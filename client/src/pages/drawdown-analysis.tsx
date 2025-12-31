import { useTrades } from "@/hooks/use-trades";
import { Trade } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

function calculateDrawdownByDimension(trades: Trade[], dimension: 'session' | 'strategy' | 'entryTF' | 'condition') {
  const baseBalance = 100000;
  
  // Group trades by dimension
  const grouped = trades.reduce((acc: any, t) => {
    let key = '';
    if (dimension === 'session') key = t.session;
    else if (dimension === 'strategy') key = t.strategy;
    else if (dimension === 'entryTF') key = t.entryTF || 'Unknown';
    else if (dimension === 'condition') key = t.condition;
    
    if (!acc[key]) {
      acc[key] = {
        dimension: key,
        trades: [],
        totalDrawdown: 0,
        maxDrawdown: 0,
        totalPL: 0,
        wins: 0,
        losses: 0
      };
    }
    acc[key].trades.push(t);
    acc[key].totalPL += Number(t.plAmt);
    if (t.outcome === 'Win') acc[key].wins++;
    if (t.outcome === 'Loss') acc[key].losses++;
    return acc;
  }, {});

  // Calculate drawdown for each group
  return Object.values(grouped).map((group: any) => {
    let peak = baseBalance;
    let balance = baseBalance;
    let maxDD = 0;

    const sortedTrades = group.trades.sort((a: Trade, b: Trade) => 
      new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
    );

    sortedTrades.forEach((t: Trade) => {
      balance += Number(t.plAmt);
      if (balance > peak) peak = balance;
      const dd = peak - balance;
      if (dd > maxDD) maxDD = dd;
    });

    const drawdownPercent = ((maxDD / baseBalance) * 100).toFixed(2);
    
    return {
      dimension: group.dimension,
      maxDrawdown: Number(maxDD),
      drawdownPercent: Number(drawdownPercent),
      totalPL: Number(group.totalPL),
      trades: group.trades.length,
      wins: group.wins,
      losses: group.losses,
      winRate: group.trades.length ? Math.round((group.wins / group.trades.length) * 100) : 0
    };
  }).sort((a, b) => b.maxDrawdown - a.maxDrawdown);
}

function BreakdownCard({ title, data, dimension }: { title: string; data: any[]; dimension: string }) {
  return (
    <Card className="p-6 bg-card/40 backdrop-blur-xl border-border/40">
      <h3 className="text-sm font-semibold mb-4 text-foreground/90">{title}</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {data.length === 0 ? (
          <p className="text-xs text-muted-foreground">No data available</p>
        ) : (
          data.map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-background/40 border border-border/20 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{item.dimension}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Max DD: <span className="text-red-400">${item.maxDrawdown.toLocaleString()}</span> ({item.drawdownPercent}%)
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-muted-foreground">Total P/L:</span>
                  <span className={`block font-medium ${item.totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${item.totalPL.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Win Rate:</span>
                  <span className="block font-medium text-primary">{item.winRate}%</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[9px] pt-2 border-t border-border/20">
                <div className="text-center">
                  <span className="block text-muted-foreground">Trades</span>
                  <span className="block font-medium">{item.trades}</span>
                </div>
                <div className="text-center text-green-400">
                  <span className="block text-muted-foreground">Wins</span>
                  <span className="block font-medium">{item.wins}</span>
                </div>
                <div className="text-center text-red-400">
                  <span className="block text-muted-foreground">Losses</span>
                  <span className="block font-medium">{item.losses}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

export default function DrawdownAnalysis() {
  const [, navigate] = useLocation();
  const { data: trades = [], isLoading } = useTrades();

  if (isLoading) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const bySession = calculateDrawdownByDimension(trades, 'session');
  const byStrategy = calculateDrawdownByDimension(trades, 'strategy');
  const byEntry = calculateDrawdownByDimension(trades, 'entryTF');
  const byCondition = calculateDrawdownByDimension(trades, 'condition');

  const chartData = [
    ...bySession.map(d => ({ category: `${d.dimension} (Session)`, drawdown: d.maxDrawdown })),
    ...byStrategy.map(d => ({ category: `${d.dimension} (Strategy)`, drawdown: d.maxDrawdown })),
    ...byEntry.map(d => ({ category: `${d.dimension} (Entry)`, drawdown: d.maxDrawdown })),
    ...byCondition.map(d => ({ category: `${d.dimension} (Condition)`, drawdown: d.maxDrawdown }))
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Drawdown Analysis</h1>
          <p className="text-muted-foreground">Breakdown of maximum drawdown by sessions, strategies, entry timeframes, and market conditions</p>
        </div>

        {/* Overview Chart */}
        <Card className="p-6 bg-card/40 backdrop-blur-xl border-border/40">
          <h3 className="text-sm font-semibold mb-4 text-foreground/90">Drawdown Comparison</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="category" stroke="rgba(255,255,255,0.5)" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                />
                <Bar dataKey="drawdown" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground">No data available</p>
          )}
        </Card>

        {/* Four Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BreakdownCard 
            title="By Session" 
            data={bySession} 
            dimension="session"
          />
          <BreakdownCard 
            title="By Strategy" 
            data={byStrategy}
            dimension="strategy"
          />
          <BreakdownCard 
            title="By Entry Timeframe" 
            data={byEntry}
            dimension="entryTF"
          />
          <BreakdownCard 
            title="By Market Condition" 
            data={byCondition}
            dimension="condition"
          />
        </div>
      </div>
    </div>
  );
}

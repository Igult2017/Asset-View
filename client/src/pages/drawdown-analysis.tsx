import { useTrades } from "@/hooks/use-trades";
import { Trade } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "./home";

function calculateDrawdownByDimension(trades: Trade[], dimension: 'session' | 'strategy' | 'entryTF' | 'condition' | 'asset') {
  const baseBalance = 100000;
  
  // Group trades by dimension
  const grouped = trades.reduce((acc: any, t) => {
    let key = '';
    if (dimension === 'session') key = t.session;
    else if (dimension === 'strategy') key = t.strategy;
    else if (dimension === 'entryTF') key = t.entryTF || 'Unknown';
    else if (dimension === 'condition') key = t.condition;
    else if (dimension === 'asset') key = t.asset;
    
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
    <Card className="p-5 space-y-4 bg-card/40 backdrop-blur-xl border-border/40 hover:border-primary/30 hover:bg-card/60 transition-all duration-500 group shadow-lg shadow-black/5 relative overflow-hidden rounded-3xl">
      <div className="absolute top-0 left-0 w-1 h-full bg-red-500/0 group-hover:bg-red-500/40 transition-all duration-500" />
      <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/90 group-hover:text-red-500 transition-colors duration-300">{title}</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {data.length === 0 ? (
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">No data</p>
        ) : (
          data.map((item, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-muted/20 border border-border/40 space-y-2 group/item hover:border-red-500/30 transition-all duration-300">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-foreground group-hover/item:text-red-500 transition-colors uppercase italic italic-heavy truncate">{item.dimension}</p>
                  <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">
                    Max DD: <span className="text-red-500 font-black italic">-${item.maxDrawdown.toLocaleString()}</span>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[9px] pt-2 border-t border-border/20">
                <div>
                  <span className="text-muted-foreground/60 font-bold uppercase tracking-widest block">Net Alpha</span>
                  <span className={`block font-black italic ${item.totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${item.totalPL.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground/60 font-bold uppercase tracking-widest block">Edge Prob</span>
                  <span className="block font-black italic text-primary">{item.winRate}%</span>
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
  const { data: trades = [], isLoading } = useTrades();

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  const bySession = calculateDrawdownByDimension(trades, 'session');
  const byStrategy = calculateDrawdownByDimension(trades, 'strategy');
  const byEntry = calculateDrawdownByDimension(trades, 'entryTF');
  const byCondition = calculateDrawdownByDimension(trades, 'condition');
  const byAsset = calculateDrawdownByDimension(trades, 'asset');

  const chartData = [
    ...byAsset.map(d => ({ category: `${d.dimension} (Instrument)`, drawdown: d.maxDrawdown })),
    ...bySession.map(d => ({ category: `${d.dimension} (Session)`, drawdown: d.maxDrawdown })),
    ...byStrategy.map(d => ({ category: `${d.dimension} (Strategy)`, drawdown: d.maxDrawdown })),
    ...byEntry.map(d => ({ category: `${d.dimension} (Entry)`, drawdown: d.maxDrawdown })),
    ...byCondition.map(d => ({ category: `${d.dimension} (Condition)`, drawdown: d.maxDrawdown }))
  ];

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto px-6 pt-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1.5 bg-primary rounded-full shadow-lg shadow-primary/20" />
              <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic italic-heavy">Drawdown Matrix</h1>
            </div>
            <p className="text-sm font-medium text-muted-foreground/80 tracking-wide max-w-xl leading-relaxed">
              Deep-dive risk analysis. Monitor maximum drawdown exposure across all trading dimensions.
            </p>
          </div>
        </div>

        {/* Overview Chart */}
        <Card className="p-6 bg-card/40 backdrop-blur-xl border-border/40 shadow-2xl rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/90">Drawdown Pulse</h3>
          </div>
          {chartData.length > 0 ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="category" 
                    stroke="rgba(var(--foreground), 0.5)" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100} 
                    tick={{ fontSize: 9, fontWeight: 700 }}
                  />
                  <YAxis 
                    stroke="rgba(var(--foreground), 0.5)"
                    tick={{ fontSize: 9, fontWeight: 700 }}
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '700'
                    }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Max DD']}
                  />
                  <Bar dataKey="drawdown" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">No data available</p>
          )}
        </Card>

        {/* Five Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <BreakdownCard 
            title="By Instrument" 
            data={byAsset} 
            dimension="asset"
          />
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
    </Layout>
  );
}

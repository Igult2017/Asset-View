import { useTrades } from "@/hooks/use-trades";
import { Trade } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowLeft, Target, ShieldAlert, Zap, TrendingDown, Layers, Calendar } from "lucide-react";
import { Layout } from "./home";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const FontStyle = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap');
    :root {
      font-family: 'Montserrat', sans-serif;
    }
    .font-blocky {
      font-family: 'Montserrat', sans-serif;
      font-weight: 900;
      letter-spacing: -0.02em;
    }
  `}} />
);

function calculateMonthlyDrawdown(trades: Trade[]) {
  const groupedByMonth = trades.reduce((acc: any, t) => {
    const date = new Date(t.date || new Date());
    const monthKey = format(date, "MMM yyyy");
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(t);
    return acc;
  }, {});

  const baseBalance = 100000;
  
  return Object.entries(groupedByMonth).map(([month, monthTrades]: [string, any]) => {
    let peak = baseBalance;
    let balance = baseBalance;
    let maxDD = 0;
    let totalPL = 0;
    let wins = 0;

    const sortedTrades = monthTrades.sort((a: Trade, b: Trade) => 
      new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
    );

    sortedTrades.forEach((t: Trade) => {
      const pl = Number(t.plAmt);
      balance += pl;
      totalPL += pl;
      if (t.outcome === 'Win') wins++;
      if (balance > peak) peak = balance;
      const dd = peak - balance;
      if (dd > maxDD) maxDD = dd;
    });

    return {
      dimension: month,
      maxDrawdown: maxDD,
      totalPL,
      winRate: monthTrades.length ? Math.round((wins / monthTrades.length) * 100) : 0,
      trades: monthTrades.length
    };
  }).sort((a, b) => new Date(b.dimension).getTime() - new Date(a.dimension).getTime());
}

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

function BreakdownCard({ title, data, icon: Icon, colorClass }: { title: string; data: any[]; icon: any; colorClass: string }) {
  return (
    <Card className="p-6 space-y-5 bg-slate-900/40 backdrop-blur-xl border-white/5 hover:border-white/10 transition-all duration-500 group relative overflow-hidden rounded-[32px]">
      <div className={cn("absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-all duration-500", colorClass.replace('text-', 'bg-'))} />
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-xl bg-white/5", colorClass)}>
          <Icon size={16} />
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-white transition-colors duration-300 font-blocky">{title}</h3>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {data.length === 0 ? (
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest font-blocky">No data</p>
        ) : (
          data.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 group/item hover:bg-white/[0.07] transition-all duration-300">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-white uppercase italic font-blocky truncate">{item.dimension}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-black text-rose-500 uppercase italic font-blocky">-${item.maxDrawdown.toLocaleString()}</span>
                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">MAX DD</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
                <div>
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest block font-blocky">Net P/L</span>
                  <span className={cn("block text-xs font-black italic font-blocky mt-0.5", item.totalPL >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
                    ${item.totalPL.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest block font-blocky">Edge</span>
                  <span className="block text-xs font-black italic text-blue-400 font-blocky mt-0.5">{item.winRate}%</span>
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
  const byMonth = calculateMonthlyDrawdown(trades);

  const chartData = [
    ...byMonth.map(d => ({ category: `${d.dimension} (Monthly)`, drawdown: d.maxDrawdown })),
    ...byAsset.map(d => ({ category: `${d.dimension} (Instrument)`, drawdown: d.maxDrawdown })),
    ...bySession.map(d => ({ category: `${d.dimension} (Session)`, drawdown: d.maxDrawdown })),
    ...byStrategy.map(d => ({ category: `${d.dimension} (Strategy)`, drawdown: d.maxDrawdown })),
    ...byEntry.map(d => ({ category: `${d.dimension} (Entry)`, drawdown: d.maxDrawdown })),
    ...byCondition.map(d => ({ category: `${d.dimension} (Condition)`, drawdown: d.maxDrawdown }))
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-[#0a0c10] text-slate-300 selection:bg-blue-500/30">
        <FontStyle />
        <div className="max-w-[1600px] mx-auto px-6 pt-10 pb-20 space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] font-blocky">
                <ShieldAlert size={18}/> Risk Exposure Intelligence
              </div>
              <h1 className="text-5xl font-blocky text-white tracking-tighter uppercase italic">
                Drawdown <span className="text-rose-600 not-italic">Matrix</span>
              </h1>
              <p className="text-sm font-bold text-slate-500 tracking-wide max-w-xl leading-relaxed">
                Deep-dive architectural risk analysis. Monitoring maximum peak-to-valley variance across all strategic dimensions.
              </p>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 min-w-[140px]">
                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1 font-blocky">Global Max DD</p>
                <p className="text-xl font-blocky text-rose-500">
                  -${Math.max(...trades.map(t => Math.abs(Number(t.plAmt))), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Overview Chart */}
          <Card className="p-8 bg-slate-900/40 backdrop-blur-xl border-white/5 shadow-2xl rounded-[40px] overflow-hidden group hover:border-rose-500/20 transition-all duration-500">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform">
                  <TrendingDown size={24} />
                </div>
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white font-blocky">Drawdown Pulse</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Instrument Correlation to Risk</p>
                </div>
              </div>
            </div>

            {chartData.length > 0 ? (
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="category" 
                      stroke="rgba(255,255,255, 0.2)" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100} 
                      tick={{ fontSize: 9, fontWeight: 900, fontFamily: 'Montserrat' }}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255, 0.2)"
                      tick={{ fontSize: 9, fontWeight: 900, fontFamily: 'Montserrat' }}
                      tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '24px',
                        padding: '16px',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                      }}
                      itemStyle={{ fontSize: '10px', fontWeight: '900', color: '#f43f5e', textTransform: 'uppercase' }}
                      labelStyle={{ fontSize: '11px', fontWeight: '900', color: '#fff', marginBottom: '8px', textTransform: 'uppercase' }}
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Max DD']}
                    />
                    <Bar dataKey="drawdown" fill="#f43f5e" radius={[8, 8, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
                <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-xs font-blocky">Intelligence Offline: No Data</p>
              </div>
            )}
          </Card>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <BreakdownCard 
              title="Monthly" 
              data={byMonth} 
              icon={Calendar}
              colorClass="text-purple-400"
            />
            <BreakdownCard 
              title="Instruments" 
              data={byAsset} 
              icon={Target}
              colorClass="text-blue-400"
            />
            <BreakdownCard 
              title="Sessions" 
              data={bySession} 
              icon={Zap}
              colorClass="text-amber-400"
            />
            <BreakdownCard 
              title="Strategies" 
              data={byStrategy}
              icon={Layers}
              colorClass="text-indigo-400"
            />
            <BreakdownCard 
              title="Timeframes" 
              data={byEntry}
              icon={Zap}
              colorClass="text-emerald-400"
            />
            <BreakdownCard 
              title="Conditions" 
              data={byCondition}
              icon={ShieldAlert}
              colorClass="text-rose-400"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

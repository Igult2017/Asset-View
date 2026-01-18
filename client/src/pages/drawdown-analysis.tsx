import { useTrades } from "@/hooks/use-trades";
import { Trade } from "@shared/schema";
import { Layout } from "./home";
import { format } from "date-fns";
import { TrendingUp, Clock, Target, BarChart3, Activity, Compass } from 'lucide-react';

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
      name: month,
      maxDD: `-$${maxDD.toLocaleString()}`,
      netPL: `$${totalPL.toLocaleString()}`,
      edge: `${monthTrades.length ? Math.round((wins / monthTrades.length) * 100) : 0}%`,
      winRate: `${monthTrades.length ? Math.round((wins / monthTrades.length) * 100) : 0}%`
    };
  }).sort((a, b) => new Date(b.name).getTime() - new Date(a.name).getTime());
}

function calculateDrawdownByDimension(trades: Trade[], dimension: 'session' | 'strategy' | 'entryTF' | 'condition' | 'asset') {
  const grouped = trades.reduce((acc: any, t) => {
    let key = '';
    if (dimension === 'session') key = t.session;
    else if (dimension === 'strategy') key = t.strategy;
    else if (dimension === 'entryTF') key = t.entryTF || 'Unknown';
    else if (dimension === 'condition') key = t.condition;
    else if (dimension === 'asset') key = t.asset;
    
    if (!acc[key]) {
      acc[key] = { name: key, trades: [], wins: 0, totalPL: 0 };
    }
    acc[key].trades.push(t);
    acc[key].totalPL += Number(t.plAmt);
    if (t.outcome === 'Win') acc[key].wins++;
    return acc;
  }, {});

  const baseBalance = 100000;
  return Object.values(grouped).map((group: any) => {
    let peak = baseBalance;
    let balance = baseBalance;
    let maxDD = 0;

    group.trades.forEach((t: Trade) => {
      balance += Number(t.plAmt);
      if (balance > peak) peak = balance;
      const dd = peak - balance;
      if (dd > maxDD) maxDD = dd;
    });

    return {
      name: group.name,
      maxDD: `-$${maxDD.toLocaleString()}`,
      netPL: `$${group.totalPL.toLocaleString()}`,
      edge: `${group.trades.length ? Math.round((group.wins / group.trades.length) * 100) : 0}%`,
      winRate: `${group.trades.length ? Math.round((group.wins / group.trades.length) * 100) : 0}%`,
      color: dimension === 'strategy' ? (group.name.includes('Silver') ? "bg-blue-500" : "bg-purple-500") : null
    };
  });
}

const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-3 mb-4 border-b border-zinc-800 pb-3">
    <Icon size={20} className="text-zinc-500" />
    <h2 className="font-black text-xl uppercase text-zinc-200 tracking-widest font-blocky">
      {title}
    </h2>
  </div>
);

const DataRow = ({ label, pl, dd, edge, colorTag }: { label: string, pl: string, dd: string, edge: string, colorTag?: string | null }) => (
  <div className="grid grid-cols-12 items-center p-4 hover:bg-zinc-900/40 transition-colors border-b border-zinc-800/50 last:border-0">
    <div className="col-span-5 flex items-center gap-3">
      {colorTag && <div className={`w-1.5 h-6 rounded-full ${colorTag}`} />}
      <span className="font-bold text-base uppercase tracking-tight text-zinc-100">{label}</span>
    </div>
    <div className="col-span-2 text-right">
      <p className="text-[11px] font-bold text-blue-400 uppercase mb-0.5">Edge</p>
      <p className="font-bold text-sm text-blue-500">{edge}</p>
    </div>
    <div className="col-span-2 text-right">
      <p className="text-[11px] font-bold text-blue-400 uppercase mb-0.5">Max DD</p>
      <p className={`font-bold text-sm ${dd === "-$0" ? 'text-zinc-600' : 'text-red-500'}`}>{dd}</p>
    </div>
    <div className="col-span-3 text-right">
      <p className="text-[11px] font-bold text-blue-400 uppercase mb-0.5">Net P/L</p>
      <p className={`font-bold text-sm ${pl.startsWith('-$') ? 'text-red-400' : 'text-green-500'}`}>{pl}</p>
    </div>
  </div>
);

const ContentBlock = ({ icon, title, data, showColor = false }: { icon: any, title: string, data: any[], showColor?: boolean }) => (
  <div className="bg-[#141417] border border-zinc-800 rounded-2xl p-6 shadow-xl">
    <SectionHeader icon={icon} title={title} />
    <div className="flex flex-col">
      {data.map((item) => (
        <DataRow 
          key={item.name} 
          label={item.name} 
          pl={item.netPL} 
          dd={item.maxDD} 
          edge={item.edge} 
          colorTag={showColor ? item.color : null} 
        />
      ))}
    </div>
  </div>
);

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

  const byMonth = calculateMonthlyDrawdown(trades);
  const latestMonth = byMonth[0] || { name: format(new Date(), "MMM yyyy"), maxDD: "-$0", netPL: "$0", edge: "0%" };
  
  const instruments = calculateDrawdownByDimension(trades, 'asset');
  const sessions = calculateDrawdownByDimension(trades, 'session');
  const strategies = calculateDrawdownByDimension(trades, 'strategy');
  const timeframes = calculateDrawdownByDimension(trades, 'entryTF');
  const calculatedConditions = calculateDrawdownByDimension(trades, 'condition');
  
  // Ensure Bullish, Bearish, Ranging, and Trending are always present
  const requiredConditions = ["Trending", "Bullish", "Bearish", "Ranging"];
  const conditions = requiredConditions.map(name => {
    const existing = calculatedConditions.find(c => c.name.toLowerCase() === name.toLowerCase());
    return existing || {
      name,
      maxDD: "-$0",
      netPL: "$0",
      edge: "0%",
      winRate: "0%"
    };
  });

  return (
    <Layout>
      <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 p-4 md:p-10">
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@900&display=swap" rel="stylesheet" />
        <style>{`.font-blocky { font-family: 'Outfit', sans-serif; font-weight: 900; }`}</style>
        
        <div className="max-w-5xl mx-auto space-y-10">
          <main className="space-y-8">
            <ContentBlock icon={Activity} title="Instruments" data={instruments} />
            <ContentBlock icon={Target} title="Strategies" data={strategies} showColor={true} />
            
            <div className="grid md:grid-cols-2 gap-8">
              <ContentBlock icon={Clock} title="Sessions" data={sessions} />
              <ContentBlock icon={BarChart3} title="Timeframes" data={timeframes} />
            </div>

            <div className="bg-[#141417] border border-zinc-800 rounded-2xl p-6">
              <SectionHeader icon={Compass} title="Market Conditions" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {conditions.map((condition) => (
                  <div key={condition.name} className="bg-black/30 border border-zinc-800/50 rounded-2xl p-5 hover:border-zinc-700 transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-black text-xl uppercase italic tracking-tighter text-zinc-100 font-blocky">
                        {condition.name}
                      </h3>
                      <div className="bg-blue-500/10 px-3 py-1 rounded-lg">
                        <p className="text-[10px] font-bold text-blue-400 uppercase mb-0.5 text-center">Edge</p>
                        <p className="font-black text-blue-500 text-sm font-blocky">{condition.winRate}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between border-t border-zinc-800 pt-4">
                      <div>
                        <p className="text-[11px] font-bold text-blue-400 uppercase mb-0.5">Max DD</p>
                        <p className="font-black text-red-500 text-lg font-blocky">{condition.maxDD}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-bold text-blue-400 uppercase mb-0.5">Net Profit</p>
                        <p className={`font-black text-lg ${condition.netPL.startsWith('-$') ? 'text-red-400' : 'text-green-500'} font-blocky`}>{condition.netPL}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}

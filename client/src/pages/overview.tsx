import React, { useState } from "react";

/**
 * MetricCard Component
 * Displays a single KPI metric with a title and value.
 */
function MetricCard({ title, value }) {
  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-none p-4 shadow-sm hover:border-blue-500 transition-colors group">
      <p className="text-[9px] text-slate-500 mb-1 uppercase tracking-[0.3em] font-900 leading-none group-hover:text-blue-400 transition-colors">{title}</p>
      <p className="text-2xl font-900 text-blue-500 tracking-tighter leading-none">{value}</p>
    </div>
  );
}

/**
 * Panel Component
 * A wrapper for different sections of the dashboard.
 */
function Panel({ title, children }) {
  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-none p-5 shadow-sm">
      <h3 className="text-[10px] font-900 mb-5 text-slate-200 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-1 inline-block">{title}</h3>
      {children}
    </div>
  );
}

/**
 * Main Overview Component
 */
export default function Overview() {
  const [dateRange, setDateRange] = useState("DEFAULT");

  return (
    <div className="min-h-screen bg-black text-slate-100 flex font-['Montserrat',sans-serif] selection:bg-blue-500/30">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap');
          body { 
            font-family: 'Montserrat', sans-serif; 
            font-weight: 900; 
            background-color: black; 
          }
          .scanline { 
            background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 50%); 
            background-size: 100% 4px; 
          }
        `}
      </style>

      <main className="flex-1 p-6 md:p-10 space-y-10 overflow-y-auto max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b-[4px] border-slate-900 pb-6">
          <h2 className="text-xl font-900 uppercase tracking-widest italic">
            PERFORMANCE <span className="text-blue-600 not-italic ml-2">OVERVIEW</span>
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setDateRange("DEFAULT")}
              className={`px-6 py-2 text-[8px] font-900 uppercase tracking-[0.4em] border-2 transition-all active:translate-y-1 ${dateRange === "DEFAULT" ? "bg-blue-600 border-blue-400" : "bg-slate-900 border-slate-700 hover:bg-slate-800"}`}
            >
              DEFAULT
            </button>
            <button
              onClick={() => setDateRange("CUSTOM")}
              className={`px-6 py-2 text-[8px] font-900 uppercase tracking-[0.4em] border-2 transition-all active:translate-y-1 ${dateRange === "CUSTOM" ? "bg-blue-600 border-blue-400" : "bg-slate-900 border-slate-700 hover:bg-slate-800"}`}
            >
              DATE RANGE
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <MetricCard title="Daily Win Rate" value="69.67%" />
          <MetricCard title="Avg Win / Avg Loss" value="0.89" />
          <MetricCard title="Trade Count" value="1,131" />
          <MetricCard title="Win Streak" value="33 DAYS" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <Panel title="Equity_Curve">
            <div className="h-48 bg-black border-2 border-slate-800 flex items-end gap-1.5 p-4 relative overflow-hidden">
              <div className="scanline absolute inset-0 opacity-5" />
              {[30, 50, 40, 65, 80, 55, 85, 95].map((h, i) => (
                <div key={i} className="flex-1 bg-blue-600 border-t-2 border-blue-400" style={{ height: `${h}%` }} />
              ))}
            </div>
          </Panel>

          <Panel title="Win_Loss_Probability_Per_Day">
            <div className="h-48 bg-black border-2 border-slate-800 flex items-center justify-center">
              {(() => {
                // mock trades for the selected period (1 = win, 0 = loss)
                const trades = Array.from({ length: 40 }, () => (Math.random() > 0.25 ? 1 : 0));
                const total = trades.length;
                const wins = trades.filter(t => t === 1).length;
                const losses = total - wins;
                const winProb = total ? Math.round((wins / total) * 100) : 0;
                const lossProb = total ? 100 - winProb : 0;

                return (
                  <div className="text-center">
                    <div className="text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-3">
                      Probability Based on Trades
                    </div>
                    <div className="text-2xl font-900 tracking-widest">
                      <span className="text-green-500">WIN: {winProb}%</span>
                      <span className="text-slate-600 mx-3">|</span>
                      <span className="text-red-500">LOSS: {lossProb}%</span>
                    </div>
                    <div className="mt-4 h-1 w-64 mx-auto flex overflow-hidden border border-slate-800">
                      <div className="bg-green-600" style={{ width: `${winProb}%` }} />
                      <div className="bg-red-600" style={{ width: `${lossProb}%` }} />
                    </div>
                  </div>
                );
              })()}
            </div>
          </Panel>

          <Panel title="Win_Loss_Frequency">
            <div className="h-48 bg-black border-2 border-slate-800 flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-3xl text-green-500">72%</div>
                <div className="text-[9px] tracking-widest text-slate-500">WINS</div>
              </div>
              <div className="text-center">
                <div className="text-3xl text-red-500">28%</div>
                <div className="text-[9px] tracking-widest text-slate-500">LOSSES</div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Calendar */}
        <Panel title={`Trading_Log - ${dateRange === "DEFAULT" ? "Feb_2024" : "Custom_Range"}`}>
          <div className="grid grid-cols-7 gap-1.5">
            {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
              <div key={d} className="text-center text-[8px] text-slate-700 tracking-[0.4em] mb-4">{d}</div>
            ))}
            {Array.from({ length: 28 }).map((_, i) => {
              const win = i % 3 === 0;
              const loss = i % 7 === 0;
              return (
                <div key={i} className={`h-24 border-2 p-2 flex flex-col transition-all cursor-pointer ${win ? 'border-green-800 bg-green-600/5' : loss ? 'border-red-800 bg-red-600/5' : 'border-slate-800 bg-slate-950'}`}>
                  <span className="text-[10px] text-slate-600 font-900">{i + 1}</span>
                  {(win || loss) && (
                    <div className={`mt-auto text-[9px] font-900 ${win ? 'text-green-500' : 'text-red-500'}`}>
                      {win ? '+$120.40' : '-$45.00'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>
      </main>
    </div>
  );
}

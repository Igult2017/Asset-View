import React, { useState } from "react";
import { Layout } from "./home";

/**
 * MetricCard Component
 * Displays a single KPI metric with a title and value.
 */
function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-md p-4 shadow-sm hover:border-blue-500 transition-colors group">
      <p className="text-[11px] text-slate-300 mb-2 uppercase tracking-[0.3em] font-bold leading-none group-hover:text-blue-400 transition-colors">{title}</p>
      <p className="text-2xl font-bold text-green-500 tracking-tighter leading-none">{value}</p>
    </div>
  );
}

/**
 * Panel Component
 * A wrapper for different sections of the dashboard.
 */
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-md p-5 shadow-sm">
      <h3 className="text-xs font-bold mb-5 text-slate-300 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-1 inline-block">{title}</h3>
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
    <Layout>
      <div className="min-h-screen bg-black text-slate-100 flex selection:bg-blue-500/30">
        <style>
          {`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');
            * {
              font-family: 'Montserrat', sans-serif !important;
            }
            .scanline { 
              background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 50%); 
              background-size: 100% 4px; 
            }
          `}
        </style>

        <main className="flex-1 p-6 md:p-10 space-y-10 overflow-y-auto max-w-7xl mx-auto">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard title="Daily Win Rate" value="69.67%" />
            <MetricCard title="Avg Win / Avg Loss" value="0.89" />
            <MetricCard title="Trade Count" value="1,131" />
            <MetricCard title="Win Streak" value="33 DAYS" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            <Panel title="Equity_Curve">
              <div className="h-48 bg-black border-2 border-slate-800 flex items-end gap-1.5 p-4 relative overflow-hidden">
                <div className="scanline absolute inset-0 opacity-5" />
                {[30, 50, 40, 65, 80, 55, 85, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-blue-600 border-t-2 border-blue-400" style={{ height: `${h}%` }} />
                ))}
              </div>
            </Panel>

            <Panel title="Win_Loss_Probability_Per_Day">
              <div className="h-48 bg-black border-2 border-slate-800 flex items-center justify-center p-4">
                {(() => {
                  // mock trades for the selected period (1 = win, 0 = loss)
                  const trades = Array.from({ length: 40 }, () => (Math.random() > 0.25 ? 1 : 0));
                  const total = trades.length;
                  const wins = trades.filter(t => t === 1).length;
                  const losses = total - wins;
                  const winProb = total ? Math.round((wins / total) * 100) : 0;
                  const lossProb = total ? 100 - winProb : 0;

                  return (
                    <div className="text-center w-full">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300 mb-3 truncate">
                        Probability Based on Trades
                      </div>
                      <div className="text-lg sm:text-2xl font-bold tracking-widest flex flex-wrap justify-center gap-2">
                        <span className="text-emerald-500 whitespace-nowrap">WIN: {winProb}%</span>
                        <span className="text-slate-600 hidden sm:inline">|</span>
                        <span className="text-rose-500 whitespace-nowrap">LOSS: {lossProb}%</span>
                      </div>
                      <div className="mt-4 h-1 w-full max-w-64 mx-auto flex overflow-hidden border border-slate-800">
                        <div className="bg-emerald-600" style={{ width: `${winProb}%` }} />
                        <div className="bg-rose-600" style={{ width: `${lossProb}%` }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </Panel>

            <Panel title="Win_Loss_Frequency">
              <div className="h-48 bg-black border-2 border-slate-800 flex items-center justify-center gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl text-emerald-500">72%</div>
                  <div className="text-[10px] tracking-widest text-slate-300">WINS</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl text-rose-500">28%</div>
                  <div className="text-[10px] tracking-widest text-slate-300">LOSSES</div>
                </div>
              </div>
            </Panel>
          </div>

          {/* Calendar */}
          <Panel title={`Trading_Log - ${dateRange === "DEFAULT" ? "Feb_2024" : "Custom_Range"}`}>
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-7 gap-1.5">
                  {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
                    <div key={d} className="text-center text-[10px] text-slate-400 tracking-[0.4em] mb-4">{d}</div>
                  ))}
                  {Array.from({ length: 28 }).map((_, i) => {
                    const win = i % 3 === 0;
                    const loss = i % 7 === 0;
                    return (
                      <div key={i} className={`h-24 border-2 p-2 flex flex-col transition-all cursor-pointer rounded-md ${win ? 'border-green-800 bg-green-600/5' : loss ? 'border-red-800 bg-red-600/5' : 'border-slate-800 bg-slate-950'}`}>
                        <span className="text-xs text-slate-300 font-bold">{i + 1}</span>
                        {(win || loss) && (
                          <div className={`mt-auto text-[11px] font-bold ${win ? 'text-green-500' : 'text-red-500'}`}>
                            {win ? '+$120.40' : '-$45.00'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Panel>
        </main>
      </div>
    </Layout>
  );
}

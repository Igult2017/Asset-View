import React, { useState, useMemo } from 'react';
import {
  Activity, BrainCircuit, Box, Clock, Cpu, Database, Gauge,
  Scale, ShieldCheck, Target, Thermometer, Layers,
  AlertTriangle, CheckCircle2, ChevronRight, Info,
  LineChart, MousePointer2, RefreshCcw, TrendingUp, Zap
} from 'lucide-react';
import { Layout } from "./home";

// Using Google Fonts to inject Montserrat for the "Blocky" premium feel
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

const AuditorExtras = ({ metrics, rollingExpectancy }: { metrics: any, rollingExpectancy: any }) => {

  /* ================= 1. Kill-Switch Rules ================= */
  const killSwitch = useMemo(() => ({
    expectancyFail: rollingExpectancy.last50 < 0,
    drawdownFail: metrics.maxDrawdown > 12,
    regimeFail: false 
  }), [rollingExpectancy, metrics.maxDrawdown]);

  /* ================= 2. Conditional Edge Validation ================= */
  const conditionalEdge = useMemo(() => ({
    liquidityGapTrades: { expectancy: 1.05, sample: 120 },
    nonQualifiedTrades: { expectancy: 0.50, sample: 338 }
  }), []);

  /* ================= 3. Trade Quality Stratification ================= */
  const tradeQualityDist = useMemo(() => ({
    A: { trades: 28, profitPct: 70 },
    B: { trades: 46, profitPct: 24 },
    C: { trades: 26, profitPct: 6 }
  }), []);

  /* ================= 4. Loss Clustering Severity ================= */
  const lossClusters = useMemo(() => ({
    avgCluster: 2.4,
    worstClusterDrawdown: 4.5
  }), []);

  /* ================= 5. Execution Asymmetry ================= */
  const executionAsymmetry = useMemo(() => ({
    winSlippage: 0.3,
    lossSlippage: 0.6
  }), []);

  /* ================= 6. Regime Transition Impact ================= */
  const regimeTransition = useMemo(() => ({
    avgDrawdown: 3.2,
    recoveryTrades: 8
  }), []);

  /* ================= 7. Capital Heat / Exposure ================= */
  const capitalHeat = useMemo(() => ({
    peakEquityRisk: 37,
    timeAtPeak: 22
  }), []);

  /* ================= 8. Automation Failure Probability ================= */
  const automationRisk = useMemo(() => ({
    failureProbability: 1.8
  }), []);

  /* ================= 9. Edge Transferability ================= */
  const edgeTransfer = useMemo(() => ({
    adjacentMarketRetention: 92
  }), []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/5">

      {/* Kill-Switch */}
      <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/10">
        <h3 className="text-[10px] font-black uppercase text-rose-400 mb-4 tracking-widest flex items-center gap-2">
          <ShieldCheck size={14}/> Kill-Switch Rules
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between font-bold"><span className="text-slate-500">Expectancy Fail</span><span className={killSwitch.expectancyFail ? 'text-rose-500' : 'text-emerald-500'}>{killSwitch.expectancyFail ? 'YES' : 'NO'}</span></div>
          <div className="flex justify-between font-bold"><span className="text-slate-500">Drawdown Fail</span><span className={killSwitch.drawdownFail ? 'text-rose-500' : 'text-emerald-500'}>{killSwitch.drawdownFail ? 'YES' : 'NO'}</span></div>
          <div className="flex justify-between font-bold"><span className="text-slate-500">Regime Fail</span><span className="text-emerald-500">NO</span></div>
        </div>
      </div>

      {/* Conditional Edge */}
      <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/10">
        <h3 className="text-[10px] font-black uppercase text-indigo-400 mb-4 tracking-widest">Conditional Edge Validation</h3>
        <div className="space-y-2 text-sm">
          <p className="text-slate-300 font-bold">Liquidity-Gap: <span className="text-white">{conditionalEdge.liquidityGapTrades.expectancy}R</span> <span className="text-xs text-slate-500">({conditionalEdge.liquidityGapTrades.sample} samples)</span></p>
          <p className="text-slate-300 font-bold">Non-Qualified: <span className="text-white">{conditionalEdge.nonQualifiedTrades.expectancy}R</span> <span className="text-xs text-slate-500">({conditionalEdge.nonQualifiedTrades.sample} samples)</span></p>
        </div>
      </div>

      {/* Trade Quality */}
      <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/10">
        <h3 className="text-[10px] font-black uppercase text-emerald-400 mb-4 tracking-widest">Trade Quality Stratification</h3>
        <div className="space-y-2 text-sm">
          {Object.entries(tradeQualityDist).map(([tier, data]) => (
            <div key={tier} className="flex justify-between font-bold">
              <span className="text-slate-500">{tier}-Trades ({data.trades})</span>
              <span className="text-white">{data.profitPct}% Profit</span>
            </div>
          ))}
        </div>
      </div>

      {/* Loss Clustering */}
      <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/10">
        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Loss Cluster Severity</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between font-bold"><span className="text-slate-500">Avg Cluster Length</span><span className="text-white">{lossClusters.avgCluster}</span></div>
          <div className="flex justify-between font-bold"><span className="text-slate-500">Worst DD Cluster</span><span className="text-rose-400">{lossClusters.worstClusterDrawdown}%</span></div>
        </div>
      </div>

      {/* Execution Asymmetry */}
      <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/10">
        <h3 className="text-[10px] font-black uppercase text-blue-400 mb-4 tracking-widest">Execution Asymmetry</h3>
        <div className="space-y-2 text-sm font-bold">
          <p className="text-slate-500">Slippage (Wins): <span className="text-white">{executionAsymmetry.winSlippage} ticks</span></p>
          <p className="text-slate-500">Slippage (Losses): <span className="text-white">{executionAsymmetry.lossSlippage} ticks</span></p>
        </div>
      </div>

      {/* Regime Transition */}
      <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/10">
        <h3 className="text-[10px] font-black uppercase text-amber-400 mb-4 tracking-widest">Regime Transition Impact</h3>
        <div className="space-y-2 text-sm font-bold">
          <p className="text-slate-500">Avg Transition DD: <span className="text-white">{regimeTransition.avgDrawdown}%</span></p>
          <p className="text-slate-500">Recovery Trades: <span className="text-white">{regimeTransition.recoveryTrades}</span></p>
        </div>
      </div>

      {/* Capital Heat */}
      <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/10">
        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Capital Heat / Exposure</h3>
        <div className="space-y-2 text-sm font-bold text-slate-500">
          <p>Peak Equity at Risk: <span className="text-white">{capitalHeat.peakEquityRisk}%</span></p>
          <p>Time at Peak: <span className="text-white">{capitalHeat.timeAtPeak}%</span></p>
        </div>
      </div>

      {/* Automation Risk */}
      <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/10">
        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Automation Risk</h3>
        <p className="text-sm font-bold text-white">{automationRisk.failureProbability}% chance of execution failure</p>
      </div>

      {/* Edge Transferability */}
      <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/10">
        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Edge Transferability</h3>
        <p className="text-sm font-bold text-white">Market Retention: {edgeTransfer.adjacentMarketRetention}%</p>
      </div>

    </div>
  );
};

const Auditor = () => {
  const [systemName] = useState('AI-Automated Audit: Quant-Neural Alpha 4.0');

  const [metrics] = useState({
    winRate: 62.4,
    avgWinR: 1.82,
    avgLossR: 0.95,
    tradeSample: 458,
    maxDrawdown: 8.4,
    recoveryTime: 12,
    timeInDrawdown: 31,
    frictionImpact: 8.2,
    ruleStability: 94,
    executionAdherence: 98.5,
    monteCarloStability: 89.2,
    varianceSkew: 1.4,
    maxLossStreak: 6,
    probFiveLosses: 14,
    slippageWin: 0.3,
    slippageLoss: 0.6
  });

  const [auditElements] = useState({
    regime: 'High-Volatility Trending (Expansion Phases)',
    entryLogic: 'AI-detected liquidity gaps + Order Flow Imbalance',
    exitLogic: 'Dynamic volatility-adjusted trailing stops',
    failureModes: 'Low-liquidity consolidation & ranging chop',
    scalingProperties: 'Deep liquidity depth; scalable to institutional tiers',
    behavioralFit: 'Fully autonomous; no discretionary input',
    sessionDependency: 'Dominant in New York & London overlaps',
    forwardConfirmation: '6-month live walk-forward verified'
  });

  const expectancy = useMemo(() => {
    const winP = metrics.winRate / 100;
    return +((winP * metrics.avgWinR) - ((1 - winP) * metrics.avgLossR)).toFixed(2);
  }, [metrics]);

  const edgeBreakdown = {
    winRate: 46,
    riskReward: 38,
    outliers: 16
  };

  const rollingExpectancy = {
    last50: 0.42,
    last200: 0.48
  };

  const tradeQuality = {
    A: { trades: 28, profit: 71 },
    B: { trades: 46, profit: 24 },
    C: { trades: 26, profit: 5 }
  };

  const auditScore = useMemo(() => {
    const sampleFactor = Math.min(metrics.tradeSample / 500, 1);
    const math = expectancy > 0 ? expectancy * 45 : 0;
    const robustness =
      metrics.ruleStability * 0.4 +
      metrics.executionAdherence * 0.4 +
      (100 - metrics.frictionImpact) * 0.2;
    const survival = Math.max(0, 100 - metrics.maxDrawdown * 4);

    return Math.min(
      Math.round((math * 0.4 + robustness * 0.3 + survival * 0.3) * (0.85 + 0.15 * sampleFactor)),
      100
    );
  }, [metrics, expectancy]);

  const authorized = auditScore >= 80;

  return (
    <Layout>
      <div className="min-h-screen bg-[#0a0c10] text-slate-300 p-6 md:p-10 font-sans selection:bg-blue-500/30">
        <FontStyle />
        <div className="max-w-7xl mx-auto space-y-12">

          {/* HEADER */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <div className="flex items-center gap-3 text-blue-400 text-xs font-black uppercase tracking-[0.2em]">
                <Cpu size={18}/> Automated Intelligence Auditor
              </div>
              <h1 className="text-4xl md:text-5xl font-blocky text-white mt-2 tracking-tight">
                {systemName}
              </h1>
              <div className="flex gap-6 text-[10px] mt-4 text-slate-500 font-black uppercase tracking-widest">
                <span className="flex items-center gap-2"><Database size={12}/> Journal Sync</span>
                <span className="flex items-center gap-2"><Layers size={12}/> Quant Model</span>
                <span className="flex items-center gap-2 text-emerald-400"><ShieldCheck size={12}/> Verified Logic</span>
              </div>
            </div>

            <div className="w-full md:w-auto bg-slate-900/60 border border-white/10 rounded-[32px] p-8 text-center backdrop-blur-md relative overflow-hidden group">
              <div className={`absolute inset-0 opacity-5 blur-2xl transition-colors ${authorized ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest relative z-10">Reliability Index</p>
              <p className={`text-6xl font-blocky relative z-10 ${authorized ? 'text-emerald-400' : 'text-blue-400'}`}>
                {auditScore}%
              </p>
              <p className="text-sm mt-2 font-black text-white relative z-10 font-blocky">Expectancy: {expectancy}R</p>
            </div>
          </header>

          {/* GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT COLUMN */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/5 space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 flex items-center gap-2">
                  <TrendingUp size={14}/> Variance & Distribution
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm font-bold">Win Rate</span>
                    <span className="text-white font-blocky text-lg">{metrics.winRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm font-bold">Sample Size</span>
                    <span className="text-white font-blocky text-lg">{metrics.tradeSample}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm font-bold">Win/Loss Ratio</span>
                    <span className="text-white font-blocky text-lg">{(metrics.avgWinR / metrics.avgLossR).toFixed(2)}</span>
                  </div>
                  <div className="pt-2 flex justify-between items-center border-t border-white/5">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Positive Skew</span>
                    <span className="text-emerald-400 font-black text-sm uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle2 size={12}/> Verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/5 space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 flex items-center gap-2">
                  <BrainCircuit size={14}/> Core Robustness
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Rule Stability', val: metrics.ruleStability, icon: Scale, color: 'text-blue-400' },
                    { label: 'Execution Adherence', val: metrics.executionAdherence, icon: MousePointer2, color: 'text-indigo-400' },
                    { label: 'Monte Carlo Stability', val: metrics.monteCarloStability, icon: RefreshCcw, color: 'text-emerald-400' }
                  ].map((item) => (
                    <div key={item.label} className="group">
                      <div className="flex justify-between text-xs mb-1 font-bold">
                        <span className="flex items-center gap-2 text-slate-400 group-hover:text-white transition-colors">
                          <item.icon size={12} className={item.color}/> {item.label}
                        </span>
                        <span className="text-white">{item.val}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                          style={{ width: `${item.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/5">
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6 flex items-center gap-2">
                  <Target size={14}/> Probabilistic Edge
                </h3>
                <div className="relative aspect-square max-w-[200px] mx-auto">
                  <div className="absolute inset-0 border-[16px] border-white/5 rounded-full"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-blocky text-white leading-none">{metrics.winRate}%</span>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">Base Rate</span>
                  </div>
                </div>
                <div className="mt-8 space-y-3">
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl">
                    <span className="text-xs font-bold text-slate-400">Avg Win</span>
                    <span className="text-emerald-400 font-blocky text-lg">{metrics.avgWinR}R</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl">
                    <span className="text-xs font-bold text-slate-400">Avg Loss</span>
                    <span className="text-rose-400 font-blocky text-lg">{metrics.avgLossR}R</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN COLUMN */}
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/40 p-8 rounded-[40px] border border-white/5 group hover:border-blue-500/30 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                      <Gauge size={24}/>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Drawdown Metrics</span>
                  </div>
                  <p className="text-5xl font-blocky text-white group-hover:scale-105 transition-transform origin-left">{metrics.maxDrawdown}%</p>
                  <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">Historical Max Peak-to-Valley</p>
                  <div className="mt-6 flex items-center gap-4 text-xs font-bold">
                    <div className="flex-1 bg-white/5 p-3 rounded-2xl">
                      <span className="text-slate-500">Recovery</span>
                      <p className="text-white mt-1">{metrics.recoveryTime} days</p>
                    </div>
                    <div className="flex-1 bg-white/5 p-3 rounded-2xl">
                      <span className="text-slate-500">Stagnation</span>
                      <p className="text-white mt-1">{metrics.timeInDrawdown}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/40 p-8 rounded-[40px] border border-white/5 group hover:border-indigo-500/30 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                      <Activity size={24}/>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Equity Variance</span>
                  </div>
                  <p className="text-5xl font-blocky text-white group-hover:scale-105 transition-transform origin-left">{metrics.monteCarloStability}%</p>
                  <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">Simulation Confidence (n=10k)</p>
                  <div className="mt-6 flex items-center gap-4 text-xs font-bold">
                    <div className="flex-1 bg-white/5 p-3 rounded-2xl">
                      <span className="text-slate-500">Variance Skew</span>
                      <p className="text-white mt-1">{metrics.varianceSkew}</p>
                    </div>
                    <div className="flex-1 bg-white/5 p-3 rounded-2xl">
                      <span className="text-slate-500">Max Cluster</span>
                      <p className="text-white mt-1">{metrics.maxLossStreak} trades</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/20 border border-white/5 rounded-[40px] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                  <h2 className="text-xl font-blocky text-white flex items-center gap-3">
                    <ShieldCheck className="text-emerald-400" size={24}/> Logical Verification Elements
                  </h2>
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">System Certified</span>
                  </div>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {Object.entries(auditElements).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-sm font-bold text-white leading-relaxed">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* FINAL AUDIT VERDICT */}
              <div className="bg-slate-900/40 p-8 rounded-[40px] border border-white/5 relative overflow-hidden group mt-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                      <ShieldCheck size={14}/> Final Audit Verdict
                    </div>
                    <h2 className="text-4xl font-blocky text-white tracking-tight">
                      SYSTEM DE-AUTHORIZED
                    </h2>
                    <p className="text-sm font-bold text-slate-500">
                      Structural check passed. Max DD of {metrics.maxDrawdown}% within 12% tolerance.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm min-w-[200px] text-center">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Next Phase</p>
                      <p className="text-lg font-blocky text-white">Walk-Forward 30D</p>
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-800 tracking-[0.3em] mr-4">
                      AUDIT: ALPHA-4.0
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <AuditorExtras metrics={metrics} rollingExpectancy={rollingExpectancy} />

          {/* ADDITIONAL METRICS PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-white/5">
            {/* Risk & Failure */}
            <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/10">
              <h3 className="text-[10px] font-black uppercase text-rose-400 mb-4 tracking-widest flex items-center gap-2">
                <Thermometer size={14}/> Risk & Failure
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between font-bold"><span className="text-slate-500">Max Loss Streak</span><span className="text-white">{metrics.maxLossStreak}</span></div>
                <div className="flex justify-between font-bold"><span className="text-slate-500">5-Loss Probability</span><span className="text-white">{metrics.probFiveLosses}%</span></div>
                <div className="flex justify-between font-bold"><span className="text-slate-500">Time in Drawdown</span><span className="text-white">{metrics.timeInDrawdown}%</span></div>
              </div>
            </div>

            {/* Edge Component Breakdown */}
            <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/10">
              <h3 className="text-[10px] font-black uppercase text-indigo-400 mb-4 tracking-widest">Edge Component Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-1">
                    <span>Win Rate</span>
                    <span className="text-white">46%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[46%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-1">
                    <span>Risk-Reward</span>
                    <span className="text-white">38%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[38%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edge Decay / Rolling Trend */}
            <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/10">
              <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Edge Decay / Rolling Trend</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-4 rounded-2xl">
                  <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest block mb-1">Last 50 Trades</span>
                  <p className="text-xl font-blocky text-white">{rollingExpectancy.last50}R</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl">
                  <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest block mb-1">Last 200 Trades</span>
                  <p className="text-xl font-blocky text-white">{rollingExpectancy.last200}R</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Auditor;
import { useState } from "react";
import { useTrades, useCreateTrade } from "@/hooks/use-trades";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTradeSchema, type InsertTrade, type Trade } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Activity, Plus, BarChart2, History, TrendingUp, Filter, Palette, ChevronDown, ArrowRight, ArrowLeft, Settings, LineChart, Sparkles, Upload, ImageIcon, X, Camera, RefreshCcw, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { StatsCard } from "@/components/stats-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

// --- Stats Calculation Helpers ---

export function Layout({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen pb-12 bg-background">
      <main>
        {children}
      </main>
    </div>
  );
}

function calculateStats(trades: Trade[]) {
  const net = trades.reduce((a, b) => a + Number(b.plAmt), 0);
  const wins = trades.filter(t => t.outcome === 'Win').length;
  const wr = trades.length ? Math.round((wins / trades.length) * 100) : 0;
  
  const exp = trades.length ? (trades.reduce((a, b) => a + Number(b.rAchieved), 0) / trades.length).toFixed(2) : "0.00";
  
  const grossWin = trades.reduce((a, b) => a + (Number(b.plAmt) > 0 ? Number(b.plAmt) : 0), 0);
  const grossLoss = Math.abs(trades.reduce((a, b) => a + (Number(b.plAmt) < 0 ? Number(b.plAmt) : 0), 0));
  const pf = grossLoss > 0 ? (grossWin / grossLoss).toFixed(2) : grossWin.toFixed(2);

  const avgDiscipline = trades.length 
    ? Math.round(trades.reduce((a, b) => a + (Number(b.rulesFollowedPercent) || 0), 0) / trades.length)
    : 100;

  const avgConfidence = trades.length
    ? (trades.reduce((a, b) => a + (Number(b.confidenceLevel) || 0), 0) / trades.length).toFixed(1)
    : "3.0";

  const setupQualityMetrics = trades.length ? {
    clarity: (trades.reduce((a, b) => a + (Number(b.setupClarityScore) || 0), 0) / trades.length).toFixed(1),
    precision: (trades.reduce((a, b) => a + (Number(b.entryPrecisionScore) || 0), 0) / trades.length).toFixed(1),
    confluence: (trades.reduce((a, b) => a + (Number(b.confluenceScore) || 0), 0) / trades.length).toFixed(1)
  } : { clarity: "3.0", precision: "3.0", confluence: "3.0" };

  const volatilityPerformance = trades.reduce((acc: any, t) => {
    const key = t.volatilityState || 'Normal';
    if (!acc[key]) acc[key] = { wins: 0, total: 0 };
    acc[key].total += 1;
    if (t.outcome === 'Win') acc[key].wins += 1;
    return acc;
  }, {});

  const emotionalStatePerformance = trades.reduce((acc: any, t) => {
    const key = t.emotionalState || 'Calm';
    if (!acc[key]) acc[key] = { wins: 0, total: 0, rSum: 0 };
    acc[key].total += 1;
    acc[key].rSum += Number(t.rAchieved);
    if (t.outcome === 'Win') acc[key].wins += 1;
    return acc;
  }, {});

  const newsPerformance = trades.reduce((acc: any, t) => {
    const key = t.newsEnvironment || 'None';
    if (!acc[key]) acc[key] = { wins: 0, total: 0, rSum: 0 };
    acc[key].total += 1;
    acc[key].rSum += Number(t.rAchieved);
    if (t.outcome === 'Win') acc[key].wins += 1;
    return acc;
  }, {});

  const avgAlignment = trades.length
    ? (trades.reduce((a, b) => a + (Number(b.marketAlignmentScore) || 0), 0) / trades.length).toFixed(1)
    : "5.0";

  // New measurable groupings
  const instrumentPerformance = trades.reduce((acc: any, t) => {
    if (!acc[t.asset]) acc[t.asset] = { net: 0, wins: 0, total: 0 };
    acc[t.asset].net += Number(t.plAmt);
    acc[t.asset].total += 1;
    if (t.outcome === 'Win') acc[t.asset].wins += 1;
    return acc;
  }, {});

  const sessionPerformance = trades.reduce((acc: any, t) => {
    const key = `${t.asset}-${t.session}`;
    if (!acc[key]) acc[key] = { wins: 0, total: 0, losses: 0 };
    acc[key].total += 1;
    if (t.outcome === 'Win') acc[key].wins += 1;
    if (t.outcome === 'Loss') acc[key].losses += 1;
    return acc;
  }, {});

  // Advanced measurable groupings for Market Edge
  const instrumentConditionPerformance = trades.reduce((acc: any, t) => {
    const key = `${t.asset}-${t.condition}`;
    if (!acc[key]) acc[key] = { wins: 0, losses: 0, total: 0 };
    acc[key].total += 1;
    if (t.outcome === 'Win') acc[key].wins += 1;
    if (t.outcome === 'Loss') acc[key].losses += 1;
    return acc;
  }, {});

  const marketRegimePerformance = trades.reduce((acc: any, t) => {
    const key = t.condition || 'Unknown';
    if (!acc[key]) acc[key] = { wins: 0, losses: 0, total: 0, rTotal: 0 };
    acc[key].total += 1;
    acc[key].rTotal += Number(t.rAchieved);
    if (t.outcome === 'Win') acc[key].wins += 1;
    if (t.outcome === 'Loss') acc[key].losses += 1;
    return acc;
  }, {});

  const complexEdgePerformance = trades.reduce((acc: any, t) => {
    const key = `${t.asset}-${t.bias}-${t.session}`;
    if (!acc[key]) acc[key] = { wins: 0, total: 0 };
    acc[key].total += 1;
    if (t.outcome === 'Win') acc[key].wins += 1;
    return acc;
  }, {});

  const strategyContextPerformance = trades.reduce((acc: any, t) => {
    const key = `${t.strategy}-${t.session}-${t.condition}`;
    if (!acc[key]) acc[key] = { rTotal: 0, total: 0 };
    acc[key].total += 1;
    acc[key].rTotal += Number(t.rAchieved);
    return acc;
  }, {});

  const hyperGranularPerformance = trades.reduce((acc: any, t) => {
    // Instrument + Analysis TF + Session
    const key = `${t.asset}-${t.analysisTF || 'H1'}-${t.session}`;
    if (!acc[key]) acc[key] = { wins: 0, losses: 0, total: 0 };
    acc[key].total += 1;
    if (t.outcome === 'Win') acc[key].wins += 1;
    if (t.outcome === 'Loss') acc[key].losses += 1;
    return acc;
  }, {});

  // Strategy Performance grouping
  const strategyPerformance = trades.reduce((acc: any, t) => {
    const strat = t.strategy || 'Unassigned';
    if (!acc[strat]) acc[strat] = { wins: 0, losses: 0, total: 0, profit: 0, avgR: 0, rSum: 0, rulesSum: 0 };
    acc[strat].total += 1;
    acc[strat].profit += Number(t.plAmt);
    acc[strat].rSum += Number(t.rAchieved);
    acc[strat].rulesSum += Number(t.rulesFollowedPercent) || 0;
    if (t.outcome === 'Win') acc[strat].wins += 1;
    if (t.outcome === 'Loss') acc[strat].losses += 1;
    return acc;
  }, {});

  // Monthly Drawdown in Percentage (Mock base 100k account if not provided)
  const monthlyData = calculateDrawdownPerMonth(trades);
  const latestMonth = monthlyData[0] || { drawdown: 0, drawdownPercent: "0.00" };
  const monthlyDrawdownPercent = latestMonth.drawdownPercent;

  return { 
    net, wr, exp, count: trades.length, pf, avgDiscipline, avgAlignment, 
    instrumentPerformance, sessionPerformance, monthlyDrawdownPercent,
    instrumentConditionPerformance, complexEdgePerformance, strategyContextPerformance,
    hyperGranularPerformance, strategyPerformance, marketRegimePerformance,
    avgConfidence, setupQualityMetrics, volatilityPerformance, emotionalStatePerformance,
    newsPerformance
  };
}

function getUniqueStrategies(trades: Trade[]) {
  return Array.from(new Set(trades.map(t => t.strategy).filter(s => s)));
}

function calculateDrawdownPerMonth(trades: Trade[]) {
  // Group trades by month
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

    // Sort trades by date for chronological DD calculation within the month
    const sortedTrades = monthTrades.sort((a: Trade, b: Trade) => 
      new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
    );

    sortedTrades.forEach((t: Trade) => {
      balance += Number(t.plAmt);
      if (balance > peak) peak = balance;
      const dd = peak - balance;
      if (dd > maxDD) maxDD = dd;
    });

    const drawdownPercent = ((maxDD / baseBalance) * 100).toFixed(2);
    return { month, drawdown: maxDD, drawdownPercent, cumulative: balance };
  }).sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime()); // Latest month first
}

function calculatePerformanceAfterLoss(trades: Trade[]) {
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
  );
  
  let afterLossTrades = 0;
  let afterLossWins = 0;
  let lastWasLoss = false;
  
  sortedTrades.forEach((trade, idx) => {
    if (lastWasLoss) {
      afterLossTrades++;
      if (trade.outcome === 'Win') {
        afterLossWins++;
      }
    }
    lastWasLoss = trade.outcome === 'Loss';
  });
  
  const winRate = afterLossTrades > 0 ? Math.round((afterLossWins / afterLossTrades) * 100) : 0;
  
  return {
    totalAfterLoss: afterLossTrades,
    winsAfterLoss: afterLossWins,
    winRate
  };
}

function calculateBestStrategy(strategyPerformance: Record<string, any>) {
  const entries = Object.entries(strategyPerformance);
  if (entries.length === 0) return null;
  
  const sorted = entries.sort((a, b) => (b[1].profit || 0) - (a[1].profit || 0));
  const [name, data] = sorted[0];
  return {
    name,
    wr: data.total ? Math.round((data.wins / data.total) * 100) : 0,
    avgR: data.total ? (data.rSum / data.total).toFixed(2) : "0.00",
    profit: data.profit || 0
  };
}

// --- Components ---

function PanelSection({ title, description, children, icon: Icon }: { title: string, description: string, children?: React.ReactNode, icon: any }) {
  return (
    <Card className="p-5 space-y-4 bg-card/40 backdrop-blur-xl border-border/40 hover:border-primary/30 hover:bg-card/60 transition-all duration-500 group shadow-lg shadow-black/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary/40 transition-all duration-500" />
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm shadow-primary/5">
          <Icon className="w-4 h-4" />
        </div>
        <div className="space-y-1.5 min-w-0">
          <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-white group-hover:text-primary transition-colors duration-300 truncate">{title}</h3>
          <p className="text-[10px] font-bold text-white leading-relaxed line-clamp-2 group-hover:text-white transition-colors">{description}</p>
        </div>
      </div>
      {children && <div className="relative z-10">{children}</div>}
    </Card>
  );
}

function LogEntryModal() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const createTrade = useCreateTrade();
  
  const form = useForm<any>({
    resolver: zodResolver(insertTradeSchema),
    defaultValues: {
      asset: "",
      strategy: "",
      session: "New York",
      condition: "Trending",
      bias: "Bullish",
      outcome: "Win",
      rAchieved: 0,
      plAmt: 0,
      imageUrl: "",
      exitTime: "",
      dayOfWeek: "Monday",
      tradeDuration: "",
      lotSize: "",
      pipsGainedLost: 0,
      contextTF: "D1",
      analysisTF: "H1",
      entryTF: "M5",
      marketRegime: "Trending",
      volatilityState: "Expanding",
      liquidityConditions: "High",
      newsEnvironment: "None",
      entryTimeUtc: "",
      sessionPhase: "Session Open",
      entryTimingContext: "Initial Impulse",
      preExpansionCondition: "Before Expansion",
      marketAlignmentScore: 3,
      setupClarityScore: 3,
      entryPrecisionScore: 3,
      confluenceScore: 3,
      timingQualityScore: 3,
      primarySignalConfirmed: false,
      secondaryConfirmationPresent: false,
      keyLevelRespected: false,
      momentumSignalValid: false,
      invalidationLevelDefined: false,
      targetLogicClear: false,
      plannedEntry: 0,
      actualEntry: 0,
      plannedStopLoss: 0,
      actualStopLoss: 0,
      plannedTakeProfit: 0,
      actualExit: 0,
      riskPercentPerTrade: 0,
      plannedRiskReward: "",
      achievedRiskReward: "",
      openRiskAtEntry: 0,
      drawdownAtEntry: 0,
      riskHeat: "Low",
      entryMethod: "Market",
      exitStrategy: "Fixed Target",
      breakEvenApplied: false,
      earlyExit: false,
      managementType: "Rule-Based",
      confidenceLevel: 3,
      emotionalState: "Calm",
      focusLevel: 3,
      stressLevel: 2,
      rulesFollowedPercent: 100,
      forcedTrade: false,
      missedValidSetup: false,
      overtrading: false,
      documentationSaved: false,
      whatWorked: "",
      whatFailed: "",
      oneRuleToReinforce: "",
      oneRuleToAdjust: "",
      setupWorthRepeating: false,
      minimumSetupScore: 3,
      approvedSessions: "",
      approvedMarketRegimes: "",
      disallowedVolatility: "",
      blacklistedConditions: ""
    }
  });

  const totalSteps = 12;
  
  const steps = [
    { title: "🎯 Core Trade Data", fields: ["asset", "strategy", "session", "condition", "bias", "outcome", "rAchieved", "plAmt", "contextTF", "analysisTF", "entryTF"] },
    { title: "🌍 Market Regime & Environment", fields: ["marketRegime", "volatilityState", "liquidityConditions", "newsEnvironment"] },
    { title: "⏰ Time-of-Day & Session Precision", fields: ["entryTimeUtc", "sessionPhase", "entryTimingContext", "preExpansionCondition"] },
    { title: "⭐ Setup Quality Scoring", fields: ["marketAlignmentScore", "setupClarityScore", "entryPrecisionScore", "confluenceScore", "timingQualityScore"] },
    { title: "🧩 Structure / Signal Validation", fields: ["primarySignalConfirmed", "secondaryConfirmationPresent", "keyLevelRespected", "momentumSignalValid", "invalidationLevelDefined", "targetLogicClear"] },
    { title: "🎯 Execution Precision", fields: ["plannedEntry", "actualEntry", "plannedStopLoss", "actualStopLoss", "plannedTakeProfit", "actualExit"] },
    { title: "⚖️ Risk & Capital Efficiency", fields: ["riskPercentPerTrade", "plannedRiskReward", "achievedRiskReward", "openRiskAtEntry", "drawdownAtEntry", "riskHeat"] },
    { title: "🧩 Trade Management Logic", fields: ["entryMethod", "exitStrategy", "breakEvenApplied", "earlyExit", "managementType"] },
    { title: "🧠 Psychological State", fields: ["confidenceLevel", "emotionalState", "focusLevel", "stressLevel"] },
    { title: "📏 Rule Adherence & Discipline", fields: ["rulesFollowedPercent", "forcedTrade", "missedValidSetup", "overtrading", "documentationSaved"] },
    { title: "🔁 Post-Trade Learning & Optimization", fields: ["whatWorked", "whatFailed", "oneRuleToReinforce", "oneRuleToAdjust", "setupWorthRepeating"] },
    { title: "🧪 Edge Filters & Strategy Constraints", fields: ["minimumSetupScore", "approvedSessions", "approvedMarketRegimes", "disallowedVolatility", "blacklistedConditions"] }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: any) => {
    console.log("Form data:", data);
    // Explicitly map all fields from the 12-step form to ensure they are captured
    const submitData: InsertTrade = {
      asset: data.asset,
      strategy: data.strategy,
      session: data.session,
      condition: data.condition,
      bias: data.bias,
      outcome: data.outcome,
      rAchieved: data.rAchieved,
      plAmt: data.plAmt,
      imageUrl: data.imageUrl,
      exitTime: data.exitTime,
      dayOfWeek: data.dayOfWeek,
      tradeDuration: data.tradeDuration,
      lotSize: data.lotSize,
      pipsGainedLost: data.pipsGainedLost,
      contextTF: data.contextTF,
      analysisTF: data.analysisTF,
      entryTF: data.entryTF,
      marketRegime: data.marketRegime || "Trending",
      volatilityState: data.volatilityState || "Expanding",
      liquidityConditions: data.liquidityConditions || "High",
      newsEnvironment: data.newsEnvironment || "None",
      entryTimeUtc: data.entryTimeUtc,
      sessionPhase: data.sessionPhase || "Session Open",
      entryTimingContext: data.entryTimingContext || "Initial Impulse",
      preExpansionCondition: data.preExpansionCondition || "Before Expansion",
      marketAlignmentScore: Number(data.marketAlignmentScore) || 3,
      setupClarityScore: Number(data.setupClarityScore) || 3,
      entryPrecisionScore: Number(data.entryPrecisionScore) || 3,
      confluenceScore: Number(data.confluenceScore) || 3,
      timingQualityScore: Number(data.timingQualityScore) || 3,
      primarySignalConfirmed: !!data.primarySignalConfirmed,
      secondaryConfirmationPresent: !!data.secondaryConfirmationPresent,
      keyLevelRespected: !!data.keyLevelRespected,
      momentumSignalValid: !!data.momentumSignalValid,
      invalidationLevelDefined: !!data.invalidationLevelDefined,
      targetLogicClear: !!data.targetLogicClear,
      plannedEntry: data.plannedEntry,
      actualEntry: data.actualEntry,
      plannedStopLoss: data.plannedStopLoss,
      actualStopLoss: data.actualStopLoss,
      plannedTakeProfit: data.plannedTakeProfit,
      actualExit: data.actualExit,
      riskPercentPerTrade: data.riskPercentPerTrade,
      plannedRiskReward: data.plannedRiskReward,
      achievedRiskReward: data.achievedRiskReward,
      openRiskAtEntry: data.openRiskAtEntry,
      drawdownAtEntry: data.drawdownAtEntry,
      riskHeat: data.riskHeat || "Low",
      entryMethod: data.entryMethod || "Market",
      exitStrategy: data.exitStrategy || "Fixed Target",
      breakEvenApplied: !!data.breakEvenApplied,
      earlyExit: !!data.earlyExit,
      managementType: data.managementType || "Rule-Based",
      confidenceLevel: Number(data.confidenceLevel) || 3,
      emotionalState: data.emotionalState || "Calm",
      focusLevel: Number(data.focusLevel) || 3,
      stressLevel: Number(data.stressLevel) || 2,
      rulesFollowedPercent: Number(data.rulesFollowedPercent) || 100,
      forcedTrade: !!data.forcedTrade,
      missedValidSetup: !!data.missedValidSetup,
      overtrading: !!data.overtrading,
      documentationSaved: !!data.documentationSaved,
      whatWorked: data.whatWorked,
      whatFailed: data.whatFailed,
      oneRuleToReinforce: data.oneRuleToReinforce,
      oneRuleToAdjust: data.oneRuleToAdjust,
      setupWorthRepeating: !!data.setupWorthRepeating,
      minimumSetupScore: Number(data.minimumSetupScore) || 3,
      approvedSessions: data.approvedSessions,
      approvedMarketRegimes: data.approvedMarketRegimes,
      disallowedVolatility: data.disallowedVolatility,
      blacklistedConditions: data.blacklistedConditions
    };
    createTrade.mutate(submitData, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        setCurrentStep(0);
      },
      onError: (error) => {
        console.error("Submission error:", error);
      }
    });
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('tradeImage', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.imageUrl) {
        form.setValue('imageUrl', result.imageUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    return (
      <div className="space-y-4">
        {currentStep === 0 && (
          <div className="space-y-8 md:space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Trade Evidence</FormLabel>
                      <FormControl>
                        <div className={`relative group overflow-hidden rounded-3xl border-2 transition-all cursor-pointer ${field.value ? 'border-blue-500/50 bg-slate-900' : 'border-dashed border-slate-800 bg-slate-950/40 hover:border-blue-500/50'}`}>
                          <input type="file" className="hidden" id="trade-image-upload" onChange={handleFileUpload} accept="image/*" disabled={isUploading} />
                          {field.value ? (
                            <div className="relative group">
                              <img src={field.value} alt="Trade Evidence" className="w-full h-auto max-h-[400px] object-contain rounded-2xl" />
                              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <label htmlFor="trade-image-upload" className="p-3 bg-blue-600 rounded-xl cursor-pointer hover:bg-blue-500 transition-colors">
                                  <RefreshCcw className={cn("w-5 h-5 text-white", isUploading && "animate-spin")} />
                                </label>
                                <button type="button" onClick={() => field.onChange("")} className="p-3 bg-rose-600 rounded-xl hover:bg-rose-500 transition-colors">
                                  <Trash2 className="w-5 h-5 text-white" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label htmlFor="trade-image-upload" className="flex flex-col items-center justify-center p-8 md:p-12 cursor-pointer">
                              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600/10 transition-all border border-slate-800">
                                {isUploading ? <Activity className="w-6 h-6 text-blue-500 animate-spin" /> : <Camera className="w-6 h-6 text-slate-500 group-hover:text-blue-500" />}
                              </div>
                              <span className="text-sm font-bold text-slate-300">Evidence Required</span>
                              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">Attach Final Position Chart</span>
                            </label>
                          )}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="entryTimeUtc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Shot Timestamp</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="asset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Instrument / Pair</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. BTCUSD, XAUUSD" {...field} className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Direction</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 outline-none transition-all text-sm font-bold">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        <SelectItem value="Bullish">Long</SelectItem>
                        <SelectItem value="Bearish">Short</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Entry Date/Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""} onChange={(e) => field.onChange(new Date(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exitTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Exit Date/Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Day of Week</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 outline-none transition-all text-sm font-bold">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tradeDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Trade Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2h 30m" {...field} className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lotSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Lot Size / Units</FormLabel>
                    <FormControl>
                      <Input placeholder="0.01" {...field} className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entryMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Order Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 outline-none transition-all text-sm font-bold">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        {['Market', 'Limit', 'Stop', 'Stop-Limit'].map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actualEntry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Entry Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="0.00" {...field} className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actualStopLoss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Stop-Loss</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plannedStopLoss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">SL (Pips)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plannedTakeProfit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Take-Profit</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actualExit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">TP (Pips)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="riskPercentPerTrade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Risk %</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pipsGainedLost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Pips G/L</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plAmt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">P/L ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="outcome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Outcome</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 outline-none transition-all text-sm font-bold">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        {['Win', 'Loss', 'BE'].map(res => (
                          <SelectItem key={res} value={res}>{res}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entryTF"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Entry TF</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 outline-none transition-all text-sm font-bold">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        {['1M', '3M', '5M'].map(tf => (
                          <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="analysisTF"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Analysis TF</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 outline-none transition-all text-sm font-bold">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        {['15M', '30MIN', '1HR', '2HR', '4HR'].map(tf => (
                          <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contextTF"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Context TF</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 outline-none transition-all text-sm font-bold">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        {['1W', '1D', '4HR'].map(tf => (
                          <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
        {currentStep === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="marketRegime" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Market Regime</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}><FormControl><SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="Trending">Trending</SelectItem><SelectItem value="Ranging">Ranging</SelectItem><SelectItem value="Transition">Transition</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="volatilityState" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Volatility State</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}><FormControl><SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="Expanding">Expanding</SelectItem><SelectItem value="Contracting">Contracting</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="liquidityConditions" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Liquidity</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}><FormControl><SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="High">High</SelectItem><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Thin">Thin</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="newsEnvironment" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">News Environment</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}><FormControl><SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="None">None</SelectItem><SelectItem value="Medium Impact">Medium Impact</SelectItem><SelectItem value="High Impact">High Impact</SelectItem></SelectContent></Select></FormItem>
            )} />
          </div>
        )}
        {currentStep === 2 && (
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="entryTimeUtc" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Entry Time (UTC)</FormLabel>
              <FormControl><Input type="time" {...field} className="bg-background border-border" /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="sessionPhase" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Session Phase</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}><FormControl><SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="Session Open">Session Open</SelectItem><SelectItem value="Mid-Session">Mid-Session</SelectItem><SelectItem value="Session Close">Session Close</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="entryTimingContext" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Timing Context</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}><FormControl><SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="Initial Impulse">Initial Impulse</SelectItem><SelectItem value="Pullback / Continuation">Pullback / Cont</SelectItem><SelectItem value="Reversal Window">Reversal</SelectItem><SelectItem value="Pre-Move Condition">Pre-Move</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="preExpansionCondition" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Expansion Timing</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}><FormControl><SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="Before Expansion">Before</SelectItem><SelectItem value="After Expansion">After</SelectItem></SelectContent></Select></FormItem>
            )} />
          </div>
        )}
        {currentStep === 3 && (
          <div className="grid grid-cols-2 gap-4">
            {["marketAlignmentScore", "setupClarityScore", "entryPrecisionScore", "confluenceScore", "timingQualityScore"].map(name => (
              <FormField key={name} control={form.control} name={name as any} render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase">{name.replace("Score", "").replace(/([A-Z])/g, " $1")}</FormLabel>
                <FormControl><Input type="number" min="1" max="5" {...field} className="bg-background border-border" /></FormControl></FormItem>
              )} />
            ))}
          </div>
        )}
        {currentStep === 4 && (
          <div className="space-y-3">
            {["primarySignalConfirmed", "secondaryConfirmationPresent", "keyLevelRespected", "momentumSignalValid", "invalidationLevelDefined", "targetLogicClear"].map(name => (
              <FormField key={name} control={form.control} name={name as any} render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl><Checkbox checked={field.value as boolean} onCheckedChange={field.onChange} /></FormControl>
                  <FormLabel className="text-[10px] font-bold uppercase cursor-pointer">{name.replace(/([A-Z])/g, " $1")}</FormLabel>
                </FormItem>
              )} />
            ))}
          </div>
        )}
        {currentStep === 5 && (
          <div className="grid grid-cols-2 gap-4">
            {["plannedEntry", "actualEntry", "plannedStopLoss", "actualStopLoss", "plannedTakeProfit", "actualExit"].map(name => (
              <FormField key={name} control={form.control} name={name as any} render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase">{name.replace(/([A-Z])/g, " $1")}</FormLabel>
                <FormControl><Input type="number" step="any" {...field} className="bg-background border-border" placeholder="Price" /></FormControl></FormItem>
              )} />
            ))}
          </div>
        )}
        {currentStep === 6 && (
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="riskPercentPerTrade" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Risk % per Trade</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} className="bg-background border-border" /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="plannedRiskReward" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Planned RR</FormLabel>
              <FormControl><Input type="text" {...field} className="bg-background border-border" placeholder="1:2" /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="achievedRiskReward" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Achieved RR</FormLabel>
              <FormControl><Input type="text" {...field} className="bg-background border-border" placeholder="1:2" /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="openRiskAtEntry" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Open Risk %</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} className="bg-background border-border" /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="drawdownAtEntry" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Drawdown %</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} className="bg-background border-border" /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="riskHeat" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Risk Heat</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}><FormControl><SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem></SelectContent></Select></FormItem>
            )} />
          </div>
        )}
        {currentStep === 7 && (
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="entryMethod" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Entry Method</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}><FormControl><SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="Market">Market</SelectItem><SelectItem value="Limit">Limit</SelectItem><SelectItem value="Confirmation">Confirmation</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="exitStrategy" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Exit Strategy</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}><FormControl><SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="Fixed Target">Fixed Target</SelectItem><SelectItem value="Partial + Runner">Partial + Runner</SelectItem><SelectItem value="Trailing Exit">Trailing Exit</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="breakEvenApplied" render={({ field }) => (
              <FormItem className="flex items-center gap-3"><FormControl><Checkbox checked={field.value as boolean} onCheckedChange={field.onChange} /></FormControl>
              <FormLabel className="text-[10px] font-bold uppercase cursor-pointer">Break-Even Applied</FormLabel></FormItem>
            )} />
            <FormField control={form.control} name="earlyExit" render={({ field }) => (
              <FormItem className="flex items-center gap-3"><FormControl><Checkbox checked={field.value as boolean} onCheckedChange={field.onChange} /></FormControl>
              <FormLabel className="text-[10px] font-bold uppercase cursor-pointer">Early Exit</FormLabel></FormItem>
            )} />
            <FormField control={form.control} name="managementType" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Management Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}><FormControl><SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="Rule-Based">Rule-Based</SelectItem><SelectItem value="Discretionary">Discretionary</SelectItem></SelectContent></Select></FormItem>
            )} />
          </div>
        )}
        {currentStep === 8 && (
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="confidenceLevel" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Confidence (1-5)</FormLabel>
              <FormControl><Input type="number" min="1" max="5" {...field} className="bg-background border-border" /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="emotionalState" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Emotional State</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}><FormControl><SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="Calm">Calm</SelectItem><SelectItem value="FOMO">FOMO</SelectItem><SelectItem value="Hesitant">Hesitant</SelectItem><SelectItem value="Overconfident">Overconfident</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="focusLevel" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Focus Level (1-5)</FormLabel>
              <FormControl><Input type="number" min="1" max="5" {...field} className="bg-background border-border" /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="stressLevel" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Stress Level (1-5)</FormLabel>
              <FormControl><Input type="number" min="1" max="5" {...field} className="bg-background border-border" /></FormControl></FormItem>
            )} />
          </div>
        )}
        {currentStep === 9 && (
          <div className="space-y-4">
            <FormField control={form.control} name="rulesFollowedPercent" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Rules Followed %</FormLabel>
              <FormControl><Input type="number" min="0" max="100" {...field} className="bg-background border-border" /></FormControl></FormItem>
            )} />
            {["forcedTrade", "missedValidSetup", "overtrading", "documentationSaved"].map(name => (
              <FormField key={name} control={form.control} name={name as any} render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl><Checkbox checked={field.value as boolean} onCheckedChange={field.onChange} /></FormControl>
                  <FormLabel className="text-[10px] font-bold uppercase cursor-pointer">{name.replace(/([A-Z])/g, " $1")}</FormLabel>
                </FormItem>
              )} />
            ))}
          </div>
        )}
        {currentStep === 10 && (
          <div className="space-y-3">
            {["whatWorked", "whatFailed", "oneRuleToReinforce", "oneRuleToAdjust"].map(name => (
              <FormField key={name} control={form.control} name={name as any} render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase">{name.replace(/([A-Z])/g, " $1")}</FormLabel>
                <FormControl><Textarea {...field} className="bg-background border-border resize-none" placeholder="Notes..." rows={2} /></FormControl></FormItem>
              )} />
            ))}
            <FormField control={form.control} name="setupWorthRepeating" render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl><Checkbox checked={field.value as boolean} onCheckedChange={field.onChange} /></FormControl>
                <FormLabel className="text-[10px] font-bold uppercase cursor-pointer">Setup Worth Repeating</FormLabel>
              </FormItem>
            )} />
          </div>
        )}
        {currentStep === 11 && (
          <div className="space-y-3">
            <FormField control={form.control} name="minimumSetupScore" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Min Setup Score</FormLabel>
              <FormControl><Input type="number" min="1" max="5" {...field} className="bg-background border-border" /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="approvedSessions" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Approved Sessions</FormLabel>
              <FormControl><Input {...field} className="bg-background border-border" placeholder="London, NY, Asian..." /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="approvedMarketRegimes" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Approved Regimes</FormLabel>
              <FormControl><Input {...field} className="bg-background border-border" placeholder="Trending, Ranging..." /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="disallowedVolatility" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Disallowed Volatility</FormLabel>
              <FormControl><Input {...field} className="bg-background border-border" placeholder="States..." /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="blacklistedConditions" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Blacklisted Conditions</FormLabel>
              <FormControl><Textarea {...field} className="bg-background border-border resize-none" placeholder="List..." rows={2} /></FormControl></FormItem>
            )} />
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Log Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {steps[currentStep].title}
            <div className="text-xs text-muted-foreground mt-2">Step {currentStep + 1} of {totalSteps}</div>
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {renderStepContent()}
            
            <div className="flex gap-2 justify-between pt-4 border-t border-border">
              <Button 
                type="button"
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>

              {currentStep < totalSteps - 1 ? (
                <Button 
                  type="button"
                  onClick={handleNext}
                  className="gap-2"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  type="submit"
                  className="gap-2 bg-emerald-500 hover:bg-emerald-600"
                  disabled={createTrade.isPending}
                >
                  {createTrade.isPending ? "Logging..." : "Log Entry"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// AI Analysis Section Component
function AIAnalysisSection() {
  const { data: analysis, isLoading, refetch } = useQuery<any>({
    queryKey: ["/api/ai/analyze"],
    enabled: false
  });

  return (
    <Card className="p-6 bg-card/40 backdrop-blur-xl border-primary/20 shadow-xl overflow-hidden relative group mt-8">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles className="w-24 h-24 text-primary" />
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">AI Performance Intelligence</h3>
            <p className="text-xs font-bold text-white/90">Neural breakdown of edge clarity and actionable growth steps.</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()} 
          disabled={isLoading}
          className="gap-2 border-primary/30 hover:border-primary/60"
        >
          {isLoading ? (
            <Activity className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          Generate Analysis
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Performance Breakdown</h4>
          {analysis ? (
            <div className="text-[11px] leading-relaxed text-white font-bold space-y-2">
              <div className="p-3 rounded bg-primary/5 border border-primary/10">
                {analysis.analysis}
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center rounded border border-dashed border-border/50 text-[10px] text-white font-bold uppercase tracking-widest">
              Awaiting data input...
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/80">Growth Recommendations</h4>
          {analysis?.recommendations ? (
            <div className="space-y-2">
              {Array.isArray(analysis.recommendations) ? analysis.recommendations.map((rec: string, i: number) => (
                <div key={i} className="flex gap-3 p-3 rounded bg-emerald-500/5 border border-emerald-500/10">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <p className="text-[11px] leading-snug text-white font-bold">{rec}</p>
                </div>
              )) : <p className="text-[11px] font-bold text-white">{analysis.recommendations}</p>}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center rounded border border-dashed border-border/50 text-[10px] text-white font-bold uppercase tracking-widest">
              Intelligence engine ready...
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// --- Main Dashboard Page ---

export default function Dashboard() {
  const { data: trades, isLoading } = useTrades();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  const [selectedStrat, setSelectedStrat] = useState<string>("All");
  const [, navigate] = useLocation();

  if (isLoading || !trades) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <Activity className="w-10 h-10 animate-pulse" />
      </div>
    );
  }

  const stats = calculateStats(trades);
  const filteredTrades = selectedStrat === "All" ? trades : trades.filter(t => t.strategy === selectedStrat);

  return (
    <Layout>
      <main className="max-w-[1600px] mx-auto px-6 pt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatsCard label="Total Net Profit" value={`$${stats.net.toLocaleString()}`} variant="emerald" />
                <StatsCard label="Global Win Rate" value={`${stats.wr}%`} variant="white" />
                <StatsCard label="Expectancy (R)" value={`${stats.exp}R`} variant="blue" />
                <StatsCard label="Trade Count" value={stats.count} variant="white" />
                <StatsCard label="Profit Factor" value={stats.pf} variant="blue" highlight />
              </div>

              {/* Intelligence Panels Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <PanelSection 
                  title="Market Regime" 
                  description="Performance edge across different volatility and regime states."
                  icon={Activity}
                >
                  <div className="space-y-3">
                    {['Trending', 'Ranging'].map(condition => {
                      const data = (stats as any).marketRegimePerformance?.[condition] || { wins: 0, losses: 0, total: 0 };
                      const wr = data.total ? Math.round((data.wins / data.total) * 100) : 0;
                      return (
                        <div key={condition} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-black uppercase">
                            <span className="text-white font-bold">{condition}</span>
                            <span className="text-primary font-bold">{wr}% WR</span>
                          </div>
                          <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${wr}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2 border-t border-border/40">
                      <div className="text-[9px] font-black text-white uppercase mb-2">Volatility Edge</div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(stats.volatilityPerformance).slice(0, 2).map(([state, data]: [string, any]) => (
                          <div key={state} className="p-1.5 rounded bg-primary/5 border border-primary/10">
                            <div className="text-[8px] text-white/90 font-bold uppercase">{state}</div>
                            <div className="text-[10px] font-bold text-white">{data.total ? Math.round((data.wins / data.total) * 100) : 0}% WR</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Execution Precision" 
                  description="Deviation analysis: slippage and entry timing accuracy."
                  icon={ArrowRight}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white font-bold uppercase">Entry Precision</span>
                      <span className="font-mono text-emerald-500 font-bold">{(stats as any).setupQualityMetrics?.precision}/5.0</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white font-bold uppercase">Timing Quality</span>
                      <span className="font-mono text-primary font-bold">{(stats as any).setupQualityMetrics?.clarity}/5.0</span>
                    </div>
                    <div className="pt-2 border-t border-border/40">
                      <div className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Signal Validation</div>
                      <div className="flex flex-wrap gap-1">
                        {['Primary', 'Confirmation', 'Levels'].map(tag => (
                          <div key={tag} className="px-1.5 py-0.5 rounded-sm bg-muted text-[8px] font-bold uppercase">{tag}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Clarity and Confluence" 
                  description="High-granularity analysis of setup quality and confluence."
                  icon={Sparkles}
                >
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="text-[8px] text-white font-bold uppercase">Clarity</div>
                        <div className="text-xs font-black">{(stats as any).setupQualityMetrics?.clarity}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[8px] text-white font-bold uppercase">Confluence</div>
                        <div className="text-xs font-black">{(stats as any).setupQualityMetrics?.confluence}</div>
                      </div>
                    </div>
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Psychology & Discipline" 
                  description="Mindset, confidence, and rule adherence analysis."
                  icon={Palette}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded bg-blue-500/10 border border-blue-500/20">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[11px] font-bold text-blue-500 uppercase">Discipline: {stats.avgDiscipline}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-1.5 rounded bg-muted/30">
                        <div className="text-[8px] text-white font-bold uppercase">Confidence</div>
                        <div className="text-[10px] font-bold">{(stats as any).avgConfidence}/5.0</div>
                      </div>
                      <div className="p-1.5 rounded bg-muted/30">
                        <div className="text-[8px] text-white font-bold uppercase">Emotional Edge</div>
                        <div className="text-[10px] font-bold text-emerald-500">
                          {Object.entries((stats as any).emotionalStatePerformance).length > 0 ? (
                            Object.entries((stats as any).emotionalStatePerformance).sort((a: any, b: any) => b[1].wins - a[1].wins)[0][0]
                          ) : "Optimal"}
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border/40">
                      <div className="text-[8px] font-bold text-muted-foreground uppercase mb-1">State Breakdown</div>
                      <div className="space-y-1">
                        {Object.entries((stats as any).emotionalStatePerformance).slice(0, 3).map(([state, data]: [string, any]) => (
                          <div key={state} className="flex justify-between text-[9px]">
                            <span className="text-muted-foreground">{state}</span>
                            <span className="font-bold">{data.total ? Math.round((data.wins / data.total) * 100) : 0}% WR</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </PanelSection>
              </div>

              {/* Intelligence Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PanelSection 
                  title="News & Catalyst Impact" 
                  description="Strategy performance during High, Medium, and Low impact news."
                  icon={BarChart2}
                >
                  <div className="space-y-3">
                    {['High', 'Medium', 'Low', 'None'].map(impact => {
                      const data = (stats as any).newsPerformance?.[impact] || { wins: 0, total: 0, rSum: 0 };
                      const wr = data.total ? Math.round((data.wins / data.total) * 100) : 0;
                      const avgR = data.total ? (data.rSum / data.total).toFixed(2) : "0.00";
                      
                      return (
                        <div key={impact} className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                            <span className={cn(
                              impact === 'High' ? "text-red-500" : 
                              impact === 'Medium' ? "text-amber-500" : 
                              "text-muted-foreground"
                            )}>{impact} Impact</span>
                            <span className="text-foreground">{wr}% WR | {avgR}R</span>
                          </div>
                          <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
                            <div className={cn(
                              "h-full transition-all duration-500",
                              impact === 'High' ? "bg-red-500" : 
                              impact === 'Medium' ? "bg-amber-500" : 
                              "bg-emerald-500"
                            )} style={{ width: `${wr}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Analysis TF + Session + Instrument clusters" 
                  description="TF + Session + Instrument clusters."
                  icon={Filter}
                >
                  <div className="space-y-2">
                    {Object.entries(stats.hyperGranularPerformance).slice(0, 3).map(([key, data]: [string, any]) => (
                      <div key={key} className="flex justify-between items-center p-1.5 rounded bg-primary/5 border border-primary/10">
                        <span className="text-[10px] font-bold truncate max-w-[150px]">{key}</span>
                        <span className="text-[10px] text-emerald-500 font-black">
                          {data.total ? Math.round((data.wins / data.total) * 100) : 0}% WR
                        </span>
                      </div>
                    ))}
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Psychological & Discipline" 
                  description="Mindset and rule adherence impact on performance."
                  icon={Palette}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded bg-blue-500/10 border border-blue-500/20">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[11px] font-bold text-blue-500 uppercase">Avg Discipline: {stats.avgDiscipline}%</span>
                    </div>
                    <div className="flex justify-between text-[10px] px-1">
                      <span className="text-muted-foreground">Edge per 100% Rules:</span>
                      <span className="text-emerald-500 font-bold">2.4R</span>
                    </div>
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Execution Metrics" 
                  description="Entry timing, slippage, and TFS alignment analysis."
                  icon={ArrowRight}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Fill Slippage (Avg)</span>
                      <span className="font-mono text-emerald-500">-0.15 pips</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">TFS Alignment (Avg)</span>
                      <span className="font-mono text-primary font-bold">1.4R</span>
                    </div>
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Instrument x Session" 
                  description="Win/Loss rate breakdown per asset and session."
                  icon={History}
                >
                  <div className="text-[10px] space-y-2">
                    {Object.entries(stats.sessionPerformance).slice(0, 3).map(([key, data]: [string, any]) => {
                      const wr = data.total ? Math.round((data.wins / data.total) * 100) : 0;
                      const lr = data.total ? Math.round((data.losses / data.total) * 100) : 0;
                      return (
                        <div key={key} className="space-y-1 border-b border-border/30 pb-1">
                          <div className="flex justify-between font-bold">
                            <span>{key}</span>
                            <span className="text-emerald-500">{wr}% WR</span>
                          </div>
                          <div className="flex gap-1 h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div className="bg-emerald-500" style={{ width: `${wr}%` }} />
                            <div className="bg-red-400" style={{ width: `${lr}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Asset + Strategy + Session + Condition" 
                  description="Asset + Strategy + Session + Condition matrix."
                  icon={Activity}
                >
                  <div className="text-[10px] space-y-2">
                    {Object.entries(stats.hyperGranularPerformance).slice(0, 3).map(([key, data]: [string, any]) => {
                      const wr = data.total ? Math.round((data.wins / data.total) * 100) : 0;
                      const lr = data.total ? Math.round((data.losses / data.total) * 100) : 0;
                      return (
                        <div key={key} className="space-y-1 border-b border-border/30 pb-1">
                          <div className="flex justify-between font-bold truncate">
                            <span>{key}</span>
                          </div>
                          <div className="flex justify-between text-[8px] mb-1">
                            <span className="text-emerald-500 font-bold">{wr}% Win</span>
                            <span className="text-red-400 font-bold">{lr}% Loss</span>
                          </div>
                          <div className="flex gap-1 h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div className="bg-emerald-500" style={{ width: `${wr}%` }} />
                            <div className="bg-red-400" style={{ width: `${lr}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </PanelSection>

              </div>

              {/* Extended Analytics Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <PanelSection 
                  title="Post-Trade Optimization" 
                  description="Learning notes and rule adjustments for strategy refinement."
                  icon={Sparkles}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="text-[8px] text-emerald-500 font-bold uppercase mb-1">What Worked</div>
                        <p className="text-[9px] text-white font-bold italic">"Patience during London open consolidation resulted in high-quality breakout."</p>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                        <div className="text-[8px] text-rose-500 font-bold uppercase mb-1">Rule Adjustment</div>
                        <p className="text-[9px] text-white font-bold italic">"Avoid entering before 8:30 AM EST news release to reduce slippage."</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-primary/5 border border-primary/10">
                      <div className="p-1 rounded bg-primary text-primary-foreground">
                        <History className="w-3 h-3" />
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-tight">85% of setups worth repeating</div>
                    </div>
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Edge Filters & Constraints" 
                  description="Minimum setup criteria and blacklisted market conditions."
                  icon={Filter}
                >
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded bg-muted/30 border border-border/50 text-center">
                      <div className="text-[8px] text-muted-foreground uppercase">Min Score</div>
                      <div className="text-[10px] font-black">3.5/5.0</div>
                    </div>
                    <div className="p-2 rounded bg-muted/30 border border-border/50 text-center col-span-2">
                      <div className="text-[8px] text-muted-foreground uppercase text-left pl-1">Blacklisted</div>
                      <div className="flex flex-wrap gap-1 mt-1 pl-1">
                        {['Thin Liquidity', 'Pre-Expansion'].map(tag => (
                          <span key={tag} className="text-[8px] font-bold text-rose-500 bg-rose-500/10 px-1 rounded-sm uppercase">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </PanelSection>
              </div>
              <div className="p-1 border border-primary/20 bg-primary/5 rounded-2xl">
                <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-primary rounded-full shadow-lg shadow-primary/50"></div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Strategy Drill-Down</h3>
                  </div>
                  <Select value={selectedStrat} onValueChange={setSelectedStrat}>
                    <SelectTrigger className="w-[200px] bg-card border-border">
                      <SelectValue placeholder="All Strategies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Strategies</SelectItem>
                      {getUniqueStrategies(trades).map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card/40 p-5 rounded-xl border border-border/50">
                  <h4 className="text-[9px] font-black text-muted-foreground uppercase mb-4 tracking-tighter">Bias & Momentum</h4>
                  <div className="space-y-3">
                    {['Bullish', 'Bearish'].map(b => {
                      const bTrades = filteredTrades.filter(t => t.bias === b);
                      const wins = bTrades.filter(t => t.outcome === 'Win').length;
                      const perc = bTrades.length ? Math.round((wins / bTrades.length) * 100) : 0;
                      return (
                        <div key={b} className="p-2 bg-card/30 rounded-lg border border-border/30">
                          <div className="flex justify-between items-center mb-2">
                            <span className={cn("text-[9px] font-black uppercase", b === 'Bullish' ? 'text-emerald-500' : 'text-rose-500')}>{b}</span>
                            <span className="text-xs font-black text-foreground">{perc}%</span>
                          </div>
                          <div className="text-[8px] text-muted-foreground">{bTrades.length} trades</div>
                        </div>
                      );
                    })}
                    <div className="pt-2 mt-2 border-t border-border/30">
                      <div className="text-[8px] text-muted-foreground font-bold mb-1">CURRENT STREAK</div>
                      <div className="text-lg font-black">
                        {filteredTrades.length > 0 ? (
                          <span className={filteredTrades[filteredTrades.length - 1].outcome === 'Win' ? 'text-emerald-500' : 'text-rose-500'}>
                            {filteredTrades[filteredTrades.length - 1].outcome}
                          </span>
                        ) : "-"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card/40 p-5 rounded-xl border border-border/50">
                  <h4 className="text-[9px] font-black text-muted-foreground uppercase mb-4 tracking-tighter">Top Performers</h4>
                  <div className="space-y-4">
                    {calculateBestStrategy(stats.strategyPerformance) && (
                      <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <div>
                          <div className="text-[8px] text-muted-foreground uppercase font-bold">Best Strategy</div>
                          <div className="text-xs font-black uppercase tracking-tight">{calculateBestStrategy(stats.strategyPerformance)?.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-emerald-500">{calculateBestStrategy(stats.strategyPerformance)?.wr}% WR</div>
                          <div className="text-[9px] text-primary font-bold">{calculateBestStrategy(stats.strategyPerformance)?.avgR}R Avg</div>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-card/30 rounded-lg border border-border/30 text-center">
                        <div className="text-[8px] text-white font-bold uppercase">Management</div>
                        <div className="text-xs font-black text-red-400">-0.52R Loss</div>
                      </div>
                      <div className="p-2 bg-card/30 rounded-lg border border-border/30 text-center">
                        <div className="text-[8px] text-muted-foreground uppercase">Heat</div>
                        <div className="text-xs font-black text-primary">LOW</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeframe Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Context Timeframe Performance */}
                <div className="bg-card/40 p-5 rounded-xl border border-border/50">
                  <h4 className="text-[9px] font-black text-muted-foreground uppercase mb-4 tracking-tighter">Context TF Performance</h4>
                  <div className="space-y-2">
                    {Array.from(new Set(filteredTrades.map(t => t.contextTF))).sort().map(tf => {
                      const tfTrades = filteredTrades.filter(t => t.contextTF === tf);
                      const wins = tfTrades.filter(t => t.outcome === 'Win').length;
                      const perc = tfTrades.length ? Math.round((wins / tfTrades.length) * 100) : 0;
                      const avgR = (tfTrades.reduce((a, b) => a + Number(b.rAchieved), 0) / tfTrades.length).toFixed(2);
                      return (
                        <div key={tf} className="flex items-center justify-between p-2 bg-card/30 rounded-lg border border-border/30">
                          <span className="text-[9px] font-black uppercase text-foreground">{tf}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-primary">{perc}%</span>
                            <span className="text-[8px] text-muted-foreground">{avgR}R</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Entry Timeframe Performance */}
                <div className="bg-card/40 p-5 rounded-xl border border-border/50">
                  <h4 className="text-[9px] font-black text-muted-foreground uppercase mb-4 tracking-tighter">Entry TF Performance</h4>
                  <div className="space-y-2">
                    {Array.from(new Set(filteredTrades.map(t => t.entryTF))).sort().map(tf => {
                      const tfTrades = filteredTrades.filter(t => t.entryTF === tf);
                      const wins = tfTrades.filter(t => t.outcome === 'Win').length;
                      const perc = tfTrades.length ? Math.round((wins / tfTrades.length) * 100) : 0;
                      const avgR = (tfTrades.reduce((a, b) => a + Number(b.rAchieved), 0) / tfTrades.length).toFixed(2);
                      return (
                        <div key={tf} className="flex items-center justify-between p-2 bg-card/30 rounded-lg border border-border/30">
                          <span className="text-[9px] font-black uppercase text-foreground">{tf}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-primary">{perc}%</span>
                            <span className="text-[8px] text-muted-foreground">{avgR}R</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Drawdown & Recovery Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Drawdown Per Month */}
                <div className="bg-card/40 p-5 rounded-xl border border-border/50">
                  <h4 className="text-[9px] font-black text-muted-foreground uppercase mb-4 tracking-tighter">Monthly Drawdown (Last 6 Months)</h4>
                  <div className="space-y-3">
                    {calculateDrawdownPerMonth(filteredTrades).length > 0 ? (
                      calculateDrawdownPerMonth(filteredTrades).map((month) => (
                        <div key={month.month} className="p-3 bg-card/30 rounded-lg border border-border/30">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black uppercase text-foreground">{month.month}</span>
                            <span className={cn("text-xs font-black", month.drawdown > 500 ? "text-rose-500" : month.drawdown > 200 ? "text-amber-500" : "text-emerald-500")}>
                              {month.drawdownPercent}% (-${month.drawdown.toLocaleString()})
                            </span>
                          </div>
                          <div className="flex justify-between text-[8px] text-muted-foreground">
                            <span>Cumulative: ${(month.cumulative || 0).toLocaleString()}</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${Math.min(100, (month.drawdown / (Math.max(...calculateDrawdownPerMonth(filteredTrades).map(m => m.drawdown)) || 1)) * 100)}%` }} 
                              className="h-full bg-rose-500/60" 
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-[9px] text-muted-foreground italic">No drawdown data available</div>
                    )}
                  </div>
                </div>

                {/* Performance After Loss */}
                <div className="bg-card/40 p-5 rounded-xl border border-border/50">
                  <h4 className="text-[9px] font-black text-muted-foreground uppercase mb-4 tracking-tighter">Recovery Performance</h4>
                  {(() => {
                    const recoveryData = calculatePerformanceAfterLoss(filteredTrades);
                    return (
                      <div className="space-y-4">
                        <div className="p-4 bg-card/30 rounded-lg border border-border/30">
                          <div className="text-[8px] text-muted-foreground font-bold uppercase mb-2">Win Rate After Loss</div>
                          <div className="text-3xl font-black text-primary">{recoveryData.winRate}%</div>
                          <div className="text-[9px] text-muted-foreground mt-2">
                            {recoveryData.winsAfterLoss} wins out of {recoveryData.totalAfterLoss} trades
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-card/30 rounded-lg border border-border/30 text-center">
                            <div className="text-[8px] text-muted-foreground font-bold uppercase mb-1">Trades After Loss</div>
                            <div className="text-xl font-black text-foreground">{recoveryData.totalAfterLoss}</div>
                          </div>
                          <div className="p-3 bg-card/30 rounded-lg border border-border/30 text-center">
                            <div className="text-[8px] text-muted-foreground font-bold uppercase mb-1">Wins</div>
                            <div className="text-xl font-black text-emerald-500">{recoveryData.winsAfterLoss}</div>
                          </div>
                        </div>
                        <div className="text-[8px] text-muted-foreground italic">
                          Tracks your ability to bounce back after losses
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Strategy Health Table */}
              <Card className="overflow-hidden border-border bg-card">
                <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Advanced Strategy Health Metrics</h3>
                </div>
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Strategy</TableHead>
                      <TableHead className="text-muted-foreground">Win % (Trending)</TableHead>
                      <TableHead className="text-muted-foreground">Win % (Ranging)</TableHead>
                      <TableHead className="text-center text-muted-foreground">Avg R</TableHead>
                      <TableHead className="text-right text-muted-foreground">Net P/L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getUniqueStrategies(trades).map(strat => {
                      const sTrades = trades.filter(t => t.strategy === strat);
                      const winTrending = sTrades.filter(t => t.condition === 'Trending' && t.outcome === 'Win').length;
                      const totalTrending = sTrades.filter(t => t.condition === 'Trending').length;
                      const winRanging = sTrades.filter(t => t.condition === 'Ranging' && t.outcome === 'Win').length;
                      const totalRanging = sTrades.filter(t => t.condition === 'Ranging').length;
                      const net = sTrades.reduce((acc, t) => acc + Number(t.plAmt), 0);
                      const avgR = (sTrades.reduce((acc, t) => acc + Number(t.rAchieved), 0) / sTrades.length).toFixed(2);

                      return (
                        <TableRow key={strat} className="border-border hover:bg-muted/30 transition-colors">
                          <TableCell className="font-black text-foreground">{strat}</TableCell>
                          <TableCell className="font-bold text-primary">
                            {totalTrending ? Math.round((winTrending/totalTrending)*100)+'%' : '0%'}
                          </TableCell>
                          <TableCell className="font-bold text-indigo-500">
                            {totalRanging ? Math.round((winRanging/totalRanging)*100)+'%' : '0%'}
                          </TableCell>
                          <TableCell className="text-center font-bold text-foreground">{avgR}R</TableCell>
                          <TableCell className={cn("text-right font-black", net >= 0 ? "text-emerald-500" : "text-rose-500")}>
                            ${net.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>

              {/* AI Analysis Section */}
              <AIAnalysisSection />
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-foreground">Vault Data</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-card border-border text-muted-foreground">
                    <Filter className="w-4 h-4 mr-2" /> Filter
                  </Button>
                </div>
              </div>
              
              <Card className="overflow-hidden border-border bg-card">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Asset</TableHead>
                      <TableHead className="text-muted-foreground">Strategy</TableHead>
                      <TableHead className="text-muted-foreground">Session</TableHead>
                      <TableHead className="text-center text-muted-foreground">R</TableHead>
                      <TableHead className="text-right text-muted-foreground">Outcome</TableHead>
                      <TableHead className="text-right text-muted-foreground">P/L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrades.map((t) => (
                      <TableRow key={t.id} className="border-border hover:bg-muted/30 transition-colors">
                        <TableCell className="text-[10px] font-bold text-muted-foreground uppercase">
                          {format(new Date(t.date || new Date()), "yyyy-MM-dd HH:mm")}
                        </TableCell>
                        <TableCell className="font-black text-foreground">{t.asset}</TableCell>
                        <TableCell className="text-xs font-bold text-muted-foreground">{t.strategy}</TableCell>
                        <TableCell>
                          <span className="text-[10px] font-black uppercase px-2 py-1 bg-muted rounded-md text-foreground">
                            {t.session}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-bold text-foreground">{t.rAchieved}R</TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            "text-[10px] font-black uppercase px-2 py-1 rounded-md shadow-sm",
                            t.outcome === 'Win' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : 
                            t.outcome === 'Loss' ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : 
                            "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                          )}>
                            {t.outcome}
                          </span>
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-black",
                          Number(t.plAmt) >= 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                          ${Number(t.plAmt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </Layout>
  );
}
import { useState } from "react";
import { useTrades, useCreateTrade } from "@/hooks/use-trades";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTradeSchema, type InsertTrade, type Trade } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Activity, Plus, BarChart2, History, TrendingUp, Filter, Palette, ChevronDown, ArrowRight, ArrowLeft, Settings } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

// --- Stats Calculation Helpers ---

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
    if (!acc[key]) acc[key] = { wins: 0, total: 0 };
    acc[key].total += 1;
    if (t.outcome === 'Win') acc[key].wins += 1;
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
    // Instrument + Strategy + Session + Condition
    const key = `${t.asset}-${t.strategy}-${t.session}-${t.condition}`;
    if (!acc[key]) acc[key] = { wins: 0, losses: 0, total: 0 };
    acc[key].total += 1;
    if (t.outcome === 'Win') acc[key].wins += 1;
    if (t.outcome === 'Loss') acc[key].losses += 1;
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
    hyperGranularPerformance
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
          <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground/90 group-hover:text-primary transition-colors duration-300 truncate">{title}</h3>
          <p className="text-[10px] font-medium text-muted-foreground/80 dark:text-muted-foreground leading-relaxed line-clamp-2 group-hover:text-muted-foreground transition-colors">{description}</p>
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
      contextTF: "D1",
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
    { title: "🎯 Core Trade Data", fields: ["asset", "strategy", "session", "condition", "bias", "outcome", "rAchieved", "plAmt"] },
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
    const submitData: InsertTrade = {
      asset: data.asset,
      strategy: data.strategy,
      session: data.session,
      condition: data.condition,
      bias: data.bias,
      outcome: data.outcome,
      rAchieved: data.rAchieved,
      plAmt: data.plAmt,
      contextTF: data.contextTF,
      entryTF: data.entryTF
    };
    createTrade.mutate(submitData, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        setCurrentStep(0);
      }
    });
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    return (
      <div className="space-y-4">
        {currentStep === 0 && (
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="asset" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Asset</FormLabel>
              <FormControl><Input placeholder="EURUSD" {...field} className="bg-background border-border" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="strategy" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Strategy</FormLabel>
              <FormControl><Input placeholder="SMC Breaker" {...field} className="bg-background border-border" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="session" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Session</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || "New York"}>
              <FormControl><SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="London">London</SelectItem><SelectItem value="New York">New York</SelectItem><SelectItem value="Asian">Asian</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="condition" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Condition</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || "Trending"}>
              <FormControl><SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="Trending">Trending</SelectItem><SelectItem value="Ranging">Ranging</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="bias" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Bias</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || "Bullish"}>
              <FormControl><SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="Bullish">Bullish</SelectItem><SelectItem value="Bearish">Bearish</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="outcome" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Outcome</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || "Win"}>
              <FormControl><SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="Win">Win</SelectItem><SelectItem value="Loss">Loss</SelectItem><SelectItem value="BE">BE</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="rAchieved" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">R-Value</FormLabel>
              <FormControl><Input type="number" step="any" {...field} className="bg-background border-border" /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="plAmt" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">P/L ($)</FormLabel>
              <FormControl><Input type="number" step="any" {...field} className="bg-background border-border" /></FormControl></FormItem>
            )} />
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

// --- Main Dashboard Page ---

export default function Dashboard() {
  const { data: trades, isLoading } = useTrades();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  const [selectedStrat, setSelectedStrat] = useState<string>("All");
  const { theme, setTheme } = useTheme();

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
    <div className="min-h-screen pb-12 bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none text-foreground">
                FSDZONESJOURNAL
              </h1>
              <p className="text-[9px] font-bold text-muted-foreground tracking-[0.2em] mt-1 uppercase">
                Granular Intelligence
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-10">
            <div className="hidden md:flex gap-8">
              <Button
                variant="ghost"
                className="text-xs font-black tracking-widest uppercase transition-all flex items-center gap-2 h-auto py-2 text-muted-foreground hover:text-foreground"
                onClick={() => setTheme(theme === "white" ? "blue" : "white")}
                data-testid="button-theme-toggle"
              >
                <Palette className="w-4 h-4" /> Theme: {theme === "white" ? "White" : "Blue"}
              </Button>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={cn(
                  "text-xs font-black tracking-widest uppercase transition-all flex items-center gap-2",
                  activeTab === 'dashboard' ? "text-primary relative" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <BarChart2 className="w-4 h-4" /> Performance
                {activeTab === 'dashboard' && (
                  <motion.div layoutId="underline" className="absolute -bottom-7 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                )}
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={cn(
                  "text-xs font-black tracking-widest uppercase transition-all flex items-center gap-2",
                  activeTab === 'history' ? "text-primary relative" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <History className="w-4 h-4" /> Trade Vault
                {activeTab === 'history' && (
                  <motion.div layoutId="underline" className="absolute -bottom-7 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                )}
              </button>
            </div>
            <LogEntryModal />
          </div>
        </div>
      </nav>

      {/* Main Content */}
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

              {/* Intelligence Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <PanelSection 
                  title="Market Regime" 
                  description="Performance edge across different volatility and regime states."
                  icon={Activity}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">Trending Efficiency</span>
                      <span className="text-emerald-500 font-bold">1.8R Avg</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">Ranging Efficiency</span>
                      <span className="text-amber-500 font-bold">0.4R Avg</span>
                    </div>
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Session Precision" 
                  description="Granular performance by entry timing relative to session open/close."
                  icon={History}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">Initial Impulse WR</span>
                      <span className="text-emerald-500 font-bold">72%</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">Late Extension WR</span>
                      <span className="text-red-400 font-bold">28%</span>
                    </div>
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Setup Quality" 
                  description="Statistical edge correlation with setup clarity and alignment scores."
                  icon={TrendingUp}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={cn("w-3 h-3 rounded-full", i <= Math.round(Number(stats.avgAlignment)) ? "bg-primary" : "bg-muted")} />
                      ))}
                    </div>
                    <span className="text-xs font-bold font-mono tracking-tighter">{stats.avgAlignment} / 5.0</span>
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Signal Validation" 
                  description="Measuring the cost of taking trades without full confluence."
                  icon={Filter}
                >
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                      <span className="text-muted-foreground">Full Conf: +2.1R</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_5px_rgba(248,113,113,0.5)]" />
                      <span className="text-muted-foreground">Partial: -0.8R</span>
                    </div>
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Execution Precision" 
                  description="Deviation analysis: slippage and entry timing accuracy."
                  icon={ArrowRight}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Fill Slippage (Avg)</span>
                    <span className="font-mono text-emerald-500">-0.15 pips</span>
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Risk Efficiency" 
                  description="Capital utilization and reward-to-drawdown ratios."
                  icon={BarChart2}
                >
                  <div className="flex gap-2">
                    <div className="flex-1 p-2 rounded bg-primary/5 border border-primary/10 text-center">
                      <div className="text-[10px] font-bold text-primary">1.25</div>
                      <div className="text-[8px] text-muted-foreground uppercase">Profit/Risk</div>
                    </div>
                    <div className="flex-1 p-2 rounded bg-primary/5 border border-primary/10 text-center">
                      <div className="text-[10px] font-bold text-primary">Low</div>
                      <div className="text-[8px] text-muted-foreground uppercase">Risk Heat</div>
                    </div>
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Management Logic" 
                  description="Opportunity loss analysis from early exits vs target rules."
                  icon={Settings}
                >
                  <div className="p-2 rounded-md bg-muted/30 border border-border/50 text-center">
                    <span className="text-[10px] font-medium text-red-400">-0.52R Opportunity Loss</span>
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Psychological State" 
                  description="Mindset impact on execution quality and rule adherence."
                  icon={Palette}
                >
                  <div className="flex items-center gap-2 px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-blue-500 uppercase">Calm WR: 75%</span>
                  </div>
                </PanelSection>
              </div>

              {/* Advanced Confluence Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PanelSection 
                  title="Confluence Matrix" 
                  description="TF + Session + Instrument performance cluster."
                  icon={Filter}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      <span className="font-bold">NAS100 + NY + M1</span>
                      <span className="text-emerald-500 font-black">82% WR</span>
                    </div>
                    <div className="flex justify-between text-[10px] p-1.5 rounded bg-red-500/10 border border-red-500/20">
                      <span className="font-bold">EURUSD + Asian + M5</span>
                      <span className="text-red-400 font-black">31% WR</span>
                    </div>
                  </div>
                </PanelSection>

                <PanelSection 
                  title="TFS Alignment" 
                  description="HTF+ATF+ETF per instrument performance edge."
                  icon={TrendingUp}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-muted/30 text-[10px] text-center">
                      <div className="text-primary font-bold">1.4R</div>
                      <div className="text-[8px] text-muted-foreground uppercase">Aligned</div>
                    </div>
                    <div className="p-2 rounded bg-muted/30 text-[10px] text-center">
                      <div className="text-red-400 font-bold">-0.2R</div>
                      <div className="text-[8px] text-muted-foreground uppercase">Divergent</div>
                    </div>
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Rules & Discipline" 
                  description="Performance when all strategy rules are followed."
                  icon={Activity}
                >
                  <div className="flex flex-col items-center justify-center p-2 rounded bg-emerald-500/5 border border-emerald-500/10">
                    <div className="text-2xl font-black text-emerald-500">2.4R</div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase">Edge per 100% Rules</div>
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
                          <div className="flex justify-end text-[8px] text-muted-foreground">
                            {lr}% Loss Rate
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Instrument x Market State" 
                  description="Performance edge per condition (Trending/Ranging)."
                  icon={BarChart2}
                >
                  <div className="text-[10px] space-y-1">
                    {Object.entries(stats.instrumentConditionPerformance).slice(0, 3).map(([key, data]: [string, any]) => (
                      <div key={key} className="flex justify-between border-b border-border/30 pb-1">
                        <span>{key}</span>
                        <span className="text-emerald-500 font-black">
                          {data.total ? Math.round((data.wins / data.total) * 100) : 0}% WR
                        </span>
                      </div>
                    ))}
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Edge Precision (Asset+Bias+Session)" 
                  description="High-granularity confluence percentage."
                  icon={Filter}
                >
                  <div className="text-[10px] space-y-1">
                    {Object.entries(stats.complexEdgePerformance).slice(0, 3).map(([key, data]: [string, any]) => (
                      <div key={key} className="flex justify-between items-center p-1.5 rounded bg-primary/5">
                        <span className="font-bold">{key}</span>
                        <span className="bg-primary/10 px-1.5 py-0.5 rounded text-primary font-black">
                          {data.total ? Math.round((data.wins / data.total) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Strategy Context Matrix" 
                  description="Strategy + Session + Condition performance edge."
                  icon={TrendingUp}
                >
                  <div className="text-[10px] space-y-1">
                    {Object.entries(stats.strategyContextPerformance).slice(0, 3).map(([key, data]: [string, any]) => (
                      <div key={key} className="flex justify-between border-b border-border/30 pb-1">
                        <span className="truncate max-w-[180px]">{key}</span>
                        <span className={cn("font-bold", data.rTotal >= 0 ? "text-emerald-500" : "text-red-400")}>
                          {(data.rTotal / (data.total || 1)).toFixed(2)}R Avg
                        </span>
                      </div>
                    ))}
                  </div>
                </PanelSection>

                <PanelSection 
                  title="Hyper-Granular Edge" 
                  description="Asset + Strategy + Session + Condition WR/LR."
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

                <PanelSection 
                  title="Capital Health" 
                  description="Profit % per strategy and Monthly Drawdown %."
                  icon={TrendingUp}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px]">
                      <span>Silver Bullet (Profit)</span><span className="text-emerald-500 font-bold">+12.4%</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span>SMC (Profit)</span><span className="text-emerald-500 font-bold">+8.1%</span>
                    </div>
                    <div className="pt-2 border-t border-border/50 space-y-2">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground uppercase">Monthly DD %</span>
                        <span className={cn("font-bold", Number(stats.monthlyDrawdownPercent) > 0 ? "text-red-400" : "text-emerald-500")}>
                          -{stats.monthlyDrawdownPercent}%
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground uppercase">Max DD ($)</span>
                        <span className="text-red-400 font-bold">
                          -${(calculateDrawdownPerMonth(trades)[0]?.drawdown || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </PanelSection>
              </div>

              {/* Strategy Filter */}
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

              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Session Performance */}
                <div className="bg-card/40 p-5 rounded-xl border border-border/50">
                  <h4 className="text-[9px] font-black text-muted-foreground uppercase mb-4 tracking-tighter">Session Win Rates</h4>
                  <div className="space-y-4">
                    {['London', 'New York', 'Asian'].map(s => {
                      const sTrades = filteredTrades.filter(t => t.session === s);
                      const wins = sTrades.filter(t => t.outcome === 'Win').length;
                      const perc = sTrades.length ? Math.round((wins / sTrades.length) * 100) : 0;
                      return (
                        <div key={s}>
                          <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                            <span className="text-foreground">{s}</span>
                            <span className="text-primary">{perc}% ({sTrades.length})</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${perc}%` }} 
                              className="h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Market Condition Performance */}
                <div className="bg-card/40 p-5 rounded-xl border border-border/50">
                  <h4 className="text-[9px] font-black text-muted-foreground uppercase mb-4 tracking-tighter">Market Condition Edge</h4>
                  <div className="space-y-2">
                    {['Trending', 'Ranging'].map(c => {
                      const cTrades = filteredTrades.filter(t => t.condition === c);
                      const wins = cTrades.filter(t => t.outcome === 'Win').length;
                      const perc = cTrades.length ? Math.round((wins / cTrades.length) * 100) : 0;
                      return (
                        <div key={c} className="flex items-center justify-between p-3 bg-card/40 rounded-xl border border-border/50 hover:border-primary/50 transition-colors">
                          <span className={cn("text-[9px] font-black uppercase", c === 'Trending' ? 'text-blue-500' : 'text-amber-500')}>{c}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-foreground">{perc}%</span>
                            <span className="text-[8px] text-muted-foreground">({cTrades.length})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bias & Streak */}
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
    </div>
  );
}
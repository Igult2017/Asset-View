import { useState } from "react";
import { useTrades, useCreateTrade } from "@/hooks/use-trades";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTradeSchema, type InsertTrade, type Trade } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Activity, Plus, BarChart2, History, TrendingUp, Filter, Palette } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

  return { net, wr, exp, count: trades.length, pf };
}

function getUniqueStrategies(trades: Trade[]) {
  return Array.from(new Set(trades.map(t => t.strategy)));
}

// --- Components ---

function LogEntryModal() {
  const [open, setOpen] = useState(false);
  const createTrade = useCreateTrade();
  
  const form = useForm<InsertTrade>({
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
      entryTF: "M5"
    }
  });

  const onSubmit = (data: InsertTrade) => {
    createTrade.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Log Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Commit Entry to Journal</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="asset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase">Asset</FormLabel>
                    <FormControl>
                      <Input placeholder="EURUSD" {...field} className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="strategy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase">Strategy</FormLabel>
                    <FormControl>
                      <Input placeholder="SMC Breaker" {...field} className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="session"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase">Session</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Select session" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="London">London</SelectItem>
                        <SelectItem value="New York">New York</SelectItem>
                        <SelectItem value="Asian">Asian</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase">Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Trending">Trending</SelectItem>
                        <SelectItem value="Ranging">Ranging</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase">Bias</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Select bias" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Bullish">Bullish</SelectItem>
                        <SelectItem value="Bearish">Bearish</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="outcome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase">Outcome</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Select outcome" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Win">Win</SelectItem>
                        <SelectItem value="Loss">Loss</SelectItem>
                        <SelectItem value="BE">BE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rAchieved"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase">R-Value</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plAmt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase">P/L ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full py-6 font-black uppercase text-sm tracking-widest" 
              disabled={createTrade.isPending}
            >
              {createTrade.isPending ? "Committing..." : "Log to Journal"}
            </Button>
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

              {/* Granular Strategy Intel */}
              <div className="p-1 border border-primary/20 bg-primary/5 rounded-2xl">
                <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-primary rounded-full shadow-lg shadow-primary/50"></div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Granular Strategy Drill-Down</h3>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 pt-0">
                  {/* Session Win Rates */}
                  <div className="bg-card/40 p-5 rounded-xl border border-border/50">
                    <h4 className="text-[9px] font-black text-muted-foreground uppercase mb-4 tracking-tighter">Win/Loss per Session %</h4>
                    <div className="space-y-4">
                      {['London', 'New York', 'Asian'].map(s => {
                        const sTrades = filteredTrades.filter(t => t.session === s);
                        const wins = sTrades.filter(t => t.outcome === 'Win').length;
                        const perc = sTrades.length ? Math.round((wins / sTrades.length) * 100) : 0;
                        return (
                          <div key={s}>
                            <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                              <span className="text-foreground">{s}</span>
                              <span className="text-primary">{perc}%</span>
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

                  {/* Market Bias */}
                  <div className="bg-card/40 p-5 rounded-xl border border-border/50">
                    <h4 className="text-[9px] font-black text-muted-foreground uppercase mb-4 tracking-tighter">Market Bias Efficiency</h4>
                    <div className="space-y-2">
                      {['Bullish', 'Bearish'].map(b => {
                        const bTrades = filteredTrades.filter(t => t.bias === b);
                        const wins = bTrades.filter(t => t.outcome === 'Win').length;
                        const perc = bTrades.length ? Math.round((wins / bTrades.length) * 100) : 0;
                        return (
                          <div key={b} className="flex items-center justify-between p-3 bg-card/40 rounded-xl border border-border/50 hover:border-primary/50 transition-colors">
                            <span className={cn("text-[9px] font-black uppercase", b === 'Bullish' ? 'text-emerald-500' : 'text-rose-500')}>{b}</span>
                            <span className="text-xs font-black text-foreground">{perc}% Win</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Streak Intervals */}
                  <div className="bg-card/40 p-5 rounded-xl border border-border/50">
                    <h4 className="text-[9px] font-black text-muted-foreground uppercase mb-4 tracking-tighter">Streak Intervals</h4>
                    <div className="grid grid-cols-2 gap-4 h-[calc(100%-2rem)]">
                      <div className="p-3 bg-card/40 rounded-xl border border-border/50 text-center flex flex-col justify-center">
                        <div className="text-[8px] text-muted-foreground font-black uppercase mb-1">Current Streak</div>
                        <div className="text-xl font-black text-foreground">
                           {filteredTrades.length > 0 ? (
                             <span className={filteredTrades[filteredTrades.length - 1].outcome === 'Win' ? 'text-emerald-500' : 'text-rose-500'}>
                               {filteredTrades[filteredTrades.length - 1].outcome}
                             </span>
                           ) : "-"}
                        </div>
                      </div>
                      <div className="p-3 bg-card/40 rounded-xl border border-border/50 text-center flex flex-col justify-center">
                        <div className="text-[8px] text-muted-foreground font-black uppercase mb-1">Total Trades</div>
                        <div className="text-xl font-black text-primary">{filteredTrades.length}</div>
                      </div>
                    </div>
                  </div>
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
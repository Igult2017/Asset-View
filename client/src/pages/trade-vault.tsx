import { useTrades, useUpdateTrade } from "@/hooks/use-trades";
import { Trade, insertTradeSchema } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Layout } from "./home";
import { format } from "date-fns";
import { Filter, ArrowRight, ArrowLeft, Edit2, Check, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

function EditTradeDialog({ trade }: { trade: Trade }) {
  const [open, setOpen] = useState(false);
  const updateTrade = useUpdateTrade();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertTradeSchema.partial()),
    defaultValues: {
      ...trade,
      plAmt: Number(trade.plAmt),
      rAchieved: Number(trade.rAchieved),
      marketAlignmentScore: Number(trade.marketAlignmentScore),
      setupClarityScore: Number(trade.setupClarityScore),
      entryPrecisionScore: Number(trade.entryPrecisionScore),
      confluenceScore: Number(trade.confluenceScore),
      timingQualityScore: Number(trade.timingQualityScore),
      confidenceLevel: Number(trade.confidenceLevel),
      focusLevel: Number(trade.focusLevel),
      stressLevel: Number(trade.stressLevel),
      rulesFollowedPercent: Number(trade.rulesFollowedPercent),
      minimumSetupScore: Number(trade.minimumSetupScore),
      slPips: Number(trade.slPips || 0),
      tpPips: Number(trade.tpPips || 0),
      pipsGainedLost: Number(trade.pipsGainedLost || 0),
    },
  });

  const onSubmit = (data: any) => {
    updateTrade.mutate(
      { id: trade.id, data },
      {
        onSuccess: () => {
          setOpen(false);
          toast({ title: "Trade updated successfully" });
        },
        onError: (error) => {
          toast({
            title: "Update failed",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/40">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase italic tracking-tighter">Edit Trade Entry</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="asset" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase">Asset</FormLabel>
                <FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="strategy" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase">Strategy</FormLabel>
                <FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="outcome" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase">Outcome</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "Win"}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent><SelectItem value="Win">Win</SelectItem><SelectItem value="Loss">Loss</SelectItem><SelectItem value="Break-even">Break-even</SelectItem></SelectContent></Select></FormItem>
              )} />
              <FormField control={form.control} name="plAmt" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase">P/L ($)</FormLabel>
                <FormControl><Input type="number" step="any" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="pipsGainedLost" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase">Pips G/L</FormLabel>
                <FormControl><Input type="number" step="any" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="direction" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase">Direction</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "Long"}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent><SelectItem value="Long">Long</SelectItem><SelectItem value="Short">Short</SelectItem></SelectContent></Select></FormItem>
              )} />
              <FormField control={form.control} name="entryMethod" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase">Order Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "Market"}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent><SelectItem value="Market">Market</SelectItem><SelectItem value="Limit">Limit</SelectItem><SelectItem value="Stop">Stop</SelectItem></SelectContent></Select></FormItem>
              )} />
              <FormField control={form.control} name="slPips" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase">SL (Pips)</FormLabel>
                <FormControl><Input type="number" step="any" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="tpPips" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase">TP (Pips)</FormLabel>
                <FormControl><Input type="number" step="any" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="newsImpact" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase">News</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "no news"}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {['before news', 'after news', 'no news'].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent></Select></FormItem>
              )} />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="entryTF" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase">Entry TF</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "5M"}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {['1M', '5M', '15M', '30M', '1H', '4H', '1D', '1W'].map(tf => <SelectItem key={tf} value={tf}>{tf}</SelectItem>)}
                </SelectContent></Select></FormItem>
              )} />
              <FormField control={form.control} name="analysisTF" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase">Analysis TF</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "1H"}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {['1M', '5M', '15M', '30M', '1H', '4H', '1D', '1W'].map(tf => <SelectItem key={tf} value={tf}>{tf}</SelectItem>)}
                </SelectContent></Select></FormItem>
              )} />
              <FormField control={form.control} name="contextTF" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase">Context TF</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "1D"}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {['1M', '5M', '15M', '30M', '1H', '4H', '1D', '1W'].map(tf => <SelectItem key={tf} value={tf}>{tf}</SelectItem>)}
                </SelectContent></Select></FormItem>
              )} />
            </div>
            
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Detailed Analysis</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="whatWorked" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase">What Worked</FormLabel>
                  <FormControl><Textarea {...field} value={field.value || ""} className="resize-none" rows={2} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="whatFailed" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase">What Failed</FormLabel>
                  <FormControl><Textarea {...field} value={field.value || ""} className="resize-none" rows={2} /></FormControl></FormItem>
                )} />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={updateTrade.isPending} className="w-full font-black uppercase tracking-widest italic">
                {updateTrade.isPending ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function TradeVault() {
  const { data: trades = [], isLoading } = useTrades();
  const [assetFilter, setAssetFilter] = useState<string>("All");
  const [strategyFilter, setStrategyFilter] = useState<string>("All");
  const [sessionFilter, setSessionFilter] = useState<string>("All");

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const matchAsset = assetFilter === "All" || trade.asset === assetFilter;
      const matchStrategy = strategyFilter === "All" || trade.strategy === strategyFilter;
      const matchSession = sessionFilter === "All" || trade.session === sessionFilter;
      return matchAsset && matchStrategy && matchSession;
    }).sort((a, b) => 
      new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );
  }, [trades, assetFilter, strategyFilter, sessionFilter]);

  const uniqueAssets = useMemo(() => ["All", ...new Set(trades.map(t => t.asset))], [trades]);
  const uniqueStrategies = useMemo(() => ["All", ...new Set(trades.map(t => t.strategy))], [trades]);
  const uniqueSessions = useMemo(() => ["All", ...new Set(trades.map(t => t.session))], [trades]);

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto px-6 pt-8 space-y-8">
        <Card className="bg-card/40 backdrop-blur-xl border-border/40 shadow-2xl rounded-3xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 px-6">Date</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Asset</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Strategy</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Session</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-center">Outcome</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right px-6">P/L</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrades.map((trade) => (
                <TableRow key={trade.id} className="group hover:bg-primary/5 transition-colors border-border/20">
                  <TableCell className="text-[10px] font-bold text-muted-foreground py-6 px-6">
                    {format(new Date(trade.date || new Date()), "yyyy-MM-dd HH:mm")}
                  </TableCell>
                  <TableCell className="text-[11px] font-black text-foreground uppercase italic py-6">
                    {trade.asset}
                  </TableCell>
                  <TableCell className="text-[10px] font-bold text-muted-foreground py-6">
                    {trade.strategy}
                  </TableCell>
                  <TableCell className="py-6">
                    <span className="px-2 py-1 rounded-md bg-muted/50 text-[9px] font-black uppercase tracking-tighter border border-border/40">
                      {trade.session}
                    </span>
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                      trade.outcome === 'Win' 
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                        : trade.outcome === 'Loss'
                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                        : "bg-muted text-muted-foreground border-border/40"
                    )}>
                      {trade.outcome}
                    </span>
                  </TableCell>
                  <TableCell className={cn(
                    "text-[11px] font-black italic text-right py-6 px-6",
                    Number(trade.plAmt) >= 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    {Number(trade.plAmt) >= 0 ? '+' : ''}${Math.abs(Number(trade.plAmt)).toLocaleString()}
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    <EditTradeDialog trade={trade} />
                  </TableCell>
                </TableRow>
              ))}
              {filteredTrades.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
                    No trade entries found matching the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
}

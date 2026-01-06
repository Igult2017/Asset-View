import { useTrades } from "@/hooks/use-trades";
import { Trade } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Layout } from "./home";
import { format } from "date-fns";
import { Filter, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function TradeVault() {
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

  // Sort trades by date descending
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  );

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto px-6 pt-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 bg-primary rounded-full shadow-lg shadow-primary/20" />
            <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic italic-heavy">Vault Data</h1>
          </div>
          <Button variant="outline" size="sm" className="gap-2 border-border/40 hover:border-primary/30 uppercase text-[10px] font-bold tracking-widest">
            <Filter className="w-3 h-3" /> Filter
          </Button>
        </div>

        <Card className="bg-card/40 backdrop-blur-xl border-border/40 shadow-2xl rounded-3xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 px-6">Date</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Asset</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Strategy</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Session</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">R</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-center">Outcome</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right px-6">P/L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTrades.map((trade) => (
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
                  <TableCell className="text-[11px] font-black text-foreground py-6">
                    {trade.rAchieved}R
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
                </TableRow>
              ))}
              {sortedTrades.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
                    No trade entries found in the vault.
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

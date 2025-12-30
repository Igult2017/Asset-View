import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  variant?: "default" | "emerald" | "blue" | "white";
  highlight?: boolean;
}

export function StatsCard({ label, value, variant = "white", highlight = false }: StatsCardProps) {
  const colorClass = {
    default: "text-slate-200",
    emerald: "text-emerald-400",
    blue: "text-blue-400",
    white: "text-white"
  }[variant];

  return (
    <Card className={cn(
      "p-6 flex flex-col justify-center transition-transform hover:-translate-y-1",
      highlight && "bg-blue-600/10 border-blue-500/30"
    )}>
      <p className={cn(
        "text-[10px] font-bold uppercase tracking-widest mb-2",
        highlight ? "text-blue-400" : "text-slate-500"
      )}>
        {label}
      </p>
      <h3 className={cn("text-3xl font-black mono-number tracking-tight", colorClass)}>
        {value}
      </h3>
    </Card>
  );
}

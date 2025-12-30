import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, Minus } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  variant?: "emerald" | "white" | "blue" | "default";
  highlight?: boolean;
}

export function StatsCard({ label, value, variant = "white", highlight }: StatsCardProps) {
  const getColors = () => {
    switch (variant) {
      case "emerald":
        return "border-emerald-500/20 bg-emerald-500/5 text-emerald-500";
      case "blue":
        return "border-primary/20 bg-primary/5 text-primary";
      default:
        return "border-border bg-card text-foreground";
    }
  };

  return (
    <Card className={cn(
      "p-6 flex flex-col gap-2 transition-all duration-300",
      getColors(),
      highlight && "ring-2 ring-primary/20 shadow-lg shadow-primary/5"
    )}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-black tracking-tighter text-foreground">{value}</h2>
        {variant === "emerald" || variant === "blue" ? (
          <TrendingUp className="w-5 h-5 opacity-50" />
        ) : (
          <Minus className="w-5 h-5 opacity-50" />
        )}
      </div>
    </Card>
  );
}

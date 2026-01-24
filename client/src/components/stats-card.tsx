import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  label: string;
  value: string | number;
  variant?: "emerald" | "white" | "blue" | "yellow" | "default";
  highlight?: boolean;
}

export function StatsCard({ label, value, variant = "white", highlight }: StatsCardProps) {
  const getColors = () => {
    switch (variant) {
      case "emerald":
        return "border-emerald-500/30 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/5";
      case "blue":
        return "border-primary/30 bg-primary/[0.03] dark:bg-primary/[0.05] text-primary shadow-sm shadow-primary/5";
      case "yellow":
        return "border-yellow-500/30 bg-yellow-500/[0.03] dark:bg-yellow-500/[0.05] text-yellow-600 dark:text-yellow-400 shadow-sm shadow-yellow-500/5";
      default:
        return "border-border/60 bg-card/60 backdrop-blur-md shadow-sm";
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card className={cn(
        "p-6 flex flex-col gap-2 transition-all duration-300 relative overflow-hidden group",
        getColors(),
        highlight && "ring-2 ring-primary/20 shadow-xl shadow-primary/10"
      )}>
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
          {variant === "emerald" || variant === "blue" || variant === "yellow" ? (
            <TrendingUp className="w-16 h-16 rotate-12" />
          ) : (
            <Minus className="w-16 h-16" />
          )}
        </div>
        
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1 relative z-10">{label}</p>
        <div className="flex items-end justify-between relative z-10">
          <h2 className={cn(
            "text-3xl font-black tracking-tighter leading-none",
            variant === "emerald" ? "text-green-500" : 
            variant === "blue" ? "text-blue-500" : 
            variant === "yellow" ? "text-yellow-500" : "text-white"
          )}>{value}</h2>
          <div className={cn(
            "p-1.5 rounded-lg",
            variant === "emerald" ? "bg-emerald-500/10" : 
            variant === "blue" ? "bg-primary/10" : 
            variant === "yellow" ? "bg-yellow-500/10" : "bg-muted/50"
          )}>
            {variant === "emerald" || variant === "blue" || variant === "yellow" ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4 opacity-50" />
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

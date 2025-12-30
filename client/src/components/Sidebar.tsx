import { LayoutGrid, Image, FileText, Clock, Cloud, Settings, PieChart, Palette } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/use-theme";

interface SidebarProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export function Sidebar({ currentFilter, onFilterChange }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const navItems = [
    { id: "all", icon: LayoutGrid, label: "All Assets" },
    { id: "image", icon: Image, label: "Images" },
    { id: "document", icon: FileText, label: "Documents" },
    { id: "recent", icon: Clock, label: "Recent" },
  ];

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <Cloud className="w-5 h-5" />
        </div>
        <span className="font-display font-bold text-lg">AssetView</span>
      </div>

      <div className="px-4 py-2">
        <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Library
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onFilterChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  currentFilter === item.id
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }
              `}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="px-4 py-6 mt-auto border-t border-border">
        <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          System
        </p>
        <nav className="space-y-1">
          <button 
            onClick={() => setTheme(theme === "black" ? "blue" : "black")}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all"
          >
            <Palette className="w-4 h-4" />
            Theme: {theme === "black" ? "Black" : "Blue"}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all">
            <PieChart className="w-4 h-4" />
            Analytics
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </nav>
        
        <div className="mt-6 px-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary">Storage Used</span>
            </div>
            <div className="h-1.5 w-full bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full w-[75%] bg-primary rounded-full" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">7.5 GB of 10 GB</p>
          </div>
        </div>
      </div>
    </div>
  );
}

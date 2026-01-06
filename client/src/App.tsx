import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/home";
import Overview from "@/pages/overview";
import Auditor from "@/pages/auditor";
import DrawdownAnalysis from "@/pages/drawdown-analysis";
import TradeVault from "@/pages/trade-vault";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Overview} />
      <Route path="/auditor" component={Auditor} />
      <Route path="/analytics" component={Dashboard} />
      <Route path="/drawdown" component={DrawdownAnalysis} />
      <Route path="/trade-vault" component={TradeVault} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="blue">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

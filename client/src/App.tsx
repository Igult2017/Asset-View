import { Switch, Route } from "wouter";
import { Helmet } from "react-helmet";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { Header } from "@/components/Header";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/home";
import Overview from "@/pages/overview";
import Auditor from "@/pages/auditor";
import LogEntryPage from "@/pages/log-entry";
import DrawdownAnalysis from "@/pages/drawdown-analysis";
import TradeVault from "@/pages/trade-vault";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Overview} />
      <Route path="/auditor" component={Auditor} />
      <Route path="/analytics" component={Dashboard} />
      <Route path="/log-entry" component={LogEntryPage} />
      <Route path="/drawdown" component={DrawdownAnalysis} />
      <Route path="/trade-vault" component={TradeVault} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Helmet>
        <title>Free Journal</title>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📓</text></svg>" />
      </Helmet>
      <ThemeProvider defaultTheme="blue">
        <TooltipProvider>
          <div className="min-h-screen bg-[#0a0e27]">
            <Header />
            <main>
              <Router />
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

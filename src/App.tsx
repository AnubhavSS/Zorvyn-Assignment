import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { StoreProvider } from "@/lib/store";
import { Shell } from "@/components/layout/Shell";

// Pages
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Insights from "@/pages/insights";

const queryClient = new QueryClient();

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/">
          <Redirect to="/dashboard" />
        </Route>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/transactions" component={Transactions} />
        <Route path="/insights" component={Insights} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <StoreProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </StoreProvider>
  );
}

export default App;

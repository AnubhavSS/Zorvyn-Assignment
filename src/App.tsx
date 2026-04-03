import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import NotFound from "@/pages/not-found";
import { Shell } from "@/components/layout/Shell";

// Pages
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Insights from "@/pages/insights";


function App() {

  useEffect(() => {
    useStore.getState().initialize();
  }, []); 

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

export default App;

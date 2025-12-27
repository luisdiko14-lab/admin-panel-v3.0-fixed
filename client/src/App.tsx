import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Servers from "@/pages/servers";
import DiscordDashboard from "@/pages/discord-dashboard";
import SpecsDashboard from "@/pages/specs-dashboard";
import BotConfig from "@/pages/bot-config";
import Validate from "@/pages/validate";

// Global error handler for unauthorized access
window.addEventListener("unhandledrejection", (event) => {
  const error = event.reason;
  if (error?.name === "UnauthorizedError" || error?.status === 401 || error?.status === 403) {
    const confirmed = confirm("Your session has expired. Do you want to go to the login page? Click OK to proceed or Cancel to stay.");
    if (confirmed) {
      window.location.href = "/";
    }
  }
});

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/validate" component={Validate} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/servers" component={Servers} />
          <Route path="/discord" component={DiscordDashboard} />
          <Route path="/specs" component={SpecsDashboard} />
          <Route path="/bot-config" component={BotConfig} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

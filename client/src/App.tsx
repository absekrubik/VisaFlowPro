import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/signup";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminAgents from "@/pages/admin/agents";
import AdminClients from "@/pages/admin/clients";
import AdminCommissions from "@/pages/admin/commissions";
import AdminSettings from "@/pages/admin/settings";

// Agent Pages
import AgentDashboard from "@/pages/agent/dashboard";
import AgentClients from "@/pages/agent/clients";
import AgentApplications from "@/pages/agent/applications";
import AgentEarnings from "@/pages/agent/earnings";
import AgentProfile from "@/pages/agent/profile";

// Client Pages
import ClientDashboard from "@/pages/client/dashboard";
import ClientApplication from "@/pages/client/application";
import ClientAgentInfo from "@/pages/client/agent-info";
import ClientProfile from "@/pages/client/profile";
import ClientDocuments from "@/pages/client/documents";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/agents" component={AdminAgents} />
      <Route path="/admin/clients" component={AdminClients} />
      <Route path="/admin/commissions" component={AdminCommissions} />
      <Route path="/admin/settings" component={AdminSettings} />
      
      {/* Agent Routes */}
      <Route path="/agent" component={AgentDashboard} />
      <Route path="/agent/clients" component={AgentClients} />
      <Route path="/agent/applications" component={AgentApplications} />
      <Route path="/agent/earnings" component={AgentEarnings} />
      <Route path="/agent/profile" component={AgentProfile} />
      
      {/* Client Routes */}
      <Route path="/client" component={ClientDashboard} />
      <Route path="/client/application" component={ClientApplication} />
      <Route path="/client/agent" component={ClientAgentInfo} />
      <Route path="/client/profile" component={ClientProfile} />
      <Route path="/client/documents" component={ClientDocuments} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;

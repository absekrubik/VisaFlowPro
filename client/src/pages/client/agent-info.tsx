import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Building2, UserCheck, AlertCircle } from "lucide-react";
import { clientApi } from "@/lib/api";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function ClientAgentInfo() {
  const { data: agentData, isLoading } = useQuery({
    queryKey: ["client", "agent"],
    queryFn: clientApi.getAssignedAgent,
  });

  const agent = agentData?.agent;

  if (isLoading) {
    return (
      <DashboardLayout role="client">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading agent info...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!agent) {
    return (
      <DashboardLayout role="client">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">My Agent</h1>
            <p className="text-muted-foreground">Your assigned visa consultant.</p>
          </div>
        </div>

        <Card className="glass-panel border-white/5 max-w-2xl mx-auto mt-8">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">No Agent Assigned</h2>
              <p className="text-muted-foreground max-w-md">
                You haven't been assigned an agent yet. An admin will assign an agent to you soon, 
                or you can contact support for assistance.
              </p>
            </div>
            <Link href="/client">
              <Button variant="outline" className="border-white/10" data-testid="button-back-dashboard">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout role="client">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">My Agent</h1>
          <p className="text-muted-foreground">Contact your assigned visa consultant.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="glass-panel border-white/5 max-w-2xl mx-auto mt-8" data-testid="card-agent-info">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
            <Avatar className="w-32 h-32 border-4 border-secondary/20">
              <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-secondary text-white">
                {getInitials(agent.user?.name || "Agent")}
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="text-2xl font-bold text-white" data-testid="text-agent-name">
                {agent.user?.name || "Agent"}
              </h2>
              <p className="text-secondary font-medium">Visa Consultant</p>
              <Badge 
                variant="outline" 
                className={`mt-2 ${
                  agent.status === "Active" 
                    ? "bg-green-500/10 text-green-500 border-green-500/20" 
                    : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                }`}
                data-testid="status-agent"
              >
                {agent.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {agent.user?.email && (
                <a href={`mailto:${agent.user.email}`}>
                  <Button 
                    variant="outline" 
                    className="border-white/10 hover:bg-white/5 flex flex-col h-auto py-4 gap-2 w-full"
                    data-testid="button-email-agent"
                  >
                    <Mail className="w-6 h-6 text-primary" />
                    <span className="text-xs">Email</span>
                  </Button>
                </a>
              )}
              {agent.phone && (
                <a href={`tel:${agent.phone}`}>
                  <Button 
                    variant="outline" 
                    className="border-white/10 hover:bg-white/5 flex flex-col h-auto py-4 gap-2 w-full"
                    data-testid="button-call-agent"
                  >
                    <Phone className="w-6 h-6 text-secondary" />
                    <span className="text-xs">Call</span>
                  </Button>
                </a>
              )}
              {agent.address && (
                <Button 
                  variant="outline" 
                  className="border-white/10 hover:bg-white/5 flex flex-col h-auto py-4 gap-2"
                  data-testid="button-address-agent"
                >
                  <MapPin className="w-6 h-6 text-accent" />
                  <span className="text-xs">Office</span>
                </Button>
              )}
            </div>

            <div className="w-full bg-white/5 rounded-xl p-6 text-left space-y-4">
              <h3 className="font-bold border-b border-white/10 pb-2">Contact Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span data-testid="text-agent-email">{agent.user?.email || "Not provided"}</span>
                </div>
                {agent.phone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span data-testid="text-agent-phone">{agent.phone}</span>
                  </div>
                )}
                {agent.companyName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company:</span>
                    <span data-testid="text-agent-company">{agent.companyName}</span>
                  </div>
                )}
                {agent.address && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address:</span>
                    <span data-testid="text-agent-address">{agent.address}</span>
                  </div>
                )}
                {agent.licenseNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">License:</span>
                    <span data-testid="text-agent-license">{agent.licenseNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <Card className="w-full bg-primary/10 border-primary/20">
              <CardContent className="p-4 flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-left text-sm">
                  <p className="font-medium text-primary">Your Dedicated Consultant</p>
                  <p className="text-muted-foreground">
                    This agent has been assigned to help you with your visa application process. 
                    Feel free to reach out with any questions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}

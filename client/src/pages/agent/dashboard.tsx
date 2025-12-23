import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, FileText, Clock, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { agentApi } from "@/lib/api";
import { parseAmount } from "@/lib/utils";

export default function AgentDashboard() {
  const { data: clients = [] } = useQuery({
    queryKey: ["agent", "clients"],
    queryFn: agentApi.getClients,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["agent", "applications"],
    queryFn: agentApi.getApplications,
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ["agent", "commissions"],
    queryFn: agentApi.getCommissions,
  });

  const pendingCommissions = commissions
    .filter((c: any) => c.status === 'Pending' || c.status === 'Approved')
    .reduce((acc: number, curr: any) => acc + parseAmount(curr.amount), 0);

  const processingApps = applications.filter((a: any) => 
    a.status !== 'Approved' && a.status !== 'Rejected'
  ).length;

  return (
    <DashboardLayout role="agent">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">Agent Portal</h1>
            <p className="text-muted-foreground">Manage your client portfolio and commissions.</p>
          </div>
          <Link href="/agent/clients">
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-[0_0_20px_-5px_hsl(var(--secondary))]">
              <Plus className="w-4 h-4 mr-2" /> Add New Client
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-[50px] -mr-10 -mt-10"></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-secondary/20 text-secondary">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Clients</p>
                    <h3 className="text-3xl font-bold font-mono">{clients.length}</h3>
                  </div>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full" style={{ width: `${Math.min(clients.length * 10, 100)}%` }}></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-10 -mt-10"></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-primary/20 text-primary">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Commission</p>
                    <h3 className="text-3xl font-bold font-mono">${pendingCommissions.toFixed(2)}</h3>
                  </div>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[45%]"></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[50px] -mr-10 -mt-10"></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-accent/20 text-accent">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Processing Apps</p>
                    <h3 className="text-3xl font-bold font-mono">{processingApps}</h3>
                  </div>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="bg-accent h-full" style={{ width: `${Math.min(processingApps * 15, 100)}%` }}></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Card className="glass-panel border-white/5 flex-1">
          <CardHeader>
            <CardTitle>Assigned Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No clients assigned yet.</p>
                  <Link href="/agent/clients">
                    <Button variant="link" className="text-primary mt-2">
                      Add your first client
                    </Button>
                  </Link>
                </div>
              ) : (
                clients.slice(0, 5).map((client: any, i: number) => (
                  <motion.div 
                    key={client.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-bold border border-white/10">
                        {client.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'CL'}
                      </div>
                      <div>
                        <p className="font-medium">{client.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{client.user?.email || 'No email'}</p>
                      </div>
                    </div>
                    <Link href="/agent/clients">
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </motion.div>
                ))
              )}
              {clients.length > 5 && (
                <Link href="/agent/clients">
                  <Button variant="link" className="w-full text-muted-foreground">
                    View all {clients.length} clients
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

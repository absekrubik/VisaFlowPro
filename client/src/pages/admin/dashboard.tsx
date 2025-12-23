import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, FileCheck, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { adminApi } from "@/lib/api";
import { parseAmount } from "@/lib/utils";

export default function AdminDashboard() {
  const { data: agents = [] } = useQuery({
    queryKey: ["admin", "agents"],
    queryFn: adminApi.getAgents,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["admin", "clients"],
    queryFn: adminApi.getClients,
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ["admin", "commissions"],
    queryFn: adminApi.getCommissions,
  });

  const totalRevenue = commissions
    .filter((c: any) => c.status === 'Paid')
    .reduce((acc: number, curr: any) => acc + parseAmount(curr.amount), 0);

  const pendingApproval = commissions.filter((c: any) => c.status === 'Pending').length;

  const activeAgents = agents.filter((a: any) => a.status === 'Active').length;
  
  const stats = [
    { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, subtitle: "from paid commissions", icon: DollarSign, color: "text-primary" },
    { title: "Active Agents", value: activeAgents.toString(), subtitle: `of ${agents.length} total`, icon: Users, color: "text-secondary" },
    { title: "Total Clients", value: clients.length.toString(), subtitle: "registered", icon: FileCheck, color: "text-accent" },
    { title: "Pending Approval", value: pendingApproval.toString(), subtitle: "commissions", icon: AlertCircle, color: "text-orange-500" },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">Admin Overview</h1>
            <p className="text-muted-foreground">Welcome back, Administrator. System status is nominal.</p>
          </div>
          <Link href="/admin/agents">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_hsl(var(--primary))]">
              Manage Agents
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-card border-white/5 bg-white/5">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono px-2 py-1 rounded-full bg-white/5 text-muted-foreground">
                      {stat.subtitle}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold font-mono">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 glass-panel border-white/5">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Link href="/admin/agents">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 border-white/10 hover:bg-white/5">
                  <Users className="w-6 h-6" />
                  <span>Manage Agents</span>
                </Button>
              </Link>
              <Link href="/admin/clients">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 border-white/10 hover:bg-white/5">
                  <FileCheck className="w-6 h-6" />
                  <span>View Clients</span>
                </Button>
              </Link>
              <Link href="/admin/commissions">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 border-white/10 hover:bg-white/5">
                  <DollarSign className="w-6 h-6" />
                  <span>Commissions</span>
                </Button>
              </Link>
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2 border-white/10 hover:bg-white/5">
                <TrendingUp className="w-6 h-6" />
                <span>Analytics</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/5">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {agents.length === 0 && clients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent activity</p>
                  <Link href="/admin/agents">
                    <Button variant="link" className="text-primary mt-2">
                      Add your first agent
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {agents.slice(0, 3).map((agent: any, i: number) => (
                    <motion.div 
                      key={agent.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-bold border border-white/10 group-hover:border-primary/50 transition-colors">
                        {agent.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'AG'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {agent.user?.name || 'Agent'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {agent.user?.email || 'No email'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

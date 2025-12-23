import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, FileText, Upload, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { clientApi } from "@/lib/api";

export default function ClientDashboard() {
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["client", "applications"],
    queryFn: clientApi.getApplications,
  });

  const getStatusIcon = (status: string, progress: number) => {
    if (status === 'Approved') return <CheckCircle2 className="w-5 h-5" />;
    if (progress >= 75) return <Clock className="w-5 h-5 animate-pulse" />;
    return <Circle className="w-5 h-5" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Submitted':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Interview':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Document Review':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="client">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading your applications...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="client">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">My Applications</h1>
            <p className="text-muted-foreground">Track your visa application progress.</p>
          </div>
          <Link href="/client/application">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> New Application
            </Button>
          </Link>
        </div>

        {applications.length === 0 ? (
          <Card className="glass-panel border-white/5">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Start your visa journey by creating your first application.
              </p>
              <Link href="/client/application">
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" /> Create Application
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {applications.map((app: any, index: number) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-panel border-white/5 overflow-hidden">
                  <div className="flex flex-col lg:flex-row">
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{app.visaType}</h3>
                          <p className="text-muted-foreground">{app.targetCountry}</p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-mono">{app.progress}%</span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-primary to-secondary"
                            initial={{ width: 0 }}
                            animate={{ width: `${app.progress}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Last Action</p>
                          <p className="font-medium">{app.lastAction || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Submitted</p>
                          <p className="font-medium">{new Date(app.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 p-6 lg:w-64 flex flex-col justify-center items-center border-t lg:border-t-0 lg:border-l border-white/10">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                        app.status === 'Approved' ? 'bg-green-500/20 text-green-500' : 
                        app.status === 'Rejected' ? 'bg-red-500/20 text-red-500' :
                        'bg-primary/20 text-primary'
                      }`}>
                        {getStatusIcon(app.status, app.progress)}
                      </div>
                      <p className="text-sm font-medium text-center">
                        {app.status === 'Approved' ? 'Approved!' : 
                         app.status === 'Rejected' ? 'Rejected' :
                         'In Progress'}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

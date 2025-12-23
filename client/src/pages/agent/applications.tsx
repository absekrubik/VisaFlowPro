import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { agentApi } from "@/lib/api";

export default function AgentApplications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["agent", "applications"],
    queryFn: agentApi.getApplications,
  });

  const statusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: number; status: string }) =>
      agentApi.updateApplicationStatus(applicationId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agent", "applications"] });
      toast({ 
        title: "Application Updated", 
        description: `Application status changed to ${variables.status}.` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update application",
        variant: "destructive" 
      });
    },
  });

  const handleStatusChange = (appId: number, status: string) => {
    statusMutation.mutate({ applicationId: appId, status });
  };

  const getStatusBadge = (status: string) => {
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
      <DashboardLayout role="agent">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="agent">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Application Management</h1>
          <p className="text-muted-foreground">Review and update client visa applications.</p>
        </div>
      </div>

      <Card className="glass-panel border-white/5">
        <CardHeader>
          <CardTitle>All Applications ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead>Client Name</TableHead>
                <TableHead>Visa Type</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No applications found. Add clients to start processing applications.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app: any) => (
                  <TableRow key={app.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-medium">{app.client?.user?.name || "N/A"}</TableCell>
                    <TableCell>{app.visaType}</TableCell>
                    <TableCell>{app.targetCountry}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-white/10 h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all" 
                            style={{ width: `${app.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{app.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadge(app.status)}>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(app.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5">
                            <Eye className="w-4 h-4 mr-2" /> Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-white/10">
                          <DialogHeader>
                            <DialogTitle>Review Application</DialogTitle>
                            <DialogDescription>Update the status of {app.client?.user?.name}'s application.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Visa Type</p>
                                <p className="font-medium">{app.visaType}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Target Country</p>
                                <p className="font-medium">{app.targetCountry}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Current Status</p>
                                <Badge variant="outline" className={getStatusBadge(app.status)}>
                                  {app.status}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Progress</p>
                                <p className="font-medium">{app.progress}%</p>
                              </div>
                            </div>
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                              <p className="mb-3 font-medium text-white">Update Status:</p>
                              <div className="flex flex-wrap gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-yellow-400 hover:bg-yellow-500/10"
                                  onClick={() => handleStatusChange(app.id, 'Document Review')}
                                >
                                  <Clock className="w-4 h-4 mr-2" /> Document Review
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-blue-400 hover:bg-blue-500/10"
                                  onClick={() => handleStatusChange(app.id, 'Submitted')}
                                >
                                  Submitted
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-purple-400 hover:bg-purple-500/10"
                                  onClick={() => handleStatusChange(app.id, 'Interview')}
                                >
                                  Interview
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-green-400 hover:bg-green-500/10"
                                  onClick={() => handleStatusChange(app.id, 'Approved')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-red-400 hover:bg-red-500/10"
                                  onClick={() => handleStatusChange(app.id, 'Rejected')}
                                >
                                  <XCircle className="w-4 h-4 mr-2" /> Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

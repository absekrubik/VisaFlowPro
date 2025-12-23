import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/lib/api";
import { parseAmount, formatAmount } from "@/lib/utils";

export default function AdminCommissions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: commissions = [], isLoading } = useQuery({
    queryKey: ["admin", "commissions"],
    queryFn: adminApi.getCommissions,
  });

  const statusMutation = useMutation({
    mutationFn: ({ commissionId, status }: { commissionId: number; status: string }) =>
      adminApi.updateCommissionStatus(commissionId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "commissions"] });
      toast({ 
        title: `Commission ${variables.status}`, 
        description: `Commission has been ${variables.status.toLowerCase()}.`,
        variant: variables.status === "Rejected" ? "destructive" : "default"
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update commission",
        variant: "destructive" 
      });
    },
  });

  const handleAction = (id: number, action: 'Approved' | 'Rejected' | 'Paid') => {
    statusMutation.mutate({ commissionId: id, status: action });
  };

  const totalPending = commissions
    .filter((c: any) => c.status === 'Pending')
    .reduce((acc: number, curr: any) => acc + parseAmount(curr.amount), 0);

  const totalApproved = commissions
    .filter((c: any) => c.status === 'Approved')
    .reduce((acc: number, curr: any) => acc + parseAmount(curr.amount), 0);

  const totalPaid = commissions
    .filter((c: any) => c.status === 'Paid')
    .reduce((acc: number, curr: any) => acc + parseAmount(curr.amount), 0);

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading commissions...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Commission Tracking</h1>
          <p className="text-muted-foreground">Monitor and approve agent payouts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-white/5">
          <CardContent className="p-6">
             <p className="text-sm text-muted-foreground">Total Pending</p>
             <h3 className="text-3xl font-bold font-mono text-yellow-500">${totalPending.toFixed(2)}</h3>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/5">
          <CardContent className="p-6">
             <p className="text-sm text-muted-foreground">Total Approved</p>
             <h3 className="text-3xl font-bold font-mono text-blue-500">${totalApproved.toFixed(2)}</h3>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/5">
          <CardContent className="p-6">
             <p className="text-sm text-muted-foreground">Total Paid</p>
             <h3 className="text-3xl font-bold font-mono text-green-500">${totalPaid.toFixed(2)}</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-white/5">
        <CardHeader>
          <CardTitle>Commission Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead>Agent</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No commissions found
                  </TableCell>
                </TableRow>
              ) : (
                commissions.map((commission: any) => (
                  <TableRow key={commission.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-medium">{commission.agent?.user?.name || "N/A"}</TableCell>
                    <TableCell>{commission.client?.user?.name || "N/A"}</TableCell>
                    <TableCell className="font-mono">{formatAmount(commission.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`
                        ${commission.status === 'Paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                        ${commission.status === 'Approved' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}
                        ${commission.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                        ${commission.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                      `}>
                        {commission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(commission.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {commission.status === 'Pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                            onClick={() => handleAction(commission.id, 'Approved')}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => handleAction(commission.id, 'Rejected')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {commission.status === 'Approved' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-primary hover:bg-primary/10"
                          onClick={() => handleAction(commission.id, 'Paid')}
                        >
                          Mark as Paid
                        </Button>
                      )}
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

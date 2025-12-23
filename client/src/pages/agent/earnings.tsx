import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { agentApi } from "@/lib/api";
import { parseAmount, formatAmount } from "@/lib/utils";

export default function AgentEarnings() {
  const { data: commissions = [], isLoading } = useQuery({
    queryKey: ["agent", "commissions"],
    queryFn: agentApi.getCommissions,
  });

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
      <DashboardLayout role="agent">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading earnings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="agent">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Earnings & Commissions</h1>
          <p className="text-muted-foreground">Track your financial performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-card border-white/5">
          <CardContent className="p-6">
             <p className="text-sm text-muted-foreground">Available (Approved)</p>
             <h3 className="text-4xl font-bold font-mono text-blue-400 mt-2">${totalApproved.toFixed(2)}</h3>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/5">
          <CardContent className="p-6">
             <p className="text-sm text-muted-foreground">Total Paid</p>
             <h3 className="text-4xl font-bold font-mono text-green-400 mt-2">${totalPaid.toFixed(2)}</h3>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/5">
          <CardContent className="p-6">
             <p className="text-sm text-muted-foreground">Pending Approval</p>
             <h3 className="text-4xl font-bold font-mono text-yellow-400 mt-2">${totalPending.toFixed(2)}</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-white/5">
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No commissions yet. Complete client applications to earn commissions.
                  </TableCell>
                </TableRow>
              ) : (
                commissions.map((commission: any) => (
                  <TableRow key={commission.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-medium">{commission.client?.user?.name || "N/A"}</TableCell>
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

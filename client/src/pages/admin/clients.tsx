import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal, UserPlus, UserMinus, Users, Key } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/lib/api";

export default function AdminClients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["admin", "clients"],
    queryFn: adminApi.getClients,
  });

  const { data: agents = [] } = useQuery({
    queryKey: ["admin", "agents"],
    queryFn: adminApi.getAgents,
  });

  const activeAgents = agents.filter((a: any) => a.status === "Active");

  const updateClientMutation = useMutation({
    mutationFn: ({ clientId, data }: { clientId: number; data: any }) =>
      adminApi.updateClient(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "agents"] });
      setIsAssignOpen(false);
      setSelectedClient(null);
      setSelectedAgentId("");
      toast({ title: "Client Updated", description: "Agent assignment has been updated." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update client",
        variant: "destructive" 
      });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: ({ clientId, newPassword }: { clientId: number; newPassword: string }) =>
      adminApi.changeClientPassword(clientId, newPassword),
    onSuccess: () => {
      setIsPasswordOpen(false);
      setSelectedClient(null);
      setNewPassword("");
      toast({ title: "Password Updated", description: "Client password has been changed successfully." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to change password",
        variant: "destructive" 
      });
    },
  });

  const openAssignDialog = (client: any) => {
    setSelectedClient(client);
    setSelectedAgentId(client.agentId?.toString() || "");
    setIsAssignOpen(true);
  };

  const openPasswordDialog = (client: any) => {
    setSelectedClient(client);
    setNewPassword("");
    setIsPasswordOpen(true);
  };

  const handleChangePassword = () => {
    if (!selectedClient || !newPassword) return;
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    passwordMutation.mutate({ clientId: selectedClient.id, newPassword });
  };

  const handleAssignAgent = () => {
    if (!selectedClient) return;
    const agentId = selectedAgentId === "none" ? null : parseInt(selectedAgentId);
    updateClientMutation.mutate({ 
      clientId: selectedClient.id, 
      data: { agentId } 
    });
  };

  const handleRemoveAgent = (client: any) => {
    updateClientMutation.mutate({ 
      clientId: client.id, 
      data: { agentId: null } 
    });
  };

  const filteredClients = clients.filter((client: any) => 
    client.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Client Management</h1>
          <p className="text-muted-foreground">View and manage all registered clients.</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name or email..." 
          className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-clients"
        />
      </div>

      <Card className="glass-panel border-white/5">
        <CardHeader>
          <CardTitle>All Clients ({filteredClients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assigned Agent</TableHead>
                <TableHead>Passport Number</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No clients found
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client: any) => (
                  <TableRow key={client.id} className="border-white/10 hover:bg-white/5" data-testid={`row-client-${client.id}`}>
                    <TableCell className="font-medium" data-testid={`text-client-name-${client.id}`}>
                      {client.user?.name || "N/A"}
                    </TableCell>
                    <TableCell data-testid={`text-client-email-${client.id}`}>
                      {client.user?.email || "N/A"}
                    </TableCell>
                    <TableCell>
                      {client.agent ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20" data-testid={`badge-agent-${client.id}`}>
                          {client.agent.user?.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20" data-testid={`badge-unassigned-${client.id}`}>
                          Unassigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{client.passportNumber || "Not provided"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`menu-client-${client.id}`}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-white/10">
                          <DropdownMenuItem 
                            onClick={() => openAssignDialog(client)}
                            data-testid={`action-assign-agent-${client.id}`}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            {client.agentId ? "Change Agent" : "Assign Agent"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openPasswordDialog(client)}
                            data-testid={`action-change-password-${client.id}`}
                          >
                            <Key className="w-4 h-4 mr-2" />
                            Change Password
                          </DropdownMenuItem>
                          {client.agentId && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleRemoveAgent(client)}
                                className="text-destructive"
                                data-testid={`action-remove-agent-${client.id}`}
                              >
                                <UserMinus className="w-4 h-4 mr-2" />
                                Remove Agent
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" /> Assign Agent
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Client: <span className="text-white font-medium">{selectedClient?.user?.name}</span>
              </p>
              {selectedClient?.agent && (
                <p className="text-sm text-muted-foreground mt-1">
                  Current Agent: <span className="text-primary font-medium">{selectedClient.agent.user?.name}</span>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Select Agent</Label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger className="bg-white/5 border-white/10" data-testid="select-agent-assignment">
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Agent (Unassign)</SelectItem>
                  {activeAgents.map((agent: any) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.user?.name} ({agent.activeClients} clients)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAssignOpen(false)} data-testid="cancel-assign-agent">
              Cancel
            </Button>
            <Button 
              onClick={handleAssignAgent} 
              disabled={updateClientMutation.isPending}
              data-testid="confirm-assign-agent"
            >
              {updateClientMutation.isPending ? "Saving..." : "Save Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" /> Change Client Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Changing password for: <span className="text-white font-medium">{selectedClient?.user?.name}</span></p>
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input 
                type="password"
                placeholder="Enter new password (min 6 characters)" 
                className="bg-white/5 border-white/10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                data-testid="input-client-new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPasswordOpen(false)} data-testid="cancel-client-password">Cancel</Button>
            <Button onClick={handleChangePassword} disabled={passwordMutation.isPending} data-testid="save-client-password">
              {passwordMutation.isPending ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Edit, Percent, Key, DollarSign } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/lib/api";

export default function AdminAgents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [editForm, setEditForm] = useState({ commissionRate: "", commissionAmount: "", phone: "", companyName: "" });
  const [newPassword, setNewPassword] = useState("");
  const [newAgent, setNewAgent] = useState({ name: "", email: "" });

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["admin", "agents"],
    queryFn: adminApi.getAgents,
  });

  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: adminApi.createAgent,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "agents"] });
      setIsAddOpen(false);
      setCreatedCredentials({ email: newAgent.email, password: data.temporaryPassword });
      setIsCredentialsOpen(true);
      setNewAgent({ name: "", email: "" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add agent",
        variant: "destructive" 
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ agentId, status }: { agentId: number; status: string }) =>
      adminApi.updateAgentStatus(agentId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "agents"] });
      toast({ title: "Status Updated", description: `Agent status changed to ${variables.status}.` });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update status",
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ agentId, data }: { agentId: number; data: any }) =>
      adminApi.updateAgent(agentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "agents"] });
      setIsEditOpen(false);
      setSelectedAgent(null);
      toast({ title: "Agent Updated", description: "Agent details have been updated." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update agent",
        variant: "destructive" 
      });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: ({ agentId, newPassword }: { agentId: number; newPassword: string }) =>
      adminApi.changeAgentPassword(agentId, newPassword),
    onSuccess: () => {
      setIsPasswordOpen(false);
      setSelectedAgent(null);
      setNewPassword("");
      toast({ title: "Password Updated", description: "Agent password has been changed successfully." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to change password",
        variant: "destructive" 
      });
    },
  });

  const openEditDialog = (agent: any) => {
    setSelectedAgent(agent);
    setEditForm({
      commissionRate: agent.commissionRate?.replace("%", "") || "10",
      commissionAmount: agent.commissionAmount?.toString() || "",
      phone: agent.phone || "",
      companyName: agent.companyName || "",
    });
    setIsEditOpen(true);
  };

  const openPasswordDialog = (agent: any) => {
    setSelectedAgent(agent);
    setNewPassword("");
    setIsPasswordOpen(true);
  };

  const handleUpdateAgent = () => {
    if (!selectedAgent) return;
    
    const commissionRate = `${editForm.commissionRate || "10"}%`;
    const commissionAmount = editForm.commissionAmount ? parseFloat(editForm.commissionAmount) : null;
    
    const data: any = {
      commissionRate,
      commissionAmount,
      phone: editForm.phone || null,
      companyName: editForm.companyName || null,
    };
    
    updateMutation.mutate({ agentId: selectedAgent.id, data });
  };

  const handleChangePassword = () => {
    if (!selectedAgent || !newPassword) return;
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    passwordMutation.mutate({ agentId: selectedAgent.id, newPassword });
  };

  const handleAddAgent = () => {
    if (!newAgent.name || !newAgent.email) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    createMutation.mutate(newAgent);
  };

  const toggleStatus = (agent: any) => {
    const newStatus = agent.status === "Active" ? "Inactive" : "Active";
    statusMutation.mutate({ agentId: agent.id, status: newStatus });
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading agents...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Manage Agents</h1>
          <p className="text-muted-foreground">Add, edit, and manage your visa consultants.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10">
            <DialogHeader>
              <DialogTitle>Add New Agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  placeholder="Jane Doe" 
                  className="bg-white/5 border-white/10"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input 
                  placeholder="jane@visaflow.com" 
                  className="bg-white/5 border-white/10"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAddAgent}>Create Account</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-panel border-white/5">
        <CardHeader>
          <CardTitle>All Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Active Clients</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Commission ($)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent: any) => (
                <TableRow key={agent.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium">{agent.user?.name || "N/A"}</TableCell>
                  <TableCell>{agent.user?.email || "N/A"}</TableCell>
                  <TableCell>{agent.activeClients}</TableCell>
                  <TableCell>{agent.commissionRate}</TableCell>
                  <TableCell>{agent.commissionAmount ? `$${agent.commissionAmount}` : "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={agent.status === "Active" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20"}>
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-white/10">
                        <DropdownMenuItem onClick={() => openEditDialog(agent)} data-testid={`edit-agent-${agent.id}`}>
                          <Edit className="w-4 h-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openPasswordDialog(agent)} data-testid={`password-agent-${agent.id}`}>
                          <Key className="w-4 h-4 mr-2" /> Change Password
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast({ title: "Performance", description: "Opening performance metrics..." })}>
                          View Performance
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={agent.status === "Active" ? "text-destructive" : "text-green-500"}
                          onClick={() => toggleStatus(agent)}
                        >
                          {agent.status === "Active" ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5" /> Edit Agent Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-white/5 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">Editing: <span className="text-white font-medium">{selectedAgent?.user?.name}</span></p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Commission Rate (%)</Label>
                <div className="relative">
                  <Input 
                    type="number"
                    min="0"
                    max="100"
                    placeholder="10" 
                    className="bg-white/5 border-white/10 pr-8"
                    value={editForm.commissionRate}
                    onChange={(e) => setEditForm({...editForm, commissionRate: e.target.value})}
                    data-testid="input-commission-rate"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Commission Amount ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="500" 
                    className="bg-white/5 border-white/10 pl-8"
                    value={editForm.commissionAmount}
                    onChange={(e) => setEditForm({...editForm, commissionAmount: e.target.value})}
                    data-testid="input-commission-amount"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Fixed dollar amount per application</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input 
                placeholder="+1 234 567 8900" 
                className="bg-white/5 border-white/10"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                data-testid="input-agent-phone"
              />
            </div>
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input 
                placeholder="Visa Consultants Inc." 
                className="bg-white/5 border-white/10"
                value={editForm.companyName}
                onChange={(e) => setEditForm({...editForm, companyName: e.target.value})}
                data-testid="input-agent-company"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditOpen(false)} data-testid="cancel-edit-agent">Cancel</Button>
            <Button onClick={handleUpdateAgent} disabled={updateMutation.isPending} data-testid="save-agent-changes">
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" /> Change Agent Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Changing password for: <span className="text-white font-medium">{selectedAgent?.user?.name}</span></p>
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input 
                type="password"
                placeholder="Enter new password (min 6 characters)" 
                className="bg-white/5 border-white/10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                data-testid="input-new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPasswordOpen(false)} data-testid="cancel-password">Cancel</Button>
            <Button onClick={handleChangePassword} disabled={passwordMutation.isPending} data-testid="save-password">
              {passwordMutation.isPending ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCredentialsOpen} onOpenChange={(open) => {
        if (!open && createdCredentials) {
          return;
        }
        setIsCredentialsOpen(open);
      }}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle>Agent Account Created</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-400 mb-3">Share these login credentials with the new agent:</p>
              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground text-xs">Email</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      readOnly 
                      value={createdCredentials?.email || ""} 
                      className="bg-white/5 border-white/10 font-mono"
                      data-testid="text-agent-email"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(createdCredentials?.email || "");
                        toast({ title: "Copied", description: "Email copied to clipboard" });
                      }}
                      data-testid="button-copy-agent-email"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Password</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      readOnly 
                      value={createdCredentials?.password || ""} 
                      className="bg-white/5 border-white/10 font-mono"
                      data-testid="text-agent-password"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(createdCredentials?.password || "");
                        toast({ title: "Copied", description: "Password copied to clipboard" });
                      }}
                      data-testid="button-copy-agent-password"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Please save these credentials securely. The password cannot be retrieved later.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setIsCredentialsOpen(false);
              setCreatedCredentials(null);
            }} data-testid="button-close-credentials">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

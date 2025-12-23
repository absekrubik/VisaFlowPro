import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, FileText, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { agentApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Approved":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "Rejected":
      return <XCircle className="w-4 h-4 text-red-500" />;
    case "Under Review":
      return <Clock className="w-4 h-4 text-yellow-500" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Approved":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "Rejected":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "Under Review":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
};

const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

export default function AgentClients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [expandedClient, setExpandedClient] = useState<number | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ status: "", notes: "" });
  const [newClient, setNewClient] = useState({ name: "", email: "", visaType: "F-1 Student" });

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["agent", "clients"],
    queryFn: agentApi.getClients,
  });

  const { data: clientDocuments = [], isLoading: docsLoading } = useQuery({
    queryKey: ["agent", "client-documents", expandedClient],
    queryFn: () => expandedClient ? agentApi.getClientDocuments(expandedClient) : Promise.resolve([]),
    enabled: !!expandedClient,
  });

  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: agentApi.createClient,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["agent", "clients"] });
      queryClient.invalidateQueries({ queryKey: ["agent", "applications"] });
      setIsAddOpen(false);
      setCreatedCredentials({ email: newClient.email, password: data.temporaryPassword });
      setIsCredentialsOpen(true);
      setNewClient({ name: "", email: "", visaType: "F-1 Student" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add client",
        variant: "destructive" 
      });
    },
  });

  const updateDocStatusMutation = useMutation({
    mutationFn: ({ documentId, status, notes }: { documentId: number; status: string; notes?: string }) =>
      agentApi.updateDocumentStatus(documentId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent", "client-documents", expandedClient] });
      setIsReviewOpen(false);
      setSelectedDocument(null);
      setReviewForm({ status: "", notes: "" });
      toast({ title: "Document Updated", description: "Document status has been updated." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update document",
        variant: "destructive" 
      });
    },
  });

  const handleAddClient = () => {
    if (!newClient.name || !newClient.email) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    createMutation.mutate(newClient as any);
  };

  const handleMessage = (name: string) => {
    toast({ title: "Message Sent", description: `Notification sent to ${name}.` });
  };

  const toggleClientExpand = (clientId: number) => {
    setExpandedClient(expandedClient === clientId ? null : clientId);
  };

  const openReviewDialog = (doc: any) => {
    setSelectedDocument(doc);
    setReviewForm({ status: doc.status || "Under Review", notes: "" });
    setIsReviewOpen(true);
  };

  const handleReviewSubmit = () => {
    if (!selectedDocument || !reviewForm.status) return;
    updateDocStatusMutation.mutate({
      documentId: selectedDocument.id,
      status: reviewForm.status,
      notes: reviewForm.notes,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout role="agent">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="agent">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">My Clients</h1>
          <p className="text-muted-foreground">Manage your assigned visa applicants and their documents.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="button-add-client">
              <Plus className="w-4 h-4 mr-2" /> Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input 
                  placeholder="Full Name" 
                  className="bg-white/5 border-white/10"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  data-testid="input-new-client-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input 
                  placeholder="client@example.com" 
                  className="bg-white/5 border-white/10"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  data-testid="input-new-client-email"
                />
              </div>
              <div className="space-y-2">
                <Label>Visa Type</Label>
                <Select 
                  value={newClient.visaType}
                  onValueChange={(val) => setNewClient({...newClient, visaType: val})}
                >
                  <SelectTrigger className="bg-white/5 border-white/10" data-testid="select-visa-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F-1 Student">F-1 Student</SelectItem>
                    <SelectItem value="J-1 Exchange">J-1 Exchange</SelectItem>
                    <SelectItem value="H-1B Work">H-1B Work</SelectItem>
                    <SelectItem value="O-1 Talent">O-1 Talent</SelectItem>
                    <SelectItem value="B-1/B-2 Visitor">B-1/B-2 Visitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAddClient} disabled={createMutation.isPending} data-testid="button-confirm-add-client">
                {createMutation.isPending ? "Adding..." : "Add Client"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-panel border-white/5">
        <CardHeader>
          <CardTitle>Assigned Clients ({clients.length})</CardTitle>
          <CardDescription>Click on a client row to view their documents</CardDescription>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No clients yet. Add your first client to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {clients.map((client: any) => (
                <Collapsible 
                  key={client.id} 
                  open={expandedClient === client.id}
                  onOpenChange={() => toggleClientExpand(client.id)}
                >
                  <div className="border border-white/10 rounded-lg overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <div 
                        className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                        data-testid={`row-client-${client.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium" data-testid={`text-client-name-${client.id}`}>
                              {client.user?.name || "N/A"}
                            </p>
                            <p className="text-sm text-muted-foreground">{client.user?.email || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Passport</p>
                            <p className="font-mono text-xs">{client.passportNumber || "Not provided"}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMessage(client.user?.name || "Client");
                            }}
                            data-testid={`button-message-${client.id}`}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            {expandedClient === client.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <AnimatePresence>
                        {expandedClient === client.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-white/10 bg-background/50 p-4"
                          >
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <FileText className="w-4 h-4" /> Documents
                            </h4>
                            {docsLoading ? (
                              <p className="text-sm text-muted-foreground">Loading documents...</p>
                            ) : clientDocuments.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                            ) : (
                              <div className="grid gap-2">
                                {clientDocuments.map((doc: any) => (
                                  <div 
                                    key={doc.id} 
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                                    data-testid={`card-document-${doc.id}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-primary" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm" data-testid={`text-doc-name-${doc.id}`}>{doc.name}</p>
                                        <p className="text-xs text-muted-foreground">{doc.type}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Badge 
                                        variant="outline" 
                                        className={getStatusColor(doc.status)}
                                        data-testid={`status-doc-${doc.id}`}
                                      >
                                        <span className="mr-1">{getStatusIcon(doc.status)}</span>
                                        {doc.status}
                                      </Badge>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => openReviewDialog(doc)}
                                        data-testid={`button-review-doc-${doc.id}`}
                                      >
                                        Review
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle>Review Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Document: <span className="text-white font-medium">{selectedDocument?.name}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Type: <span className="text-white">{selectedDocument?.type}</span>
              </p>
              {selectedDocument?.path && isValidUrl(selectedDocument.path) && (
                <p className="text-sm text-muted-foreground mt-1">
                  <a href={selectedDocument.path} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    <Eye className="w-3 h-3" /> View Document
                  </a>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={reviewForm.status} onValueChange={(val) => setReviewForm({...reviewForm, status: val})}>
                <SelectTrigger className="bg-white/5 border-white/10" data-testid="select-doc-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea 
                placeholder="Add notes about this document..."
                className="bg-white/5 border-white/10"
                value={reviewForm.notes}
                onChange={(e) => setReviewForm({...reviewForm, notes: e.target.value})}
                data-testid="input-review-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsReviewOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleReviewSubmit} 
              disabled={updateDocStatusMutation.isPending}
              data-testid="button-submit-review"
            >
              {updateDocStatusMutation.isPending ? "Updating..." : "Update Status"}
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
            <DialogTitle>Client Account Created</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-400 mb-3">Share these login credentials with the new client:</p>
              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground text-xs">Email</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      readOnly 
                      value={createdCredentials?.email || ""} 
                      className="bg-white/5 border-white/10 font-mono"
                      data-testid="text-client-email"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(createdCredentials?.email || "");
                        toast({ title: "Copied", description: "Email copied to clipboard" });
                      }}
                      data-testid="button-copy-client-email"
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
                      data-testid="text-client-password"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(createdCredentials?.password || "");
                        toast({ title: "Copied", description: "Password copied to clipboard" });
                      }}
                      data-testid="button-copy-client-password"
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
            }} data-testid="button-close-client-credentials">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

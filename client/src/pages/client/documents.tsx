import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { commonApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { FileText, Upload, Eye, Clock, CheckCircle, XCircle, AlertCircle, Plus, Link } from "lucide-react";
import { motion } from "framer-motion";

const documentTypes = [
  "Passport",
  "Photo",
  "Bank Statement",
  "Employment Letter",
  "Education Certificate",
  "Travel Insurance",
  "Application Form",
  "Other",
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Approved":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "Rejected":
      return <XCircle className="w-4 h-4 text-red-500" />;
    case "Under Review":
      return <Clock className="w-4 h-4 text-yellow-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
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

export default function ClientDocuments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    type: "",
    path: "",
  });

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["client", "documents"],
    queryFn: commonApi.getMyDocuments,
  });

  const uploadMutation = useMutation({
    mutationFn: (data: { name: string; type: string; path: string }) =>
      commonApi.uploadDocument({
        ...data,
        ownerType: "client",
        ownerId: user?.id || 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", "documents"] });
      setIsUploadOpen(false);
      resetForm();
      toast({ title: "Document uploaded", description: "Your document has been uploaded for review." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to upload document.", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setUploadForm({ name: "", type: "", path: "" });
  };

  const handleUpload = () => {
    if (!uploadForm.name || !uploadForm.type || !uploadForm.path) {
      toast({ title: "Missing fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    if (!isValidUrl(uploadForm.path)) {
      toast({ 
        title: "Invalid URL", 
        description: "Please enter a valid URL starting with http:// or https://", 
        variant: "destructive" 
      });
      return;
    }

    uploadMutation.mutate(uploadForm);
  };

  const handleDialogClose = (open: boolean) => {
    setIsUploadOpen(open);
    if (!open) {
      resetForm();
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="client">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="client">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">My Documents</h1>
            <p className="text-muted-foreground">Upload and manage your visa application documents.</p>
          </div>
          <Dialog open={isUploadOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground" data-testid="button-upload-document">
                <Plus className="w-4 h-4 mr-2" /> Add Document
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-white/10 max-w-md">
              <DialogHeader>
                <DialogTitle>Add Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Document Name</Label>
                  <Input
                    placeholder="e.g., Passport Copy"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                    className="bg-white/5 border-white/10"
                    data-testid="input-document-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select
                    value={uploadForm.type}
                    onValueChange={(val) => setUploadForm({ ...uploadForm, type: val })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10" data-testid="select-document-type">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Link className="w-4 h-4" /> Document URL
                  </Label>
                  <Input
                    placeholder="https://drive.google.com/file/..."
                    value={uploadForm.path}
                    onChange={(e) => setUploadForm({ ...uploadForm, path: e.target.value })}
                    className="bg-white/5 border-white/10"
                    data-testid="input-document-url"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload your document to Google Drive, Dropbox, or OneDrive and paste the sharing link here
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDialogClose(false)}
                    className="flex-1"
                    data-testid="button-cancel-upload"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    className="flex-1"
                    data-testid="button-submit-upload"
                  >
                    {uploadMutation.isPending ? "Adding..." : "Add Document"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {documents.length === 0 ? (
          <Card className="glass-panel border-white/5">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Upload className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Documents Yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Add your visa application documents by providing links from Google Drive, Dropbox, or other cloud storage.
              </p>
              <Button
                className="bg-primary text-primary-foreground"
                onClick={() => setIsUploadOpen(true)}
                data-testid="button-first-upload"
              >
                <Plus className="w-4 h-4 mr-2" /> Add First Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc: any, index: number) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-panel border-white/5" data-testid={`card-document-${doc.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold" data-testid={`text-document-name-${doc.id}`}>
                            {doc.name}
                          </h4>
                          <p className="text-sm text-muted-foreground" data-testid={`text-document-type-${doc.id}`}>
                            {doc.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant="outline"
                          className={getStatusColor(doc.status)}
                          data-testid={`status-document-${doc.id}`}
                        >
                          <span className="mr-1">{getStatusIcon(doc.status)}</span>
                          {doc.status}
                        </Badge>
                        {doc.path && isValidUrl(doc.path) && (
                          <a href={doc.path} target="_blank" rel="noopener noreferrer">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-white/10"
                              data-testid={`button-view-document-${doc.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                    {doc.notes && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Notes:</span> {doc.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Card className="glass-panel border-white/5 border-l-4 border-l-secondary">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-secondary/20 text-secondary">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">How to Add Documents</h4>
                <p className="text-sm text-muted-foreground">
                  Upload your documents to a cloud storage service like Google Drive or Dropbox, 
                  then share the link and paste it here. Make sure your documents are clear and legible.
                  Your agent will review each document and update its status.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

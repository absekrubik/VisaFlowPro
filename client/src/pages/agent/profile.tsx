import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { agentApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AgentProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    companyName: "",
    licenseNumber: "",
  });
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ["agent", "profile"],
    queryFn: agentApi.getProfile,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.user?.name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        companyName: profile.companyName || "",
        licenseNumber: profile.licenseNumber || "",
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: agentApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent", "profile"] });
      setIsEditing(false);
      toast({ title: "Profile updated", description: "Your profile has been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.user?.name || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      companyName: profile?.companyName || "",
      licenseNumber: profile?.licenseNumber || "",
    });
    setIsEditing(false);
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "AG";

  if (isLoading) {
    return (
      <DashboardLayout role="agent">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="agent">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">My Profile</h1>
          <p className="text-muted-foreground">Manage your agent profile information.</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} data-testid="edit-profile-btn">
            <Edit className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} data-testid="cancel-edit-btn">
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending} data-testid="save-profile-btn">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-panel border-white/5 lg:col-span-1 h-fit">
          <CardContent className="p-6 flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32">
              <AvatarFallback className="text-4xl bg-secondary/20 text-secondary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center space-y-2">
              <h3 className="font-bold text-xl" data-testid="text-agent-name">{user?.name || "Agent"}</h3>
              <p className="text-sm text-muted-foreground" data-testid="text-agent-id">ID: AG-{user?.id || "---"}</p>
              <Badge variant={profile?.status === "Active" ? "default" : "secondary"} data-testid="status-agent">
                {profile?.status || "Active"}
              </Badge>
            </div>
            <div className="w-full pt-4 border-t border-white/10 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Commission Rate</span>
                <span className="font-medium text-primary" data-testid="text-commission-rate">{profile?.commissionRate || "10%"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Clients</span>
                <span className="font-medium" data-testid="text-active-clients">{profile?.activeClients || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" /> Business Details
            </CardTitle>
            <CardDescription>{isEditing ? "Edit your profile information" : "Your profile information"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  value={isEditing ? formData.name : (user?.name || "")} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10" 
                  disabled={!isEditing}
                  data-testid="input-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  value={user?.email || ""} 
                  className="bg-white/5 border-white/10" 
                  disabled 
                  data-testid="input-email"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                  value={isEditing ? formData.phone : (profile?.phone || "Not provided")} 
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/5 border-white/10" 
                  disabled={!isEditing}
                  data-testid="input-phone"
                />
              </div>
              <div className="space-y-2">
                <Label>License Number</Label>
                <Input 
                  value={isEditing ? formData.licenseNumber : (profile?.licenseNumber || "Not provided")} 
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="bg-white/5 border-white/10" 
                  disabled={!isEditing}
                  data-testid="input-license"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input 
                value={isEditing ? formData.companyName : (profile?.companyName || "Not provided")} 
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="bg-white/5 border-white/10" 
                disabled={!isEditing}
                data-testid="input-company"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input 
                value={isEditing ? formData.address : (profile?.address || "Not provided")} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-white/5 border-white/10" 
                disabled={!isEditing}
                data-testid="input-address"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

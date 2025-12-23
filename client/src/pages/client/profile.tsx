import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { clientApi, commonApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X, UserPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClientProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    passportNumber: "",
    dateOfBirth: "",
    currentAddress: "",
    phone: "",
    nationality: "",
    education: "",
  });
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ["client", "profile"],
    queryFn: clientApi.getProfile,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.user?.name || "",
        passportNumber: profile.passportNumber || "",
        dateOfBirth: profile.dateOfBirth || "",
        currentAddress: profile.currentAddress || "",
        phone: profile.phone || "",
        nationality: profile.nationality || "",
        education: profile.education || "",
      });
    }
  }, [profile]);

  const { data: availableAgents = [] } = useQuery({
    queryKey: ["available-agents"],
    queryFn: commonApi.getAvailableAgents,
  });

  const updateMutation = useMutation({
    mutationFn: clientApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", "profile"] });
      setIsEditing(false);
      toast({ title: "Profile updated", description: "Your profile has been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    },
  });

  const chooseAgentMutation = useMutation({
    mutationFn: clientApi.chooseAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", "profile"] });
      toast({ title: "Agent assigned", description: "You have been assigned to the selected agent." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to assign agent.", variant: "destructive" });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.user?.name || "",
      passportNumber: profile?.passportNumber || "",
      dateOfBirth: profile?.dateOfBirth || "",
      currentAddress: profile?.currentAddress || "",
      phone: profile?.phone || "",
      nationality: profile?.nationality || "",
      education: profile?.education || "",
    });
    setIsEditing(false);
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "CL";

  if (isLoading) {
    return (
      <DashboardLayout role="client">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="client">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information.</p>
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
              <AvatarFallback className="text-4xl bg-primary/20 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="font-bold text-xl">{user?.name || "Client"}</h3>
              <p className="text-sm text-muted-foreground">ID: CL-{user?.id || "---"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5 lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
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
                <Label>Nationality</Label>
                <Input 
                  value={isEditing ? formData.nationality : (profile?.nationality || "Not provided")} 
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="bg-white/5 border-white/10" 
                  disabled={!isEditing}
                  data-testid="input-nationality"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Passport Number</Label>
                <Input 
                  value={isEditing ? formData.passportNumber : (profile?.passportNumber || "Not provided")} 
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                  className="bg-white/5 border-white/10" 
                  disabled={!isEditing}
                  data-testid="input-passport"
                />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input 
                  type={isEditing ? "date" : "text"}
                  value={isEditing ? formData.dateOfBirth : (profile?.dateOfBirth || "Not provided")} 
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="bg-white/5 border-white/10" 
                  disabled={!isEditing}
                  data-testid="input-dob"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Education</Label>
              <Input 
                value={isEditing ? formData.education : (profile?.education || "Not provided")} 
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className="bg-white/5 border-white/10" 
                disabled={!isEditing}
                data-testid="input-education"
              />
            </div>
            <div className="space-y-2">
              <Label>Current Address</Label>
              <Input 
                value={isEditing ? formData.currentAddress : (profile?.currentAddress || "Not provided")} 
                onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                className="bg-white/5 border-white/10" 
                disabled={!isEditing}
                data-testid="input-address"
              />
            </div>
          </CardContent>
        </Card>

        {!profile?.agentId && availableAgents.length > 0 && (
          <Card className="glass-panel border-white/5 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> Choose Your Agent
              </CardTitle>
              <CardDescription>Select an agent to help manage your visa application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Available Agents</Label>
                  <Select onValueChange={(value) => chooseAgentMutation.mutate(parseInt(value))}>
                    <SelectTrigger className="bg-white/5 border-white/10" data-testid="select-agent">
                      <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAgents.map((agent: any) => (
                        <SelectItem key={agent.id} value={agent.id.toString()}>
                          {agent.user?.name} - {agent.commissionRate} commission
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {profile?.agentId && (
          <Card className="glass-panel border-white/5 lg:col-span-3">
            <CardHeader>
              <CardTitle>Your Agent</CardTitle>
              <CardDescription>You are assigned to an agent who will help manage your application</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Agent ID: {profile.agentId}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

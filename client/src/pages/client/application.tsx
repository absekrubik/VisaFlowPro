import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { clientApi } from "@/lib/api";

export default function ClientApplication() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    visaType: "",
    targetCountry: "",
    purpose: "",
  });

  const createMutation = useMutation({
    mutationFn: clientApi.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", "applications"] });
      toast({ 
        title: "Application Submitted", 
        description: "Your visa application has been created and is now under review." 
      });
      setLocation("/client");
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to submit application",
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.visaType || !formData.targetCountry) {
      toast({ 
        title: "Missing Information", 
        description: "Please select visa type and target country.",
        variant: "destructive" 
      });
      return;
    }

    createMutation.mutate({
      visaType: formData.visaType,
      targetCountry: formData.targetCountry,
      purpose: formData.purpose || "",
    });
  };

  return (
    <DashboardLayout role="client">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/client">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-white">New Visa Application</h1>
              <p className="text-muted-foreground">Complete your application details.</p>
            </div>
          </div>
          <Button 
            className="bg-primary text-primary-foreground" 
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Submitting..." : (
              <>
                <Send className="w-4 h-4 mr-2" /> Submit Application
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel border-white/5">
            <CardHeader>
              <CardTitle>Visa Details</CardTitle>
              <CardDescription>Tell us about your visa requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Target Country *</Label>
                <Select 
                  value={formData.targetCountry}
                  onValueChange={(val) => setFormData({...formData, targetCountry: val})}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select destination country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Visa Type *</Label>
                <Select 
                  value={formData.visaType}
                  onValueChange={(val) => setFormData({...formData, visaType: val})}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select visa type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F-1 Student">F-1 Student Visa</SelectItem>
                    <SelectItem value="J-1 Exchange">J-1 Exchange Visitor</SelectItem>
                    <SelectItem value="H-1B Work">H-1B Work Visa</SelectItem>
                    <SelectItem value="O-1 Talent">O-1 Extraordinary Ability</SelectItem>
                    <SelectItem value="B-1/B-2 Visitor">B-1/B-2 Business/Tourist</SelectItem>
                    <SelectItem value="L-1 Transfer">L-1 Intracompany Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Purpose of Travel</Label>
                <Textarea 
                  placeholder="Describe your purpose of travel and any additional details..."
                  className="bg-white/5 border-white/10 min-h-[120px]"
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/5 border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/20 text-primary">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">What happens next?</h4>
                  <p className="text-sm text-muted-foreground">
                    After submitting your application, your assigned agent will review your details 
                    and contact you with next steps. You'll be able to track the progress from your dashboard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

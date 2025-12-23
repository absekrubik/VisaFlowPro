import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";

export default function AdminSettings() {
  return (
    <DashboardLayout role="admin">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">System Settings</h1>
          <p className="text-muted-foreground">Configure platform preferences and notifications.</p>
        </div>
        <Button className="bg-primary text-primary-foreground">
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle>General Configuration</CardTitle>
            <CardDescription>Basic settings for the VisaFlow platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Platform Name</Label>
              <Input defaultValue="VisaFlow" className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input defaultValue="support@visaflow.com" className="bg-white/5 border-white/10" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage system-wide alerts and emails.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Application Alerts</Label>
                <p className="text-sm text-muted-foreground">Notify admins when a new student applies</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Commission Reports</Label>
                <p className="text-sm text-muted-foreground">Weekly email summary of commissions</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>System Maintenance</Label>
                <p className="text-sm text-muted-foreground">Show maintenance banner to users</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { User, Lock, Mail, ArrowRight, Shield, Briefcase, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { fetchAdmins } from "@/lib/api";

export default function SignupPage() {
  const { signup } = useAuth();
  const { toast } = useToast();
  const [role, setRole] = useState<"client" | "agent" | "admin">("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminId, setAdminId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: admins = [] } = useQuery({
    queryKey: ["admins-public"],
    queryFn: async () => {
      const response = await fetch("/api/admins/public");
      if (!response.ok) return [];
      return response.json();
    },
  });

  const handleSignup = async () => {
    if (!name || !email || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if ((role === "client" || role === "agent") && !adminId) {
      toast({
        title: "Missing information",
        description: "Please select an admin to work with.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await signup(role, name, email, password, adminId ? parseInt(adminId) : undefined);
      toast({
        title: "Account created!",
        description: `Welcome to VisaFlow, ${name}.`,
      });
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4 bg-background">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 -z-10"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-panel border-white/10">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-display font-bold text-gradient">Create Account</CardTitle>
            <CardDescription>Join the future of visa consultancy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-3">
              <div 
                onClick={() => setRole("client")}
                data-testid="role-client"
                className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 text-center ${
                  role === "client" 
                    ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_-5px_hsl(var(--primary)/0.3)]" 
                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                }`}
              >
                <GraduationCap className="w-6 h-6" />
                <span className="text-sm font-medium">Client</span>
              </div>
              <div 
                onClick={() => setRole("agent")}
                data-testid="role-agent"
                className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 text-center ${
                  role === "agent" 
                    ? "bg-secondary/10 border-secondary text-secondary shadow-[0_0_15px_-5px_hsl(var(--secondary)/0.3)]" 
                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                }`}
              >
                <Briefcase className="w-6 h-6" />
                <span className="text-sm font-medium">Agent</span>
              </div>
              <div 
                onClick={() => setRole("admin")}
                data-testid="role-admin"
                className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 text-center ${
                  role === "admin" 
                    ? "bg-accent/10 border-accent text-accent shadow-[0_0_15px_-5px_hsl(var(--accent)/0.3)]" 
                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                }`}
              >
                <Shield className="w-6 h-6" />
                <span className="text-sm font-medium">Admin</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="John Doe" 
                    className="pl-10 bg-white/5 border-white/10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="input-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="name@example.com" 
                    className="pl-10 bg-white/5 border-white/10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="password" 
                    className="pl-10 bg-white/5 border-white/10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="input-password"
                  />
                </div>
              </div>
              
              {(role === "client" || role === "agent") && (
                <div className="space-y-2">
                  <Label>Select Admin</Label>
                  <Select value={adminId} onValueChange={setAdminId}>
                    <SelectTrigger className="bg-white/5 border-white/10" data-testid="select-admin">
                      <SelectValue placeholder="Choose an admin to work with" />
                    </SelectTrigger>
                    <SelectContent>
                      {admins.length === 0 ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">No admins available yet</div>
                      ) : (
                        admins.map((admin: any) => (
                          <SelectItem key={admin.id} value={String(admin.id)}>
                            {admin.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    This admin will manage your account and visa applications.
                  </p>
                </div>
              )}
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity" 
              onClick={handleSignup}
              disabled={isLoading}
              data-testid="button-signup"
            >
              {isLoading ? "Creating Account..." : "Create Account"} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link></p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

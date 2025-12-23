import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Briefcase, GraduationCap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  const handleNavigation = (path: string) => {
    if (isAuthenticated && user) {
      // If logged in, go to their dashboard
      setLocation(`/${user.role}`);
    } else {
      // If not logged in, go to login
      setLocation("/login");
    }
  };

  const roles = [
    {
      id: "admin",
      title: "Admin Portal",
      icon: Shield,
      description: "Manage brokers, track commissions, and oversee all operations.",
      color: "text-primary",
      gradient: "from-cyan-500/20 to-blue-500/5",
      border: "group-hover:border-cyan-500/50",
      path: "/admin"
    },
    {
      id: "broker",
      title: "Broker Portal",
      icon: Briefcase,
      description: "Manage your students, track applications, and view earnings.",
      color: "text-secondary",
      gradient: "from-purple-500/20 to-pink-500/5",
      border: "group-hover:border-purple-500/50",
      path: "/broker"
    },
    {
      id: "student",
      title: "Student Portal",
      icon: GraduationCap,
      description: "Apply for visas, track progress, and connect with brokers.",
      color: "text-accent",
      gradient: "from-pink-500/20 to-rose-500/5",
      border: "group-hover:border-pink-500/50",
      path: "/student"
    }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-background to-background -z-10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 -z-10"></div>
      
      {/* Floating Orbs */}
      <motion.div 
        animate={{ 
          x: [0, 50, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1] 
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10"
      />
      <motion.div 
        animate={{ 
          x: [0, -30, 0],
          y: [0, 40, 0],
          scale: [1, 1.1, 1] 
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] -z-10"
      />

      <div className="max-w-5xl w-full space-y-12 z-10">
        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4"
          >
            <Globe className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-mono tracking-wider text-muted-foreground">VISA CONSULTANCY 2.0</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-white/40"
          >
            Visa<span className="text-primary">Flow</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            The future of immigration management. Seamlessly connect students, brokers, and administrators in one unified, intelligent platform.
          </motion.p>

          <div className="flex justify-center gap-4 pt-4">
            {!isAuthenticated && (
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full px-8 shadow-[0_0_20px_-5px_hsl(var(--primary))]"
                onClick={() => setLocation("/signup")}
              >
                Get Started
              </Button>
            )}
             <Button 
                size="lg" 
                variant="outline"
                className="border-white/10 hover:bg-white/5 rounded-full px-8"
                onClick={() => setLocation(isAuthenticated ? `/${user?.role}` : "/login")}
              >
                {isAuthenticated ? "Go to Dashboard" : "Login"}
              </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
            >
              <Card 
                className={`h-full bg-card/40 backdrop-blur-sm border-white/5 hover:bg-card/60 transition-all duration-500 group cursor-pointer border ${role.border} relative overflow-hidden`}
                onMouseEnter={() => setHoveredRole(role.id)}
                onMouseLeave={() => setHoveredRole(null)}
                onClick={() => handleNavigation(role.path)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <CardContent className="p-8 flex flex-col items-center text-center h-full relative z-10 space-y-6">
                  <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${role.color} ring-1 ring-white/5 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_-10px_currentColor]`}>
                    <role.icon className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-display font-bold">{role.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-4">
                    <Button variant="ghost" className="group-hover:translate-x-1 transition-transform duration-300 gap-2">
                      Enter Portal <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </div>
  );
}

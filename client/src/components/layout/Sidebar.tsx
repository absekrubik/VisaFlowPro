import React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  PieChart, 
  Briefcase,
  GraduationCap,
  Menu,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

type Role = "admin" | "agent" | "client";

interface SidebarProps {
  role: Role;
}

const menuItems = {
  admin: [
    { icon: LayoutDashboard, label: "Overview", href: "/admin" },
    { icon: Users, label: "Agents", href: "/admin/agents" },
    { icon: GraduationCap, label: "Clients", href: "/admin/clients" },
    { icon: PieChart, label: "Commissions", href: "/admin/commissions" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ],
  agent: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/agent" },
    { icon: Users, label: "My Clients", href: "/agent/clients" },
    { icon: FileText, label: "Applications", href: "/agent/applications" },
    { icon: PieChart, label: "Earnings", href: "/agent/earnings" },
    { icon: Settings, label: "Profile", href: "/agent/profile" },
  ],
  client: [
    { icon: LayoutDashboard, label: "My Dashboard", href: "/client" },
    { icon: FileText, label: "Visa Application", href: "/client/application" },
    { icon: Upload, label: "My Documents", href: "/client/documents" },
    { icon: Briefcase, label: "My Agent", href: "/client/agent" },
    { icon: Settings, label: "Profile", href: "/client/profile" },
  ],
};

export function Sidebar({ role }: SidebarProps) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const items = menuItems[role];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-display font-bold tracking-tighter text-gradient mb-2">
          VisaFlow
        </h1>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
          {role} portal
        </p>
      </div>

      <div className="flex-1 px-4 py-2 space-y-2">
        {items.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer group relative overflow-hidden",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-5px_hsl(var(--primary)/0.5)]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <item.icon className={cn("w-5 h-5 relative z-10", isActive && "animate-pulse")} />
                <span className="font-medium relative z-10">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 border-white/10 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden md:flex w-64 flex-col border-r border-white/10 bg-sidebar/50 backdrop-blur-xl h-screen fixed left-0 top-0 z-30"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Trigger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background/50 backdrop-blur-md border-white/10">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-sidebar/95 backdrop-blur-xl border-r border-white/10 text-sidebar-foreground">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

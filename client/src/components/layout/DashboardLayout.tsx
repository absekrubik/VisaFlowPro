import React, { ReactNode, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { NotificationBar } from "@/components/NotificationBar";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "admin" | "agent" | "client";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    } else if (user?.role !== role) {
      setLocation(`/${user?.role}`);
    }
  }, [isAuthenticated, user, role, setLocation]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar role={role} />
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end mb-4">
            <NotificationBar userRole={role} />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

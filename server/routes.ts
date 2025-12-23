import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertApplicationSchema, updateClientSchema, updateAgentSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function generateSecurePassword(): string {
  return crypto.randomBytes(16).toString('base64');
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { name, email, password, role, adminId } = req.body;
      
      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "All fields are required" });
      }
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Agents and clients must select an admin when self-registering
      if ((role === "agent" || role === "client") && !adminId) {
        return res.status(400).json({ error: "Please select an admin to work with" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        role,
      });

      if (role === "agent") {
        console.log("[DEBUG] Creating agent with adminId:", adminId, "type:", typeof adminId);
        await storage.createAgent({
          userId: user.id,
          adminId: Number(adminId),
          commissionRate: "10%",
          status: "Active",
        });
      } else if (role === "client") {
        console.log("[DEBUG] Creating client with adminId:", adminId, "type:", typeof adminId);
        await storage.createClient({
          userId: user.id,
          adminId: Number(adminId),
          agentId: null,
        });
      }

      req.session.userId = user.id;
      req.session.role = role;

      res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(400).json({ error: error.message || "Signup failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, role } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== role) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.role = user.role;

      res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ error: error.message || "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  // Admin list endpoint - available to all authenticated users (full details)
  app.get("/api/admins", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const admins = await storage.getAllAdmins();
    res.json(admins);
  });

  // Public admin list endpoint - only returns name and ID for registration
  app.get("/api/admins/public", async (req, res) => {
    const admins = await storage.getAllAdmins();
    res.json(admins.map(admin => ({ id: admin.id, name: admin.name })));
  });

  // Clear all data endpoint - admin only
  app.post("/api/admin/clear-data", async (req, res) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      await storage.clearAllData();
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
      });
      res.json({ message: "All data cleared successfully" });
    } catch (error: any) {
      console.error("Clear data error:", error);
      res.status(500).json({ error: error.message || "Failed to clear data" });
    }
  });

  // Admin routes
  app.get("/api/admin/agents", async (req, res) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    console.log("[DEBUG] Admin fetching agents, userId:", req.session.userId);
    const agents = await storage.getAgentsByAdminId(req.session.userId!);
    console.log("[DEBUG] Found agents:", agents.length);
    res.json(agents);
  });

  app.post("/api/admin/agents", async (req, res) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const { name, email } = req.body;
      const password = generateSecurePassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        role: "agent",
      });

      const agent = await storage.createAgent({
        userId: user.id,
        adminId: req.session.userId!,
        commissionRate: "10%",
        status: "Active",
      });

      res.json({ ...agent, user, temporaryPassword: password });
    } catch (error: any) {
      console.error("Create agent error:", error);
      res.status(400).json({ error: error.message || "Failed to create agent" });
    }
  });

  app.patch("/api/admin/agents/:id/status", async (req, res) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const agentId = parseInt(req.params.id);
      const agent = await storage.getAgentById(agentId);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      if (agent.adminId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { status } = req.body;
      await storage.updateAgentStatus(agentId, status);
      res.json({ message: "Status updated" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin: Update agent commission settings
  app.patch("/api/admin/agents/:id/commission", async (req, res) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const agentId = parseInt(req.params.id);
      const agent = await storage.getAgentById(agentId);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      if (agent.adminId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { commissionRate, commissionAmount } = req.body;
      await storage.updateAgentCommission(agentId, commissionRate, commissionAmount || null);
      res.json({ message: "Commission updated" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin: Change agent password
  app.patch("/api/admin/agents/:id/password", async (req, res) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const agentId = parseInt(req.params.id);
      const agent = await storage.getAgentById(agentId);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      if (agent.adminId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUserPassword(agent.userId, hashedPassword);
      res.json({ message: "Password updated" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin: Change client password
  app.patch("/api/admin/clients/:id/password", async (req, res) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.getClientById(clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      if (client.adminId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUserPassword(client.userId, hashedPassword);
      res.json({ message: "Password updated" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/clients", async (req, res) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    console.log("[DEBUG] Admin fetching clients, userId:", req.session.userId);
    const clients = await storage.getClientsByAdminId(req.session.userId!);
    console.log("[DEBUG] Found clients:", clients.length);
    res.json(clients);
  });

  app.get("/api/admin/applications", async (req, res) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const applications = await storage.getApplicationsByAdminId(req.session.userId!);
    res.json(applications);
  });

  app.get("/api/admin/commissions", async (req, res) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const commissions = await storage.getCommissionsByAdminId(req.session.userId!);
    res.json(commissions);
  });

  app.patch("/api/admin/commissions/:id/status", async (req, res) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const commissionId = parseInt(req.params.id);
      const commission = await storage.getCommissionById(commissionId);
      if (!commission) {
        return res.status(404).json({ error: "Commission not found" });
      }

      const agent = await storage.getAgentById(commission.agentId);
      if (!agent || agent.adminId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { status } = req.body;
      await storage.updateCommissionStatus(commissionId, status);
      res.json({ message: "Status updated" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Agent routes
  app.get("/api/agent/clients", async (req, res) => {
    if (req.session.role !== "agent") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const agent = await storage.getAgentByUserId(req.session.userId!);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    const clients = await storage.getClientsByAgentId(agent.id);
    res.json(clients);
  });

  app.post("/api/agent/clients", async (req, res) => {
    if (req.session.role !== "agent") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const { name, email, visaType } = req.body;

      const password = generateSecurePassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      const agent = await storage.getAgentByUserId(req.session.userId!);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        role: "client",
      });

      const client = await storage.createClient({
        userId: user.id,
        adminId: agent.adminId,
        agentId: agent.id,
      });

      await storage.createApplication({
        clientId: client.id,
        visaType: visaType || "F-1 Student",
        targetCountry: "United States",
        purpose: "",
        status: "Document Review",
        progress: 0,
        lastAction: "Account Created",
      });

      res.json({ ...client, user, temporaryPassword: password });
    } catch (error: any) {
      console.error("Create client error:", error);
      res.status(400).json({ error: error.message || "Failed to create client" });
    }
  });

  app.get("/api/agent/applications", async (req, res) => {
    if (req.session.role !== "agent") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const agent = await storage.getAgentByUserId(req.session.userId!);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    const applications = await storage.getApplicationsByAgentId(agent.id);
    res.json(applications);
  });

  app.patch("/api/agent/applications/:id/status", async (req, res) => {
    if (req.session.role !== "agent") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      const agent = await storage.getAgentByUserId(req.session.userId!);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      const client = await storage.getClientById(application.clientId);
      if (!client || client.agentId !== agent.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { status } = req.body;
      await storage.updateApplicationStatus(applicationId, status);
      res.json({ message: "Status updated" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/agent/commissions", async (req, res) => {
    if (req.session.role !== "agent") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const agent = await storage.getAgentByUserId(req.session.userId!);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    const commissions = await storage.getCommissionsByAgentId(agent.id);
    res.json(commissions);
  });

  // Client routes
  app.get("/api/client/applications", async (req, res) => {
    if (req.session.role !== "client") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const client = await storage.getClientByUserId(req.session.userId!);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const applications = await storage.getApplicationsByClientId(client.id);
    res.json(applications);
  });

  app.post("/api/client/applications", async (req, res) => {
    if (req.session.role !== "client") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const client = await storage.getClientByUserId(req.session.userId!);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      const applicationData = insertApplicationSchema.parse({
        visaType: req.body.visaType,
        targetCountry: req.body.targetCountry,
        purpose: req.body.purpose || "",
        clientId: client.id,
        status: "Document Review",
        progress: 10,
        lastAction: "Application Submitted",
      });

      const application = await storage.createApplication(applicationData);
      res.json(application);
    } catch (error: any) {
      console.error("Create application error:", error);
      res.status(400).json({ error: error.message || "Failed to create application" });
    }
  });

  app.patch("/api/client/applications/:id/progress", async (req, res) => {
    if (req.session.role !== "client") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      const client = await storage.getClientByUserId(req.session.userId!);
      if (!client || application.clientId !== client.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { progress, lastAction } = req.body;
      await storage.updateApplicationProgress(applicationId, progress, lastAction);
      res.json({ message: "Progress updated" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/client/profile", async (req, res) => {
    if (req.session.role !== "client") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const client = await storage.getClientByUserId(req.session.userId!);
    const user = await storage.getUserById(req.session.userId!);
    
    // Include agent info if assigned
    let agent = null;
    let agentUser = null;
    if (client?.agentId) {
      agent = await storage.getAgentById(client.agentId);
      if (agent) {
        agentUser = await storage.getUserById(agent.userId);
      }
    }
    
    res.json({ ...client, user, agent: agent ? { ...agent, user: agentUser } : null });
  });

  // Get assigned agent info for client
  app.get("/api/client/agent", async (req, res) => {
    if (req.session.role !== "client") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const client = await storage.getClientByUserId(req.session.userId!);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    if (!client.agentId) {
      return res.json({ agent: null });
    }

    const agent = await storage.getAgentById(client.agentId);
    if (!agent) {
      return res.json({ agent: null });
    }

    const agentUser = await storage.getUserById(agent.userId);
    res.json({ agent: { ...agent, user: agentUser } });
  });

  app.patch("/api/client/profile", async (req, res) => {
    if (req.session.role !== "client") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const client = await storage.getClientByUserId(req.session.userId!);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      const updateData = updateClientSchema.parse(req.body);
      const updatedClient = await storage.updateClientProfile(client.id, updateData);
      
      if (req.body.name) {
        await storage.updateUserName(req.session.userId!, req.body.name);
      }

      await storage.createActivity({
        actorId: req.session.userId!,
        actorRole: "client",
        targetType: "client",
        targetId: client.id,
        activityType: "profile_updated",
        description: `Client profile updated`,
        metadata: {},
      });

      res.json(updatedClient);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/client/choose-agent", async (req, res) => {
    if (req.session.role !== "client") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const client = await storage.getClientByUserId(req.session.userId!);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      const { agentId } = req.body;
      
      const agent = await storage.getAgentById(agentId);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      if (agent.adminId !== client.adminId) {
        return res.status(403).json({ error: "You can only choose agents from your assigned admin" });
      }

      await storage.assignAgentToClient(client.id, agentId);

      await storage.createActivity({
        actorId: req.session.userId!,
        actorRole: "client",
        targetType: "agent",
        targetId: agentId,
        activityType: "agent_assigned",
        description: `Client chose an agent`,
        metadata: { clientId: client.id },
      });

      res.json({ message: "Agent assigned successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Agent profile routes
  app.get("/api/agent/profile", async (req, res) => {
    if (req.session.role !== "agent") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const agent = await storage.getAgentByUserId(req.session.userId!);
    const user = await storage.getUserById(req.session.userId!);
    res.json({ ...agent, user });
  });

  app.patch("/api/agent/profile", async (req, res) => {
    if (req.session.role !== "agent") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const agent = await storage.getAgentByUserId(req.session.userId!);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      const updateData = updateAgentSchema.parse(req.body);
      const updatedAgent = await storage.updateAgentProfile(agent.id, updateData);
      
      if (req.body.name) {
        await storage.updateUserName(req.session.userId!, req.body.name);
      }

      await storage.createActivity({
        actorId: req.session.userId!,
        actorRole: "agent",
        targetType: "agent",
        targetId: agent.id,
        activityType: "profile_updated",
        description: `Agent profile updated`,
        metadata: {},
      });

      res.json(updatedAgent);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin routes for managing agents and clients
  app.patch("/api/admin/agents/:id", async (req, res) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const agentId = parseInt(req.params.id);
      const agent = await storage.getAgentById(agentId);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      if (agent.adminId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updateData: any = {};
      if (req.body.commissionRate) updateData.commissionRate = req.body.commissionRate;
      if (req.body.commissionAmount !== undefined) updateData.commissionAmount = req.body.commissionAmount;
      if (req.body.status) updateData.status = req.body.status;
      if (req.body.phone !== undefined) updateData.phone = req.body.phone;
      if (req.body.address !== undefined) updateData.address = req.body.address;
      if (req.body.companyName !== undefined) updateData.companyName = req.body.companyName;
      if (req.body.licenseNumber !== undefined) updateData.licenseNumber = req.body.licenseNumber;

      const updatedAgent = await storage.updateAgentProfile(agentId, updateData);
      
      if (req.body.name) {
        await storage.updateUserName(agent.userId, req.body.name);
      }

      await storage.createActivity({
        actorId: req.session.userId!,
        actorRole: "admin",
        targetType: "agent",
        targetId: agentId,
        activityType: "profile_updated",
        description: `Admin updated agent profile`,
        metadata: { changes: Object.keys(updateData) },
      });

      res.json(updatedAgent);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/agents/:id", async (req, res) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const agent = await storage.getAgentById(parseInt(req.params.id));
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    if (agent.adminId !== req.session.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const user = await storage.getUserById(agent.userId);
    res.json({ ...agent, user });
  });

  app.patch("/api/admin/clients/:id", async (req, res) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.getClientById(clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      if (client.adminId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updateData: any = {};
      if (req.body.passportNumber) updateData.passportNumber = req.body.passportNumber;
      if (req.body.dateOfBirth) updateData.dateOfBirth = req.body.dateOfBirth;
      if (req.body.currentAddress) updateData.currentAddress = req.body.currentAddress;
      if (req.body.phone) updateData.phone = req.body.phone;
      if (req.body.nationality) updateData.nationality = req.body.nationality;
      if (req.body.education) updateData.education = req.body.education;
      if (req.body.agentId !== undefined) updateData.agentId = req.body.agentId;

      const updatedClient = await storage.updateClientProfile(clientId, updateData);
      
      if (req.body.name) {
        await storage.updateUserName(client.userId, req.body.name);
      }

      await storage.createActivity({
        actorId: req.session.userId!,
        actorRole: "admin",
        targetType: "client",
        targetId: clientId,
        activityType: "profile_updated",
        description: `Admin updated client profile`,
        metadata: { changes: Object.keys(updateData) },
      });

      res.json(updatedClient);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/clients/:id", async (req, res) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const client = await storage.getClientById(parseInt(req.params.id));
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    if (client.adminId !== req.session.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const user = await storage.getUserById(client.userId);
    res.json({ ...client, user });
  });

  app.patch("/api/admin/applications/:id/assign-agent", async (req, res) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const { agentId } = req.body;
      const applicationId = parseInt(req.params.id);
      
      const application = await storage.getApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      const client = await storage.getClientById(application.clientId);
      if (!client || client.adminId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      await storage.assignAgentToClient(application.clientId, agentId);

      await storage.createActivity({
        actorId: req.session.userId!,
        actorRole: "admin",
        targetType: "application",
        targetId: applicationId,
        activityType: "agent_assigned",
        description: `Admin assigned agent to client`,
        metadata: { agentId, clientId: application.clientId },
      });

      res.json({ message: "Agent assigned successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Helper function to validate URLs
  const isValidDocumentUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  };

  // Document routes
  app.post("/api/documents", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { ownerType, ownerId, name, type, path } = req.body;
      
      // Validate URL to prevent XSS - only allow http/https
      if (!path || !isValidDocumentUrl(path)) {
        return res.status(400).json({ error: "Invalid document URL. Only http:// and https:// URLs are allowed." });
      }
      
      const document = await storage.createDocument({
        ownerType,
        ownerId,
        uploadedById: req.session.userId,
        name,
        type,
        path,
        status: "Pending",
      });

      await storage.createActivity({
        actorId: req.session.userId,
        actorRole: req.session.role!,
        targetType: ownerType,
        targetId: ownerId,
        activityType: "document_uploaded",
        description: `Document "${name}" uploaded`,
        metadata: { documentId: document.id },
      });

      res.json(document);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/documents/my", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let ownerId: number;
    let ownerType: string;

    if (req.session.role === "client") {
      const client = await storage.getClientByUserId(req.session.userId);
      if (!client) return res.status(404).json({ error: "Client not found" });
      ownerId = client.id;
      ownerType = "client";
    } else if (req.session.role === "agent") {
      const agent = await storage.getAgentByUserId(req.session.userId);
      if (!agent) return res.status(404).json({ error: "Agent not found" });
      ownerId = agent.id;
      ownerType = "agent";
    } else {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const documents = await storage.getDocumentsByOwner(ownerType, ownerId);
    res.json(documents);
  });

  app.get("/api/agent/clients/:clientId/documents", async (req, res) => {
    if (req.session.role !== "agent") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const agent = await storage.getAgentByUserId(req.session.userId!);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    const clientId = parseInt(req.params.clientId);
    const client = await storage.getClientById(clientId);
    
    if (!client || client.agentId !== agent.id) {
      return res.status(403).json({ error: "Client not assigned to you" });
    }

    const documents = await storage.getDocumentsByOwner("client", clientId);
    res.json(documents);
  });

  app.get("/api/admin/documents", async (req, res) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const documents = await storage.getDocumentsByAdminId(req.session.userId!);
    res.json(documents);
  });

  app.get("/api/admin/documents/:ownerType/:ownerId", async (req, res) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const ownerType = req.params.ownerType;
    const ownerId = parseInt(req.params.ownerId);
    
    if (ownerType === "client") {
      const client = await storage.getClientById(ownerId);
      if (!client || client.adminId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }
    } else if (ownerType === "agent") {
      const agent = await storage.getAgentById(ownerId);
      if (!agent || agent.adminId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    const documents = await storage.getDocumentsByOwner(ownerType, ownerId);
    res.json(documents);
  });

  app.patch("/api/documents/:id/status", async (req, res) => {
    if (req.session.role !== "admin" && req.session.role !== "agent") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const { status, notes } = req.body;
      const documentId = parseInt(req.params.id);

      // For agents, verify they have access to this document's owner
      if (req.session.role === "agent") {
        const agent = await storage.getAgentByUserId(req.session.userId!);
        if (!agent) {
          return res.status(404).json({ error: "Agent not found" });
        }
        
        const document = await storage.getDocumentById(documentId);
        if (!document) {
          return res.status(404).json({ error: "Document not found" });
        }
        
        // Only allow agents to update documents of their assigned clients
        if (document.ownerType === "client") {
          const client = await storage.getClientById(document.ownerId);
          if (!client || client.agentId !== agent.id) {
            return res.status(403).json({ error: "You can only manage documents from your assigned clients" });
          }
        } else {
          return res.status(403).json({ error: "Unauthorized to manage this document" });
        }
      }

      await storage.updateDocumentStatus(documentId, status, notes);

      await storage.createActivity({
        actorId: req.session.userId!,
        actorRole: req.session.role,
        targetType: "document",
        targetId: documentId,
        activityType: "document_reviewed",
        description: `Document status updated to ${status}`,
        metadata: { status, notes },
      });

      res.json({ message: "Document status updated" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Activity/Notification routes
  app.get("/api/activities", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let activities;
    if (req.session.role === "admin") {
      activities = await storage.getAllActivities();
    } else {
      activities = await storage.getActivitiesByRole(req.session.role!, req.session.userId);
    }

    res.json(activities);
  });

  // Get available agents for client selection
  app.get("/api/agents/available", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let adminId: number | null = null;
    
    if (req.session.role === "client") {
      const client = await storage.getClientByUserId(req.session.userId);
      if (client) {
        adminId = client.adminId;
      }
    } else if (req.session.role === "admin") {
      adminId = req.session.userId;
    } else if (req.session.role === "agent") {
      const agent = await storage.getAgentByUserId(req.session.userId);
      if (agent) {
        adminId = agent.adminId;
      }
    }
    
    if (!adminId) {
      return res.status(403).json({ error: "Could not determine admin" });
    }

    const agents = await storage.getAgentsByAdminId(adminId);
    const activeAgents = agents.filter(a => a.status === "Active");
    res.json(activeAgents);
  });

  return httpServer;
}

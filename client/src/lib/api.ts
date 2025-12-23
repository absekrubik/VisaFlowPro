// API client functions for backend integration

// Admin API
export const adminApi = {
  getAgents: async () => {
    const response = await fetch("/api/admin/agents", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch agents");
    return response.json();
  },

  createAgent: async (data: { name: string; email: string }) => {
    const response = await fetch("/api/admin/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create agent");
    return response.json();
  },

  updateAgentStatus: async (agentId: number, status: string) => {
    const response = await fetch(`/api/admin/agents/${agentId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error("Failed to update agent status");
    return response.json();
  },

  getClients: async () => {
    const response = await fetch("/api/admin/clients", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch clients");
    return response.json();
  },

  getApplications: async () => {
    const response = await fetch("/api/admin/applications", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch applications");
    return response.json();
  },

  getCommissions: async () => {
    const response = await fetch("/api/admin/commissions", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch commissions");
    return response.json();
  },

  updateCommissionStatus: async (commissionId: number, status: string) => {
    const response = await fetch(`/api/admin/commissions/${commissionId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error("Failed to update commission status");
    return response.json();
  },

  getAgent: async (agentId: number) => {
    const response = await fetch(`/api/admin/agents/${agentId}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch agent");
    return response.json();
  },

  updateAgent: async (agentId: number, data: any) => {
    const response = await fetch(`/api/admin/agents/${agentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update agent");
    return response.json();
  },

  getClient: async (clientId: number) => {
    const response = await fetch(`/api/admin/clients/${clientId}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch client");
    return response.json();
  },

  updateClient: async (clientId: number, data: any) => {
    const response = await fetch(`/api/admin/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update client");
    return response.json();
  },

  assignAgentToApplication: async (applicationId: number, agentId: number) => {
    const response = await fetch(`/api/admin/applications/${applicationId}/assign-agent`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ agentId }),
    });
    if (!response.ok) throw new Error("Failed to assign agent");
    return response.json();
  },

  getDocuments: async () => {
    const response = await fetch("/api/admin/documents", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch documents");
    return response.json();
  },

  getDocumentsByOwner: async (ownerType: string, ownerId: number) => {
    const response = await fetch(`/api/admin/documents/${ownerType}/${ownerId}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch documents");
    return response.json();
  },

  updateAgentCommission: async (agentId: number, commissionRate: string, commissionAmount: number | null) => {
    const response = await fetch(`/api/admin/agents/${agentId}/commission`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ commissionRate, commissionAmount }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update commission");
    }
    return response.json();
  },

  changeAgentPassword: async (agentId: number, newPassword: string) => {
    const response = await fetch(`/api/admin/agents/${agentId}/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ newPassword }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to change password");
    }
    return response.json();
  },

  changeClientPassword: async (clientId: number, newPassword: string) => {
    const response = await fetch(`/api/admin/clients/${clientId}/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ newPassword }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to change password");
    }
    return response.json();
  },
};

// Agent API
export const agentApi = {
  getClients: async () => {
    const response = await fetch("/api/agent/clients", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch clients");
    return response.json();
  },

  createClient: async (data: { name: string; email: string; visaType: string; adminId: number }) => {
    const response = await fetch("/api/agent/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create client");
    return response.json();
  },

  getApplications: async () => {
    const response = await fetch("/api/agent/applications", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch applications");
    return response.json();
  },

  updateApplicationStatus: async (applicationId: number, status: string) => {
    const response = await fetch(`/api/agent/applications/${applicationId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error("Failed to update application status");
    return response.json();
  },

  getCommissions: async () => {
    const response = await fetch("/api/agent/commissions", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch commissions");
    return response.json();
  },

  getProfile: async () => {
    const response = await fetch("/api/agent/profile", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch profile");
    return response.json();
  },

  updateProfile: async (data: any) => {
    const response = await fetch("/api/agent/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update profile");
    return response.json();
  },

  getClientDocuments: async (clientId: number) => {
    const response = await fetch(`/api/agent/clients/${clientId}/documents`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch documents");
    return response.json();
  },

  updateDocumentStatus: async (documentId: number, status: string, notes?: string) => {
    const response = await fetch(`/api/documents/${documentId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status, notes }),
    });
    if (!response.ok) throw new Error("Failed to update document status");
    return response.json();
  },
};

// Client API
export const clientApi = {
  getApplications: async () => {
    const response = await fetch("/api/client/applications", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch applications");
    return response.json();
  },

  createApplication: async (data: {
    visaType: string;
    targetCountry: string;
    purpose: string;
    status?: string;
    progress?: number;
    lastAction?: string;
  }) => {
    const response = await fetch("/api/client/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create application");
    return response.json();
  },

  updateApplicationProgress: async (applicationId: number, progress: number, lastAction: string) => {
    const response = await fetch(`/api/client/applications/${applicationId}/progress`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ progress, lastAction }),
    });
    if (!response.ok) throw new Error("Failed to update application progress");
    return response.json();
  },

  getProfile: async () => {
    const response = await fetch("/api/client/profile", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch profile");
    return response.json();
  },

  updateProfile: async (data: any) => {
    const response = await fetch("/api/client/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update profile");
    return response.json();
  },

  chooseAgent: async (agentId: number) => {
    const response = await fetch("/api/client/choose-agent", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ agentId }),
    });
    if (!response.ok) throw new Error("Failed to choose agent");
    return response.json();
  },

  getAssignedAgent: async () => {
    const response = await fetch("/api/client/agent", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch assigned agent");
    return response.json();
  },
};

// Fetch all admins (for dropdown)
export const fetchAdmins = async () => {
  const response = await fetch("/api/admins", {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch admins");
  return response.json();
};

// Clear all data (admin only)
export const clearAllData = async () => {
  const response = await fetch("/api/admin/clear-data", {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to clear data");
  return response.json();
};

// Common API
export const commonApi = {
  getAvailableAgents: async () => {
    const response = await fetch("/api/agents/available", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch agents");
    return response.json();
  },

  getActivities: async () => {
    const response = await fetch("/api/activities", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch activities");
    return response.json();
  },

  getMyDocuments: async () => {
    const response = await fetch("/api/documents/my", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch documents");
    return response.json();
  },

  uploadDocument: async (data: { ownerType: string; ownerId: number; name: string; type: string; path: string }) => {
    const response = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to upload document");
    return response.json();
  },

  updateDocumentStatus: async (documentId: number, status: string, notes?: string) => {
    const response = await fetch(`/api/documents/${documentId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status, notes }),
    });
    if (!response.ok) throw new Error("Failed to update document status");
    return response.json();
  },
};

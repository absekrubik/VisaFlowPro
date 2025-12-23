import {
  connectToDatabase,
  getNextSequence,
  UserModel,
  AgentModel,
  ClientModel,
  ApplicationModel,
  CommissionModel,
  DocumentModel,
  ActivityModel,
  CounterModel,
} from "./db";
import {
  type User,
  type InsertUser,
  type Agent,
  type InsertAgent,
  type Client,
  type InsertClient,
  type Application,
  type InsertApplication,
  type Commission,
  type InsertCommission,
  type Document,
  type InsertDocument,
  type Activity,
  type InsertActivity,
} from "@shared/schema";

function toUser(doc: any): User | undefined {
  if (!doc) return undefined;
  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
    password: doc.password,
    role: doc.role,
    createdAt: doc.createdAt,
  };
}

function toAgent(doc: any): Agent | undefined {
  if (!doc) return undefined;
  return {
    id: doc.id,
    userId: doc.userId,
    adminId: doc.adminId,
    commissionRate: doc.commissionRate,
    commissionAmount: doc.commissionAmount || null,
    status: doc.status,
    activeClients: doc.activeClients || doc.activeStudents || 0,
    phone: doc.phone || null,
    address: doc.address || null,
    companyName: doc.companyName || null,
    licenseNumber: doc.licenseNumber || null,
  };
}

function toClient(doc: any): Client | undefined {
  if (!doc) return undefined;
  return {
    id: doc.id,
    userId: doc.userId,
    adminId: doc.adminId,
    agentId: doc.agentId || doc.brokerId || null,
    passportNumber: doc.passportNumber || null,
    dateOfBirth: doc.dateOfBirth || null,
    currentAddress: doc.currentAddress || null,
    phone: doc.phone || null,
    nationality: doc.nationality || null,
    education: doc.education || null,
    feeAmount: doc.feeAmount || null,
  };
}

function toApplication(doc: any): Application | undefined {
  if (!doc) return undefined;
  return {
    id: doc.id,
    clientId: doc.clientId || doc.studentId,
    visaType: doc.visaType,
    targetCountry: doc.targetCountry,
    purpose: doc.purpose || null,
    status: doc.status,
    progress: doc.progress,
    submittedAt: doc.submittedAt,
    lastAction: doc.lastAction || null,
  };
}

function toCommission(doc: any): Commission | undefined {
  if (!doc) return undefined;
  return {
    id: doc.id,
    agentId: doc.agentId || doc.brokerId,
    clientId: doc.clientId || doc.studentId,
    amount: doc.amount,
    status: doc.status,
    date: doc.date,
  };
}

function toDocument(doc: any): Document | undefined {
  if (!doc) return undefined;
  return {
    id: doc.id,
    ownerType: doc.ownerType,
    ownerId: doc.ownerId,
    uploadedById: doc.uploadedById,
    name: doc.name,
    type: doc.type,
    path: doc.path,
    status: doc.status,
    notes: doc.notes || null,
    uploadedAt: doc.uploadedAt,
  };
}

function toActivity(doc: any): Activity | undefined {
  if (!doc) return undefined;
  return {
    id: doc.id,
    actorId: doc.actorId,
    actorRole: doc.actorRole,
    targetType: doc.targetType,
    targetId: doc.targetId,
    activityType: doc.activityType,
    description: doc.description,
    metadata: doc.metadata || null,
    createdAt: doc.createdAt,
  };
}

export interface IStorage {
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  updateUserName(userId: number, name: string): Promise<void>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<void>;
  getAllAdmins(): Promise<Array<{ id: number; name: string; email: string }>>;
  clearAllData(): Promise<void>;

  createAgent(agent: InsertAgent): Promise<Agent>;
  getAgentByUserId(userId: number): Promise<Agent | undefined>;
  getAllAgents(): Promise<Array<Agent & { user: User }>>;
  getAgentsByAdminId(adminId: number): Promise<Array<Agent & { user: User }>>;
  updateAgentStatus(agentId: number, status: string): Promise<void>;
  getAgentById(id: number): Promise<Agent | undefined>;
  updateAgentProfile(agentId: number, data: Partial<Agent>): Promise<Agent>;
  updateAgentCommissionRate(agentId: number, rate: string): Promise<void>;
  updateAgentCommission(agentId: number, rate: string, amount: number | null): Promise<void>;

  createClient(client: InsertClient): Promise<Client>;
  getClientByUserId(userId: number): Promise<Client | undefined>;
  getClientsByAgentId(agentId: number): Promise<Array<Client & { user: User }>>;
  getClientsByAdminId(adminId: number): Promise<Array<Client & { user: User; agent?: Agent & { user: User } }>>;
  getAllClients(): Promise<Array<Client & { user: User; agent?: Agent & { user: User } }>>;
  assignAgentToClient(clientId: number, agentId: number): Promise<void>;
  updateClientProfile(clientId: number, data: Partial<Client>): Promise<Client>;
  getClientById(id: number): Promise<Client | undefined>;

  createApplication(application: InsertApplication): Promise<Application>;
  getApplicationsByClientId(clientId: number): Promise<Application[]>;
  getApplicationsByAgentId(agentId: number): Promise<Array<Application & { client: Client & { user: User } }>>;
  getApplicationsByAdminId(adminId: number): Promise<Array<Application & { client: Client & { user: User } }>>;
  getAllApplications(): Promise<Array<Application & { client: Client & { user: User } }>>;
  updateApplicationStatus(id: number, status: string): Promise<void>;
  updateApplicationProgress(id: number, progress: number, lastAction: string): Promise<void>;
  getApplicationById(id: number): Promise<Application | undefined>;

  createCommission(commission: InsertCommission): Promise<Commission>;
  getCommissionsByAgentId(agentId: number): Promise<Array<Commission & { client: Client & { user: User } }>>;
  getCommissionsByAdminId(adminId: number): Promise<Array<Commission & { agent: Agent & { user: User }; client: Client & { user: User } }>>;
  getCommissionById(id: number): Promise<Commission | undefined>;
  getAllCommissions(): Promise<Array<Commission & { agent: Agent & { user: User }; client: Client & { user: User } }>>;
  updateCommissionStatus(id: number, status: string): Promise<void>;

  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentsByOwner(ownerType: string, ownerId: number): Promise<Array<Document & { uploadedBy: User }>>;
  getDocumentsByAgentClients(agentId: number): Promise<Array<Document & { uploadedBy: User }>>;
  getDocumentsByAdminId(adminId: number): Promise<Array<Document & { uploadedBy: User }>>;
  getAllDocuments(): Promise<Array<Document & { uploadedBy: User }>>;
  updateDocumentStatus(id: number, status: string, notes?: string): Promise<void>;
  getDocumentById(id: number): Promise<Document | undefined>;

  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivitiesByRole(role: string, userId: number): Promise<Array<Activity & { actor: User }>>;
  getAllActivities(): Promise<Array<Activity & { actor: User }>>;
}

export class DatabaseStorage implements IStorage {
  private initialized = false;

  private async ensureConnected(): Promise<void> {
    if (!this.initialized) {
      await connectToDatabase();
      this.initialized = true;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.ensureConnected();
    const user = await UserModel.findOne({ email }).lean();
    return toUser(user);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.ensureConnected();
    const id = await getNextSequence("users");
    const user = await UserModel.create({
      id,
      ...insertUser,
      createdAt: new Date(),
    });
    return toUser(user)!;
  }

  async getUserById(id: number): Promise<User | undefined> {
    await this.ensureConnected();
    const user = await UserModel.findOne({ id }).lean();
    return toUser(user);
  }

  async updateUserName(userId: number, name: string): Promise<void> {
    await this.ensureConnected();
    await UserModel.updateOne({ id: userId }, { name });
  }

  async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    await this.ensureConnected();
    await UserModel.updateOne({ id: userId }, { password: hashedPassword });
  }

  async getAllAdmins(): Promise<Array<{ id: number; name: string; email: string }>> {
    await this.ensureConnected();
    const admins = await UserModel.find({ role: "admin" }).lean();
    return admins.map(admin => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
    }));
  }

  async clearAllData(): Promise<void> {
    await this.ensureConnected();
    await UserModel.deleteMany({});
    await AgentModel.deleteMany({});
    await ClientModel.deleteMany({});
    await ApplicationModel.deleteMany({});
    await CommissionModel.deleteMany({});
    await DocumentModel.deleteMany({});
    await ActivityModel.deleteMany({});
    await CounterModel.deleteMany({});
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    await this.ensureConnected();
    const id = await getNextSequence("agents");
    const agent = await AgentModel.create({
      id,
      ...insertAgent,
      activeClients: 0,
    });
    return toAgent(agent)!;
  }

  async getAgentByUserId(userId: number): Promise<Agent | undefined> {
    await this.ensureConnected();
    const agent = await AgentModel.findOne({ userId }).lean();
    return toAgent(agent);
  }

  async getAllAgents(): Promise<Array<Agent & { user: User }>> {
    await this.ensureConnected();
    const agentDocs = await AgentModel.find().lean();
    const results: Array<Agent & { user: User }> = [];
    
    for (const agentDoc of agentDocs) {
      const userDoc = await UserModel.findOne({ id: agentDoc.userId }).lean();
      if (userDoc) {
        results.push({
          ...toAgent(agentDoc)!,
          user: toUser(userDoc)!,
        });
      }
    }
    
    return results;
  }

  async getAgentsByAdminId(adminId: number): Promise<Array<Agent & { user: User }>> {
    await this.ensureConnected();
    const agentDocs = await AgentModel.find({ adminId }).lean();
    const results: Array<Agent & { user: User }> = [];
    
    for (const agentDoc of agentDocs) {
      const userDoc = await UserModel.findOne({ id: agentDoc.userId }).lean();
      if (userDoc) {
        results.push({
          ...toAgent(agentDoc)!,
          user: toUser(userDoc)!,
        });
      }
    }
    
    return results;
  }

  async updateAgentStatus(agentId: number, status: string): Promise<void> {
    await this.ensureConnected();
    await AgentModel.updateOne({ id: agentId }, { status });
  }

  async getAgentById(id: number): Promise<Agent | undefined> {
    await this.ensureConnected();
    const agent = await AgentModel.findOne({ id }).lean();
    return toAgent(agent);
  }

  async updateAgentProfile(agentId: number, data: Partial<Agent>): Promise<Agent> {
    await this.ensureConnected();
    const agent = await AgentModel.findOneAndUpdate(
      { id: agentId },
      { $set: data },
      { new: true }
    ).lean();
    return toAgent(agent)!;
  }

  async updateAgentCommissionRate(agentId: number, rate: string): Promise<void> {
    await this.ensureConnected();
    await AgentModel.updateOne({ id: agentId }, { commissionRate: rate });
  }

  async updateAgentCommission(agentId: number, rate: string, amount: number | null): Promise<void> {
    await this.ensureConnected();
    await AgentModel.updateOne({ id: agentId }, { commissionRate: rate, commissionAmount: amount });
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    await this.ensureConnected();
    const id = await getNextSequence("clients");
    const client = await ClientModel.create({
      id,
      ...insertClient,
    });
    return toClient(client)!;
  }

  async getClientByUserId(userId: number): Promise<Client | undefined> {
    await this.ensureConnected();
    const client = await ClientModel.findOne({ userId }).lean();
    return toClient(client);
  }

  async getClientsByAgentId(agentId: number): Promise<Array<Client & { user: User }>> {
    await this.ensureConnected();
    const clientDocs = await ClientModel.find({ agentId }).lean();
    const results: Array<Client & { user: User }> = [];
    
    for (const clientDoc of clientDocs) {
      const userDoc = await UserModel.findOne({ id: clientDoc.userId }).lean();
      if (userDoc) {
        results.push({
          ...toClient(clientDoc)!,
          user: toUser(userDoc)!,
        });
      }
    }
    
    return results;
  }

  async getClientsByAdminId(adminId: number): Promise<Array<Client & { user: User; agent?: Agent & { user: User } }>> {
    await this.ensureConnected();
    const clientDocs = await ClientModel.find({ adminId }).lean();
    const results: Array<Client & { user: User; agent?: Agent & { user: User } }> = [];
    
    for (const clientDoc of clientDocs) {
      const userDoc = await UserModel.findOne({ id: clientDoc.userId }).lean();
      if (userDoc) {
        let agentWithUser: (Agent & { user: User }) | undefined;
        
        if (clientDoc.agentId) {
          const agentDoc = await AgentModel.findOne({ id: clientDoc.agentId }).lean();
          if (agentDoc) {
            const agentUserDoc = await UserModel.findOne({ id: agentDoc.userId }).lean();
            if (agentUserDoc) {
              agentWithUser = {
                ...toAgent(agentDoc)!,
                user: toUser(agentUserDoc)!,
              };
            }
          }
        }
        
        results.push({
          ...toClient(clientDoc)!,
          user: toUser(userDoc)!,
          agent: agentWithUser,
        });
      }
    }
    
    return results;
  }

  async getAllClients(): Promise<Array<Client & { user: User; agent?: Agent & { user: User } }>> {
    await this.ensureConnected();
    const clientDocs = await ClientModel.find().lean();
    const results: Array<Client & { user: User; agent?: Agent & { user: User } }> = [];
    
    for (const clientDoc of clientDocs) {
      const userDoc = await UserModel.findOne({ id: clientDoc.userId }).lean();
      if (userDoc) {
        let agentWithUser: (Agent & { user: User }) | undefined;
        
        if (clientDoc.agentId) {
          const agentDoc = await AgentModel.findOne({ id: clientDoc.agentId }).lean();
          if (agentDoc) {
            const agentUserDoc = await UserModel.findOne({ id: agentDoc.userId }).lean();
            if (agentUserDoc) {
              agentWithUser = {
                ...toAgent(agentDoc)!,
                user: toUser(agentUserDoc)!,
              };
            }
          }
        }
        
        results.push({
          ...toClient(clientDoc)!,
          user: toUser(userDoc)!,
          agent: agentWithUser,
        });
      }
    }
    
    return results;
  }

  async assignAgentToClient(clientId: number, agentId: number): Promise<void> {
    await this.ensureConnected();
    await ClientModel.updateOne({ id: clientId }, { agentId });
  }

  async updateClientProfile(clientId: number, data: Partial<Client>): Promise<Client> {
    await this.ensureConnected();
    const client = await ClientModel.findOneAndUpdate(
      { id: clientId },
      { $set: data },
      { new: true }
    ).lean();
    return toClient(client)!;
  }

  async getClientById(id: number): Promise<Client | undefined> {
    await this.ensureConnected();
    const client = await ClientModel.findOne({ id }).lean();
    return toClient(client);
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    await this.ensureConnected();
    const id = await getNextSequence("applications");
    const application = await ApplicationModel.create({
      id,
      ...insertApplication,
      submittedAt: new Date(),
    });
    return toApplication(application)!;
  }

  async getApplicationsByClientId(clientId: number): Promise<Application[]> {
    await this.ensureConnected();
    const applications = await ApplicationModel.find({ clientId }).lean();
    return applications.map(app => toApplication(app)!);
  }

  async getApplicationsByAgentId(agentId: number): Promise<Array<Application & { client: Client & { user: User } }>> {
    await this.ensureConnected();
    const clientDocs = await ClientModel.find({ agentId }).lean();
    const clientIds = clientDocs.map(c => c.id);
    
    if (clientIds.length === 0) {
      return [];
    }
    
    const applicationDocs = await ApplicationModel.find({ clientId: { $in: clientIds } })
      .sort({ submittedAt: -1 })
      .lean();
    
    const results: Array<Application & { client: Client & { user: User } }> = [];
    
    for (const appDoc of applicationDocs) {
      const clientDoc = clientDocs.find(c => c.id === appDoc.clientId);
      if (clientDoc) {
        const userDoc = await UserModel.findOne({ id: clientDoc.userId }).lean();
        if (userDoc) {
          results.push({
            ...toApplication(appDoc)!,
            client: {
              ...toClient(clientDoc)!,
              user: toUser(userDoc)!,
            },
          });
        }
      }
    }
    
    return results;
  }

  async getApplicationsByAdminId(adminId: number): Promise<Array<Application & { client: Client & { user: User } }>> {
    await this.ensureConnected();
    const clientDocs = await ClientModel.find({ adminId }).lean();
    const clientIds = clientDocs.map(c => c.id);
    
    if (clientIds.length === 0) {
      return [];
    }
    
    const applicationDocs = await ApplicationModel.find({ clientId: { $in: clientIds } })
      .sort({ submittedAt: -1 })
      .lean();
    
    const results: Array<Application & { client: Client & { user: User } }> = [];
    
    for (const appDoc of applicationDocs) {
      const clientDoc = clientDocs.find(c => c.id === appDoc.clientId);
      if (clientDoc) {
        const userDoc = await UserModel.findOne({ id: clientDoc.userId }).lean();
        if (userDoc) {
          results.push({
            ...toApplication(appDoc)!,
            client: {
              ...toClient(clientDoc)!,
              user: toUser(userDoc)!,
            },
          });
        }
      }
    }
    
    return results;
  }

  async getAllApplications(): Promise<Array<Application & { client: Client & { user: User } }>> {
    await this.ensureConnected();
    const applicationDocs = await ApplicationModel.find().sort({ submittedAt: -1 }).lean();
    const results: Array<Application & { client: Client & { user: User } }> = [];
    
    for (const appDoc of applicationDocs) {
      const clientDoc = await ClientModel.findOne({ id: appDoc.clientId }).lean();
      if (clientDoc) {
        const userDoc = await UserModel.findOne({ id: clientDoc.userId }).lean();
        if (userDoc) {
          results.push({
            ...toApplication(appDoc)!,
            client: {
              ...toClient(clientDoc)!,
              user: toUser(userDoc)!,
            },
          });
        }
      }
    }
    
    return results;
  }

  async updateApplicationStatus(id: number, status: string): Promise<void> {
    await this.ensureConnected();
    await ApplicationModel.updateOne({ id }, { status });
  }

  async updateApplicationProgress(id: number, progress: number, lastAction: string): Promise<void> {
    await this.ensureConnected();
    await ApplicationModel.updateOne({ id }, { progress, lastAction });
  }

  async getApplicationById(id: number): Promise<Application | undefined> {
    await this.ensureConnected();
    const application = await ApplicationModel.findOne({ id }).lean();
    return toApplication(application);
  }

  async createCommission(insertCommission: InsertCommission): Promise<Commission> {
    await this.ensureConnected();
    const id = await getNextSequence("commissions");
    const commission = await CommissionModel.create({
      id,
      ...insertCommission,
      date: new Date(),
    });
    return toCommission(commission)!;
  }

  async getCommissionsByAgentId(agentId: number): Promise<Array<Commission & { client: Client & { user: User } }>> {
    await this.ensureConnected();
    const commissionDocs = await CommissionModel.find({ agentId }).sort({ date: -1 }).lean();
    const results: Array<Commission & { client: Client & { user: User } }> = [];
    
    for (const commDoc of commissionDocs) {
      const clientDoc = await ClientModel.findOne({ id: commDoc.clientId }).lean();
      if (clientDoc) {
        const userDoc = await UserModel.findOne({ id: clientDoc.userId }).lean();
        if (userDoc) {
          results.push({
            ...toCommission(commDoc)!,
            client: {
              ...toClient(clientDoc)!,
              user: toUser(userDoc)!,
            },
          });
        }
      }
    }
    
    return results;
  }

  async getCommissionsByAdminId(adminId: number): Promise<Array<Commission & { agent: Agent & { user: User }; client: Client & { user: User } }>> {
    await this.ensureConnected();
    const agentDocs = await AgentModel.find({ adminId }).lean();
    const agentIds = agentDocs.map(a => a.id);
    
    if (agentIds.length === 0) {
      return [];
    }
    
    const commissionDocs = await CommissionModel.find({ agentId: { $in: agentIds } }).sort({ date: -1 }).lean();
    const results: Array<Commission & { agent: Agent & { user: User }; client: Client & { user: User } }> = [];
    
    for (const commDoc of commissionDocs) {
      const agentDoc = agentDocs.find(a => a.id === commDoc.agentId);
      const clientDoc = await ClientModel.findOne({ id: commDoc.clientId }).lean();
      
      if (agentDoc && clientDoc) {
        const agentUserDoc = await UserModel.findOne({ id: agentDoc.userId }).lean();
        const clientUserDoc = await UserModel.findOne({ id: clientDoc.userId }).lean();
        
        if (agentUserDoc && clientUserDoc) {
          results.push({
            ...toCommission(commDoc)!,
            agent: {
              ...toAgent(agentDoc)!,
              user: toUser(agentUserDoc)!,
            },
            client: {
              ...toClient(clientDoc)!,
              user: toUser(clientUserDoc)!,
            },
          });
        }
      }
    }
    
    return results;
  }

  async getCommissionById(id: number): Promise<Commission | undefined> {
    await this.ensureConnected();
    const commission = await CommissionModel.findOne({ id }).lean();
    return toCommission(commission);
  }

  async getAllCommissions(): Promise<Array<Commission & { agent: Agent & { user: User }; client: Client & { user: User } }>> {
    await this.ensureConnected();
    const commissionDocs = await CommissionModel.find().sort({ date: -1 }).lean();
    const results: Array<Commission & { agent: Agent & { user: User }; client: Client & { user: User } }> = [];
    
    for (const commDoc of commissionDocs) {
      const agentDoc = await AgentModel.findOne({ id: commDoc.agentId }).lean();
      const clientDoc = await ClientModel.findOne({ id: commDoc.clientId }).lean();
      
      if (agentDoc && clientDoc) {
        const agentUserDoc = await UserModel.findOne({ id: agentDoc.userId }).lean();
        const clientUserDoc = await UserModel.findOne({ id: clientDoc.userId }).lean();
        
        if (agentUserDoc && clientUserDoc) {
          results.push({
            ...toCommission(commDoc)!,
            agent: {
              ...toAgent(agentDoc)!,
              user: toUser(agentUserDoc)!,
            },
            client: {
              ...toClient(clientDoc)!,
              user: toUser(clientUserDoc)!,
            },
          });
        }
      }
    }
    
    return results;
  }

  async updateCommissionStatus(id: number, status: string): Promise<void> {
    await this.ensureConnected();
    await CommissionModel.updateOne({ id }, { status });
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    await this.ensureConnected();
    const id = await getNextSequence("documents");
    const document = await DocumentModel.create({
      id,
      ...insertDocument,
      uploadedAt: new Date(),
    });
    return toDocument(document)!;
  }

  async getDocumentsByOwner(ownerType: string, ownerId: number): Promise<Array<Document & { uploadedBy: User }>> {
    await this.ensureConnected();
    const documentDocs = await DocumentModel.find({ ownerType, ownerId }).sort({ uploadedAt: -1 }).lean();
    const results: Array<Document & { uploadedBy: User }> = [];
    
    for (const docDoc of documentDocs) {
      const userDoc = await UserModel.findOne({ id: docDoc.uploadedById }).lean();
      if (userDoc) {
        results.push({
          ...toDocument(docDoc)!,
          uploadedBy: toUser(userDoc)!,
        });
      }
    }
    
    return results;
  }

  async getDocumentsByAgentClients(agentId: number): Promise<Array<Document & { uploadedBy: User }>> {
    await this.ensureConnected();
    const clientDocs = await ClientModel.find({ agentId }).lean();
    const clientIds = clientDocs.map(c => c.id);
    
    if (clientIds.length === 0) {
      return [];
    }
    
    const documentDocs = await DocumentModel.find({ 
      ownerType: "client", 
      ownerId: { $in: clientIds } 
    }).sort({ uploadedAt: -1 }).lean();
    
    const results: Array<Document & { uploadedBy: User }> = [];
    
    for (const docDoc of documentDocs) {
      const userDoc = await UserModel.findOne({ id: docDoc.uploadedById }).lean();
      if (userDoc) {
        results.push({
          ...toDocument(docDoc)!,
          uploadedBy: toUser(userDoc)!,
        });
      }
    }
    
    return results;
  }

  async getDocumentsByAdminId(adminId: number): Promise<Array<Document & { uploadedBy: User }>> {
    await this.ensureConnected();
    const clientDocs = await ClientModel.find({ adminId }).lean();
    const clientIds = clientDocs.map(c => c.id);
    
    const agentDocs = await AgentModel.find({ adminId }).lean();
    const agentIds = agentDocs.map(a => a.id);
    
    const documentDocs = await DocumentModel.find({
      $or: [
        { ownerType: "client", ownerId: { $in: clientIds } },
        { ownerType: "agent", ownerId: { $in: agentIds } },
        { ownerType: "admin", ownerId: adminId }
      ]
    }).sort({ uploadedAt: -1 }).lean();
    
    const results: Array<Document & { uploadedBy: User }> = [];
    
    for (const docDoc of documentDocs) {
      const userDoc = await UserModel.findOne({ id: docDoc.uploadedById }).lean();
      if (userDoc) {
        results.push({
          ...toDocument(docDoc)!,
          uploadedBy: toUser(userDoc)!,
        });
      }
    }
    
    return results;
  }

  async getAllDocuments(): Promise<Array<Document & { uploadedBy: User }>> {
    await this.ensureConnected();
    const documentDocs = await DocumentModel.find().sort({ uploadedAt: -1 }).lean();
    const results: Array<Document & { uploadedBy: User }> = [];
    
    for (const docDoc of documentDocs) {
      const userDoc = await UserModel.findOne({ id: docDoc.uploadedById }).lean();
      if (userDoc) {
        results.push({
          ...toDocument(docDoc)!,
          uploadedBy: toUser(userDoc)!,
        });
      }
    }
    
    return results;
  }

  async updateDocumentStatus(id: number, status: string, notes?: string): Promise<void> {
    await this.ensureConnected();
    const updateData: any = { status };
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    await DocumentModel.updateOne({ id }, updateData);
  }

  async getDocumentById(id: number): Promise<Document | undefined> {
    await this.ensureConnected();
    const document = await DocumentModel.findOne({ id }).lean();
    return toDocument(document);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    await this.ensureConnected();
    const id = await getNextSequence("activities");
    const activity = await ActivityModel.create({
      id,
      ...insertActivity,
      createdAt: new Date(),
    });
    return toActivity(activity)!;
  }

  async getActivitiesByRole(role: string, userId: number): Promise<Array<Activity & { actor: User }>> {
    await this.ensureConnected();
    let query: any = {};
    
    if (role === "admin") {
      query = { actorId: userId };
    } else if (role === "agent") {
      const agent = await AgentModel.findOne({ userId }).lean();
      if (agent) {
        query = { $or: [{ actorId: userId }, { targetType: "agent", targetId: agent.id }] };
      }
    } else if (role === "client") {
      const client = await ClientModel.findOne({ userId }).lean();
      if (client) {
        query = { $or: [{ actorId: userId }, { targetType: "client", targetId: client.id }] };
      }
    }
    
    const activityDocs = await ActivityModel.find(query).sort({ createdAt: -1 }).limit(50).lean();
    const results: Array<Activity & { actor: User }> = [];
    
    for (const actDoc of activityDocs) {
      const userDoc = await UserModel.findOne({ id: actDoc.actorId }).lean();
      if (userDoc) {
        results.push({
          ...toActivity(actDoc)!,
          actor: toUser(userDoc)!,
        });
      }
    }
    
    return results;
  }

  async getAllActivities(): Promise<Array<Activity & { actor: User }>> {
    await this.ensureConnected();
    const activityDocs = await ActivityModel.find().sort({ createdAt: -1 }).limit(100).lean();
    const results: Array<Activity & { actor: User }> = [];
    
    for (const actDoc of activityDocs) {
      const userDoc = await UserModel.findOne({ id: actDoc.actorId }).lean();
      if (userDoc) {
        results.push({
          ...toActivity(actDoc)!,
          actor: toUser(userDoc)!,
        });
      }
    }
    
    return results;
  }
}

export const storage = new DatabaseStorage();

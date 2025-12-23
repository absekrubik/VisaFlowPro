import { z } from "zod";

export const roleEnum = ["admin", "agent", "client"] as const;
export const applicationStatusEnum = ["Document Review", "Submitted", "Interview", "Approved", "Rejected"] as const;
export const commissionStatusEnum = ["Pending", "Approved", "Paid", "Rejected"] as const;
export const documentStatusEnum = ["Pending", "Approved", "Rejected"] as const;
export const activityTypeEnum = ["application_submitted", "application_updated", "agent_assigned", "document_uploaded", "document_reviewed", "commission_created", "profile_updated", "status_changed"] as const;

export const insertUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(roleEnum),
});

export const insertAgentSchema = z.object({
  userId: z.number(),
  adminId: z.number(),
  commissionRate: z.string().default("10%"),
  commissionAmount: z.number().optional(),
  status: z.string().default("Active"),
  phone: z.string().optional(),
  address: z.string().optional(),
  companyName: z.string().optional(),
  licenseNumber: z.string().optional(),
});

export const insertClientSchema = z.object({
  userId: z.number(),
  adminId: z.number(),
  agentId: z.number().nullable().optional(),
  passportNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  currentAddress: z.string().optional(),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  education: z.string().optional(),
  feeAmount: z.number().optional(),
});

export const insertApplicationSchema = z.object({
  clientId: z.number(),
  visaType: z.string(),
  targetCountry: z.string(),
  purpose: z.string().optional(),
  status: z.enum(applicationStatusEnum).default("Document Review"),
  progress: z.number().default(0),
  lastAction: z.string().optional(),
});

export const insertCommissionSchema = z.object({
  agentId: z.number(),
  clientId: z.number(),
  amount: z.string(),
  status: z.enum(commissionStatusEnum).default("Pending"),
});

export const insertDocumentSchema = z.object({
  ownerType: z.enum(roleEnum),
  ownerId: z.number(),
  uploadedById: z.number(),
  name: z.string(),
  type: z.string(),
  path: z.string(),
  status: z.enum(documentStatusEnum).default("Pending"),
  notes: z.string().optional(),
});

export const insertActivitySchema = z.object({
  actorId: z.number(),
  actorRole: z.enum(roleEnum),
  targetType: z.string(),
  targetId: z.number(),
  activityType: z.enum(activityTypeEnum),
  description: z.string(),
  metadata: z.record(z.any()).optional(),
});

export const updateClientSchema = z.object({
  passportNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  currentAddress: z.string().optional(),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  education: z.string().optional(),
  agentId: z.number().nullable().optional(),
  feeAmount: z.number().optional(),
});

export const updateAgentSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  companyName: z.string().optional(),
  licenseNumber: z.string().optional(),
  commissionRate: z.string().optional(),
  commissionAmount: z.number().optional(),
  status: z.string().optional(),
});

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: typeof roleEnum[number];
  createdAt: Date;
};

export type InsertUser = z.infer<typeof insertUserSchema>;

export type Agent = {
  id: number;
  userId: number;
  adminId: number;
  commissionRate: string;
  commissionAmount?: number | null;
  status: string;
  activeClients: number;
  phone?: string | null;
  address?: string | null;
  companyName?: string | null;
  licenseNumber?: string | null;
};

export type InsertAgent = z.infer<typeof insertAgentSchema>;

export type Client = {
  id: number;
  userId: number;
  adminId: number;
  agentId: number | null;
  passportNumber?: string | null;
  dateOfBirth?: string | null;
  currentAddress?: string | null;
  phone?: string | null;
  nationality?: string | null;
  education?: string | null;
  feeAmount?: number | null;
};

export type InsertClient = z.infer<typeof insertClientSchema>;

export type Application = {
  id: number;
  clientId: number;
  visaType: string;
  targetCountry: string;
  purpose?: string | null;
  status: typeof applicationStatusEnum[number];
  progress: number;
  submittedAt: Date;
  lastAction?: string | null;
};

export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type Commission = {
  id: number;
  agentId: number;
  clientId: number;
  amount: string;
  status: typeof commissionStatusEnum[number];
  date: Date;
};

export type InsertCommission = z.infer<typeof insertCommissionSchema>;

export type Document = {
  id: number;
  ownerType: typeof roleEnum[number];
  ownerId: number;
  uploadedById: number;
  name: string;
  type: string;
  path: string;
  status: typeof documentStatusEnum[number];
  notes?: string | null;
  uploadedAt: Date;
};

export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Activity = {
  id: number;
  actorId: number;
  actorRole: typeof roleEnum[number];
  targetType: string;
  targetId: number;
  activityType: typeof activityTypeEnum[number];
  description: string;
  metadata?: Record<string, any> | null;
  createdAt: Date;
};

export type InsertActivity = z.infer<typeof insertActivitySchema>;

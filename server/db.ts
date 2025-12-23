import mongoose from "mongoose";

/* ===============================
   MongoDB Connection
================================ */

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI must be set. Did you forget to add a MongoDB connection string?"
  );
}

let isConnected = false;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (isConnected) return mongoose;

  try {
    await mongoose.connect(MONGODB_URI as string, {
      autoIndex: true,
    });
    isConnected = true;
    console.log("✅ Connected to MongoDB");
    return mongoose;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

/* ===============================
   Counter (Auto Increment IDs)
================================ */

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const CounterModel =
  mongoose.models.Counter || mongoose.model("Counter", counterSchema);

export async function getNextSequence(name: string): Promise<number> {
  const counter = await CounterModel.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

/* ===============================
   User Schema
================================ */

const userSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true }, // HASHED password
    role: {
      type: String,
      enum: ["admin", "agent", "client"],
      required: true,
    },
  },
  { timestamps: true }
);

/* ===============================
   Agent Schema
================================ */

const agentSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    userId: { type: Number, required: true, index: true },
    adminId: { type: Number, required: true },
    commissionRate: { type: Number, default: 10 }, // percentage
    commissionAmount: { type: Number, default: 0 },
    status: { type: String, default: "Active" },
    activeClients: { type: Number, default: 0 },
    phone: String,
    address: String,
    companyName: String,
    licenseNumber: String,
  },
  { timestamps: true }
);

/* ===============================
   Client Schema
================================ */

const clientSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    userId: { type: Number, required: true, index: true },
    adminId: { type: Number, required: true },
    agentId: { type: Number, default: null },
    passportNumber: String,
    dateOfBirth: String,
    currentAddress: String,
    phone: String,
    nationality: String,
    education: String,
    feeAmount: { type: Number },
  },
  { timestamps: true }
);

/* ===============================
   Application Schema
================================ */

const applicationSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    clientId: { type: Number, required: true, index: true },
    visaType: { type: String, required: true },
    targetCountry: { type: String, required: true },
    purpose: String,
    status: {
      type: String,
      enum: [
        "Document Review",
        "Submitted",
        "Interview",
        "Approved",
        "Rejected",
      ],
      default: "Document Review",
    },
    progress: { type: Number, default: 0 },
    lastAction: String,
  },
  { timestamps: true }
);

/* ===============================
   Commission Schema
================================ */

const commissionSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    agentId: { type: Number, required: true, index: true },
    clientId: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Paid", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

/* ===============================
   Document Schema
================================ */

const documentSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    ownerType: {
      type: String,
      enum: ["admin", "agent", "client"],
      required: true,
    },
    ownerId: { type: Number, required: true },
    uploadedById: { type: Number, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    path: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    notes: String,
  },
  { timestamps: true }
);

/* ===============================
   Activity Schema
================================ */

const activitySchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    actorId: { type: Number, required: true },
    actorRole: {
      type: String,
      enum: ["admin", "agent", "client"],
      required: true,
    },
    targetType: { type: String, required: true },
    targetId: { type: Number, required: true },
    activityType: {
      type: String,
      enum: [
        "application_submitted",
        "application_updated",
        "agent_assigned",
        "document_uploaded",
        "document_reviewed",
        "commission_created",
        "profile_updated",
        "status_changed",
      ],
      required: true,
    },
    description: { type: String, required: true },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

/* ===============================
   Model Exports
================================ */

export const UserModel =
  mongoose.models.User || mongoose.model("User", userSchema);
export const AgentModel =
  mongoose.models.Agent || mongoose.model("Agent", agentSchema);
export const ClientModel =
  mongoose.models.Client || mongoose.model("Client", clientSchema);
export const ApplicationModel =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);
export const CommissionModel =
  mongoose.models.Commission ||
  mongoose.model("Commission", commissionSchema);
export const DocumentModel =
  mongoose.models.Document || mongoose.model("Document", documentSchema);
export const ActivityModel =
  mongoose.models.Activity || mongoose.model("Activity", activitySchema);
export const Counter =
  mongoose.models.Counter || mongoose.model("Counter", counterSchema);

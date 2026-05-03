import { z } from "zod/v4";

// ─── Field schemas ──────────────────────────────────────────────

const FieldSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  required: z.boolean(),
  unique: z.boolean().optional(),
  default: z.string().optional(),
  description: z.string().optional(),
});

const RelationSchema = z.object({
  target: z.string().min(1),
  type: z.enum(["one-to-one", "one-to-many", "many-to-many"]),
});

// ─── Block data schemas ─────────────────────────────────────────

export const DataModelDataSchema = z.object({
  blockType: z.literal("DataModel"),
  name: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(FieldSchema),
  relations: z.array(RelationSchema),
});

export const EndpointDataSchema = z.object({
  blockType: z.literal("Endpoint"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  path: z.string().min(1),
  description: z.string().optional(),
  auth: z.enum(["none", "required", "role-based"]),
  requestSchema: z.string().optional(),
  responseSchema: z.string().optional(),
  consumedByViews: z.array(z.string()),
});

export const ViewDataSchema = z.object({
  blockType: z.literal("View"),
  name: z.string().min(1),
  route: z.string().optional(),
  description: z.string().optional(),
  consumesEndpoints: z.array(z.string()),
  requiredAuth: z.string().optional(),
  notes: z.string().optional(),
});

export const IntegrationDataSchema = z.object({
  blockType: z.literal("Integration"),
  service: z.string().min(1),
  purpose: z.string(),
  usedIn: z.array(z.string()),
  secretsNeeded: z.array(z.string()),
});

export const UserFlowStepSchema = z.object({
  actor: z.string().min(1),
  action: z.string().min(1),
  target: z.string().optional(),
});

export const UserFlowDataSchema = z.object({
  blockType: z.literal("UserFlow"),
  name: z.string().min(1),
  steps: z.array(UserFlowStepSchema),
});

export const AuthDataSchema = z.object({
  blockType: z.literal("Auth"),
  method: z.enum(["email-password", "oauth", "magic-link", "api-key"]),
  roles: z.array(z.string()),
  protects: z.array(z.string()),
});

export const JobDataSchema = z.object({
  blockType: z.literal("Job"),
  name: z.string().min(1),
  trigger: z.enum(["cron", "webhook", "event"]),
  frequency: z.string().optional(),
  action: z.string(),
});

export const NoteDataSchema = z.object({
  blockType: z.literal("Note"),
  content: z.string(),
});

// ─── Discriminated union ────────────────────────────────────────

export const BlockDataSchema = z.discriminatedUnion("blockType", [
  DataModelDataSchema,
  EndpointDataSchema,
  ViewDataSchema,
  IntegrationDataSchema,
  UserFlowDataSchema,
  AuthDataSchema,
  JobDataSchema,
  NoteDataSchema,
]);

// ─── Canvas node & edge ─────────────────────────────────────────

export const BLOCK_TYPES = [
  "DataModel",
  "Endpoint",
  "View",
  "Integration",
  "UserFlow",
  "Auth",
  "Job",
  "Note",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export const CONNECTION_TYPES = ["uses", "dependsOn", "protects", "navigatesTo"] as const;

export type ConnectionType = (typeof CONNECTION_TYPES)[number];

export const CanvasNodeSchema = z.object({
  id: z.string(),
  type: z.enum(BLOCK_TYPES),
  position: z.object({ x: z.number(), y: z.number() }),
  data: BlockDataSchema,
});

export const CanvasEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.enum(CONNECTION_TYPES),
  label: z.string().optional(),
});

export const CanvasSchema = z.object({
  nodes: z.array(CanvasNodeSchema),
  edges: z.array(CanvasEdgeSchema),
});

// ─── TypeScript types ───────────────────────────────────────────

export type Field = z.infer<typeof FieldSchema>;
export type Relation = z.infer<typeof RelationSchema>;
export type DataModelData = z.infer<typeof DataModelDataSchema>;
export type EndpointData = z.infer<typeof EndpointDataSchema>;
export type ViewData = z.infer<typeof ViewDataSchema>;
export type IntegrationData = z.infer<typeof IntegrationDataSchema>;
export type UserFlowStep = z.infer<typeof UserFlowStepSchema>;
export type UserFlowData = z.infer<typeof UserFlowDataSchema>;
export type AuthData = z.infer<typeof AuthDataSchema>;
export type JobData = z.infer<typeof JobDataSchema>;
export type NoteData = z.infer<typeof NoteDataSchema>;
export type BlockData = z.infer<typeof BlockDataSchema>;
export type CanvasNode = z.infer<typeof CanvasNodeSchema>;
export type CanvasEdge = z.infer<typeof CanvasEdgeSchema>;
export type Canvas = z.infer<typeof CanvasSchema>;

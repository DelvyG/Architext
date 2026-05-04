import { z } from "zod/v4";

// Helper: accept null as undefined for optional fields (AI often returns null)
const optStr = z.string().nullable().optional();
const optBool = z.boolean().nullable().optional();

// ─── Field schemas ──────────────────────────────────────────────

const FieldSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  required: z.boolean(),
  unique: optBool,
  default: z.coerce.string().optional(),
  description: optStr,
});

const RelationSchema = z.object({
  target: z.string().min(1),
  type: z.enum(["one-to-one", "one-to-many", "many-to-many"]),
});

// ─── Block data schemas ─────────────────────────────────────────

export const DataModelDataSchema = z.object({
  blockType: z.literal("DataModel"),
  name: z.string().min(1),
  description: optStr,
  fields: z.array(FieldSchema),
  relations: z.array(RelationSchema),
});

export const EndpointDataSchema = z.object({
  blockType: z.literal("Endpoint"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  path: z.string().min(1),
  description: optStr,
  auth: z.enum(["none", "required", "role-based"]),
  requestSchema: optStr,
  responseSchema: optStr,
  consumedByViews: z.array(z.string()),
});

export const ViewDataSchema = z.object({
  blockType: z.literal("View"),
  name: z.string().min(1),
  route: optStr,
  description: optStr,
  consumesEndpoints: z.array(z.string()),
  requiredAuth: optStr,
  notes: optStr,
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
  target: optStr,
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
  frequency: optStr,
  action: z.string(),
});

export const NoteDataSchema = z.object({
  blockType: z.literal("Note"),
  content: z.string(),
});

export const SecurityDataSchema = z.object({
  blockType: z.literal("Security"),
  name: z.string().min(1),
  policies: z.array(z.string()),
  description: optStr,
});

export const CacheDataSchema = z.object({
  blockType: z.literal("Cache"),
  name: z.string().min(1),
  strategy: z.enum(["redis", "in-memory", "cdn", "browser", "custom"]),
  ttl: optStr,
  description: optStr,
});

export const QueueDataSchema = z.object({
  blockType: z.literal("Queue"),
  name: z.string().min(1),
  broker: z.string(),
  events: z.array(z.string()),
  description: optStr,
});

export const StorageDataSchema = z.object({
  blockType: z.literal("Storage"),
  name: z.string().min(1),
  provider: z.string(),
  fileTypes: z.array(z.string()),
  maxSize: optStr,
  description: optStr,
});

export const SEODataSchema = z.object({
  blockType: z.literal("SEO"),
  name: z.string().min(1),
  strategies: z.array(z.string()),
  description: optStr,
});

export const GroupDataSchema = z.object({
  blockType: z.literal("Group"),
  name: z.string().min(1),
  color: optStr,
  description: optStr,
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
  SecurityDataSchema,
  CacheDataSchema,
  QueueDataSchema,
  StorageDataSchema,
  SEODataSchema,
  GroupDataSchema,
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
  "Security",
  "Cache",
  "Queue",
  "Storage",
  "SEO",
  "Group",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export const CONNECTION_TYPES = ["uses", "dependsOn", "protects", "navigatesTo"] as const;

export type ConnectionType = (typeof CONNECTION_TYPES)[number];

export const CanvasNodeSchema = z.object({
  id: z.string(),
  type: z.enum(BLOCK_TYPES),
  position: z.object({ x: z.number(), y: z.number() }),
  data: BlockDataSchema,
  parentId: optStr,
});

export const CanvasEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.enum(CONNECTION_TYPES),
  label: optStr,
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
export type SecurityData = z.infer<typeof SecurityDataSchema>;
export type CacheData = z.infer<typeof CacheDataSchema>;
export type QueueData = z.infer<typeof QueueDataSchema>;
export type StorageData = z.infer<typeof StorageDataSchema>;
export type SEOData = z.infer<typeof SEODataSchema>;
export type GroupData = z.infer<typeof GroupDataSchema>;
export type BlockData = z.infer<typeof BlockDataSchema>;
export type CanvasNode = z.infer<typeof CanvasNodeSchema>;
export type CanvasEdge = z.infer<typeof CanvasEdgeSchema>;
export type Canvas = z.infer<typeof CanvasSchema>;

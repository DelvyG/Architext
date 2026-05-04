import type { BlockData, BlockType } from "./schemas";

export function defaultBlockData(type: BlockType): BlockData {
  switch (type) {
    case "DataModel":
      return {
        blockType: "DataModel",
        name: "NewModel",
        fields: [{ name: "id", type: "uuid", required: true, unique: true }],
        relations: [],
      };
    case "Endpoint":
      return {
        blockType: "Endpoint",
        method: "GET",
        path: "/api/resource",
        auth: "required",
        consumedByViews: [],
      };
    case "View":
      return { blockType: "View", name: "NewView", consumesEndpoints: [] };
    case "Integration":
      return {
        blockType: "Integration",
        service: "Service",
        purpose: "",
        usedIn: [],
        secretsNeeded: [],
      };
    case "UserFlow":
      return {
        blockType: "UserFlow",
        name: "NewFlow",
        steps: [{ actor: "User", action: "does something" }],
      };
    case "Auth":
      return {
        blockType: "Auth",
        method: "email-password",
        roles: ["user"],
        protects: [],
      };
    case "Job":
      return { blockType: "Job", name: "NewJob", trigger: "cron", action: "" };
    case "Note":
      return { blockType: "Note", content: "" };
    case "Security":
      return {
        blockType: "Security",
        name: "Security Policy",
        policies: ["CORS", "Rate Limiting", "Input Validation"],
      };
    case "Cache":
      return { blockType: "Cache", name: "Cache Layer", strategy: "redis" };
    case "Queue":
      return {
        blockType: "Queue",
        name: "Message Queue",
        broker: "Redis / BullMQ",
        events: ["order.created"],
      };
    case "Storage":
      return {
        blockType: "Storage",
        name: "File Storage",
        provider: "S3",
        fileTypes: ["image/png", "image/jpeg", "application/pdf"],
      };
    case "SEO":
      return {
        blockType: "SEO",
        name: "SEO Config",
        strategies: ["Meta tags", "Sitemap", "Open Graph"],
      };
    case "Group":
      return { blockType: "Group", name: "Group", color: "#e2e8f0" };
  }
}

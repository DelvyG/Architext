import { buildSystemPrompt } from "./system-base";
import type { ModelMessage } from "ai";
import type { Canvas } from "@/lib/blocks/schemas";

function serializeCanvasCompact(canvas: Canvas): string {
  const lines: string[] = [];

  const dataModels = canvas.nodes.filter((n) => n.data.blockType === "DataModel");
  if (dataModels.length > 0) {
    lines.push("DataModels:");
    for (const n of dataModels) {
      if (n.data.blockType === "DataModel") {
        const fields = n.data.fields.map((f) => f.name).join(", ");
        lines.push(`  ${n.data.name}(${fields})`);
      }
    }
  }

  const endpoints = canvas.nodes.filter((n) => n.data.blockType === "Endpoint");
  if (endpoints.length > 0) {
    lines.push("Endpoints:");
    for (const n of endpoints) {
      if (n.data.blockType === "Endpoint") {
        lines.push(`  ${n.data.method} ${n.data.path} [auth:${n.data.auth}]`);
      }
    }
  }

  const views = canvas.nodes.filter((n) => n.data.blockType === "View");
  if (views.length > 0) {
    lines.push("Views:");
    for (const n of views) {
      if (n.data.blockType === "View") {
        lines.push(`  ${n.data.name}${n.data.route ? ` → ${n.data.route}` : ""}`);
      }
    }
  }

  const integrations = canvas.nodes.filter((n) => n.data.blockType === "Integration");
  if (integrations.length > 0) {
    lines.push("Integrations:");
    for (const n of integrations) {
      if (n.data.blockType === "Integration") {
        lines.push(`  ${n.data.service}: ${n.data.purpose}`);
      }
    }
  }

  const auth = canvas.nodes.filter((n) => n.data.blockType === "Auth");
  if (auth.length > 0) {
    lines.push("Auth:");
    for (const n of auth) {
      if (n.data.blockType === "Auth") {
        lines.push(`  ${n.data.method} roles:[${n.data.roles.join(",")}]`);
      }
    }
  }

  const jobs = canvas.nodes.filter((n) => n.data.blockType === "Job");
  if (jobs.length > 0) {
    lines.push("Jobs:");
    for (const n of jobs) {
      if (n.data.blockType === "Job") {
        lines.push(`  ${n.data.name} (${n.data.trigger}): ${n.data.action}`);
      }
    }
  }

  if (canvas.edges.length > 0) {
    lines.push("Connections:");
    for (const e of canvas.edges) {
      lines.push(`  ${e.source} --[${e.type}]--> ${e.target}`);
    }
  }

  return lines.join("\n");
}

type Params = {
  canvas: Canvas;
  userMessage: string;
  language: string;
  history?: ModelMessage[];
};

type AssistantPrompt = {
  system: string;
  messages: ModelMessage[];
};

function serializeCanvasWithIds(canvas: Canvas): string {
  const lines: string[] = [];

  for (const n of canvas.nodes) {
    const d = n.data;
    switch (d.blockType) {
      case "DataModel": {
        const fields = d.fields.map((f) => `${f.name}:${f.type}`).join(", ");
        lines.push(`[${n.id}] DataModel "${d.name}" (${fields})`);
        break;
      }
      case "Endpoint":
        lines.push(`[${n.id}] Endpoint ${d.method} ${d.path} [auth:${d.auth}]`);
        break;
      case "View":
        lines.push(`[${n.id}] View "${d.name}"${d.route ? ` → ${d.route}` : ""}`);
        break;
      case "Integration":
        lines.push(`[${n.id}] Integration "${d.service}": ${d.purpose}`);
        break;
      case "Auth":
        lines.push(`[${n.id}] Auth ${d.method} roles:[${d.roles.join(",")}]`);
        break;
      case "Job":
        lines.push(`[${n.id}] Job "${d.name}" (${d.trigger}): ${d.action}`);
        break;
      case "Security":
        lines.push(`[${n.id}] Security "${d.name}"`);
        break;
      case "Cache":
        lines.push(`[${n.id}] Cache "${d.name}" (${d.strategy})`);
        break;
      case "Queue":
        lines.push(`[${n.id}] Queue "${d.name}"`);
        break;
      case "Storage":
        lines.push(`[${n.id}] Storage "${d.name}" (${d.provider})`);
        break;
      case "SEO":
        lines.push(`[${n.id}] SEO "${d.name}"`);
        break;
      case "UserFlow":
        lines.push(`[${n.id}] UserFlow "${d.name}"`);
        break;
      case "Note":
        lines.push(`[${n.id}] Note: ${d.content.slice(0, 60)}`);
        break;
      default:
        lines.push(`[${n.id}] ${d.blockType}`);
    }
  }

  if (canvas.edges.length > 0) {
    lines.push("");
    lines.push("Connections:");
    for (const e of canvas.edges) {
      lines.push(`  ${e.source} --[${e.type}]--> ${e.target}`);
    }
  }

  return lines.join("\n");
}

const CANVAS_COMMANDS_INSTRUCTIONS = `

## Canvas Modification

When the user asks to ADD, REMOVE, UPDATE, or CONNECT blocks on the canvas, you MUST include a JSON block in your response with the commands to apply.

If the user is just asking a question (not requesting changes), respond normally without JSON.

When modifying the canvas, respond with:
1. A brief explanation of what you're doing
2. A JSON block wrapped in \`\`\`json fences with this structure:

\`\`\`json
{
  "canvasCommands": [
    { "op": "addNode", "type": "DataModel", "id": "unique-id", "position": {"x": 100, "y": 100}, "data": { "blockType": "DataModel", "name": "User", "fields": [{"name": "id", "type": "uuid", "required": true}], "relations": [] } },
    { "op": "addNode", "type": "Endpoint", "id": "unique-id-2", "position": {"x": 500, "y": 100}, "data": { "blockType": "Endpoint", "method": "POST", "path": "/api/users", "auth": "required", "consumedByViews": [] } },
    { "op": "updateNode", "id": "existing-node-id", "data": { "blockType": "DataModel", "name": "UpdatedName", "fields": [...], "relations": [] } },
    { "op": "deleteNode", "id": "existing-node-id" },
    { "op": "addEdge", "source": "node-id-1", "target": "node-id-2", "edgeType": "uses" },
    { "op": "deleteEdge", "id": "existing-edge-id" }
  ]
}
\`\`\`

Rules for canvas commands:
- Use the node IDs shown in [brackets] in the canvas state to reference existing nodes
- For new nodes, generate short descriptive IDs like "user-model", "auth-endpoint", etc.
- Position new nodes logically: DataModels at y=100, Endpoints at y=400, Views at y=650, Infrastructure at x=1200+
- Space nodes 300px apart horizontally
- When adding a DataModel, always include at least an "id" field with type "uuid"
- Valid block types: DataModel, Endpoint, View, Integration, UserFlow, Auth, Job, Note, Security, Cache, Queue, Storage, SEO
- Valid edge types: uses, dependsOn, protects, navigatesTo
- For updateNode, include the COMPLETE data object (not partial), with the correct blockType
- IMPORTANT: Always include the "canvasCommands" key in your JSON`;

export function buildAssistantPrompt({
  canvas,
  userMessage,
  language,
  history,
}: Params): AssistantPrompt {
  const system = buildSystemPrompt(language);
  const canvasContext = serializeCanvasWithIds(canvas);

  const systemWithCanvas = `${system}\n\n## Current Canvas State:\n${canvasContext || "(empty canvas)"}${CANVAS_COMMANDS_INSTRUCTIONS}`;

  const messages: ModelMessage[] = [];

  if (history) {
    messages.push(...history);
  }

  messages.push({ role: "user", content: userMessage });

  return { system: systemWithCanvas, messages };
}

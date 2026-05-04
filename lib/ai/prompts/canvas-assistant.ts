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

export function buildAssistantPrompt({
  canvas,
  userMessage,
  language,
  history,
}: Params): AssistantPrompt {
  const system = buildSystemPrompt(language);
  const canvasContext = serializeCanvasCompact(canvas);

  const systemWithCanvas = `${system}\n\n## Current Canvas State:\n${canvasContext || "(empty canvas)"}`;

  const messages: ModelMessage[] = [];

  if (history) {
    messages.push(...history);
  }

  messages.push({ role: "user", content: userMessage });

  return { system: systemWithCanvas, messages };
}

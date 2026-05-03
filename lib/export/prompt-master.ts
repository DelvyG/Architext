import type { Canvas } from "@/lib/blocks/schemas";

type ProjectData = {
  name: string;
  description?: string | null;
  stack?: Record<string, unknown> | null;
  canvas: Canvas;
  language: string;
};

export function generatePromptMaster(project: ProjectData): string {
  const parts: string[] = [];
  parts.push(`I need you to build "${project.name}".`);
  if (project.description) {
    parts.push(`\n${project.description}`);
  }

  if (project.stack) {
    parts.push(
      `\nTech stack: ${Object.entries(project.stack)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
        .join("; ")}`,
    );
  }

  const dataModels = project.canvas.nodes.filter((n) => n.data.blockType === "DataModel");
  if (dataModels.length > 0) {
    parts.push("\n\nData models:");
    for (const n of dataModels) {
      if (n.data.blockType === "DataModel") {
        const fields = n.data.fields
          .map((f) => `${f.name}:${f.type}${f.required ? "*" : ""}`)
          .join(", ");
        parts.push(`- ${n.data.name} (${fields})`);
      }
    }
  }

  const endpoints = project.canvas.nodes.filter((n) => n.data.blockType === "Endpoint");
  if (endpoints.length > 0) {
    parts.push("\n\nAPI endpoints:");
    for (const n of endpoints) {
      if (n.data.blockType === "Endpoint") {
        parts.push(`- ${n.data.method} ${n.data.path} [auth: ${n.data.auth}]`);
      }
    }
  }

  const views = project.canvas.nodes.filter((n) => n.data.blockType === "View");
  if (views.length > 0) {
    parts.push("\n\nViews/pages:");
    for (const n of views) {
      if (n.data.blockType === "View") {
        parts.push(`- ${n.data.name}${n.data.route ? ` (${n.data.route})` : ""}`);
      }
    }
  }

  const auth = project.canvas.nodes.filter((n) => n.data.blockType === "Auth");
  if (auth.length > 0) {
    parts.push("\n\nAuth:");
    for (const n of auth) {
      if (n.data.blockType === "Auth") {
        parts.push(`- Method: ${n.data.method}, Roles: ${n.data.roles.join(", ")}`);
      }
    }
  }

  parts.push("\n\nPlease implement this architecture step by step.");
  return parts.join("\n");
}

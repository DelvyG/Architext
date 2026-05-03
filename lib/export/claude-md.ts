import type { Canvas } from "@/lib/blocks/schemas";

type ProjectData = {
  name: string;
  description?: string | null;
  stack?: Record<string, unknown> | null;
  canvas: Canvas;
  language: string;
};

export function generateClaudeMd(project: ProjectData): string {
  const lines: string[] = [];
  lines.push(`# CLAUDE.md — ${project.name}\n`);
  if (project.description) {
    lines.push(`> ${project.description}\n`);
  }

  if (project.stack) {
    lines.push("## Tech Stack\n");
    for (const [key, value] of Object.entries(project.stack)) {
      if (Array.isArray(value)) {
        lines.push(`- **${key}:** ${value.join(", ")}`);
      } else {
        lines.push(`- **${key}:** ${String(value)}`);
      }
    }
    lines.push("");
  }

  const dataModels = project.canvas.nodes.filter((n) => n.data.blockType === "DataModel");
  if (dataModels.length > 0) {
    lines.push("## Data Models\n");
    for (const n of dataModels) {
      if (n.data.blockType === "DataModel") {
        lines.push(`### ${n.data.name}\n`);
        if (n.data.description) lines.push(`${n.data.description}\n`);
        lines.push("| Field | Type | Required |");
        lines.push("|---|---|---|");
        for (const f of n.data.fields) {
          lines.push(`| ${f.name} | ${f.type} | ${f.required ? "Yes" : "No"} |`);
        }
        if (n.data.relations.length > 0) {
          lines.push(
            `\nRelations: ${n.data.relations.map((r) => `${r.type} → ${r.target}`).join(", ")}`,
          );
        }
        lines.push("");
      }
    }
  }

  const endpoints = project.canvas.nodes.filter((n) => n.data.blockType === "Endpoint");
  if (endpoints.length > 0) {
    lines.push("## API Endpoints\n");
    for (const n of endpoints) {
      if (n.data.blockType === "Endpoint") {
        lines.push(`### \`${n.data.method} ${n.data.path}\`\n`);
        if (n.data.description) lines.push(`${n.data.description}\n`);
        lines.push(`- **Auth:** ${n.data.auth}`);
        lines.push("");
      }
    }
  }

  const views = project.canvas.nodes.filter((n) => n.data.blockType === "View");
  if (views.length > 0) {
    lines.push("## Views\n");
    for (const n of views) {
      if (n.data.blockType === "View") {
        lines.push(`- **${n.data.name}**${n.data.route ? ` → \`${n.data.route}\`` : ""}`);
        if (n.data.description) lines.push(`  ${n.data.description}`);
      }
    }
    lines.push("");
  }

  const auth = project.canvas.nodes.filter((n) => n.data.blockType === "Auth");
  if (auth.length > 0) {
    lines.push("## Authentication\n");
    for (const n of auth) {
      if (n.data.blockType === "Auth") {
        lines.push(`- **Method:** ${n.data.method}`);
        lines.push(`- **Roles:** ${n.data.roles.join(", ")}`);
        lines.push("");
      }
    }
  }

  const integrations = project.canvas.nodes.filter((n) => n.data.blockType === "Integration");
  if (integrations.length > 0) {
    lines.push("## Integrations\n");
    for (const n of integrations) {
      if (n.data.blockType === "Integration") {
        lines.push(`### ${n.data.service}\n`);
        lines.push(`- **Purpose:** ${n.data.purpose}`);
        if (n.data.secretsNeeded.length > 0) {
          lines.push(`- **Secrets needed:** ${n.data.secretsNeeded.join(", ")}`);
        }
        lines.push("");
      }
    }
  }

  const jobs = project.canvas.nodes.filter((n) => n.data.blockType === "Job");
  if (jobs.length > 0) {
    lines.push("## Background Jobs\n");
    for (const n of jobs) {
      if (n.data.blockType === "Job") {
        lines.push(`### ${n.data.name}\n`);
        lines.push(
          `- **Trigger:** ${n.data.trigger}${n.data.frequency ? ` (${n.data.frequency})` : ""}`,
        );
        lines.push(`- **Action:** ${n.data.action}`);
        lines.push("");
      }
    }
  }

  return lines.join("\n");
}

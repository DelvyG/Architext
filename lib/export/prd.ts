import type { Canvas } from "@/lib/blocks/schemas";

type ProjectData = {
  name: string;
  description?: string | null;
  stack?: Record<string, unknown> | null;
  canvas: Canvas;
  language: string;
};

export function generatePrd(project: ProjectData): string {
  const lines: string[] = [];
  lines.push(`# PRD — ${project.name}\n`);

  lines.push("## Overview\n");
  lines.push(project.description || "No description provided.");
  lines.push("");

  if (project.stack) {
    lines.push("## Technical Stack\n");
    for (const [key, value] of Object.entries(project.stack)) {
      lines.push(`- **${key}:** ${Array.isArray(value) ? value.join(", ") : String(value)}`);
    }
    lines.push("");
  }

  const dataModels = project.canvas.nodes.filter((n) => n.data.blockType === "DataModel");
  lines.push("## Data Architecture\n");
  lines.push(`The system has ${dataModels.length} core data models:\n`);
  for (const n of dataModels) {
    if (n.data.blockType === "DataModel") {
      lines.push(
        `- **${n.data.name}**: ${n.data.fields.length} fields${n.data.description ? ` — ${n.data.description}` : ""}`,
      );
    }
  }
  lines.push("");

  const endpoints = project.canvas.nodes.filter((n) => n.data.blockType === "Endpoint");
  if (endpoints.length > 0) {
    lines.push(`## API Surface\n`);
    lines.push(`${endpoints.length} endpoints:\n`);
    for (const n of endpoints) {
      if (n.data.blockType === "Endpoint") {
        lines.push(
          `- \`${n.data.method} ${n.data.path}\`${n.data.description ? ` — ${n.data.description}` : ""}`,
        );
      }
    }
    lines.push("");
  }

  const views = project.canvas.nodes.filter((n) => n.data.blockType === "View");
  if (views.length > 0) {
    lines.push("## User Interface\n");
    for (const n of views) {
      if (n.data.blockType === "View") {
        lines.push(
          `- **${n.data.name}**${n.data.route ? ` (${n.data.route})` : ""}${n.data.description ? ` — ${n.data.description}` : ""}`,
        );
      }
    }
    lines.push("");
  }

  const flows = project.canvas.nodes.filter((n) => n.data.blockType === "UserFlow");
  if (flows.length > 0) {
    lines.push("## User Flows\n");
    for (const n of flows) {
      if (n.data.blockType === "UserFlow") {
        lines.push(`### ${n.data.name}\n`);
        n.data.steps.forEach((step, i) => {
          lines.push(
            `${i + 1}. **${step.actor}** ${step.action}${step.target ? ` → ${step.target}` : ""}`,
          );
        });
        lines.push("");
      }
    }
  }

  return lines.join("\n");
}

import type { Canvas } from "@/lib/blocks/schemas";

type ProjectData = {
  name: string;
  description?: string | null;
  stack?: Record<string, unknown> | null;
  canvas: Canvas;
  language: string;
};

export function generatePromptMaster(project: ProjectData): string {
  const out: string[] = [];

  // ─── Role & Context ──────────────────────────────────────────
  out.push(`You are building "${project.name}".`);
  if (project.description) {
    out.push(`\n${project.description}`);
  }

  // ─── Stack ───────────────────────────────────────────────────
  if (project.stack && Object.keys(project.stack).length > 0) {
    out.push("\n## Tech Stack\n");
    for (const [key, value] of Object.entries(project.stack)) {
      out.push(`- ${key}: ${Array.isArray(value) ? value.join(", ") : value}`);
    }
  }

  // ─── Data Models (Prisma-like notation) ──────────────────────
  const dataModels = project.canvas.nodes.filter((n) => n.data.blockType === "DataModel");
  if (dataModels.length > 0) {
    out.push("\n## Data Models\n");
    for (const n of dataModels) {
      if (n.data.blockType !== "DataModel") continue;
      out.push(`model ${n.data.name} {`);
      for (const f of n.data.fields) {
        const attrs: string[] = [];
        if (f.unique) attrs.push("@unique");
        if (f.default) attrs.push(`@default(${f.default})`);
        const opt = f.required ? "" : "?";
        out.push(`  ${f.name}  ${f.type}${opt}  ${attrs.join(" ")}`.trimEnd());
      }
      if (n.data.relations.length > 0) {
        for (const r of n.data.relations) {
          out.push(`  // ${r.type} → ${r.target}`);
        }
      }
      out.push("}\n");
    }
  }

  // ─── API Endpoints ───────────────────────────────────────────
  const endpoints = project.canvas.nodes.filter((n) => n.data.blockType === "Endpoint");
  if (endpoints.length > 0) {
    out.push("## API Endpoints\n");
    for (const n of endpoints) {
      if (n.data.blockType !== "Endpoint") continue;
      out.push(`${n.data.method} ${n.data.path}  [auth: ${n.data.auth}]`);
      if (n.data.description) out.push(`  → ${n.data.description}`);
    }
    out.push("");
  }

  // ─── Views ───────────────────────────────────────────────────
  const views = project.canvas.nodes.filter((n) => n.data.blockType === "View");
  if (views.length > 0) {
    out.push("## Pages\n");
    for (const n of views) {
      if (n.data.blockType !== "View") continue;
      out.push(
        `- ${n.data.route ?? "/?"} → ${n.data.name}${n.data.description ? `: ${n.data.description}` : ""}`,
      );
    }
    out.push("");
  }

  // ─── Auth ────────────────────────────────────────────────────
  const auth = project.canvas.nodes.filter((n) => n.data.blockType === "Auth");
  if (auth.length > 0) {
    out.push("## Auth\n");
    for (const n of auth) {
      if (n.data.blockType !== "Auth") continue;
      out.push(`Method: ${n.data.method}`);
      out.push(`Roles: ${n.data.roles.join(", ")}`);

      const protectsEdges = project.canvas.edges.filter(
        (e) => e.source === n.id && e.type === "protects",
      );
      if (protectsEdges.length > 0) {
        const names = protectsEdges.map((e) => {
          const target = project.canvas.nodes.find((nd) => nd.id === e.target);
          if (!target) return e.target;
          return "name" in target.data
            ? target.data.name
            : "path" in target.data
              ? target.data.path
              : e.target;
        });
        out.push(`Protected: ${names.join(", ")}`);
      }
    }
    out.push("");
  }

  // ─── Integrations ────────────────────────────────────────────
  const integrations = project.canvas.nodes.filter((n) => n.data.blockType === "Integration");
  if (integrations.length > 0) {
    out.push("## External Services\n");
    for (const n of integrations) {
      if (n.data.blockType !== "Integration") continue;
      out.push(`- ${n.data.service}: ${n.data.purpose}`);
      if (n.data.secretsNeeded.length > 0) {
        out.push(`  Env: ${n.data.secretsNeeded.join(", ")}`);
      }
    }
    out.push("");
  }

  // ─── Jobs ────────────────────────────────────────────────────
  const jobs = project.canvas.nodes.filter((n) => n.data.blockType === "Job");
  if (jobs.length > 0) {
    out.push("## Background Jobs\n");
    for (const n of jobs) {
      if (n.data.blockType !== "Job") continue;
      out.push(
        `- ${n.data.name} [${n.data.trigger}${n.data.frequency ? `, ${n.data.frequency}` : ""}]: ${n.data.action}`,
      );
    }
    out.push("");
  }

  // ─── User Flows ──────────────────────────────────────────────
  const flows = project.canvas.nodes.filter((n) => n.data.blockType === "UserFlow");
  if (flows.length > 0) {
    out.push("## Key User Flows\n");
    for (const n of flows) {
      if (n.data.blockType !== "UserFlow") continue;
      out.push(`### ${n.data.name}\n`);
      n.data.steps.forEach((step, i) => {
        out.push(`${i + 1}. ${step.actor}: ${step.action}`);
      });
      out.push("");
    }
  }

  // ─── Instructions ────────────────────────────────────────────
  out.push("## Instructions\n");
  out.push("Implement this architecture following these principles:");
  out.push("1. Start with the data models and database schema");
  out.push("2. Build the API endpoints with proper validation and auth middleware");
  out.push("3. Create the views/pages connecting to the endpoints");
  out.push("4. Set up external integrations with proper error handling");
  out.push("5. Add background jobs last");
  out.push("6. Write tests for critical paths\n");

  return out.join("\n");
}

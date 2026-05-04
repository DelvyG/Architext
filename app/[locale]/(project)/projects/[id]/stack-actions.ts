"use server";

import { prisma } from "@/lib/db/client";
import { requireSession } from "@/lib/auth/session";
import { generateText } from "ai";
import { getAIClient, NoActiveApiKeyError } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/prompts/system-base";
import type { Canvas } from "@/lib/blocks/schemas";

export type StackConfig = {
  frontend: string;
  backend: string;
  database: string;
  orm: string;
  auth: string;
  hosting: string;
  styling: string;
  testing: string;
  cicd: string;
  monitoring: string;
  integrations: string[];
  notes: string;
};

const EMPTY_STACK: StackConfig = {
  frontend: "",
  backend: "",
  database: "",
  orm: "",
  auth: "",
  hosting: "",
  styling: "",
  testing: "",
  cicd: "",
  monitoring: "",
  integrations: [],
  notes: "",
};

export async function getStack(projectId: string): Promise<StackConfig> {
  const session = await requireSession();
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: session.user.id },
    select: { stack: true },
  });
  if (!project) throw new Error("Project not found");

  const raw = project.stack as Record<string, unknown> | null;
  if (!raw) return EMPTY_STACK;

  return {
    frontend: String(raw.frontend ?? ""),
    backend: String(raw.backend ?? ""),
    database: String(raw.database ?? raw.db ?? ""),
    orm: String(raw.orm ?? ""),
    auth: String(raw.auth ?? ""),
    hosting: String(raw.hosting ?? ""),
    styling: String(raw.styling ?? ""),
    testing: String(raw.testing ?? ""),
    cicd: String(raw.cicd ?? ""),
    monitoring: String(raw.monitoring ?? ""),
    integrations: Array.isArray(raw.integrations) ? raw.integrations.map(String) : [],
    notes: String(raw.notes ?? ""),
  };
}

export async function saveStack(projectId: string, stack: StackConfig) {
  const session = await requireSession();
  await prisma.project.update({
    where: { id: projectId, ownerId: session.user.id },
    data: { stack: JSON.parse(JSON.stringify(stack)) },
  });
}

function summarizeCanvas(canvas: Canvas): string {
  const lines: string[] = [];

  const models = canvas.nodes.filter((n) => n.data.blockType === "DataModel");
  if (models.length > 0) {
    lines.push(
      `Data Models: ${models
        .map((n) => (n.data.blockType === "DataModel" ? n.data.name : ""))
        .filter(Boolean)
        .join(", ")}`,
    );
  }

  const endpoints = canvas.nodes.filter((n) => n.data.blockType === "Endpoint");
  if (endpoints.length > 0) {
    lines.push(
      `Endpoints: ${endpoints
        .map((n) => (n.data.blockType === "Endpoint" ? `${n.data.method} ${n.data.path}` : ""))
        .filter(Boolean)
        .join(", ")}`,
    );
  }

  const views = canvas.nodes.filter((n) => n.data.blockType === "View");
  if (views.length > 0) {
    lines.push(
      `Views: ${views
        .map((n) => (n.data.blockType === "View" ? n.data.name : ""))
        .filter(Boolean)
        .join(", ")}`,
    );
  }

  const integrations = canvas.nodes.filter((n) => n.data.blockType === "Integration");
  if (integrations.length > 0) {
    lines.push(
      `Integrations: ${integrations
        .map((n) => (n.data.blockType === "Integration" ? n.data.service : ""))
        .filter(Boolean)
        .join(", ")}`,
    );
  }

  const auth = canvas.nodes.filter((n) => n.data.blockType === "Auth");
  if (auth.length > 0) {
    lines.push(
      `Auth: ${auth.map((n) => (n.data.blockType === "Auth" ? `${n.data.method} with roles [${n.data.roles.join(", ")}]` : "")).join(", ")}`,
    );
  }

  const other = canvas.nodes.filter(
    (n) => !["DataModel", "Endpoint", "View", "Integration", "Auth"].includes(n.data.blockType),
  );
  if (other.length > 0) {
    lines.push(`Other blocks: ${other.map((n) => `${n.data.blockType}`).join(", ")}`);
  }

  return lines.join("\n");
}

export async function suggestStack(
  projectId: string,
): Promise<{ stack: StackConfig; reasoning: string }> {
  const session = await requireSession();
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: session.user.id },
    select: { name: true, description: true, canvas: true, language: true, initialPrompt: true },
  });
  if (!project) throw new Error("Project not found");

  const { client, model } = await getAIClient(session.user.id);
  const canvas = project.canvas as Canvas;
  const canvasSummary = summarizeCanvas(canvas);
  const context = project.initialPrompt || project.description || project.name;

  const { text } = await generateText({
    model: client(model),
    system:
      buildSystemPrompt(project.language) +
      `\n\nYou are suggesting a tech stack for a software project. You MUST fill in ALL fields — never leave any empty. Be specific with version numbers. Respond ONLY with a JSON object in a code fence.

Required JSON structure (fill ALL fields):
{
  "frontend": "specific framework + version, e.g. Next.js 15 (App Router) + React 19",
  "backend": "specific runtime + framework, e.g. Node.js 22 + Next.js API Routes",
  "database": "specific DB + version, e.g. PostgreSQL 16",
  "orm": "specific ORM, e.g. Prisma 6",
  "auth": "specific auth solution, e.g. better-auth with email/password + Google OAuth",
  "hosting": "specific provider + services, e.g. Vercel (frontend) + Supabase (DB)",
  "styling": "specific CSS framework + component library, e.g. Tailwind CSS 4 + shadcn/ui",
  "testing": "specific testing tools, e.g. Vitest (unit) + Playwright (e2e)",
  "cicd": "specific CI/CD pipeline, e.g. GitHub Actions with preview deploys",
  "monitoring": "specific monitoring stack, e.g. Sentry (errors) + Vercel Analytics (performance)",
  "integrations": ["list", "every", "external", "service", "needed"],
  "notes": "Brief note about why these choices fit this specific project",
  "reasoning": "Detailed paragraph explaining the reasoning behind each choice"
}`,
    messages: [
      {
        role: "user",
        content: `Suggest the complete tech stack for this project:

Project: "${project.name}"
Description: "${context}"

Architecture (${canvas.nodes.length} blocks, ${canvas.edges.length} connections):
${canvasSummary || "Empty canvas — suggest based on the project description."}

Requirements:
- Fill ALL 10 tech fields with specific tools and versions
- List ALL needed external integrations
- Choose modern, production-ready, well-documented tools
- Consider the scale implied by the architecture
- Explain WHY each choice fits this project`,
      },
    ],
  });

  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
  const json = JSON.parse(match?.[1] ?? match?.[0] ?? "{}");

  const stack: StackConfig = {
    frontend: json.frontend ?? "",
    backend: json.backend ?? "",
    database: json.database ?? "",
    orm: json.orm ?? "",
    auth: json.auth ?? "",
    hosting: json.hosting ?? "",
    styling: json.styling ?? "",
    testing: json.testing ?? "",
    cicd: json.cicd ?? "",
    monitoring: json.monitoring ?? "",
    integrations: Array.isArray(json.integrations) ? json.integrations : [],
    notes: json.notes ?? "",
  };

  // Auto-save the suggested stack
  await prisma.project.update({
    where: { id: projectId },
    data: { stack: JSON.parse(JSON.stringify(stack)) },
  });

  return {
    stack,
    reasoning: json.reasoning ?? "",
  };
}

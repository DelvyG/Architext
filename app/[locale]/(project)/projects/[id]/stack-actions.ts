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
  const context = project.initialPrompt || project.description || project.name;

  const { text } = await generateText({
    model: client(model),
    system:
      buildSystemPrompt(project.language) +
      `\n\nRespond ONLY with a JSON object in a code fence. Structure:
{
  "frontend": "e.g. Next.js 15 (App Router)",
  "backend": "e.g. Next.js API Routes",
  "database": "e.g. PostgreSQL 16",
  "orm": "e.g. Prisma",
  "auth": "e.g. better-auth with email/password + OAuth",
  "hosting": "e.g. Vercel + Supabase",
  "styling": "e.g. Tailwind CSS + shadcn/ui",
  "testing": "e.g. Vitest + Playwright",
  "cicd": "e.g. GitHub Actions",
  "monitoring": "e.g. Sentry + Vercel Analytics",
  "integrations": ["Stripe", "SendGrid"],
  "notes": "Brief reasoning for choices",
  "reasoning": "Detailed explanation"
}`,
    messages: [
      {
        role: "user",
        content: `Suggest the best tech stack for this project: "${context}".
Consider the architecture has ${canvas.nodes.length} blocks.
Be specific with versions and libraries. Choose modern, production-ready tools.`,
      },
    ],
  });

  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
  const json = JSON.parse(match?.[1] ?? match?.[0] ?? "{}");

  return {
    stack: {
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
      integrations: json.integrations ?? [],
      notes: json.notes ?? "",
    },
    reasoning: json.reasoning ?? "",
  };
}

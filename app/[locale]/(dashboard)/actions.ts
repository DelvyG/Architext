"use server";

import { z } from "zod/v4";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireSession } from "@/lib/auth/session";

const TEMPLATE_SLUGS = [
  "saas-b2b",
  "ecommerce",
  "internal-dashboard",
  "mobile-with-backend",
  "ai-tool",
];

async function loadTemplateCanvas(slug: string): Promise<{ nodes: unknown[]; edges: unknown[] }> {
  try {
    const filePath = join(process.cwd(), "templates", `${slug}.json`);
    const raw = await readFile(filePath, "utf-8");
    const template = JSON.parse(raw);
    return template.canvas ?? { nodes: [], edges: [] };
  } catch {
    return { nodes: [], edges: [] };
  }
}

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  language: z.enum(["en", "es"]),
  templateSlug: z.string().optional(),
});

export async function createProject(raw: unknown) {
  const input = CreateProjectSchema.parse(raw);
  const session = await requireSession();

  let canvas: Prisma.InputJsonValue = { nodes: [], edges: [] };
  if (input.templateSlug && TEMPLATE_SLUGS.includes(input.templateSlug)) {
    canvas = (await loadTemplateCanvas(input.templateSlug)) as Prisma.InputJsonValue;
  }

  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      language: input.language,
      templateSlug: input.templateSlug,
      canvas,
      ownerId: session.user.id,
    },
    select: { id: true },
  });

  return project;
}

const DeleteProjectSchema = z.string().min(1);

export async function deleteProject(rawId: unknown) {
  const id = DeleteProjectSchema.parse(rawId);
  const session = await requireSession();

  await prisma.project.delete({
    where: { id, ownerId: session.user.id },
  });
}

const RenameProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
});

export async function renameProject(rawId: unknown, rawName: unknown) {
  const { id, name } = RenameProjectSchema.parse({ id: rawId, name: rawName });
  const session = await requireSession();

  await prisma.project.update({
    where: { id, ownerId: session.user.id },
    data: { name },
  });
}

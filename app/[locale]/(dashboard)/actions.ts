"use server";

import { z } from "zod/v4";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireSession } from "@/lib/auth/session";
import { sendProjectShareEmail } from "@/lib/email/resend";

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

const MAX_PROJECTS_PER_USER = 12;

export async function createProject(raw: unknown) {
  const input = CreateProjectSchema.parse(raw);
  const session = await requireSession();

  const count = await prisma.project.count({
    where: { ownerId: session.user.id },
  });
  if (count >= MAX_PROJECTS_PER_USER) {
    throw new Error("PROJECT_LIMIT_REACHED");
  }

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

export async function duplicateProject(projectId: string, newName?: string) {
  const session = await requireSession();

  const original = await prisma.project.findFirst({
    where: { id: projectId, ownerId: session.user.id },
    select: {
      name: true,
      description: true,
      canvas: true,
      stack: true,
      language: true,
    },
  });
  if (!original) throw new Error("Project not found");

  const count = await prisma.project.count({
    where: { ownerId: session.user.id },
  });
  if (count >= MAX_PROJECTS_PER_USER) {
    throw new Error("PROJECT_LIMIT_REACHED");
  }

  const project = await prisma.project.create({
    data: {
      name: newName || `${original.name} (copy)`,
      description: original.description,
      canvas: original.canvas ?? { nodes: [], edges: [] },
      stack: original.stack ?? undefined,
      language: original.language,
      ownerId: session.user.id,
    },
    select: { id: true },
  });

  return project;
}

// ─── Project sharing ──────────────────────────────────────────

const ShareProjectSchema = z.object({
  projectId: z.string().min(1),
  email: z.email(),
});

export async function shareProject(raw: unknown) {
  const input = ShareProjectSchema.parse(raw);
  const session = await requireSession();

  if (input.email.toLowerCase() === session.user.email.toLowerCase()) {
    throw new Error("CANNOT_SHARE_WITH_SELF");
  }

  const project = await prisma.project.findFirst({
    where: { id: input.projectId, ownerId: session.user.id },
    select: { id: true, name: true },
  });
  if (!project) throw new Error("Project not found");

  const existing = await prisma.projectShare.findUnique({
    where: {
      projectId_toEmail: { projectId: project.id, toEmail: input.email.toLowerCase() },
    },
  });
  if (existing) throw new Error("ALREADY_SHARED");

  const recipientUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    select: { id: true },
  });

  await prisma.projectShare.create({
    data: {
      projectId: project.id,
      fromUserId: session.user.id,
      toEmail: input.email.toLowerCase(),
    },
  });

  await sendProjectShareEmail({
    to: input.email.toLowerCase(),
    fromName: session.user.name || session.user.email,
    projectName: project.name,
    hasAccount: !!recipientUser,
  });

  return { success: true };
}

export async function getPendingShares() {
  const session = await requireSession();

  return prisma.projectShare.findMany({
    where: {
      toEmail: session.user.email.toLowerCase(),
      status: "pending",
    },
    select: {
      id: true,
      createdAt: true,
      project: { select: { name: true, description: true, language: true } },
      fromUser: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function acceptShare(shareId: string) {
  const session = await requireSession();

  const share = await prisma.projectShare.findFirst({
    where: {
      id: shareId,
      toEmail: session.user.email.toLowerCase(),
      status: "pending",
    },
    include: {
      project: {
        select: { name: true, description: true, canvas: true, stack: true, language: true },
      },
      fromUser: { select: { name: true } },
    },
  });
  if (!share) throw new Error("Share not found");

  const count = await prisma.project.count({
    where: { ownerId: session.user.id },
  });
  if (count >= MAX_PROJECTS_PER_USER) {
    throw new Error("PROJECT_LIMIT_REACHED");
  }

  const [, project] = await prisma.$transaction([
    prisma.projectShare.update({
      where: { id: shareId },
      data: { status: "accepted" },
    }),
    prisma.project.create({
      data: {
        name: share.project.name,
        description: share.project.description,
        canvas: share.project.canvas ?? { nodes: [], edges: [] },
        stack: share.project.stack ?? undefined,
        language: share.project.language,
        ownerId: session.user.id,
      },
      select: { id: true },
    }),
  ]);

  return project;
}

export async function rejectShare(shareId: string) {
  const session = await requireSession();

  await prisma.projectShare.updateMany({
    where: {
      id: shareId,
      toEmail: session.user.email.toLowerCase(),
      status: "pending",
    },
    data: { status: "rejected" },
  });
}

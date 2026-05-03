"use server";

import { z } from "zod/v4";
import { prisma } from "@/lib/db/client";
import { requireSession } from "@/lib/auth/session";

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  language: z.enum(["en", "es"]),
  templateSlug: z.string().optional(),
});

export async function createProject(raw: unknown) {
  const input = CreateProjectSchema.parse(raw);
  const session = await requireSession();

  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      language: input.language,
      templateSlug: input.templateSlug,
      canvas: { nodes: [], edges: [] },
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

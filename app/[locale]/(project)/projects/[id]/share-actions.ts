"use server";

import { nanoid } from "nanoid";
import { prisma } from "@/lib/db/client";
import { requireSession } from "@/lib/auth/session";

export async function generateShareToken(projectId: string): Promise<string> {
  const session = await requireSession();

  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: session.user.id },
    select: { shareToken: true },
  });
  if (!project) throw new Error("Project not found");

  // Return existing token or create new one
  if (project.shareToken) return project.shareToken;

  const token = nanoid(24);
  await prisma.project.update({
    where: { id: projectId },
    data: { shareToken: token },
  });
  return token;
}

export async function revokeShareToken(projectId: string) {
  const session = await requireSession();
  await prisma.project.update({
    where: { id: projectId, ownerId: session.user.id },
    data: { shareToken: null },
  });
}

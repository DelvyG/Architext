"use server";

import { z } from "zod/v4";
import { prisma } from "@/lib/db/client";
import { requireSession } from "@/lib/auth/session";

export async function createSnapshot(projectId: string, label?: string) {
  const session = await requireSession();

  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: session.user.id },
    select: { canvas: true },
  });
  if (!project) throw new Error("Project not found");

  await prisma.canvasSnapshot.create({
    data: {
      projectId,
      canvas: project.canvas ?? { nodes: [], edges: [] },
      reason: "manual",
      label: label || `Snapshot – ${new Date().toLocaleString()}`,
    },
  });
}

export async function getSnapshots(projectId: string) {
  const session = await requireSession();

  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: session.user.id },
    select: { id: true },
  });
  if (!project) throw new Error("Project not found");

  return prisma.canvasSnapshot.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      reason: true,
      label: true,
      createdAt: true,
    },
  });
}

export async function restoreSnapshot(projectId: string, snapshotId: string) {
  const session = await requireSession();

  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: session.user.id },
    select: { id: true, canvas: true },
  });
  if (!project) throw new Error("Project not found");

  const snapshot = await prisma.canvasSnapshot.findFirst({
    where: { id: snapshotId, projectId },
    select: { canvas: true },
  });
  if (!snapshot) throw new Error("Snapshot not found");

  // Save current canvas before restoring
  await prisma.canvasSnapshot.create({
    data: {
      projectId,
      canvas: project.canvas ?? { nodes: [], edges: [] },
      reason: "auto",
      label: "Before restoring snapshot",
    },
  });

  // Restore
  await prisma.project.update({
    where: { id: projectId },
    data: { canvas: snapshot.canvas ?? { nodes: [], edges: [] } },
  });

  return snapshot.canvas;
}

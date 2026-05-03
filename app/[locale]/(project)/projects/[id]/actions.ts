"use server";

import { prisma } from "@/lib/db/client";
import { requireSession } from "@/lib/auth/session";
import { CanvasSchema } from "@/lib/blocks/schemas";

export async function saveCanvas(projectId: string, canvas: unknown) {
  const session = await requireSession();
  const parsed = CanvasSchema.parse(canvas);

  await prisma.project.update({
    where: { id: projectId, ownerId: session.user.id },
    data: { canvas: parsed },
  });
}

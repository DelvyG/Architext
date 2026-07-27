"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/client";

const UpdateUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  emailVerified: z.boolean().optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export async function updateUser(raw: z.infer<typeof UpdateUserSchema>) {
  await requireAdmin();
  const input = UpdateUserSchema.parse(raw);

  const { id, ...data } = input;
  await prisma.user.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const { session } = await requireAdmin();

  if (userId === session.user.id) {
    return { error: "Cannot delete your own account." };
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function updateAdminProfile(data: { name: string }) {
  const { session } = await requireAdmin();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: data.name.trim() },
  });

  revalidatePath("/admin/profile");
  return { success: true };
}

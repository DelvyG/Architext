import { redirect } from "next/navigation";
import { getSession } from "./session";
import { prisma } from "@/lib/db/client";

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, email: true },
  });

  if (!user || user.role !== "admin") {
    redirect("/admin/login");
  }

  return { session, user: { ...session.user, role: user.role } };
}

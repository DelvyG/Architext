import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

export default async function AdminRootPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role === "admin") {
    redirect("/admin/dashboard");
  }

  redirect("/admin/login");
}

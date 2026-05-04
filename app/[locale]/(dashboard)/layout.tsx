import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { DashboardHeader } from "./dashboard-header";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/login`);
  }

  const activeKey = await prisma.apiKey.findFirst({
    where: { userId: session.user.id, isActive: true },
    select: { id: true },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={session.user} hasApiKey={!!activeKey} />
      <main className="flex-1">{children}</main>
    </div>
  );
}

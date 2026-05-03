import { setRequestLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db/client";
import { requireSession } from "@/lib/auth/session";
import { ProjectsList } from "./projects-list";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard.projects");
  const session = await requireSession();

  const projects = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      updatedAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>
      <ProjectsList projects={projects} />
    </div>
  );
}

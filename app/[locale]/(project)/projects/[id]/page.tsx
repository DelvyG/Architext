import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { requireSession } from "@/lib/auth/session";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ProjectEditorPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("project.editor");
  const session = await requireSession();

  const project = await prisma.project.findFirst({
    where: { id, ownerId: session.user.id },
    select: { id: true, name: true },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center gap-4 border-b px-4">
        <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">
          {t("backToProjects")}
        </Link>
        <span className="text-sm text-muted-foreground">/</span>
        <h1 className="text-sm font-medium">{project.name}</h1>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">{t("title", { name: project.name })}</p>
      </main>
    </div>
  );
}

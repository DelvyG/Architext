import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/client";
import { requireSession } from "@/lib/auth/session";
import { ProjectEditor } from "./project-editor";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ProjectEditorPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const session = await requireSession();

  const project = await prisma.project.findFirst({
    where: { id, ownerId: session.user.id },
    select: {
      id: true,
      name: true,
      canvas: true,
      language: true,
      messages: {
        orderBy: { createdAt: "asc" },
        take: 50,
        select: { role: true, content: true },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const canvas = project.canvas as { nodes: unknown[]; edges: unknown[] };

  return (
    <ProjectEditor
      projectId={project.id}
      projectName={project.name}
      initialCanvas={canvas}
      initialMessages={project.messages}
    />
  );
}

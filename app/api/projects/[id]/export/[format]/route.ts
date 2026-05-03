import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { requireSession } from "@/lib/auth/session";
import { generateClaudeMd } from "@/lib/export/claude-md";
import { generatePromptMaster } from "@/lib/export/prompt-master";
import { generatePrd } from "@/lib/export/prd";
import { generateSqlSchema } from "@/lib/export/sql-schema";
import type { Canvas } from "@/lib/blocks/schemas";

const FORMATS = ["claude-md", "prompt", "prd", "sql"] as const;

type Props = {
  params: Promise<{ id: string; format: string }>;
};

export async function GET(_req: Request, { params }: Props) {
  const { id, format } = await params;
  const session = await requireSession();

  if (!FORMATS.includes(format as (typeof FORMATS)[number])) {
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  }

  const project = await prisma.project.findFirst({
    where: { id, ownerId: session.user.id },
    select: {
      id: true,
      name: true,
      description: true,
      stack: true,
      canvas: true,
      language: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const canvas = project.canvas as Canvas;
  const projectData = {
    name: project.name,
    description: project.description,
    stack: project.stack as Record<string, unknown> | null,
    canvas,
    language: project.language,
  };

  let content: string;
  let contentType: string;
  let filename: string;

  switch (format) {
    case "claude-md":
      content = generateClaudeMd(projectData);
      contentType = "text/markdown";
      filename = "CLAUDE.md";
      break;
    case "prompt":
      content = generatePromptMaster(projectData);
      contentType = "text/plain";
      filename = "prompt.txt";
      break;
    case "prd":
      content = generatePrd(projectData);
      contentType = "text/markdown";
      filename = "PRD.md";
      break;
    case "sql":
      content = generateSqlSchema(canvas);
      contentType = "application/sql";
      filename = "schema.sql";
      break;
    default:
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  }

  // Save export record and snapshot
  await prisma.$transaction([
    prisma.export.create({
      data: {
        projectId: project.id,
        format,
        content,
      },
    }),
    prisma.canvasSnapshot.create({
      data: {
        projectId: project.id,
        canvas,
        reason: "export",
        label: `Export to ${format} – ${new Date().toISOString().split("T")[0]}`,
      },
    }),
  ]);

  return new NextResponse(content, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

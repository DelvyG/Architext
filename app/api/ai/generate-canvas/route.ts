import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { generateObject } from "ai";
import { prisma } from "@/lib/db/client";
import { requireSession } from "@/lib/auth/session";
import { getAIClient, NoActiveApiKeyError } from "@/lib/ai/client";
import { GenerateCanvasResponseSchema } from "@/lib/ai/schemas";
import { buildGenerateCanvasPrompt } from "@/lib/ai/prompts/generate-canvas";
import { checkRateLimit } from "@/lib/ai/rate-limit";

const BodySchema = z.object({
  projectId: z.string().min(1),
  prompt: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = BodySchema.parse(await req.json());

    const { allowed, retryAfter } = checkRateLimit(session.user.id);
    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    const project = await prisma.project.findFirst({
      where: { id: body.projectId, ownerId: session.user.id },
      select: { id: true, language: true, templateSlug: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { client, model } = await getAIClient(session.user.id);
    const messages = buildGenerateCanvasPrompt({
      userPrompt: body.prompt,
      language: project.language,
      templateName: project.templateSlug ?? undefined,
    });

    let result;
    try {
      result = await generateObject({
        model: client(model),
        messages,
        schema: GenerateCanvasResponseSchema,
      });
    } catch (firstError) {
      // Retry once with error context
      try {
        const errorContext =
          firstError instanceof Error ? firstError.message : "Unknown validation error";
        const retryMessages = [
          ...messages,
          {
            role: "user" as const,
            content: `The previous response failed validation: ${errorContext}. Please fix and try again.`,
          },
        ];
        result = await generateObject({
          model: client(model),
          messages: retryMessages,
          schema: GenerateCanvasResponseSchema,
        });
      } catch {
        return NextResponse.json({ error: "AI generation failed after retry" }, { status: 422 });
      }
    }

    const canvas = { nodes: result.object.nodes, edges: result.object.edges };

    await prisma.$transaction([
      prisma.project.update({
        where: { id: project.id },
        data: {
          canvas,
          stack: result.object.stack,
          initialPrompt: body.prompt,
        },
      }),
      prisma.chatMessage.create({
        data: {
          projectId: project.id,
          role: "user",
          content: body.prompt,
        },
      }),
      prisma.chatMessage.create({
        data: {
          projectId: project.id,
          role: "assistant",
          content: result.object.reasoning,
        },
      }),
    ]);

    return NextResponse.json(canvas);
  } catch (err) {
    if (err instanceof NoActiveApiKeyError) {
      return NextResponse.json({ error: "No active API key" }, { status: 400 });
    }
    console.error("Generate canvas error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { streamText, type ModelMessage } from "ai";
import { prisma } from "@/lib/db/client";
import { requireSession } from "@/lib/auth/session";
import { getAIClient, NoActiveApiKeyError } from "@/lib/ai/client";
import { buildAssistantPrompt } from "@/lib/ai/prompts/canvas-assistant";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import type { Canvas } from "@/lib/blocks/schemas";

const BodySchema = z.object({
  projectId: z.string().min(1),
  message: z.string().min(1),
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
      select: { id: true, language: true, canvas: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.chatMessage.create({
      data: {
        projectId: project.id,
        role: "user",
        content: body.message,
      },
    });

    const recentMessages = await prisma.chatMessage.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: { role: true, content: true },
    });

    const history: ModelMessage[] = recentMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(0, -1)
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const { client, model } = await getAIClient(session.user.id);
    const { system, messages } = buildAssistantPrompt({
      canvas: project.canvas as Canvas,
      userMessage: body.message,
      language: project.language,
      history,
    });

    const result = streamText({
      model: client(model),
      system,
      messages,
      async onFinish({ text }) {
        await prisma.chatMessage.create({
          data: {
            projectId: project.id,
            role: "assistant",
            content: text,
          },
        });
      },
    });

    return result.toTextStreamResponse();
  } catch (err) {
    if (err instanceof NoActiveApiKeyError) {
      return NextResponse.json({ error: "No active API key" }, { status: 400 });
    }
    console.error("Chat error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

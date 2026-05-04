import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { generateText } from "ai";
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

function extractJson(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match?.[1]) return match[1].trim();
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch?.[0]) return braceMatch[0];
  return text;
}

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
    const { system, messages } = buildGenerateCanvasPrompt({
      userPrompt: body.prompt,
      language: project.language,
      templateName: project.templateSlug ?? undefined,
    });

    const jsonInstructions = `\n\nIMPORTANT: Respond ONLY with a JSON object wrapped in a \`\`\`json code fence. Structure:
{
  "stack": { "frontend": "...", "backend": "...", "db": "...", "hosting": "...", "integrations": ["..."] },
  "nodes": [
    { "id": "short-id", "type": "DataModel", "position": {"x": 100, "y": 100}, "data": { "blockType": "DataModel", ...fields } }
  ],
  "edges": [
    { "id": "e1", "source": "node-id", "target": "node-id", "type": "uses" }
  ],
  "reasoning": "Why I chose this architecture..."
}

Block data by blockType:
- DataModel: { blockType, name, description?, fields: [{name, type, required, unique?, default?}], relations: [{target, type: "one-to-one"|"one-to-many"|"many-to-many"}] }
- Endpoint: { blockType, method: GET|POST|PUT|PATCH|DELETE, path, description?, auth: none|required|role-based, consumedByViews: [] }
- View: { blockType, name, route?, description?, consumesEndpoints: [] }
- Integration: { blockType, service, purpose, usedIn: [], secretsNeeded: [] }
- UserFlow: { blockType, name, steps: [{actor, action, target?}] }
- Auth: { blockType, method: email-password|oauth|magic-link|api-key, roles: [], protects: [] }
- Job: { blockType, name, trigger: cron|webhook|event, frequency?, action }
- Note: { blockType, content }`;

    const { text } = await generateText({
      model: client(model),
      system: system + jsonInstructions,
      messages,
    });

    const jsonStr = extractJson(text);
    let parsed;
    try {
      parsed = GenerateCanvasResponseSchema.parse(JSON.parse(jsonStr));
    } catch (parseError) {
      console.error("First parse failed, retrying...", parseError);
      const { text: retryText } = await generateText({
        model: client(model),
        system: system + jsonInstructions,
        messages: [
          ...messages,
          { role: "assistant" as const, content: text },
          {
            role: "user" as const,
            content: `Your JSON was invalid. Fix it and return ONLY valid JSON.`,
          },
        ],
      });
      const retryJson = extractJson(retryText);
      try {
        parsed = GenerateCanvasResponseSchema.parse(JSON.parse(retryJson));
      } catch {
        return NextResponse.json({ error: "AI generation failed after retry" }, { status: 422 });
      }
    }

    const canvas = { nodes: parsed.nodes, edges: parsed.edges };

    await prisma.$transaction([
      prisma.project.update({
        where: { id: project.id },
        data: {
          canvas,
          stack: parsed.stack,
          initialPrompt: body.prompt,
        },
      }),
      prisma.chatMessage.create({
        data: { projectId: project.id, role: "user", content: body.prompt },
      }),
      prisma.chatMessage.create({
        data: { projectId: project.id, role: "assistant", content: parsed.reasoning },
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

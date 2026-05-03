"use server";

import { z } from "zod/v4";
import { prisma } from "@/lib/db/client";
import { requireSession } from "@/lib/auth/session";
import { encryptKey, decryptKey } from "@/lib/crypto/api-keys";
import { PROVIDER_IDS } from "@/lib/ai/providers";
import { generateText } from "ai";
import { getAIClient } from "@/lib/ai/client";

const AddApiKeySchema = z.object({
  provider: z.enum(PROVIDER_IDS as [string, ...string[]]),
  label: z.string().max(100).optional(),
  secret: z.string().min(1),
});

export async function addApiKey(raw: unknown) {
  const input = AddApiKeySchema.parse(raw);
  const session = await requireSession();

  const { encrypted, iv } = encryptKey(input.secret);

  const existingCount = await prisma.apiKey.count({
    where: { userId: session.user.id },
  });

  await prisma.apiKey.create({
    data: {
      userId: session.user.id,
      provider: input.provider,
      label: input.label || null,
      encrypted,
      iv,
      isActive: existingCount === 0,
    },
  });
}

export async function setActiveApiKey(id: string) {
  const session = await requireSession();

  const key = await prisma.apiKey.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!key) throw new Error("Key not found");

  await prisma.$transaction([
    prisma.apiKey.updateMany({
      where: { userId: session.user.id },
      data: { isActive: false },
    }),
    prisma.apiKey.update({
      where: { id },
      data: { isActive: true },
    }),
  ]);
}

export async function deleteApiKey(id: string) {
  const session = await requireSession();
  await prisma.apiKey.delete({
    where: { id, userId: session.user.id },
  });
}

export async function renameApiKey(id: string, label: string) {
  const session = await requireSession();
  await prisma.apiKey.update({
    where: { id, userId: session.user.id },
    data: { label },
  });
}

export async function testApiKeyConnection(): Promise<{ success: boolean; error?: string }> {
  const session = await requireSession();

  try {
    const { client, model } = await getAIClient(session.user.id);
    await generateText({
      model: client(model),
      prompt: "Respond with the word OK",
      maxOutputTokens: 5,
    });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

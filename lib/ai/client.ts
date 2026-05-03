import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { prisma } from "@/lib/db/client";
import { decryptKey } from "@/lib/crypto/api-keys";
import type { ProviderId } from "./providers";

export class NoActiveApiKeyError extends Error {
  constructor() {
    super("No active API key configured");
    this.name = "NoActiveApiKeyError";
  }
}

export async function getAIClient(userId: string) {
  const apiKey = await prisma.apiKey.findFirst({
    where: { userId, isActive: true },
  });

  if (!apiKey) {
    throw new NoActiveApiKeyError();
  }

  const secret = apiKey.provider === "ollama" ? "" : decryptKey(apiKey.encrypted, apiKey.iv);
  const provider = apiKey.provider as ProviderId;

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  switch (provider) {
    case "anthropic":
      return {
        provider,
        model: "claude-sonnet-4-6",
        client: createAnthropic({ apiKey: secret }),
      };
    case "openai":
      return {
        provider,
        model: "gpt-4o",
        client: createOpenAI({ apiKey: secret }),
      };
    case "google":
      return {
        provider,
        model: "gemini-2.5-flash",
        client: createGoogleGenerativeAI({ apiKey: secret }),
      };
    case "openrouter":
      return {
        provider,
        model: "anthropic/claude-sonnet-4-6",
        client: createOpenAI({
          apiKey: secret,
          baseURL: "https://openrouter.ai/api/v1",
        }),
      };
    case "ollama":
      return {
        provider,
        model: "llama3.3",
        client: createOpenAI({
          apiKey: "ollama",
          baseURL: secret || "http://localhost:11434/v1",
        }),
      };
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

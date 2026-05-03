import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/client";
import { requireSession } from "@/lib/auth/session";
import { maskKey, decryptKey } from "@/lib/crypto/api-keys";
import { ApiKeysManager } from "./api-keys-manager";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ApiKeysPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireSession();

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      provider: true,
      label: true,
      isActive: true,
      encrypted: true,
      iv: true,
      createdAt: true,
      lastUsedAt: true,
    },
  });

  const maskedKeys = keys.map((key) => {
    let masked = "****";
    try {
      const plain = decryptKey(key.encrypted, key.iv);
      masked = maskKey(plain);
    } catch {
      // key may be corrupted
    }
    return {
      id: key.id,
      provider: key.provider,
      label: key.label,
      isActive: key.isActive,
      maskedKey: masked,
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt,
    };
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <ApiKeysManager keys={maskedKeys} />
    </div>
  );
}

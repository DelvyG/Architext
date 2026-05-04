"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth/client";
import { Key } from "lucide-react";

type Props = {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
  hasApiKey: boolean;
};

export function DashboardHeader({ user, hasApiKey }: Props) {
  const t = useTranslations();
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = (user.name ?? user.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/projects" className="text-lg font-bold">
          Architext
        </Link>
        <div className="flex items-center gap-2">
          {!hasApiKey && (
            <Link href="/settings/api-keys">
              <Button variant="outline" size="sm" className="text-amber-600 border-amber-300">
                <Key className="mr-1.5 h-3.5 w-3.5" />
                Set up AI key
              </Button>
            </Link>
          )}
          <Link href="/settings/api-keys">
            <Button variant="ghost" size="sm">
              <Key className="mr-1.5 h-3.5 w-3.5" />
              API Keys
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {initials}
              </span>
              <span className="hidden sm:inline">{user.name ?? user.email}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                {t("dashboard.header.settings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>{t("auth.signOut")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

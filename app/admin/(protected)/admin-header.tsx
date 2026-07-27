"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { LayoutDashboard, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  user: {
    name?: string | null;
    email: string;
  };
};

export function AdminHeader({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Users", icon: LayoutDashboard },
    { href: "/admin/profile", label: "Profile", icon: User },
  ];

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="text-lg font-bold">
            Architext <span className="text-xs font-normal text-muted-foreground">Admin</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(pathname === item.href && "bg-muted")}
                >
                  <item.icon className="mr-1.5 h-3.5 w-3.5" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user.name ?? user.email}</span>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}

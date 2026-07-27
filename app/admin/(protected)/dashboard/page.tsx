import { prisma } from "@/lib/db/client";
import { UserTable } from "./user-table";

export default async function AdminDashboardPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      role: true,
      createdAt: true,
      projects: {
        select: {
          id: true,
          name: true,
          templateSlug: true,
          language: true,
          shareToken: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              messages: true,
              snapshots: true,
              shares: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      },
      apiKeys: {
        select: {
          id: true,
          provider: true,
          label: true,
          isActive: true,
          lastUsedAt: true,
        },
      },
      sharesSent: {
        select: {
          id: true,
          toEmail: true,
          status: true,
          project: { select: { name: true } },
        },
      },
      sessions: {
        select: { id: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const serialized = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    emailVerified: u.emailVerified,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    lastLogin: u.sessions[0]?.createdAt.toISOString() ?? null,
    projects: u.projects.map((p) => ({
      id: p.id,
      name: p.name,
      templateSlug: p.templateSlug,
      language: p.language,
      shared: !!p.shareToken,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      messages: p._count.messages,
      snapshots: p._count.snapshots,
      shares: p._count.shares,
    })),
    apiKeys: u.apiKeys.map((k) => ({
      provider: k.provider,
      label: k.label,
      isActive: k.isActive,
      lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
    })),
    sharesSent: u.sharesSent.map((s) => ({
      toEmail: s.toEmail,
      status: s.status,
      projectName: s.project.name,
    })),
  }));

  const totalProjects = serialized.reduce((sum, u) => sum + u.projects.length, 0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Users</h2>
        <p className="text-sm text-muted-foreground">
          {users.length} user{users.length !== 1 ? "s" : ""} &middot; {totalProjects} project
          {totalProjects !== 1 ? "s" : ""} total
        </p>
      </div>
      <UserTable users={serialized} />
    </div>
  );
}

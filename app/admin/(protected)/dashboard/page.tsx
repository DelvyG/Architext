import { prisma } from "@/lib/db/client";
import { UserTable } from "./user-table";

async function getMetrics() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    usersToday,
    usersThisWeek,
    usersThisMonth,
    totalProjects,
    projectsThisWeek,
    totalMessages,
    messagesThisWeek,
    apiKeysByProvider,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.project.count(),
    prisma.project.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.chatMessage.count(),
    prisma.chatMessage.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.apiKey.groupBy({
      by: ["provider"],
      where: { isActive: true },
      _count: true,
    }),
  ]);

  return {
    totalUsers,
    usersToday,
    usersThisWeek,
    usersThisMonth,
    totalProjects,
    projectsThisWeek,
    totalMessages,
    messagesThisWeek,
    providerStats: apiKeysByProvider.map((p) => ({
      provider: p.provider,
      count: p._count,
    })),
  };
}

function MetricCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value.toLocaleString()}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [metrics, users] = await Promise.all([
    getMetrics(),
    prisma.user.findMany({
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
    }),
  ]);

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

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
      </div>

      {/* Metrics Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard
          label="Total Users"
          value={metrics.totalUsers}
          sub={`+${metrics.usersToday} today · +${metrics.usersThisWeek} this week`}
        />
        <MetricCard
          label="Total Projects"
          value={metrics.totalProjects}
          sub={`+${metrics.projectsThisWeek} this week`}
        />
        <MetricCard
          label="Prompts Sent"
          value={metrics.totalMessages}
          sub={`+${metrics.messagesThisWeek} this week`}
        />
        <MetricCard
          label="Users (30 days)"
          value={metrics.usersThisMonth}
          sub="New registrations"
        />
      </div>

      {/* AI Providers */}
      {metrics.providerStats.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Active API Keys by Provider
          </h3>
          <div className="flex flex-wrap gap-3">
            {metrics.providerStats
              .sort((a, b) => b.count - a.count)
              .map((p) => (
                <div key={p.provider} className="rounded-md border bg-card px-3 py-2 text-sm">
                  <span className="font-medium capitalize">{p.provider}</span>
                  <span className="ml-2 text-muted-foreground">{p.count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Users</h3>
        <p className="text-sm text-muted-foreground">{users.length} total</p>
      </div>
      <UserTable users={serialized} />
    </div>
  );
}

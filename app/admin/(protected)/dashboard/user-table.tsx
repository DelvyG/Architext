"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Pencil,
  Trash2,
  Shield,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Key,
  Share2,
  MessageSquare,
  Camera,
  Globe,
  Clock,
} from "lucide-react";
import { EditUserDialog } from "./edit-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";

type Project = {
  id: string;
  name: string;
  templateSlug: string | null;
  language: string;
  shared: boolean;
  createdAt: string;
  updatedAt: string;
  messages: number;
  snapshots: number;
  shares: number;
};

type ApiKey = {
  provider: string;
  label: string | null;
  isActive: boolean;
  lastUsedAt: string | null;
};

type ShareSent = {
  toEmail: string;
  status: string;
  projectName: string;
};

export type User = {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  role: string;
  createdAt: string;
  lastLogin: string | null;
  projects: Project[];
  apiKeys: ApiKey[];
  sharesSent: ShareSent[];
};

type Props = {
  users: User[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function UserDetail({ user }: { user: User }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
      {/* Projects */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Projects ({user.projects.length})</h4>
        </div>
        {user.projects.length === 0 ? (
          <p className="text-xs text-muted-foreground">No projects yet.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {user.projects.map((p) => (
              <div key={p.id} className="rounded-md border p-2.5 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{p.name}</span>
                  {p.shared && (
                    <span className="ml-1 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">
                      shared
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
                  {p.templateSlug && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {p.templateSlug}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {p.messages} msgs
                  </span>
                  <span className="flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    {p.snapshots} snaps
                  </span>
                  {p.shares > 0 && (
                    <span className="flex items-center gap-1">
                      <Share2 className="h-3 w-3" />
                      {p.shares} shares
                    </span>
                  )}
                </div>
                <div className="text-muted-foreground">
                  <Clock className="inline h-3 w-3 mr-1" />
                  Updated {timeAgo(p.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* API Keys */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Key className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">API Keys ({user.apiKeys.length})</h4>
        </div>
        {user.apiKeys.length === 0 ? (
          <p className="text-xs text-muted-foreground">No API keys configured.</p>
        ) : (
          <div className="space-y-2">
            {user.apiKeys.map((k, i) => (
              <div
                key={i}
                className="rounded-md border p-2.5 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-medium capitalize">{k.provider}</span>
                  {k.label && <span className="ml-1.5 text-muted-foreground">({k.label})</span>}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    k.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {k.isActive ? "active" : "inactive"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Shares Sent */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Share2 className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Shares Sent ({user.sharesSent.length})</h4>
        </div>
        {user.sharesSent.length === 0 ? (
          <p className="text-xs text-muted-foreground">No shares sent.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {user.sharesSent.map((s, i) => (
              <div key={i} className="rounded-md border p-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{s.projectName}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      s.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : s.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                <p className="text-muted-foreground mt-0.5">To: {s.toEmail}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export function UserTable({ users }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  return (
    <>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-8 px-2 py-3" />
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-center font-medium">Verified</th>
                <th className="px-4 py-3 text-center font-medium">Role</th>
                <th className="px-4 py-3 text-center font-medium">Projects</th>
                <th className="px-4 py-3 text-left font-medium">Last Login</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <>
                  <tr
                    key={user.id}
                    className="border-b hover:bg-muted/30 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                  >
                    <td className="px-2 py-3 text-center text-muted-foreground">
                      {expandedId === user.id ? (
                        <ChevronDown className="h-4 w-4 mx-auto" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{user.name ?? "-"}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${
                          user.emailVerified ? "bg-green-500" : "bg-amber-500"
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          <ShieldCheck className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {user.projects.length}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.lastLogin ? timeAgo(user.lastLogin) : "Never"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon-sm" onClick={() => setEditUser(user)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteUser(user)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === user.id && (
                    <tr key={`${user.id}-detail`} className="border-b bg-muted/10">
                      <td colSpan={9}>
                        <UserDetail user={user} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editUser && (
        <EditUserDialog user={editUser} open={!!editUser} onClose={() => setEditUser(null)} />
      )}

      {deleteUser && (
        <DeleteUserDialog
          user={deleteUser}
          open={!!deleteUser}
          onClose={() => setDeleteUser(null)}
        />
      )}
    </>
  );
}

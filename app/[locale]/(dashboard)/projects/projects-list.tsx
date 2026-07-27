"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MoreVertical, Plus, Copy, Share2, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  deleteProject,
  renameProject,
  duplicateProject,
  shareProject,
  acceptShare,
  rejectShare,
} from "../actions";

type Project = {
  id: string;
  name: string;
  description: string | null;
  updatedAt: Date;
};

type PendingShare = {
  id: string;
  createdAt: Date;
  project: { name: string; description: string | null; language: string };
  fromUser: { name: string | null; email: string };
};

type Props = {
  projects: Project[];
  pendingShares: PendingShare[];
};

export function ProjectsList({ projects, pendingShares }: Props) {
  const t = useTranslations("dashboard.projects");
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const [shareId, setShareId] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    await deleteProject(deleteId);
    setDeleteId(null);
    router.refresh();
  }

  async function handleRename() {
    if (!renameId || !renameName.trim()) return;
    await renameProject(renameId, renameName.trim());
    setRenameId(null);
    setRenameName("");
    router.refresh();
  }

  async function handleDuplicate() {
    if (!duplicateId) return;
    try {
      await duplicateProject(duplicateId, duplicateName.trim() || undefined);
      setDuplicateId(null);
      setDuplicateName("");
      router.refresh();
    } catch (err) {
      if (err instanceof Error && err.message === "PROJECT_LIMIT_REACHED") {
        setDuplicateId(null);
        toast.error(t("limitReached"));
      }
    }
  }

  async function handleShare() {
    if (!shareId || !shareEmail.trim()) return;
    setShareLoading(true);
    try {
      await shareProject({ projectId: shareId, email: shareEmail.trim() });
      setShareSuccess(true);
      setTimeout(() => {
        setShareId(null);
        setShareEmail("");
        setShareSuccess(false);
      }, 1500);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "CANNOT_SHARE_WITH_SELF") {
          toast.error(t("shareDialog.errorSelf"));
        } else if (err.message === "ALREADY_SHARED") {
          toast.error(t("shareDialog.errorAlready"));
        } else {
          toast.error(t("shareDialog.errorGeneric"));
        }
      }
    } finally {
      setShareLoading(false);
    }
  }

  async function handleAcceptShare(id: string) {
    try {
      await acceptShare(id);
      router.refresh();
    } catch (err) {
      if (err instanceof Error && err.message === "PROJECT_LIMIT_REACHED") {
        toast.error(t("pendingShares.limitReached"));
      }
    }
  }

  async function handleRejectShare(id: string) {
    await rejectShare(id);
    router.refresh();
  }

  return (
    <>
      {/* Pending shares */}
      {pendingShares.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            {t("pendingShares.title")}
          </h2>
          <div className="space-y-2">
            {pendingShares.map((share) => (
              <div
                key={share.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{share.project.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("pendingShares.from", {
                      name: share.fromUser.name || share.fromUser.email,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5"
                    onClick={() => handleAcceptShare(share.id)}
                  >
                    <Check className="h-3.5 w-3.5" />
                    {t("pendingShares.accept")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5 text-muted-foreground"
                    onClick={() => handleRejectShare(share.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                    {t("pendingShares.reject")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("newProject")}
          </Button>
        </Link>
      </div>

      {projects.length === 0 && pendingShares.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg font-medium text-muted-foreground">{t("empty")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("emptyDescription")}</p>
        </div>
      ) : projects.length === 0 ? null : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="group relative">
              <Link href={`/projects/${project.id}`} className="absolute inset-0 z-0" />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-base">{project.name}</CardTitle>
                    {project.description && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {project.description}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="relative z-10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-muted">
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setRenameId(project.id);
                          setRenameName(project.name);
                        }}
                      >
                        {t("rename")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDuplicateId(project.id);
                          setDuplicateName(`${project.name} (copy)`);
                        }}
                      >
                        <Copy className="mr-2 h-3.5 w-3.5" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setShareId(project.id);
                          setShareEmail("");
                          setShareSuccess(false);
                        }}
                      >
                        <Share2 className="mr-2 h-3.5 w-3.5" />
                        {t("share")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(project.id)}
                      >
                        {t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("updated", { date: project.updatedAt.toLocaleDateString() })}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteConfirm")}</DialogTitle>
            <DialogDescription>{t("deleteDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={!!renameId} onOpenChange={() => setRenameId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rename")}</DialogTitle>
          </DialogHeader>
          <Input value={renameName} onChange={(e) => setRenameName(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameId(null)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleRename}>{t("rename")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate dialog */}
      <Dialog open={!!duplicateId} onOpenChange={() => setDuplicateId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate project</DialogTitle>
          </DialogHeader>
          <Input
            value={duplicateName}
            onChange={(e) => setDuplicateName(e.target.value)}
            placeholder="Name for the copy"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateId(null)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleDuplicate}>Duplicate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share dialog */}
      <Dialog
        open={!!shareId}
        onOpenChange={() => {
          setShareId(null);
          setShareEmail("");
          setShareSuccess(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("shareDialog.title")}</DialogTitle>
            <DialogDescription>{t("shareDialog.description")}</DialogDescription>
          </DialogHeader>
          <Input
            type="email"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            placeholder={t("shareDialog.emailPlaceholder")}
            onKeyDown={(e) => e.key === "Enter" && handleShare()}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShareId(null);
                setShareEmail("");
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleShare}
              disabled={shareLoading || shareSuccess || !shareEmail.trim()}
            >
              {shareSuccess
                ? t("shareDialog.success")
                : shareLoading
                  ? t("shareDialog.sending")
                  : t("shareDialog.send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

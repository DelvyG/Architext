"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
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
import { MoreVertical, Plus } from "lucide-react";
import { deleteProject, renameProject } from "../actions";

type Project = {
  id: string;
  name: string;
  description: string | null;
  updatedAt: Date;
};

type Props = {
  projects: Project[];
};

export function ProjectsList({ projects }: Props) {
  const t = useTranslations("dashboard.projects");
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");

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

  return (
    <>
      <div className="mt-4 flex justify-end">
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("newProject")}
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg font-medium text-muted-foreground">{t("empty")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("emptyDescription")}</p>
        </div>
      ) : (
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
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Save, X, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  getStack,
  saveStack,
  suggestStack,
  type StackConfig,
} from "@/app/[locale]/(project)/projects/[id]/stack-actions";

type Props = {
  projectId: string;
  open: boolean;
  onClose: () => void;
};

const STACK_FIELDS: { key: keyof StackConfig; label: string; placeholder: string }[] = [
  { key: "frontend", label: "Frontend", placeholder: "Next.js 15, React 19..." },
  { key: "backend", label: "Backend", placeholder: "Next.js API Routes, Express..." },
  { key: "database", label: "Database", placeholder: "PostgreSQL 16, MongoDB..." },
  { key: "orm", label: "ORM / DB Client", placeholder: "Prisma, Drizzle, Mongoose..." },
  { key: "auth", label: "Authentication", placeholder: "better-auth, NextAuth, Clerk..." },
  { key: "hosting", label: "Hosting", placeholder: "Vercel, Railway, AWS..." },
  { key: "styling", label: "Styling / UI", placeholder: "Tailwind CSS, shadcn/ui..." },
  { key: "testing", label: "Testing", placeholder: "Vitest, Playwright, Jest..." },
  { key: "cicd", label: "CI/CD", placeholder: "GitHub Actions, GitLab CI..." },
  { key: "monitoring", label: "Monitoring", placeholder: "Sentry, Datadog, LogRocket..." },
];

export function StackPanel({ projectId, open, onClose }: Props) {
  const [stack, setStack] = useState<StackConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [reasoning, setReasoning] = useState("");
  const [newIntegration, setNewIntegration] = useState("");

  useEffect(() => {
    if (open && !stack) {
      getStack(projectId).then(setStack);
    }
  }, [open, projectId, stack]);

  async function handleSave() {
    if (!stack) return;
    setLoading(true);
    await saveStack(projectId, stack);
    setLoading(false);
    toast.success("Stack saved");
  }

  async function handleSuggest() {
    setSuggesting(true);
    setReasoning("");
    try {
      const result = await suggestStack(projectId);
      setStack(result.stack);
      setReasoning(result.reasoning);
      toast.success("Stack suggested by AI");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to suggest stack");
    } finally {
      setSuggesting(false);
    }
  }

  function updateField(key: keyof StackConfig, value: string) {
    if (!stack) return;
    setStack({ ...stack, [key]: value });
  }

  function addIntegration() {
    if (!stack || !newIntegration.trim()) return;
    setStack({ ...stack, integrations: [...stack.integrations, newIntegration.trim()] });
    setNewIntegration("");
  }

  function removeIntegration(index: number) {
    if (!stack) return;
    setStack({ ...stack, integrations: stack.integrations.filter((_, i) => i !== index) });
  }

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Tech Stack
            <Button variant="outline" size="sm" onClick={handleSuggest} disabled={suggesting}>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              {suggesting ? "Thinking..." : "Suggest with AI"}
            </Button>
          </DialogTitle>
        </DialogHeader>

        {reasoning && (
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
            <p className="font-medium mb-1">AI reasoning:</p>
            <p>{reasoning}</p>
          </div>
        )}

        {stack && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {STACK_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs">{field.label}</Label>
                  <Input
                    value={String(stack[field.key] ?? "")}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs">Integrations & External Services</Label>
              <div className="flex flex-wrap gap-2">
                {stack.integrations.map((int, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"
                  >
                    {int}
                    <button onClick={() => removeIntegration(i)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newIntegration}
                  onChange={(e) => setNewIntegration(e.target.value)}
                  placeholder="Stripe, SendGrid, S3..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIntegration())}
                />
                <Button variant="outline" size="sm" onClick={addIntegration}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Notes</Label>
              <textarea
                value={stack.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Any additional context about tech choices..."
                rows={2}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {loading ? "Saving..." : "Save stack"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

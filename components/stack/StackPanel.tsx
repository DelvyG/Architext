"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const OTHER = "__other__";

type FieldDef = {
  key: keyof StackConfig;
  label: string;
  options: string[];
  placeholder: string;
};

const STACK_FIELDS: FieldDef[] = [
  {
    key: "frontend",
    label: "Frontend",
    placeholder: "Custom framework...",
    options: [
      "Next.js 15 (App Router)",
      "Next.js 15 (Pages Router)",
      "React + Vite",
      "Vue 3 + Nuxt",
      "Svelte + SvelteKit",
      "Angular 18",
      "Astro",
      "Remix",
      "React Native",
      "Flutter",
    ],
  },
  {
    key: "backend",
    label: "Backend",
    placeholder: "Custom backend...",
    options: [
      "Next.js API Routes",
      "Express.js",
      "Fastify",
      "NestJS",
      "Hono",
      "Django",
      "FastAPI",
      "Laravel",
      "Ruby on Rails",
      "Spring Boot",
      "Go + Gin",
      "Rust + Axum",
      "Serverless (AWS Lambda)",
      "Supabase Edge Functions",
    ],
  },
  {
    key: "database",
    label: "Database",
    placeholder: "Custom database...",
    options: [
      "PostgreSQL 16",
      "MySQL 8",
      "SQLite",
      "MongoDB",
      "Redis",
      "Supabase (PostgreSQL)",
      "PlanetScale (MySQL)",
      "Neon (PostgreSQL)",
      "Turso (SQLite)",
      "DynamoDB",
      "Firebase Firestore",
    ],
  },
  {
    key: "orm",
    label: "ORM / DB Client",
    placeholder: "Custom ORM...",
    options: [
      "Prisma",
      "Drizzle",
      "TypeORM",
      "Sequelize",
      "Mongoose",
      "Kysely",
      "Knex.js",
      "SQLAlchemy",
      "None (raw SQL)",
    ],
  },
  {
    key: "auth",
    label: "Authentication",
    placeholder: "Custom auth...",
    options: [
      "better-auth",
      "NextAuth / Auth.js",
      "Clerk",
      "Supabase Auth",
      "Firebase Auth",
      "Lucia",
      "Passport.js",
      "Auth0",
      "Kinde",
      "Custom JWT",
    ],
  },
  {
    key: "hosting",
    label: "Hosting / Deploy",
    placeholder: "Custom hosting...",
    options: [
      "Vercel",
      "Netlify",
      "Railway",
      "Render",
      "Fly.io",
      "AWS (EC2/ECS)",
      "Google Cloud Run",
      "Azure App Service",
      "DigitalOcean App Platform",
      "Docker self-hosted",
      "Coolify",
      "Hetzner + Docker",
    ],
  },
  {
    key: "styling",
    label: "Styling / UI",
    placeholder: "Custom styling...",
    options: [
      "Tailwind CSS + shadcn/ui",
      "Tailwind CSS",
      "CSS Modules",
      "Styled Components",
      "Chakra UI",
      "Material UI (MUI)",
      "Ant Design",
      "Mantine",
      "Radix UI + custom CSS",
      "Bootstrap",
    ],
  },
  {
    key: "testing",
    label: "Testing",
    placeholder: "Custom testing...",
    options: [
      "Vitest + Playwright",
      "Jest + React Testing Library",
      "Vitest",
      "Cypress",
      "Playwright",
      "Jest",
      "pytest",
      "None",
    ],
  },
  {
    key: "cicd",
    label: "CI/CD",
    placeholder: "Custom CI/CD...",
    options: [
      "GitHub Actions",
      "GitLab CI",
      "Vercel (auto deploy)",
      "CircleCI",
      "Jenkins",
      "Bitbucket Pipelines",
      "None",
    ],
  },
  {
    key: "monitoring",
    label: "Monitoring / Observability",
    placeholder: "Custom monitoring...",
    options: [
      "Sentry",
      "Sentry + Vercel Analytics",
      "Datadog",
      "LogRocket",
      "New Relic",
      "Grafana + Prometheus",
      "PostHog",
      "Better Stack (Uptime)",
      "None",
    ],
  },
];

function StackSelect({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (val: string) => void;
}) {
  const isCustom = value !== "" && !field.options.includes(value);
  const [showCustom, setShowCustom] = useState(isCustom);

  if (showCustom) {
    return (
      <div className="flex gap-1.5">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="flex-1"
        />
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-xs"
          onClick={() => {
            setShowCustom(false);
            onChange("");
          }}
        >
          List
        </Button>
      </div>
    );
  }

  return (
    <Select
      value={value || undefined}
      onValueChange={(v) => {
        if (v === OTHER) {
          setShowCustom(true);
          onChange("");
        } else if (v) {
          onChange(v);
        }
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
      </SelectTrigger>
      <SelectContent>
        {field.options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
        <SelectItem value={OTHER}>Other (custom)...</SelectItem>
      </SelectContent>
    </Select>
  );
}

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
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-lg">Tech Stack Configuration</span>
            <Button variant="outline" size="sm" onClick={handleSuggest} disabled={suggesting}>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              {suggesting ? "Analyzing project..." : "Suggest with AI"}
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
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {STACK_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs font-medium">{field.label}</Label>
                  <StackSelect
                    field={field}
                    value={String(stack[field.key] ?? "")}
                    onChange={(v) => updateField(field.key, v)}
                  />
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-xs font-medium">Integrations & External Services</Label>
              <div className="flex flex-wrap gap-2">
                {stack.integrations.map((int, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs"
                  >
                    {int}
                    <button onClick={() => removeIntegration(i)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {stack.integrations.length === 0 && (
                  <span className="text-xs text-muted-foreground">No integrations added</span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newIntegration}
                  onChange={(e) => setNewIntegration(e.target.value)}
                  placeholder="Add integration: Stripe, SendGrid, S3, Twilio..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIntegration())}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addIntegration}
                  disabled={!newIntegration.trim()}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Additional Notes</Label>
              <textarea
                value={stack.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Justifications, constraints, preferences..."
                rows={3}
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

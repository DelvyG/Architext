"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { createProject } from "../../actions";

const TEMPLATES = [
  { slug: "blank", enabled: true },
  { slug: "saas-b2b", enabled: false },
  { slug: "ecommerce", enabled: false },
  { slug: "internal-dashboard", enabled: false },
  { slug: "mobile-with-backend", enabled: false },
  { slug: "ai-tool", enabled: false },
] as const;

export function NewProjectForm() {
  const t = useTranslations("dashboard.newProject");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState("blank");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || undefined;
    const language = formData.get("language") as string;

    const result = await createProject({
      name,
      description,
      language,
      templateSlug: template === "blank" ? undefined : template,
    });

    if (result?.id) {
      router.push(`/projects/${result.id}`);
    } else {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" name="name" required placeholder={t("namePlaceholder")} autoFocus />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Input id="description" name="description" placeholder={t("descriptionPlaceholder")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">{t("language")}</Label>
            <select
              id="language"
              name="language"
              defaultValue="en"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
            <p className="text-xs text-muted-foreground">{t("languageHint")}</p>
          </div>

          <div className="space-y-2">
            <Label>{t("template")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((tmpl) => {
                const btn = (
                  <button
                    key={tmpl.slug}
                    type="button"
                    disabled={!tmpl.enabled}
                    onClick={() => tmpl.enabled && setTemplate(tmpl.slug)}
                    className={`rounded-md border p-3 text-left text-sm transition-colors ${
                      template === tmpl.slug
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    } ${!tmpl.enabled ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    {tmpl.slug === "blank" ? t("templateBlank") : tmpl.slug}
                  </button>
                );

                if (!tmpl.enabled) {
                  return (
                    <Tooltip key={tmpl.slug}>
                      <TooltipTrigger render={<div />}>{btn}</TooltipTrigger>
                      <TooltipContent>{t("templateComingSoon")}</TooltipContent>
                    </Tooltip>
                  );
                }

                return btn;
              })}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("creating") : t("create")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

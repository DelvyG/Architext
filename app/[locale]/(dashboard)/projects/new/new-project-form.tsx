"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProject } from "../../actions";

const TEMPLATES = [
  { slug: "blank", label: "Blank project" },
  { slug: "saas-b2b", label: "B2B SaaS" },
  { slug: "ecommerce", label: "E-commerce" },
  { slug: "internal-dashboard", label: "Internal Dashboard" },
  { slug: "mobile-with-backend", label: "Mobile + Backend" },
  { slug: "ai-tool", label: "AI Tool" },
];

export function NewProjectForm() {
  const t = useTranslations("dashboard.newProject");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState("blank");
  const [language, setLanguage] = useState("en");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || undefined;

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
            <Label>{t("language")}</Label>
            <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t("languageHint")}</p>
          </div>

          <div className="space-y-2">
            <Label>{t("template")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.slug}
                  type="button"
                  onClick={() => setTemplate(tmpl.slug)}
                  className={`rounded-md border p-3 text-left text-sm transition-colors ${
                    template === tmpl.slug
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {tmpl.label}
                </button>
              ))}
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

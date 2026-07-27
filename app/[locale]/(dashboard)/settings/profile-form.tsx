"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";

type Props = {
  name: string;
  email: string;
};

export function ProfileForm({ name: initialName, email }: Props) {
  const t = useTranslations("dashboard.settings.profileForm");
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setLoading(true);
    const { error } = await authClient.updateUser({ name: name.trim() });
    setLoading(false);
    if (error) {
      toast.error(t("errorSave"));
    } else {
      toast.success(t("saved"));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="profile-name">{t("name")}</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("email")}</Label>
          <Input value={email} disabled className="text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{t("emailHint")}</p>
        </div>
        <Button onClick={handleSave} disabled={loading || name.trim() === initialName}>
          {loading ? t("saving") : t("save")}
        </Button>
      </CardContent>
    </Card>
  );
}

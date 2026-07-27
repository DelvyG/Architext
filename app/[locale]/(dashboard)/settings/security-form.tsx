"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";

type Props = {
  email: string;
};

export function SecurityForm({ email }: Props) {
  const t = useTranslations("dashboard.settings.securityForm");
  const router = useRouter();

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Email
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) return;
    setPasswordLoading(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setPasswordLoading(false);
    if (error) {
      toast.error(t("passwordError"));
    } else {
      toast.success(t("passwordSuccess"));
      setCurrentPassword("");
      setNewPassword("");
    }
  }

  async function handleChangeEmail() {
    if (!newEmail.trim()) return;
    setEmailLoading(true);
    const { error } = await authClient.changeEmail({
      newEmail: newEmail.trim(),
      callbackURL: "/settings",
    });
    setEmailLoading(false);
    if (error) {
      toast.error(t("emailError"));
    } else {
      setEmailSent(true);
      toast.success(t("emailSuccess"));
    }
  }

  return (
    <div className="space-y-6">
      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("passwordTitle")}</CardTitle>
          <CardDescription>{t("passwordDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">{t("currentPassword")}</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">{t("newPassword")}</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">{t("passwordHint")}</p>
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={passwordLoading || !currentPassword || !newPassword || newPassword.length < 8}
          >
            {passwordLoading ? t("saving") : t("changePassword")}
          </Button>
        </CardContent>
      </Card>

      {/* Change email */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("emailTitle")}</CardTitle>
          <CardDescription>{t("emailDescription", { email })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailSent ? (
            <p className="text-sm text-muted-foreground">{t("emailSentMessage")}</p>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="new-email">{t("newEmail")}</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={t("newEmailPlaceholder")}
                />
              </div>
              <Button
                onClick={handleChangeEmail}
                disabled={
                  emailLoading ||
                  !newEmail.trim() ||
                  newEmail.trim().toLowerCase() === email.toLowerCase()
                }
              >
                {emailLoading ? t("saving") : t("changeEmail")}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

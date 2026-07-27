"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth/client";
import { updateAdminProfile } from "../../actions";
import { toast } from "sonner";

type Props = {
  name: string;
  email: string;
};

export function AdminProfileForm({ name: initialName, email }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [nameLoading, setNameLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function handleSaveName() {
    if (!name.trim()) return;
    setNameLoading(true);
    const result = await updateAdminProfile({ name: name.trim() });
    setNameLoading(false);

    if ("error" in result) {
      toast.error("Failed to update profile.");
    } else {
      toast.success("Profile updated.");
      router.refresh();
    }
  }

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
      toast.error("Failed to change password. Check your current password.");
    } else {
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Information</CardTitle>
          <CardDescription>Update your admin profile details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-name">Name</Label>
            <Input
              id="admin-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} disabled className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Email cannot be changed from here.</p>
          </div>
          <Button onClick={handleSaveName} disabled={nameLoading || name.trim() === initialName}>
            {nameLoading ? "Saving..." : "Save"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change Password</CardTitle>
          <CardDescription>Update your admin account password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-current-pw">Current Password</Label>
            <Input
              id="admin-current-pw"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-new-pw">New Password</Label>
            <Input
              id="admin-new-pw"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={passwordLoading || !currentPassword || !newPassword || newPassword.length < 8}
          >
            {passwordLoading ? "Changing..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

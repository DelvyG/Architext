"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateUser } from "../../actions";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  role: string;
};

type Props = {
  user: User;
  open: boolean;
  onClose: () => void;
};

export function EditUserDialog({ user, open, onClose }: Props) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email);
  const [emailVerified, setEmailVerified] = useState(user.emailVerified);
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const result = await updateUser({
      id: user.id,
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      emailVerified,
      role: role as "user" | "admin",
    });

    setLoading(false);

    if ("error" in result) {
      toast.error(result.error as string);
    } else {
      toast.success("User updated successfully.");
      router.refresh();
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user details for {user.email}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="User name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="edit-verified" className="cursor-pointer">
              Email Verified
            </Label>
            <button
              id="edit-verified"
              type="button"
              role="switch"
              aria-checked={emailVerified}
              onClick={() => setEmailVerified(!emailVerified)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                emailVerified ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  emailVerified ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={role === "user" ? "default" : "outline"}
                size="sm"
                onClick={() => setRole("user")}
              >
                User
              </Button>
              <Button
                type="button"
                variant={role === "admin" ? "default" : "outline"}
                size="sm"
                onClick={() => setRole("admin")}
              >
                Admin
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

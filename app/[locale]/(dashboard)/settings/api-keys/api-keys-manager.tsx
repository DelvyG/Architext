"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { PROVIDERS, type ProviderId, PROVIDER_IDS } from "@/lib/ai/providers";
import {
  addApiKey,
  setActiveApiKey,
  deleteApiKey,
  renameApiKey,
  testApiKeyConnection,
} from "./actions";
import { Check, Key, Plus, Trash2, Zap } from "lucide-react";

type MaskedKey = {
  id: string;
  provider: string;
  label: string | null;
  isActive: boolean;
  maskedKey: string;
  createdAt: Date;
  lastUsedAt: Date | null;
};

type Props = {
  keys: MaskedKey[];
};

export function ApiKeysManager({ keys }: Props) {
  const t = useTranslations("dashboard.settings");
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [newProvider, setNewProvider] = useState<ProviderId>("anthropic");
  const [newLabel, setNewLabel] = useState("");
  const [newSecret, setNewSecret] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setLoading(true);
    await addApiKey({ provider: newProvider, label: newLabel || undefined, secret: newSecret });
    setShowAdd(false);
    setNewProvider("anthropic");
    setNewLabel("");
    setNewSecret("");
    setLoading(false);
    router.refresh();
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    const result = await testApiKeyConnection();
    setTestResult(result);
    setTesting(false);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("apiKeys")}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTest} disabled={testing || keys.length === 0}>
            <Zap className="mr-2 h-4 w-4" />
            {testing ? "Testing..." : "Test connection"}
          </Button>
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add API key
          </Button>
        </div>
      </div>

      {testResult && (
        <div
          className={`mt-4 rounded-md p-3 text-sm ${testResult.success ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200" : "bg-destructive/10 text-destructive"}`}
        >
          {testResult.success ? "Connection successful!" : `Error: ${testResult.error}`}
        </div>
      )}

      {keys.length === 0 ? (
        <div className="mt-16 text-center">
          <Key className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No API keys configured yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your AI provider key to start generating architecture
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {keys.map((key) => (
            <Card key={key.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {key.isActive && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <Check className="h-3 w-3 text-green-700 dark:text-green-300" />
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {PROVIDERS[key.provider as ProviderId]?.label ?? key.provider}
                      {key.label && ` — ${key.label}`}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">{key.maskedKey}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!key.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await setActiveApiKey(key.id);
                        router.refresh();
                      }}
                    >
                      Activate
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      await deleteApiKey(key.id);
                      router.refresh();
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add API key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <select
                value={newProvider}
                onChange={(e) => setNewProvider(e.target.value as ProviderId)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                {PROVIDER_IDS.map((id) => (
                  <option key={id} value={id}>
                    {PROVIDERS[id].label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Label (optional)</Label>
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="My key"
              />
            </div>
            <div className="space-y-2">
              <Label>{PROVIDERS[newProvider].needsKey ? "API Key" : "Base URL"}</Label>
              <Input
                type={PROVIDERS[newProvider].needsKey ? "password" : "text"}
                value={newSecret}
                onChange={(e) => setNewSecret(e.target.value)}
                placeholder={
                  PROVIDERS[newProvider].needsKey
                    ? PROVIDERS[newProvider].keyPlaceholder
                    : "http://localhost:11434"
                }
              />
              <p className="text-xs text-muted-foreground">
                <a
                  href={PROVIDERS[newProvider].docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Get your key here
                </a>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={loading || !newSecret}>
              {loading ? "Adding..." : "Add key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

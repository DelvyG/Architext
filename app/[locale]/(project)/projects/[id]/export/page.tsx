"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Copy, Check } from "lucide-react";

const FORMATS = [
  { key: "claude-md", label: "CLAUDE.md", filename: "CLAUDE.md" },
  { key: "prompt", label: "Prompt", filename: "prompt.txt" },
  { key: "prd", label: "PRD", filename: "PRD.md" },
  { key: "sql", label: "SQL Schema", filename: "schema.sql" },
] as const;

export default function ExportPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function loadFormat(format: string) {
    if (content[format]) return;
    setLoading(format);
    try {
      const res = await fetch(`/api/projects/${projectId}/export/${format}`);
      if (res.ok) {
        const text = await res.text();
        setContent((prev) => ({ ...prev, [format]: text }));
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleCopy(format: string) {
    const text = content[format];
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleDownload(format: string) {
    const text = content[format];
    if (!text) return;
    const fmt = FORMATS.find((f) => f.key === format);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fmt?.filename ?? "export.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-12 shrink-0 items-center gap-4 border-b px-4">
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to editor
        </Link>
        <span className="text-sm text-muted-foreground">/</span>
        <h1 className="text-sm font-medium">Export</h1>
      </header>
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <Tabs defaultValue="claude-md" onValueChange={(v) => loadFormat(v)}>
          <TabsList>
            {FORMATS.map((fmt) => (
              <TabsTrigger key={fmt.key} value={fmt.key}>
                {fmt.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {FORMATS.map((fmt) => (
            <TabsContent key={fmt.key} value={fmt.key} className="mt-4">
              <div className="mb-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(fmt.key)}
                  disabled={!content[fmt.key]}
                >
                  <Download className="mr-1 h-3 w-3" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(fmt.key)}
                  disabled={!content[fmt.key]}
                >
                  {copied === fmt.key ? (
                    <Check className="mr-1 h-3 w-3" />
                  ) : (
                    <Copy className="mr-1 h-3 w-3" />
                  )}
                  {copied === fmt.key ? "Copied" : "Copy"}
                </Button>
              </div>
              {loading === fmt.key ? (
                <div className="rounded-md border bg-muted p-4 text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : content[fmt.key] ? (
                <pre className="max-h-[600px] overflow-auto rounded-md border bg-muted p-4 text-sm">
                  {content[fmt.key]}
                </pre>
              ) : (
                <div className="rounded-md border bg-muted p-4 text-sm text-muted-foreground">
                  Click this tab to generate the export preview
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

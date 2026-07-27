"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useCanvasStore } from "@/lib/stores/canvas-store";
import type { CanvasNode, CanvasEdge, BlockType, ConnectionType } from "@/lib/blocks/schemas";
import { Send, AlertTriangle, Loader2, Paperclip, X, FileText, Wand2, Check } from "lucide-react";
import { toast } from "sonner";

type Props = {
  projectId: string;
  initialMessages: { role: string; content: string }[];
};

const PROMPT_WARN_CHARS = 4000;
const ACCEPTED_FILE_TYPES = ".pdf,.md,.txt";

type CanvasCommand =
  | {
      op: "addNode";
      type: string;
      id: string;
      position: { x: number; y: number };
      data: Record<string, unknown>;
    }
  | { op: "updateNode"; id: string; data: Record<string, unknown> }
  | { op: "deleteNode"; id: string }
  | { op: "addEdge"; source: string; target: string; edgeType: string }
  | { op: "deleteEdge"; id: string };

function extractCanvasCommands(text: string): CanvasCommand[] | null {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (!match?.[1]) return null;

  try {
    const parsed = JSON.parse(match[1].trim());
    if (parsed.canvasCommands && Array.isArray(parsed.canvasCommands)) {
      return parsed.canvasCommands;
    }
  } catch {
    // Not valid JSON or not canvas commands
  }
  return null;
}

function getMessageDisplayText(text: string): string {
  // Remove the JSON block from display, show only the explanation
  return text.replace(/```(?:json)?\s*\{[\s\S]*?"canvasCommands"[\s\S]*?\}[\s\S]*?```/g, "").trim();
}

function GeneratingIndicator({ elapsed }: { elapsed: number }) {
  const t = useTranslations("project.chat");

  const phase =
    elapsed < 5
      ? t("generatingAnalyzing")
      : elapsed < 15
        ? t("generatingDesigning")
        : elapsed < 30
          ? t("generatingBuilding")
          : t("generatingAlmost");

  return (
    <div className="mb-3 text-left">
      <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>{phase}</span>
      </div>
    </div>
  );
}

export function ChatPanel({ projectId, initialMessages }: Props) {
  const t = useTranslations("project.chat");
  const nodes = useCanvasStore((s) => s.nodes);
  const loadCanvas = useCanvasStore((s) => s.loadCanvas);
  const addNode = useCanvasStore((s) => s.addNode);
  const updateNode = useCanvasStore((s) => s.updateNode);
  const deleteNode = useCanvasStore((s) => s.deleteNode);
  const addEdge = useCanvasStore((s) => s.addEdge);
  const deleteEdge = useCanvasStore((s) => s.deleteEdge);
  const [inputValue, setInputValue] = useState("");
  const [generating, setGenerating] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [attachedFile, setAttachedFile] = useState<{ name: string; text: string } | null>(null);
  const [parsingFile, setParsingFile] = useState(false);
  const [appliedCommandIds, setAppliedCommandIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEmpty = nodes.length === 0;

  const transport = useMemo(
    () => new TextStreamChatTransport({ api: "/api/ai/chat", body: { projectId } }),
    [projectId],
  );

  const { messages, sendMessage, status } = useChat({
    id: `chat-${projectId}`,
    transport,
    messages: initialMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m, i) => ({
        id: String(i),
        role: m.role as "user" | "assistant",
        parts: [{ type: "text" as const, text: m.content }],
      })),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!generating) return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [generating]);

  const applyCommands = useCallback(
    (commands: CanvasCommand[], msgId: string) => {
      let added = 0;
      let updated = 0;
      let deleted = 0;
      const idMap = new Map<string, string>();

      for (const cmd of commands) {
        switch (cmd.op) {
          case "addNode": {
            const storeNodes = useCanvasStore.getState().nodes;
            addNode(cmd.type as BlockType, cmd.position);
            const newNodes = useCanvasStore.getState().nodes;
            const newNode = newNodes.find((n) => !storeNodes.some((o) => o.id === n.id));
            if (newNode) {
              idMap.set(cmd.id, newNode.id);
              updateNode(newNode.id, cmd.data as never);
            }
            added++;
            break;
          }
          case "updateNode": {
            const realId = idMap.get(cmd.id) || cmd.id;
            updateNode(realId, cmd.data as never);
            updated++;
            break;
          }
          case "deleteNode": {
            deleteNode(cmd.id);
            deleted++;
            break;
          }
          case "addEdge": {
            const realSource = idMap.get(cmd.source) || cmd.source;
            const realTarget = idMap.get(cmd.target) || cmd.target;
            addEdge(realSource, realTarget, cmd.edgeType as ConnectionType);
            added++;
            break;
          }
          case "deleteEdge": {
            deleteEdge(cmd.id);
            deleted++;
            break;
          }
        }
      }

      setAppliedCommandIds((prev) => new Set([...prev, msgId]));

      const parts: string[] = [];
      if (added > 0) parts.push(`${added} added`);
      if (updated > 0) parts.push(`${updated} updated`);
      if (deleted > 0) parts.push(`${deleted} removed`);
      toast.success(`Canvas updated: ${parts.join(", ")}`);
    },
    [addNode, updateNode, deleteNode, addEdge, deleteEdge],
  );

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/ai/parse-file", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || t("errorGeneric"));
        return;
      }

      const { text } = await res.json();
      setAttachedFile({ name: file.name, text });
    } catch {
      alert(t("errorGeneric"));
    } finally {
      setParsingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function getFullPrompt(): string {
    const parts: string[] = [];
    if (attachedFile) {
      parts.push(
        `--- Document: ${attachedFile.name} ---\n${attachedFile.text}\n--- End of document ---`,
      );
    }
    if (inputValue.trim()) {
      parts.push(inputValue.trim());
    }
    return parts.join("\n\n");
  }

  async function handleGenerateCanvas(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const prompt = getFullPrompt();
    if (!prompt) return;

    setElapsedSeconds(0);
    setGenerating(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 110_000);

      const res = await fetch("/api/ai/generate-canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, prompt }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || t("errorGeneric"));
        return;
      }

      const canvas = await res.json();
      loadCanvas(
        projectId,
        (canvas.nodes ?? []) as CanvasNode[],
        (canvas.edges ?? []) as CanvasEdge[],
      );
      setInputValue("");
      setAttachedFile(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        alert(t("errorTimeout"));
      } else {
        alert(t("errorGeneric"));
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleChatSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const prompt = getFullPrompt();
    if (!prompt) return;

    setInputValue("");
    setAttachedFile(null);
    sendMessage({ text: prompt });
  }

  const onSubmit = isEmpty ? handleGenerateCanvas : handleChatSubmit;

  function getMessageText(msg: (typeof messages)[number]): string {
    return (
      msg.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("") ?? ""
    );
  }

  const totalChars = (attachedFile?.text.length ?? 0) + inputValue.length;
  const showLengthWarning = isEmpty && totalChars > PROMPT_WARN_CHARS;
  const hasContent = inputValue.trim() || attachedFile;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && isEmpty && (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-xs text-center">
              <p className="text-sm font-medium">{t("describeProject")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("describeExample")}</p>
              <p className="mt-3 text-xs text-muted-foreground">{t("fileHint")}</p>
            </div>
          </div>
        )}
        {messages.map((msg) => {
          const rawText = getMessageText(msg);
          const commands = msg.role === "assistant" ? extractCanvasCommands(rawText) : null;
          const displayText = commands ? getMessageDisplayText(rawText) : rawText;
          const isApplied = appliedCommandIds.has(msg.id);

          return (
            <div
              key={msg.id}
              className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}
            >
              <div
                className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {displayText}
              </div>
              {commands && commands.length > 0 && (
                <div className="mt-1.5">
                  {isApplied ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
                      <Check className="h-3 w-3" />
                      {t("changesApplied")}
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1.5 text-xs"
                      onClick={() => applyCommands(commands, msg.id)}
                    >
                      <Wand2 className="h-3 w-3" />
                      {t("applyChanges", { count: commands.length })}
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {generating && <GeneratingIndicator elapsed={elapsedSeconds} />}
        {status === "streaming" && !generating && (
          <div className="mb-3 text-left">
            <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{t("streaming")}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={onSubmit} className="border-t p-3">
        {attachedFile && (
          <div className="mb-2 flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate text-xs">{attachedFile.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {attachedFile.text.length.toLocaleString()} chars
            </span>
            <button
              type="button"
              onClick={() => setAttachedFile(null)}
              className="shrink-0 rounded p-0.5 hover:bg-muted"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        )}
        {parsingFile && (
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>{t("parsingFile")}</span>
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex flex-1 flex-col">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (hasContent) {
                    e.currentTarget.form?.requestSubmit();
                  }
                }
              }}
              placeholder={
                attachedFile
                  ? t("placeholderWithFile")
                  : isEmpty
                    ? t("placeholderEmpty")
                    : t("placeholderChat")
              }
              disabled={generating}
              rows={3}
              className="flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col justify-end gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={generating || parsingFile}
              onClick={() => fileInputRef.current?.click()}
              title={t("attachFile")}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              size="icon"
              disabled={!hasContent || generating || status === "streaming" || parsingFile}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{t("enterToSend")}</p>
          {showLengthWarning && (
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <AlertTriangle className="h-3 w-3" />
              <span>{t("errorTooLong", { chars: totalChars.toLocaleString() })}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

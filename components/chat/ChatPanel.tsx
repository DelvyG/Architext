"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useCanvasStore } from "@/lib/stores/canvas-store";
import type { CanvasNode, CanvasEdge } from "@/lib/blocks/schemas";
import { Send, AlertTriangle, Loader2 } from "lucide-react";

type Props = {
  projectId: string;
  initialMessages: { role: string; content: string }[];
};

const PROMPT_WARN_CHARS = 4000;

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
  const [inputValue, setInputValue] = useState("");
  const [generating, setGenerating] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  async function handleGenerateCanvas(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setElapsedSeconds(0);
    setGenerating(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 110_000);

      const res = await fetch("/api/ai/generate-canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, prompt: inputValue }),
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
    if (!inputValue.trim()) return;

    const text = inputValue;
    setInputValue("");
    sendMessage({ text });
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

  const showLengthWarning = isEmpty && inputValue.length > PROMPT_WARN_CHARS;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && isEmpty && (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-xs text-center">
              <p className="text-sm font-medium">{t("describeProject")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("describeExample")}</p>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}>
            <div
              className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {getMessageText(msg)}
            </div>
          </div>
        ))}
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
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (inputValue.trim()) {
                  e.currentTarget.form?.requestSubmit();
                }
              }
            }}
            placeholder={isEmpty ? t("placeholderEmpty") : t("placeholderChat")}
            disabled={generating}
            rows={3}
            className="flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
          />
          <Button
            type="submit"
            size="icon"
            className="mt-auto"
            disabled={!inputValue.trim() || generating || status === "streaming"}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{t("enterToSend")}</p>
          {showLengthWarning && (
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <AlertTriangle className="h-3 w-3" />
              <span>{t("errorTooLong", { chars: inputValue.length.toLocaleString() })}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCanvasStore } from "@/lib/stores/canvas-store";
import type { CanvasNode, CanvasEdge } from "@/lib/blocks/schemas";
import { Send } from "lucide-react";

type Props = {
  projectId: string;
  initialMessages: { role: string; content: string }[];
};

export function ChatPanel({ projectId, initialMessages }: Props) {
  const nodes = useCanvasStore((s) => s.nodes);
  const loadCanvas = useCanvasStore((s) => s.loadCanvas);
  const [inputValue, setInputValue] = useState("");
  const [generating, setGenerating] = useState(false);
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

  async function handleGenerateCanvas(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, prompt: inputValue }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to generate");
        return;
      }

      const canvas = await res.json();
      loadCanvas(
        projectId,
        (canvas.nodes ?? []) as CanvasNode[],
        (canvas.edges ?? []) as CanvasEdge[],
      );
      setInputValue("");
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

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && isEmpty && (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-xs text-center">
              <p className="text-sm font-medium">Describe your project</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Example: &quot;A SaaS for barbershop appointment management with WhatsApp and
                payments&quot;
              </p>
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
        {(status === "streaming" || generating) && (
          <div className="mb-3 text-left">
            <div className="inline-block rounded-lg bg-muted px-3 py-2 text-sm">
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={onSubmit} className="flex gap-2 border-t p-3">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isEmpty ? "Describe your project..." : "Ask about your architecture..."}
          disabled={generating}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!inputValue.trim() || generating || status === "streaming"}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

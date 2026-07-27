import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "text/markdown",
  "text/plain",
  "text/x-markdown",
]);
const ALLOWED_EXTENSIONS = new Set([".pdf", ".md", ".txt"]);

export async function POST(req: Request) {
  try {
    await requireSession();

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_TYPES.has(file.type) && !ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "Only PDF, Markdown, and text files are supported" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text: string;

    if (ext === ".pdf") {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const result = await parser.getText();
      text = result.text;
    } else {
      text = buffer.toString("utf-8");
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    return NextResponse.json({ text: trimmed, chars: trimmed.length });
  } catch {
    return NextResponse.json({ error: "Failed to parse file" }, { status: 500 });
  }
}

#!/usr/bin/env node

/**
 * Architext CLI — Pull architecture exports from an Architext instance
 *
 * Usage:
 *   npx architext-cli pull <token> [options]
 *
 * Options:
 *   --format    Export format: claude-md (default), prompt, prd, sql, canvas
 *   --server    Architext server URL (default: http://localhost:3000)
 *   --output    Output file path (default: auto based on format)
 *
 * Examples:
 *   npx architext-cli pull abc123def456
 *   npx architext-cli pull abc123def456 --format sql --output schema.sql
 *   npx architext-cli pull abc123def456 --server https://my-architext.com
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const FORMATS = {
  "claude-md": "CLAUDE.md",
  prompt: "ARCHITEXT_PROMPT.txt",
  prd: "PRD.md",
  sql: "schema.sql",
  canvas: "canvas.json",
};

function printHelp() {
  console.log(`
  \x1b[1mArchitext CLI\x1b[0m — Pull architecture from Architext into your project

  \x1b[36mUsage:\x1b[0m
    npx architext-cli pull <share-token> [options]

  \x1b[36mOptions:\x1b[0m
    --format <format>   claude-md (default), prompt, prd, sql, canvas
    --server <url>      Server URL (default: http://localhost:3000)
    --output <path>     Output file (default: auto)
    --help              Show this help

  \x1b[36mExamples:\x1b[0m
    npx architext-cli pull abc123xyz
    npx architext-cli pull abc123xyz --format sql
    npx architext-cli pull abc123xyz --format claude-md --output CLAUDE.md
    npx architext-cli pull abc123xyz --server https://architext.example.com

  \x1b[36mHow to get a share token:\x1b[0m
    In Architext, open a project → click "Share" in the header → copy the token.
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.length === 0) {
    printHelp();
    process.exit(0);
  }

  const command = args[0];
  if (command !== "pull") {
    console.error(`Unknown command: ${command}. Use "pull".`);
    process.exit(1);
  }

  const token = args[1];
  if (!token || token.startsWith("--")) {
    console.error("Missing share token. Usage: architext-cli pull <token>");
    process.exit(1);
  }

  // Parse options
  let format = "claude-md";
  let server = "http://localhost:3000";
  let output = "";

  for (let i = 2; i < args.length; i++) {
    if (args[i] === "--format" && args[i + 1]) {
      format = args[++i];
    } else if (args[i] === "--server" && args[i + 1]) {
      server = args[++i];
    } else if (args[i] === "--output" && args[i + 1]) {
      output = args[++i];
    }
  }

  if (!FORMATS[format]) {
    console.error(`Invalid format: ${format}. Use: ${Object.keys(FORMATS).join(", ")}`);
    process.exit(1);
  }

  const url = `${server}/api/share/${token}/${format}`;
  console.log(`\x1b[36m→\x1b[0m Fetching ${format} from ${server}...`);

  try {
    const res = await fetch(url);

    if (!res.ok) {
      const body = await res.text();
      try {
        const json = JSON.parse(body);
        console.error(`\x1b[31m✗\x1b[0m Error: ${json.error || res.statusText}`);
      } catch {
        console.error(`\x1b[31m✗\x1b[0m Error: ${res.statusText}`);
      }
      process.exit(1);
    }

    const content = await res.text();
    const outFile = output || FORMATS[format];
    const outPath = resolve(process.cwd(), outFile);

    writeFileSync(outPath, content, "utf-8");
    console.log(`\x1b[32m✓\x1b[0m Saved to ${outFile}`);
    console.log(`  ${content.split("\n").length} lines, ${content.length} bytes`);
  } catch (err) {
    console.error(`\x1b[31m✗\x1b[0m Could not connect to ${server}`);
    console.error(`  Make sure Architext is running at ${server}`);
    process.exit(1);
  }
}

main();

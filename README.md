# Architext

Design your software architecture visually before coding with AI.

Architext is an open-source tool where you describe your project in natural language, an AI proposes an initial architecture (data models, endpoints, views, security, cache, integrations...), you edit it visually on an interactive canvas, and export an instruction package ready for any AI coding assistant (Claude Code, Cursor, Copilot, etc.).

**The product does NOT generate code.** It generates the blueprint that code generators need to not go off the rails.

## Features

- **AI-powered architecture generation** — Describe your project, get a complete architecture
- **14 block types** — DataModel (ER-style), Endpoint, View, Auth, Integration, Security, Cache, Queue, Storage, SEO, Job, UserFlow, Note, Group
- **Visual canvas** — React Flow with drag & drop, connections, multi-select, right-click menu
- **BYOK (Bring Your Own Key)** — Use your own AI provider: Anthropic, OpenAI, Google, OpenRouter, or Ollama
- **Export to 4 formats** — CLAUDE.md, prompt for any AI, PRD markdown, SQL schema
- **CLI integration** — Pull architecture directly into your VS Code project with one command
- **5 starter templates** — B2B SaaS, E-commerce, Internal Dashboard, Mobile + Backend, AI Tool
- **Snapshots** — Save and restore canvas versions
- **i18n** — English and Spanish

## Installation

### Prerequisites

- **Node.js** 22+
- **pnpm** (`npm install -g pnpm`)
- **PostgreSQL** 16+ (installed locally or via Docker)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/DelvyG/Architext.git
cd Architext

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
```

Edit `.env` with your values:

```bash
# PostgreSQL connection (change to your local PostgreSQL)
DATABASE_URL="postgresql://postgres@localhost:5432/architext"

# Generate these with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
AUTH_SECRET="paste-generated-value-here"
ENCRYPTION_KEY="paste-generated-value-here"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

```bash
# 4. Create the database
# If using psql:
createdb -U postgres architext

# 5. Push the schema
npx prisma db push

# 6. Start the development server
pnpm dev
```

Open **http://localhost:3000** in your browser.

### First steps

1. **Create an account** — Click "Get started" on the homepage
2. **Add your AI key** — Click "API Keys" in the header → Add your Anthropic/OpenAI/Google key
3. **Create a project** — Choose a template or start blank
4. **Describe your project** — In the chat panel, describe what you want to build
5. **Edit the architecture** — Drag blocks, edit properties, add connections
6. **Export** — Click Export to get your CLAUDE.md, prompt, PRD, or SQL schema

## CLI — Pull architecture into your project

After designing your architecture in Architext, you can pull it directly into your coding project:

```bash
# In your project's terminal (VS Code, etc.):
npx architext-cli pull YOUR_SHARE_TOKEN
```

This creates a `CLAUDE.md` file in your project root with the full architecture. Open Claude Code or Cursor and it will understand your entire project structure.

### How to get a share token

1. Open a project in Architext
2. Click **Share** in the header
3. Copy the command shown

### Other formats

```bash
npx architext-cli pull TOKEN --format claude-md   # CLAUDE.md (default)
npx architext-cli pull TOKEN --format prompt       # Prompt for any AI
npx architext-cli pull TOKEN --format prd          # PRD document
npx architext-cli pull TOKEN --format sql          # PostgreSQL schema
npx architext-cli pull TOKEN --format canvas       # Raw canvas JSON
```

## Environment variables

| Variable              | Required | Description                                   |
| --------------------- | -------- | --------------------------------------------- |
| `DATABASE_URL`        | Yes      | PostgreSQL connection string                  |
| `AUTH_SECRET`         | Yes      | Session signing secret                        |
| `ENCRYPTION_KEY`      | Yes      | AES-256-GCM key for API key encryption        |
| `NEXT_PUBLIC_APP_URL` | Yes      | Public URL (default: `http://localhost:3000`) |
| `BETTER_AUTH_SECRET`  | Yes      | Same as AUTH_SECRET                           |
| `BETTER_AUTH_URL`     | Yes      | Same as NEXT_PUBLIC_APP_URL                   |

## Tech stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Framework  | Next.js 16 (App Router) + TypeScript |
| UI         | Tailwind CSS 4 + shadcn/ui           |
| Canvas     | React Flow 12                        |
| State      | Zustand                              |
| Database   | PostgreSQL + Prisma 6                |
| Auth       | better-auth                          |
| AI         | Vercel AI SDK 6 (multi-provider)     |
| Validation | Zod 4                                |
| i18n       | next-intl (en/es)                    |

## BYOK — Bring Your Own Key

Architext does not use any AI API keys. Each user configures their own provider:

- **Anthropic** (Claude) — `sk-ant-...`
- **OpenAI** (GPT-4o) — `sk-...`
- **Google** (Gemini) — `AI...`
- **OpenRouter** — `sk-or-...`
- **Ollama** (local, no key needed)

Keys are encrypted with AES-256-GCM before storing in the database.

## License

[AGPL-3.0](LICENSE) — Free to use, modify, and self-host. If you offer it as a public service, you must publish your modifications.

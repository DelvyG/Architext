# Architext

Design your software architecture visually before coding with AI.

Architext is an open-source tool where you describe your project in natural language, an AI proposes an initial architecture (stack, data models, endpoints, flows, security), you edit it as connected blocks on a visual canvas, and export an instruction package (CLAUDE.md, prompts, SQL schema, diagrams) ready for any coding assistant.

## Self-hosting

### Prerequisites

- Docker and Docker Compose
- Or: Node.js 22+, pnpm, PostgreSQL 16+

### Quick start with Docker

```bash
git clone https://github.com/your-org/architext.git
cd architext
cp .env.example .env

# Generate secrets
# Linux/Mac:
# openssl rand -base64 32  (paste into AUTH_SECRET)
# openssl rand -base64 32  (paste into ENCRYPTION_KEY)

docker compose up
```

The app will be available at `http://localhost:3000`.

### Local development

```bash
pnpm install
cp .env.example .env
# Edit .env with your database URL and secrets

npx prisma migrate dev --name init
pnpm dev
```

## Environment variables

| Variable              | Required    | Description                                                                    |
| --------------------- | ----------- | ------------------------------------------------------------------------------ |
| `DATABASE_URL`        | Yes         | PostgreSQL connection string                                                   |
| `AUTH_SECRET`         | Yes         | Secret for session signing (`openssl rand -base64 32`)                         |
| `ENCRYPTION_KEY`      | Yes         | 32-byte key for AES-256-GCM encryption of API keys (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | Yes         | Public URL of the app (default: `http://localhost:3000`)                       |
| `POSTGRES_PASSWORD`   | Docker only | Password for the Docker PostgreSQL instance                                    |

## Tech stack

- **Framework:** Next.js (App Router) + TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **Canvas:** React Flow
- **Database:** PostgreSQL + Prisma
- **Auth:** better-auth
- **AI:** Vercel AI SDK (BYOK — Bring Your Own Key)
- **i18n:** next-intl (en/es)

## License

[AGPL-3.0](LICENSE)

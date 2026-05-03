# Arquitectura Técnica — Blueprint

Este documento contiene todas las decisiones técnicas del MVP, justificadas. Cualquier desviación debe sustentarse aquí antes de implementarse.

## 1. Principios rectores

1. **Self-hosting trivial.** Un `docker compose up` debe levantar el sistema completo. Cero dependencias de SaaS externos para funciones core.
2. **Multi-tenant-ready desde el día 1.** Aunque el MVP es individual, todas las tablas que tienen sentido tienen `organizationId` (nullable). Activarlo más adelante = un flag, no una migración masiva.
3. **BYOK obligatorio.** No se almacena ninguna API key del operador. Cada usuario configura la suya, encriptada en DB.
4. **JSON-first para el canvas.** Toda la estructura de bloques y conexiones vive en una columna JSONB validada con Zod. No se normaliza por bloque — eso simplifica enormemente y permite versionado barato.
5. **Server Components por defecto, Client sólo donde haga falta.** El canvas y el chat son `"use client"`; el resto es server.

## 2. Stack completo

### Frontend

- **Next.js 15** con App Router y Server Actions.
- **TypeScript** estricto (`strict: true`, `noUncheckedIndexedAccess: true`).
- **Tailwind CSS** + **shadcn/ui** para componentes base.
- **React Flow (xyflow)** v12+ para el canvas. Razón: estándar de facto, MIT, extensible con nodos custom, soporta zoom/pan/minimap nativos.
- **Zustand** para estado del canvas en cliente (más simple que Redux y más explícito que Context).
- **next-intl** para i18n (es/en).

### Backend

- Mismo monorepo Next.js. **API Routes** + **Server Actions**.
- **Prisma** como ORM.
- **PostgreSQL 16+** como única DB.
- **better-auth** para autenticación (sesiones en DB, sin servicios externos, soporta email/password + OAuth).
- **Zod** para todos los schemas (validación de request, validación de bloques, validación de respuestas estructuradas de la IA).

### IA

- **Vercel AI SDK** (`ai` + providers oficiales: `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google`, `@ai-sdk/openai-compatible` para OpenRouter, Ollama, etc.).
- Razones: abstrae multi-provider, streaming nativo, `generateObject` con Zod schemas (clave para outputs estructurados), tool calling unificado.

### Infraestructura / DevX

- **Docker Compose** con tres servicios: `app`, `postgres`, `migrate` (job one-shot).
- **Husky + lint-staged** para pre-commit.
- **ESLint + Prettier** con configs estándar.
- **Playwright** para e2e mínimos (login, crear proyecto, generar canvas, exportar).
- **Vitest** para unit tests del lib (generadores de export sobre todo).

### Licencia

**AGPL-3.0**. Razones:

- Permite uso, modificación y self-hosting libres.
- **Obliga** a publicar modificaciones si se ofrece como servicio público (red).
- Bloquea el patrón "alguien hace fork, monta SaaS cerrado, no contribuye" — que es el riesgo principal de proyectos como este.
- Si en el futuro quieres ofrecer una versión cloud, mantienes ventaja al ser el único actor con derecho a relicenciar.

## 3. Estructura de carpetas

```
blueprint/
├── app/
│   ├── [locale]/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── projects/page.tsx
│   │   │   ├── projects/new/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── settings/api-keys/page.tsx
│   │   ├── (project)/
│   │   │   └── projects/[id]/
│   │   │       ├── page.tsx          # editor principal (chat + canvas + inspector)
│   │   │       └── export/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/[...all]/route.ts    # better-auth handler
│   │   ├── ai/chat/route.ts          # streaming chat con IA
│   │   ├── ai/generate-canvas/route.ts
│   │   └── projects/[id]/export/[format]/route.ts
│   └── globals.css
├── components/
│   ├── ui/                           # shadcn
│   ├── canvas/
│   │   ├── Canvas.tsx                # React Flow root
│   │   ├── nodes/
│   │   │   ├── DataModelNode.tsx
│   │   │   ├── EndpointNode.tsx
│   │   │   ├── ViewNode.tsx
│   │   │   ├── IntegrationNode.tsx
│   │   │   ├── UserFlowNode.tsx
│   │   │   ├── AuthNode.tsx
│   │   │   ├── JobNode.tsx
│   │   │   └── NoteNode.tsx
│   │   └── edges/TypedEdge.tsx
│   ├── inspector/                    # panel der: editar bloque seleccionado
│   ├── chat/                         # panel izq: chat con IA
│   └── shared/
├── lib/
│   ├── ai/
│   │   ├── providers.ts              # registry de proveedores soportados
│   │   ├── client.ts                 # crea cliente AI SDK desde la key del user
│   │   ├── prompts/
│   │   │   ├── generate-canvas.ts
│   │   │   ├── canvas-assistant.ts
│   │   │   └── system-base.ts
│   │   └── schemas.ts                # Zod schemas que la IA debe respetar
│   ├── blocks/
│   │   ├── schemas.ts                # Zod schema por tipo de bloque
│   │   ├── defaults.ts               # bloque vacío por tipo
│   │   └── connections.ts            # qué conexiones son válidas entre tipos
│   ├── export/
│   │   ├── claude-md.ts
│   │   ├── prompt-master.ts
│   │   ├── prd.ts
│   │   ├── sql-schema.ts
│   │   └── png.ts
│   ├── db/
│   │   ├── client.ts                 # PrismaClient singleton
│   │   └── queries.ts
│   ├── auth/
│   │   └── config.ts                 # better-auth config
│   ├── crypto/
│   │   └── api-keys.ts               # encrypt/decrypt de keys del user
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                       # carga los 5 templates iniciales
├── messages/
│   ├── en.json
│   └── es.json
├── templates/                        # templates iniciales como JSON
│   ├── saas-b2b.json
│   ├── ecommerce.json
│   ├── internal-dashboard.json
│   ├── mobile-with-backend.json
│   └── ai-tool.json
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── README.md
├── CLAUDE.md
├── LICENSE                           # AGPL-3.0
└── package.json
```

## 4. Modelo de datos

```prisma
// prisma/schema.prisma

generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Multi-tenant ready: nullable hoy, requerido mañana
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])

  projects   Project[]
  apiKeys    ApiKey[]
  sessions   Session[]
  accounts   Account[]
}

// Reservada para futuro multi-tenant. Hoy puede tener un solo registro "personal" por user
// o quedar vacía. Definirla ya evita migraciones dolorosas.
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())

  users     User[]
  projects  Project[]
}

model Project {
  id             String   @id @default(cuid())
  name           String
  description    String?
  initialPrompt  String?  // lo que el user escribió originalmente
  stack          Json?    // { frontend, backend, db, hosting, ... } sugerido por IA
  canvas         Json     // { nodes: [...], edges: [...] } validado con Zod
  language       String   @default("en") // idioma preferido para exports

  ownerId        String
  owner          User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])

  templateSlug   String?  // si se creó desde template
  isTemplate     Boolean  @default(false) // para v0.2 (compartibles)
  isPublic       Boolean  @default(false) // para v0.2

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  messages   ChatMessage[]
  snapshots  CanvasSnapshot[]
  exports    Export[]

  @@index([ownerId])
  @@index([organizationId])
}

model ChatMessage {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  role      String   // "user" | "assistant" | "system"
  content   String   @db.Text
  createdAt DateTime @default(now())

  @@index([projectId, createdAt])
}

model CanvasSnapshot {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  canvas    Json
  reason    String   // "export" | "manual" | "auto"
  label     String?
  createdAt DateTime @default(now())

  @@index([projectId, createdAt])
}

model Export {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  format    String   // "claude-md" | "prompt-master" | "prd" | "png" | "sql"
  content   String   @db.Text
  createdAt DateTime @default(now())

  @@index([projectId])
}

model ApiKey {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  provider    String   // "anthropic" | "openai" | "google" | "openrouter" | "ollama"
  label       String?  // nombre que el user le pone
  encrypted   String   @db.Text  // ciphertext (AES-256-GCM)
  iv          String                // hex
  createdAt   DateTime @default(now())
  lastUsedAt  DateTime?

  @@index([userId])
}

// Tablas de better-auth (Session, Account, Verification) — añadir según
// el schema oficial de la versión que se instale.
```

### Decisión clave: por qué `canvas` es JSONB

- Un proyecto medio tiene 20-80 bloques. Normalizar significa 5+ tablas y joins constantes para una operación que siempre se hace en bloque (cargar todo el canvas).
- Las queries que importan son a nivel proyecto, no a nivel bloque.
- Hacer snapshot = `INSERT INTO snapshots (canvas) VALUES (proyecto.canvas)`. Trivial.
- Validación con Zod en escritura garantiza integridad sin costar joins.

## 5. Tipos de bloque (schemas Zod)

Cada nodo en el canvas tiene la forma:

```typescript
type CanvasNode = {
  id: string; // nanoid
  type: BlockType; // "DataModel" | "Endpoint" | ...
  position: { x: number; y: number };
  data: BlockData; // varía según type, validado con Zod
};

type CanvasEdge = {
  id: string;
  source: string; // node id
  target: string; // node id
  type: ConnectionType; // "uses" | "dependsOn" | "protects" | "navigatesTo"
  label?: string;
};
```

### Schemas de cada tipo (resumen — ver `lib/blocks/schemas.ts`)

- **`DataModel`**: `name`, `description?`, `fields[]` (cada field con `name`, `type`, `required`, `unique?`, `default?`, `description?`), `relations[]` (a otros DataModel).
- **`Endpoint`**: `method` (GET/POST/PUT/PATCH/DELETE), `path`, `description?`, `auth` (none/required/role-based), `requestSchema?`, `responseSchema?`, `consumedByViews[]`.
- **`View`**: `name`, `route?`, `description?`, `consumesEndpoints[]`, `requiredAuth?`, `notes?`.
- **`Integration`**: `service` (Stripe, Twilio, etc.), `purpose`, `usedIn[]` (referencia a otros bloques), `secretsNeeded[]`.
- **`UserFlow`**: `name`, `steps[]` (cada step con `actor`, `action`, `target?`).
- **`Auth`**: `method` (email-password, OAuth, magic-link, ...), `roles[]`, `protects[]` (refs).
- **`Job`**: `name`, `trigger` (cron/webhook/event), `frequency?`, `action`.
- **`Note`**: `content` (markdown libre).

### Conexiones permitidas (`lib/blocks/connections.ts`)

| Source → Target          | `uses` | `dependsOn` | `protects` | `navigatesTo` |
| ------------------------ | :----: | :---------: | :--------: | :-----------: |
| Endpoint → DataModel     |   ✅   |     ✅      |            |               |
| View → Endpoint          |   ✅   |             |            |               |
| View → View              |        |             |            |      ✅       |
| Auth → Endpoint          |        |             |     ✅     |               |
| Auth → View              |        |             |     ✅     |               |
| Job → Endpoint           |   ✅   |             |            |               |
| Job → DataModel          |   ✅   |             |            |               |
| Integration → cualquiera |   ✅   |             |            |               |
| UserFlow → View          |        |             |            |      ✅       |

Conexiones inválidas se rechazan en el cliente (UX) y en validación Zod (seguridad).

## 6. Capa IA (multi-provider)

### Registry de proveedores

```typescript
// lib/ai/providers.ts
export const PROVIDERS = {
  anthropic: {
    label: "Anthropic Claude",
    models: ["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"],
    keyPlaceholder: "sk-ant-...",
    docs: "https://console.anthropic.com",
  },
  openai: {
    /* ... */
  },
  google: {
    /* ... */
  },
  openrouter: {
    /* ... */
  },
  ollama: { label: "Ollama (local)", needsKey: false, baseUrlRequired: true },
} as const;
```

### Cliente per-request

```typescript
// lib/ai/client.ts (boceto)
export async function getAIClient(userId: string) {
  const key = await loadAndDecryptKey(userId); // selecciona la activa
  switch (key.provider) {
    case "anthropic":
      return createAnthropic({ apiKey: key.value });
    case "openai":
      return createOpenAI({ apiKey: key.value });
    // ...
  }
}
```

### Dos modos de uso

**A. Generación inicial del canvas** (`generateObject` con Zod schema):

- Input: prompt del usuario + idioma + (opcional) template base.
- Output: `{ stack, nodes, edges }` validado contra Zod.
- Si la validación falla, reintenta una vez con el error como contexto.

**B. Asistente contextual dentro del canvas** (`streamText`):

- Input: estado actual del canvas (serializado compacto) + pregunta del usuario.
- Output: streaming de texto. Puede sugerir cambios estructurados que el usuario aplica con un click.

### Optimización del contexto

Para no quemar tokens, el canvas se serializa a una representación compacta antes de mandarlo:

```
DataModels: User(id, email, name), Project(id, name, ownerId→User)
Endpoints: GET /projects [auth:required] → returns Project[]
Views: ProjectsList → consumes [GET /projects]
```

Esto reduce 5-10x el tamaño vs JSON crudo.

## 7. Sistema de export

Cada generador en `lib/export/*.ts` recibe el `Project` completo y devuelve `string` (o `Buffer` para PNG).

### `claude-md.ts`

Genera un `CLAUDE.md` listo para pegar en la raíz de un repo. Estructura:

1. Resumen del proyecto (nombre, descripción, stack).
2. Modelo de datos (cada DataModel como una sección con sus campos).
3. API endpoints agrupados por recurso.
4. Vistas y rutas.
5. Auth y permisos.
6. Integraciones externas y secrets requeridos.
7. Jobs y procesos asíncronos.
8. Convenciones recomendadas (derivadas del stack elegido).

### `prompt-master.ts`

Versión plana, single-shot, optimizada para pegar en un chat (Claude.ai, ChatGPT, etc.).

### `prd.ts`

PRD ejecutivo en markdown, con secciones de problema, solución, alcance, funcionalidades.

### `sql-schema.ts`

Genera DDL SQL desde los `DataModel` y sus relaciones. Por ahora target genérico Postgres (futuras versiones: MySQL, SQLite).

### `png.ts`

Renderiza el canvas como PNG vía `html-to-image` (ya integrado con React Flow).

## 8. Sistema de templates

### MVP

5 templates como archivos JSON en `templates/`. El `seed.ts` los carga en una tabla `Template` (o se leen directo del filesystem en runtime — más simple).

Estructura de cada template:

```json
{
  "slug": "saas-b2b",
  "name": { "en": "B2B SaaS", "es": "SaaS B2B" },
  "description": { "en": "...", "es": "..." },
  "suggestedStack": { /* ... */ },
  "canvas": { "nodes": [...], "edges": [...] }
}
```

Al crear proyecto desde template, el `canvas` se clona en el proyecto nuevo.

### Post-MVP (v0.2)

- Tabla `Template` real con `ownerId`, `isPublic`, `slug` único.
- Galería pública en `/templates`.
- Fork: crear proyecto a partir de template público de otro user.

## 9. Internacionalización (i18n)

- `next-intl` con detección por path (`/en/projects`, `/es/projects`).
- Traducciones en `messages/en.json` y `messages/es.json`.
- El idioma del **export** es independiente del idioma de la **UI** y se elige por proyecto (`Project.language`).
- Los prompts a la IA usan el idioma del proyecto, no de la UI.

## 10. Self-hosting

```yaml
# docker-compose.yml (boceto)
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: blueprint
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]

  migrate:
    build: .
    command: ["npx", "prisma", "migrate", "deploy"]
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/blueprint

  app:
    build: .
    ports: ["3000:3000"]
    depends_on:
      migrate:
        condition: service_completed_successfully
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/blueprint
      AUTH_SECRET: ${AUTH_SECRET}
      ENCRYPTION_KEY: ${ENCRYPTION_KEY} # 32 bytes base64 para AES-256-GCM

volumes:
  pgdata:
```

`.env.example` documenta cada variable y cómo generarla.

## 11. Seguridad

- API keys del usuario encriptadas con **AES-256-GCM**, llave maestra desde `ENCRYPTION_KEY` (variable de entorno, nunca en DB).
- Rate limiting en endpoints `/api/ai/*` (e.g. 30 req/min por user) con `@upstash/ratelimit` o equivalente in-memory para self-host.
- CSRF protegido por better-auth + same-origin.
- Validación Zod en cada Server Action y API Route.
- `Content-Security-Policy` estricto.
- No se loggea el contenido del canvas ni los mensajes del chat (solo metadata).

## 12. Decisiones que NO se toman ahora

- ❌ Stripe / pagos (no aplica al MVP open source).
- ❌ Emails transaccionales (better-auth puede usar SMTP cuando se necesite).
- ❌ Logging avanzado / observabilidad (Pino mínimo es suficiente).
- ❌ CDN / storage de imágenes (las exports PNG se sirven inline o por endpoint propio).

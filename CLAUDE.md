# CLAUDE.md — Contexto del proyecto Architext

> Este archivo se queda en la raíz del repo. Claude Code lo lee automáticamente en cada sesión. Es la fuente de verdad sobre **cómo se trabaja en este proyecto**. Cualquier desviación del stack, las convenciones o las reglas debe justificarse y actualizarse aquí.

---

## ¿Qué es Architext?

Architext es una herramienta open-source para diseñar visualmente la **arquitectura** de proyectos antes de codearlos con asistentes de IA. El usuario describe su proyecto en lenguaje natural, una IA propone un canvas inicial (modelos de datos, endpoints, vistas, integraciones, flujos de auth, jobs), el usuario itera visualmente sobre bloques tipados conectados, y al final exporta un paquete de instrucciones (`CLAUDE.md`, prompts, schema SQL, diagrama) listo para alimentar a Claude Code, Cursor, Lovable, etc.

**El producto NO genera código.** Genera el blueprint que los generadores de código necesitan para no descarrilar.

## Stack (no desviarse sin justificar aquí)

| Capa                    | Tecnología                       | Versión mínima |
| ----------------------- | -------------------------------- | -------------- |
| Framework               | Next.js (App Router)             | 15.x           |
| Lenguaje                | TypeScript estricto              | 5.x            |
| UI                      | Tailwind CSS + shadcn/ui         | última         |
| Canvas                  | React Flow (`@xyflow/react`)     | 12.x           |
| Estado canvas (cliente) | Zustand                          | 4.x            |
| ORM                     | Prisma                           | 5.x            |
| DB                      | PostgreSQL                       | 16.x           |
| Auth                    | better-auth                      | última         |
| IA                      | Vercel AI SDK (`ai`) + providers | 4.x            |
| Validación              | Zod                              | 3.x            |
| i18n                    | next-intl                        | 3.x            |
| Tests                   | Vitest (unit) + Playwright (e2e) | última         |
| Lint                    | ESLint + Prettier                | última         |

**No introducir Redux, tRPC, Drizzle, Clerk, NextAuth, Convex, ni ninguna alternativa al stack de arriba sin abrir un issue de discusión.** El stack es deliberadamente conservador y self-host-friendly.

## Reglas no negociables

1. **Server Components por defecto.** Solo marca `"use client"` cuando el componente necesite estado, efectos, event handlers o APIs del browser. Los nodos de React Flow y el chat son client; casi todo lo demás es server.
2. **Server Actions sobre API Routes** cuando sea posible. API Routes solo para endpoints que necesitan ser llamados desde fuera del propio app (ej. webhook) o cuando se requiere streaming (chat IA).
3. **Validación Zod en cada borde.** Toda Server Action y API Route empieza validando input con Zod. Toda respuesta estructurada de IA se valida con Zod (`generateObject`).
4. **TypeScript estricto.** Nada de `any`. Si necesitas escapar el sistema de tipos, usa `unknown` y reduce con type guards.
5. **i18n desde día 1.** Todo string visible al usuario va en `messages/en.json` y `messages/es.json` y se accede vía `useTranslations`. Nunca hardcodear strings en componentes.
6. **Tenant-aware queries siempre.** Aunque el MVP es individual, toda query a `Project` debe filtrar por `ownerId` (y en el futuro por `organizationId`). Crear helpers en `lib/db/queries.ts` que ya reciben el `userId` y lo aplican.
7. **Nada de telemetría sin opt-in.** El producto se autohospeda. Cualquier llamada hacia afuera (excepto las APIs de IA configuradas por el user) debe poder desactivarse con una variable de entorno.
8. **Cero secrets en el repo.** `.env.example` documenta variables. `.env` está en `.gitignore`. CI debe fallar si detecta keys.

## Convenciones de código

### Naming

- Componentes: `PascalCase.tsx`. Un componente por archivo.
- Hooks: `useCamelCase.ts`.
- Funciones util: `camelCase` en archivos `kebab-case.ts`.
- Server Actions: prefijo verbal (`createProject`, `updateCanvas`, `generateInitialCanvas`).
- Tipos y interfaces: `PascalCase`. Preferir `type` sobre `interface` salvo extensión.
- Schemas Zod: sufijo `Schema` (`ProjectSchema`, `CanvasNodeSchema`).
- Constantes globales: `SCREAMING_SNAKE_CASE`.

### Estructura de un componente cliente típico

```tsx
"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

type Props = {
  // ...
};

export function MyComponent({ ... }: Props) {
  const t = useTranslations("namespace");
  const [state, setState] = useState(...);

  // ...

  return ( /* ... */ );
}
```

### Estructura de una Server Action típica

```ts
"use server";

import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/client";

const InputSchema = z.object({ /* ... */ });

export async function actionName(raw: unknown) {
  const input = InputSchema.parse(raw);
  const session = await auth.api.getSession({ headers: ... });
  if (!session) throw new Error("UNAUTHENTICATED");

  // Tenant-aware
  const result = await prisma.project.update({
    where: { id: input.id, ownerId: session.user.id },
    data: { /* ... */ },
  });

  return result;
}
```

### Trabajando con la DB

- **Nunca** usar `prisma.project.findUnique({ where: { id } })` sin verificar ownership. Usa siempre el helper o filtra en el `where` por `ownerId`.
- Migraciones: `npx prisma migrate dev --name descripcion_corta`.
- No usar `prisma.$queryRaw` salvo necesidad real (justificar en comentario).

### Trabajando con el canvas

- El canvas vive en `Project.canvas` como JSONB.
- En el cliente se carga a un store Zustand y todas las mutaciones pasan por acciones del store.
- La persistencia es **debounced**: 800ms tras el último cambio, se llama a una Server Action que valida con Zod y guarda. Mostrar indicador "Saving..." / "Saved".
- El schema del canvas (`CanvasSchema`) vive en `lib/blocks/schemas.ts`. Si se modifica, considerar migración de canvases existentes.

### Trabajando con la IA

- Toda llamada a IA pasa por `lib/ai/client.ts` que carga la key del user.
- Para outputs estructurados usar `generateObject({ schema })` del AI SDK, **nunca** parsear JSON manualmente del texto.
- Si la generación estructurada falla validación Zod, reintentar **una sola vez** pasando el error como contexto adicional. Si falla de nuevo, mostrar error al user.
- Para chat usar `streamText` y devolver con `result.toDataStreamResponse()`.
- Los prompts viven en `lib/ai/prompts/` como funciones que reciben contexto y devuelven `string`. **No** los inlinees en las route handlers.

### Trabajando con i18n

- Strings de UI: `useTranslations` (client) o `getTranslations` (server).
- Strings de IA / exports: el idioma viene del `Project.language`, no del locale de UI.
- Las llaves de traducción son **jerárquicas y descriptivas**: `dashboard.projects.create.button` no `btn1`.
- Plurales y variables siguen formato ICU.

## Estructura de carpetas (resumen)

Ver `02_ARCHITECTURE.md` § 3 para el árbol completo. Esto es lo crítico:

- `app/[locale]/(group)` — rutas agrupadas por contexto, no por feature.
- `components/canvas/nodes/*` — un archivo por tipo de bloque.
- `lib/blocks/schemas.ts` — **única fuente de verdad** sobre la forma de los bloques. Cualquier código que toque bloques importa de aquí.
- `lib/ai/prompts/*` — todos los prompts. Si encuentras un prompt inline en una route, **muévelo aquí**.
- `lib/export/*` — un archivo por formato de export.

## Patrones a usar

✅ **Sí:**

- Discriminated unions para tipos de bloque (`type BlockData = DataModelData | EndpointData | ...`).
- `parse` (no `safeParse`) en bordes — fallar rápido. `safeParse` solo cuando un fallo es esperado y manejable.
- Componentes shadcn modificados in-place. No envolverlos en wrappers innecesarios.
- Tests de las funciones de export (son lógica pura, fáciles de testear y críticas).

❌ **No:**

- `any`, `as` (salvo casos justificados con comentario), `// @ts-ignore`.
- Estado de canvas en `useState` distribuido. Va en el store Zustand.
- Llamadas a la IA desde componentes cliente directamente (debe pasar por API Route o Server Action por la key).
- Imports relativos largos (`../../../`). Configurar alias `@/*` y usarlo siempre.
- Crear nuevas tablas sin actualizar `02_ARCHITECTURE.md` y este documento.

## Variables de entorno

Documentadas en `.env.example`. Las críticas:

- `DATABASE_URL` — Postgres connection string.
- `AUTH_SECRET` — secret de better-auth (`openssl rand -base64 32`).
- `ENCRYPTION_KEY` — 32 bytes base64, para encriptar API keys de los users (`openssl rand -base64 32`).
- `NEXT_PUBLIC_APP_URL` — URL pública del app (para callbacks OAuth).
- `OAUTH_GITHUB_ID`, `OAUTH_GITHUB_SECRET` — opcional.
- `OAUTH_GOOGLE_ID`, `OAUTH_GOOGLE_SECRET` — opcional.

## Cómo se prueba

- `pnpm dev` para desarrollo.
- `pnpm test` para unit tests (Vitest).
- `pnpm test:e2e` para e2e (Playwright).
- `pnpm lint` y `pnpm typecheck` deben pasar antes de cualquier commit.
- Pre-commit hook con Husky ejecuta lint-staged.

## Antes de pedirme cambios grandes

Si vas a:

- Añadir una dependencia → justifícala en este archivo.
- Crear una tabla nueva → actualiza `02_ARCHITECTURE.md` § 4 y este documento.
- Añadir un tipo de bloque → actualiza `lib/blocks/schemas.ts`, `lib/blocks/connections.ts`, crea el componente en `components/canvas/nodes/` y añade traducciones.
- Cambiar el formato del canvas → considera retrocompatibilidad o migración de proyectos existentes.

## Lo que NO hace este producto

- ❌ No genera código de la app del user (eso lo hacen Claude Code, Cursor, etc.).
- ❌ No es un IDE.
- ❌ No es un PM tool.
- ❌ No tiene mockups de UI (eso es Figma / Stitch / v0).
- ❌ No despliega nada en cloud por el user.

Si una propuesta empuja al producto en alguna de esas direcciones, **rechaza y propón alternativa.**

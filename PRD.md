# PRD — Blueprint

> **Nombre placeholder:** "Blueprint". Al final del documento hay alternativas; reemplaza globalmente cuando elijas.

## 1. Visión en una frase

Una herramienta open-source y minimalista donde describes tu proyecto en lenguaje natural, una IA te propone una arquitectura inicial (stack, modelos de datos, endpoints, flujos, seguridad), tú la editas como bloques conectados en un canvas visual, y al final exportas un paquete de instrucciones (`.md`, prompts, schema SQL, diagrama) listo para alimentar a cualquier asistente de codeo (Claude Code, Cursor, Lovable, v0, etc.).

## 2. Problema que resuelve

El "vibe coding" con IA falla mayormente por una razón: los usuarios entran a la conversación con la IA **sin arquitectura mental clara**. Resultado:

- La IA inventa estructuras inconsistentes entre sesiones.
- Aparecen tablas duplicadas, endpoints contradictorios, lógica repetida.
- A las 200 líneas de código nadie — ni el humano ni la IA — entiende el sistema.
- El proyecto se vuelve imposible de mantener y se abandona.

Las herramientas existentes no resuelven este paso:

- **Lucidchart / Excalidraw / Whimsical:** son lienzos genéricos. No entienden de arquitectura de software ni se conectan con IA de codeo.
- **Figma / Google Stitch / v0:** se enfocan en UI/maquetado, no en la arquitectura subyacente.
- **Notion / Linear:** son para gestión, no para diseño técnico.
- **PRD generators (ChatPRD, etc.):** sólo texto, sin canvas estructurado.

Blueprint ocupa el hueco: **la capa de arquitectura previa al codeo asistido por IA.**

## 3. Audiencia (en orden de prioridad)

1. **Vibe coders / no-programadores con ideas claras** que quieren construir con IA pero terminan atascados.
2. **Desarrolladores junior/mid** que usan Claude Code, Cursor, etc. y quieren ahorrarse 1-2 horas de planning por proyecto.
3. **Equipos pequeños / freelancers** que necesitan documentar arquitectura para clientes (ej. agencias).
4. **Educadores / creadores de contenido técnico** que enseñan arquitectura de software.

## 4. Casos de uso típicos

1. _"Quiero un SaaS de gestión de citas para barberías con WhatsApp y pagos."_ → la IA propone stack, modelos (Negocio, Cita, Cliente, Pago), endpoints, integraciones (Twilio, Stripe), flujo de auth. El usuario itera visualmente y exporta un `CLAUDE.md` + prompt maestro.
2. _"Tengo este PRD en Notion, ayúdame a convertirlo en arquitectura."_ → pega el texto, la IA extrae entidades y las coloca como bloques.
3. _"Voy a clonar Linear pero con foco en estudiantes."_ → arranca desde un template "Project Management SaaS" y lo modifica.

## 5. Propuesta de valor diferenciada

- **Estructura primero, código después.** No genera código (otros lo hacen mejor); genera el blueprint que esos generadores necesitan para no descarrilar.
- **Canvas con tipos de bloque rígidos.** No es un lienzo libre: cada bloque tiene campos predefinidos (modelo de datos, endpoint, vista, integración, flujo, auth, job, nota). Esto fuerza claridad.
- **Export multi-formato.** El mismo proyecto se exporta como `CLAUDE.md`, `.cursorrules`, PRD markdown, schema SQL, diagrama PNG/SVG, prompt plano.
- **BYOK (Bring Your Own Key).** Cada usuario conecta su propia API de IA (Anthropic, OpenAI, Google, OpenRouter, Ollama). Cero costos de IA para el operador.
- **Open source (AGPL-3.0).** Self-hosteable. La comunidad puede contribuir templates y tipos de bloque.

## 6. Alcance MVP (versión 0.1)

### Incluido

- Auth con email/password + OAuth (GitHub, Google).
- Dashboard de proyectos del usuario (CRUD).
- Editor de proyecto con tres paneles: chat con IA (izq), canvas (centro), inspector de bloque seleccionado (der).
- 8 tipos de bloque iniciales: `DataModel`, `Endpoint`, `View`, `Integration`, `UserFlow`, `Auth`, `Job`, `Note`.
- Conexiones tipadas entre bloques (`uses`, `dependsOn`, `protects`, `navigatesTo`).
- Generación inicial vía IA: el usuario describe, la IA propone bloques + conexiones.
- Asistente IA contextual dentro del canvas ("¿qué me falta?", "¿esto está bien?").
- Configuración de proveedor de IA por usuario (BYOK) con encriptación de la key.
- Export a 4 formatos: `CLAUDE.md`, prompt maestro plano, PRD markdown, PNG del canvas.
- Versionado: snapshot automático en cada export.
- Interfaz bilingüe es/en con `next-intl`.
- 5 templates predefinidos (SaaS B2B, e-commerce, dashboard interno, app móvil con backend, herramienta IA).

### Explícitamente fuera del MVP

- Multi-tenant con equipos / colaboración en tiempo real (la arquitectura debe **permitirlo** desde el día 1, pero no se construye).
- Marketplace público de templates compartidos por la comunidad.
- Generación de código real (eso es de otras herramientas).
- Importación desde repos existentes.
- App móvil del producto.

## 7. Roadmap post-MVP (orden tentativo)

1. **v0.2 — Templates compartibles.** Los usuarios pueden hacer públicos sus templates con un slug. Galería pública.
2. **v0.3 — Multi-tenant.** Organizaciones, miembros, roles (owner/editor/viewer).
3. **v0.4 — Colaboración real-time** sobre el canvas (Yjs / Liveblocks self-hosted).
4. **v0.5 — Más tipos de bloque** (eventos, mensajes asíncronos, capa de cache, observabilidad).
5. **v0.6 — Importación inversa.** Pegar un schema Prisma o un OpenAPI y reconstruir el canvas.
6. **v1.0 — Versión cloud gestionada** (opcional, sobre la misma base AGPL).

## 8. Modelo de negocio

- **Producto base:** 100% open source bajo AGPL-3.0. Self-hosteable gratis.
- **Monetización futura (opcional):** versión cloud gestionada con auth lista, backups, sincronización de templates premium. La AGPL impide que terceros hagan un SaaS cerrado encima del código.
- **Sin costos de IA** para el operador del MVP gracias al BYOK.

## 9. Métricas de éxito (primeros 3 meses tras lanzamiento)

- ⭐ 500 stars en GitHub.
- 🚀 100 self-hosters reportados (analytics opt-in o GitHub stars como proxy).
- 📤 1.000 exports generados (telemetría anónima opt-in).
- 🔁 30% de retención semana 2 entre usuarios que crean ≥1 proyecto.
- 🌍 5+ contribuciones externas mergeadas (templates o features).

## 10. Riesgos y mitigaciones

| Riesgo                                               | Mitigación                                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| Curva de aprendizaje del canvas asusta a no-técnicos | Onboarding con un template pre-cargado + tour guiado                            |
| El producto se vuelve "Lucidchart genérico"          | Set rígido de tipos de bloque; el chat IA es el "modo natural" para no-técnicos |
| BYOK genera fricción ("¿dónde saco una key?")        | Tutorial paso a paso por proveedor + soporte de Ollama local sin key            |
| Output de IA inconsistente entre proveedores         | Schemas Zod estrictos en las respuestas estructuradas; validación + retry       |
| Fork comercial cerrado                               | Licencia AGPL-3.0                                                               |

## 11. Nombres alternativos a considerar

| Nombre        | Sentido                                     |
| ------------- | ------------------------------------------- |
| **Blueprint** | Plano antes de construir. Directo.          |
| **Architext** | Arquitectura + texto.                       |
| **Stagehand** | El que monta el escenario antes de la obra. |
| **Forekit**   | Kit del paso previo.                        |
| **Stackmap**  | Mapa del stack.                             |
| **Prefab**    | Prefabricado, modular.                      |
| **Vibearch**  | "Vibe coding" + "architecture". Más nicho.  |
| **Schemato**  | Si quieres tono más juguetón.               |

Mi recomendación: **Blueprint** o **Architext**. Verifica disponibilidad de dominio (`.dev`, `.app`, `.io`) y handle en GitHub/X antes de cerrar.

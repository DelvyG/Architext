import { buildSystemPrompt } from "./system-base";
import type { ModelMessage } from "ai";

type Params = {
  userPrompt: string;
  language: string;
  templateName?: string;
};

export function buildGenerateCanvasPrompt({
  userPrompt,
  language,
  templateName,
}: Params): ModelMessage[] {
  const system = buildSystemPrompt(language);

  const templateContext = templateName
    ? `\nThe user chose the "${templateName}" template as a starting point. Adapt your architecture to this context.`
    : "";

  return [
    { role: "system", content: system },
    {
      role: "user",
      content: `Design the initial architecture for this project:

"${userPrompt}"
${templateContext}

Generate a complete set of blocks (DataModel, Endpoint, View, Integration, UserFlow, Auth, Job as needed)
with realistic names, fields, and connections. Also suggest a tech stack.

Each node needs:
- A unique id (use short descriptive ids like "user-model", "auth-endpoint", etc.)
- A type matching one of the block types
- A position (spread them out in a grid pattern, ~250px apart)
- Data matching the block type schema

Each edge needs:
- source and target node ids
- A connection type: "uses", "dependsOn", "protects", or "navigatesTo"

Be thorough but not excessive — aim for 8-20 blocks for a typical project.
Include your reasoning explaining why you chose this architecture.`,
    },
  ];
}

import type { BlockType, ConnectionType } from "./schemas";

type ConnectionRule = {
  source: BlockType;
  target: BlockType;
  allowed: ConnectionType[];
};

const RULES: ConnectionRule[] = [
  { source: "Endpoint", target: "DataModel", allowed: ["uses", "dependsOn"] },
  { source: "View", target: "Endpoint", allowed: ["uses"] },
  { source: "View", target: "View", allowed: ["navigatesTo"] },
  { source: "Auth", target: "Endpoint", allowed: ["protects"] },
  { source: "Auth", target: "View", allowed: ["protects"] },
  { source: "Job", target: "Endpoint", allowed: ["uses"] },
  { source: "Job", target: "DataModel", allowed: ["uses"] },
  { source: "Integration", target: "DataModel", allowed: ["uses"] },
  { source: "Integration", target: "Endpoint", allowed: ["uses"] },
  { source: "Integration", target: "View", allowed: ["uses"] },
  { source: "Integration", target: "Job", allowed: ["uses"] },
  { source: "Integration", target: "Auth", allowed: ["uses"] },
  { source: "Integration", target: "UserFlow", allowed: ["uses"] },
  { source: "Integration", target: "Integration", allowed: ["uses"] },
  { source: "Integration", target: "Note", allowed: ["uses"] },
  { source: "UserFlow", target: "View", allowed: ["navigatesTo"] },
  // New block types
  { source: "Security", target: "Endpoint", allowed: ["protects"] },
  { source: "Security", target: "View", allowed: ["protects"] },
  { source: "Security", target: "DataModel", allowed: ["protects"] },
  { source: "Cache", target: "Endpoint", allowed: ["uses"] },
  { source: "Cache", target: "DataModel", allowed: ["uses"] },
  { source: "Queue", target: "Job", allowed: ["uses"] },
  { source: "Queue", target: "Endpoint", allowed: ["uses"] },
  { source: "Queue", target: "DataModel", allowed: ["uses"] },
  { source: "Endpoint", target: "Queue", allowed: ["uses"] },
  { source: "Endpoint", target: "Cache", allowed: ["uses"] },
  { source: "Endpoint", target: "Storage", allowed: ["uses"] },
  { source: "Storage", target: "DataModel", allowed: ["uses"] },
  { source: "Job", target: "Queue", allowed: ["uses"] },
  { source: "Job", target: "Storage", allowed: ["uses"] },
  { source: "SEO", target: "View", allowed: ["uses"] },
  { source: "View", target: "SEO", allowed: ["uses"] },
];

export function isValidConnection(
  sourceType: BlockType,
  targetType: BlockType,
  connectionType: ConnectionType,
): boolean {
  return RULES.some(
    (rule) =>
      rule.source === sourceType &&
      rule.target === targetType &&
      rule.allowed.includes(connectionType),
  );
}

export function getAllowedConnectionTypes(
  sourceType: BlockType,
  targetType: BlockType,
): ConnectionType[] {
  const rule = RULES.find((r) => r.source === sourceType && r.target === targetType);
  return rule?.allowed ?? [];
}

export function getConnectionHint(sourceType: BlockType, targetType: BlockType): string {
  // Check if the reverse direction works
  const reverse = RULES.find((r) => r.source === targetType && r.target === sourceType);
  if (reverse) {
    return `Try the other direction: ${targetType} → ${sourceType} (${reverse.allowed.join(", ")})`;
  }

  // Show what the source CAN connect to
  const sourceRules = RULES.filter((r) => r.source === sourceType);
  if (sourceRules.length > 0) {
    const targets = sourceRules.map((r) => r.target);
    return `${sourceType} can connect to: ${targets.join(", ")}`;
  }

  // Show what can connect TO the source (it's always a target)
  const asTarget = RULES.filter((r) => r.target === sourceType);
  if (asTarget.length > 0) {
    const sources = asTarget.map((r) => r.source);
    return `${sourceType} receives connections from: ${sources.join(", ")}`;
  }

  return "These block types cannot be connected";
}

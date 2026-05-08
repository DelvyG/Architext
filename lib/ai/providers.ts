export const PROVIDERS = {
  anthropic: {
    label: "Anthropic Claude",
    models: ["claude-sonnet-4-6", "claude-haiku-4-5-20251001", "claude-opus-4-6"],
    keyPlaceholder: "sk-ant-...",
    docs: "https://console.anthropic.com",
    needsKey: true,
    baseUrlRequired: false,
  },
  openai: {
    label: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "o3-mini"],
    keyPlaceholder: "sk-...",
    docs: "https://platform.openai.com/api-keys",
    needsKey: true,
    baseUrlRequired: false,
  },
  google: {
    label: "Google Gemini",
    models: ["gemini-2.5-pro", "gemini-2.5-flash"],
    keyPlaceholder: "AI...",
    docs: "https://aistudio.google.com/apikey",
    needsKey: true,
    baseUrlRequired: false,
  },
  openrouter: {
    label: "OpenRouter",
    models: ["anthropic/claude-sonnet-4-6", "openai/gpt-4o", "google/gemini-2.5-pro"],
    keyPlaceholder: "sk-or-...",
    docs: "https://openrouter.ai/keys",
    needsKey: true,
    baseUrlRequired: false,
  },
  deepseek: {
    label: "DeepSeek",
    models: ["deepseek-chat", "deepseek-reasoner"],
    keyPlaceholder: "sk-...",
    docs: "https://platform.deepseek.com/api_keys",
    needsKey: true,
    baseUrlRequired: false,
  },
  ollama: {
    label: "Ollama (local)",
    models: ["llama3.3", "mistral", "codestral"],
    keyPlaceholder: "",
    docs: "https://ollama.com",
    needsKey: false,
    baseUrlRequired: true,
  },
} as const;

export type ProviderId = keyof typeof PROVIDERS;
export const PROVIDER_IDS = Object.keys(PROVIDERS) as ProviderId[];

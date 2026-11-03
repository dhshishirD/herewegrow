// AI provider interface (Phase 1 spec, section 3). Workers AI at launch; Claude or Gemini can
// replace it later by adding an adapter and choosing it in `aiProvider` below.

export interface AiRequest {
  system: string;
  prompt: string;
  maxTokens: number;
}

export interface AiResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

export interface AiProvider {
  name: string;
  run(req: AiRequest): Promise<AiResult>;
}

/** The small part of the Workers AI binding this site uses. */
export interface WorkersAiBinding {
  run(model: string, input: unknown): Promise<unknown>;
}

export interface AiEnv {
  /** Workers AI binding ([ai] in wrangler.toml). */
  AI?: WorkersAiBinding;
  /** Optional plain variable to try another Workers AI model without a code change. */
  AI_MODEL?: string;
}

/** Good at English and reads Bangla; fast and low cost. */
export const DEFAULT_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

export function workersAi(ai: WorkersAiBinding, model = DEFAULT_MODEL): AiProvider {
  return {
    name: `workers-ai:${model}`,
    async run({ system, prompt, maxTokens }) {
      const out = (await ai.run(model, {
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.4,
      })) as { response?: unknown; usage?: { prompt_tokens?: number; completion_tokens?: number } } | null;
      const r = out?.response;
      return {
        text: typeof r === 'string' ? r : r == null ? '' : JSON.stringify(r),
        inputTokens: out?.usage?.prompt_tokens ?? 0,
        outputTokens: out?.usage?.completion_tokens ?? 0,
      };
    },
  };
}

/** The provider for this environment, or null when AI is not set up. */
export const aiProvider = (env: AiEnv): AiProvider | null => (env.AI ? workersAi(env.AI, env.AI_MODEL || DEFAULT_MODEL) : null);

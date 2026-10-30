import { getSystemConfig } from "@/lib/database/db";

export interface ModelEndpoint {
  id: string;
  name: string;
  family: "Qwen" | "DeepSeek" | "Gemma" | "Llama" | "vLLM / Open URL";
  contextWindow: number;
  recommendedRole: string;
}

export const AVAILABLE_MODELS: ModelEndpoint[] = [
  {
    id: "openai",
    name: "Open-Source Fast Cluster (Pollinations URL API - Free)",
    family: "vLLM / Open URL",
    contextWindow: 65536,
    recommendedRole: "Instant URL API, High-Speed Educational Tutor, No Keys Required",
  },
  {
    id: "gemma4:latest",
    name: "Gemma 4 (8.0B Reasoning & Thinking Model - Local Ollama)",
    family: "Gemma / Ollama",
    contextWindow: 131072,
    recommendedRole: "Primary Local Inference, STEM & Advanced Mathematical Derivations",
  },
  {
    id: "gemma3:4b",
    name: "Gemma 3 (4.3B High-Speed Model - Local Ollama)",
    family: "Gemma / Ollama",
    contextWindow: 131072,
    recommendedRole: "Ultra-Fast Local Q&A and Fact Retrieval",
  },
  {
    id: "Qwen/Qwen2.5-72B-Instruct",
    name: "Qwen 2.5 72B Instruct (Deep Mathematics & STEM)",
    family: "Qwen",
    contextWindow: 131072,
    recommendedRole: "All-Round Academic Tutor, Deep Mathematics, Physics & Multilingual",
  },
  {
    id: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
    name: "DeepSeek R1 (Chain-of-Thought Reasoning)",
    family: "DeepSeek",
    contextWindow: 65536,
    recommendedRole: "Step-by-Step Proofs, Formal Logic & Olympiad Mathematics",
  },
  {
    id: "deepseek-ai/DeepSeek-V3",
    name: "DeepSeek V3 (671B MoE)",
    family: "DeepSeek",
    contextWindow: 128000,
    recommendedRole: "Complex Scientific Derivations & Full-Stack Coding",
  },
  {
    id: "google/gemma-2-27b-it",
    name: "Gemma 2 27B Instruct",
    family: "Gemma",
    contextWindow: 8192,
    recommendedRole: "Fast Socratic Explanations & Quick Concept Q&A",
  },
  {
    id: "meta-llama/Llama-3.3-70B-Instruct",
    name: "Llama 3.3 70B Instruct",
    family: "Llama",
    contextWindow: 128000,
    recommendedRole: "Humanities, Research Papers & Essay Deconstruction",
  },
  {
    id: "vllm-local-cluster",
    name: "Self-Hosted vLLM Server (http://localhost:8000/v1)",
    family: "vLLM / Open URL",
    contextWindow: 32768,
    recommendedRole: "On-Premise GPU Inference via vLLM URL API",
  },
  {
    id: "ollama-local",
    name: "Local Ollama Endpoint (http://localhost:11434/v1)",
    family: "vLLM / Open URL",
    contextWindow: 32768,
    recommendedRole: "Local Offline Inference via Ollama URL API",
  },
];

export interface ChatMessageParam {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface InferenceOptions {
  model?: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface EndpointTestResult {
  status: "Connected" | "Disconnected" | "Model Unavailable" | "Authentication Required" | "Rate Limited" | "Timeout" | "Invalid Response";
  latencyMs: number;
  model: string;
  endpoint: string;
  sampleResponse?: string;
  error?: string;
}

/**
 * Resolves inference endpoint URL dynamically:
 * Supports direct text.pollinations.ai, OpenAI endpoints, vLLM, and Ollama.
 */
export function resolveInferenceEndpoint(baseUrl: string): { url: string; isDirectPollinations: boolean } {
  const clean = (baseUrl || "").replace(/\/+$/, "");
  if (!clean || clean.includes("text.pollinations.ai")) {
    return { url: "https://text.pollinations.ai/", isDirectPollinations: true };
  }
  if (clean.endsWith("/chat/completions")) {
    return { url: clean, isDirectPollinations: false };
  }
  return { url: `${clean}/chat/completions`, isDirectPollinations: false };
}

/**
 * Real model connection verification:
 * Sends an actual generation prompt to the configured endpoint and checks for a valid response.
 */
export async function testModelEndpoint(
  baseUrlOverride?: string,
  modelOverride?: string,
  apiKeyOverride?: string
): Promise<EndpointTestResult> {
  const config = await getSystemConfig();
  const baseUrl = baseUrlOverride || process.env.INFERENCE_BASE_URL || config.inferenceBaseUrl || "https://text.pollinations.ai";
  const model = modelOverride || config.activeModel || "openai-fast";
  const apiKey = apiKeyOverride ?? process.env.INFERENCE_API_KEY ?? "";

  const startTime = Date.now();
  const { url: testEndpoint, isDirectPollinations } = resolveInferenceEndpoint(baseUrl);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const targetModel = isDirectPollinations
      ? "openai-fast"
      : model === "vllm-local-cluster"
      ? "Qwen/Qwen2.5-72B-Instruct"
      : model;

    const res = await fetch(testEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [{ role: "user", content: "Reply with the single word: OPERATIONAL" }],
        max_tokens: 20,
        temperature: 0.1,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const latencyMs = Date.now() - startTime;

    if (res.status === 401 || res.status === 403) {
      return {
        status: "Authentication Required",
        latencyMs,
        model: targetModel,
        endpoint: baseUrl,
        error: `HTTP ${res.status}: Endpoint rejected request. Please check bearer token in settings.`,
      };
    }

    if (res.status === 429) {
      return {
        status: "Rate Limited",
        latencyMs,
        model: targetModel,
        endpoint: baseUrl,
        error: "HTTP 429: Model server rate limit reached. Retry shortly.",
      };
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        status: "Model Unavailable",
        latencyMs,
        model: targetModel,
        endpoint: baseUrl,
        error: `HTTP ${res.status}: ${errText.slice(0, 150)}`,
      };
    }

    const contentType = res.headers.get("content-type") || "";
    let generatedText = "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      generatedText = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.message?.reasoning || "";
    } else {
      generatedText = await res.text();
    }

    if (!generatedText) {
      return {
        status: "Invalid Response",
        latencyMs,
        model: targetModel,
        endpoint: baseUrl,
        error: "Endpoint returned 200 OK but choices[0].message.content was empty.",
      };
    }

    return {
      status: "Connected",
      latencyMs,
      model: targetModel,
      endpoint: baseUrl,
      sampleResponse: generatedText.trim().slice(0, 80),
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    if (err.name === "AbortError") {
      return {
        status: "Timeout",
        latencyMs,
        model,
        endpoint: baseUrl,
        error: "Inference endpoint failed to respond within 7s timeout.",
      };
    }

    return {
      status: "Disconnected",
      latencyMs,
      model,
      endpoint: baseUrl,
      error: err.message || "Failed to establish TCP/HTTP connection with model server.",
    };
  }
}

/**
 * Perform streaming inference with actual open-source AI models
 * Attempts Primary URL -> Configured Secondary Fallback URL.
 * NEVER returns hardcoded mock answers if both fail.
 */
export async function createChatCompletionStream(
  messages: ChatMessageParam[],
  options: InferenceOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  const config = await getSystemConfig();
  const primaryUrl = process.env.INFERENCE_BASE_URL || config.inferenceBaseUrl || "https://text.pollinations.ai";
  const fallbackUrl = "https://text.pollinations.ai";
  const apiKey = process.env.INFERENCE_API_KEY || "";
  let model = options.model || config.activeModel || "openai-fast";

  if (model === "vllm-local-cluster") model = "Qwen/Qwen2.5-72B-Instruct";
  if (model === "ollama-local") model = "llama3.2";

  // Attempt 1: Primary Configured Endpoint
  try {
    const stream = await callHttpInferenceStream(primaryUrl, model, messages, options, apiKey);
    if (stream) return stream;
  } catch (err: any) {
    console.warn(`Primary model endpoint (${primaryUrl}) connection failed:`, err.message);
  }

  // Attempt 2: If primary was custom or local, try public open-source URL fallback
  if (primaryUrl !== fallbackUrl) {
    try {
      console.log(`Attempting fallback to public open-source cluster (${fallbackUrl})...`);
      const fallbackStream = await callHttpInferenceStream(fallbackUrl, "openai-fast", messages, options, "");
      if (fallbackStream) return fallbackStream;
    } catch (fallbackErr: any) {
      console.error("Secondary fallback model endpoint failed:", fallbackErr.message);
    }
  }

  // If ALL endpoints fail, return an honest, explicit connection error stream (NO MOCKS)
  return createConnectionErrorStream({
    endpoint: primaryUrl,
    model,
    reason: "Unable to establish live connection to the configured open-source AI inference endpoint.",
  });
}

/**
 * Non-streaming chat completion for quizzes and structured outputs
 */
export async function generateChatCompletion(
  messages: ChatMessageParam[],
  options: InferenceOptions = {}
): Promise<string> {
  const config = await getSystemConfig();
  const primaryUrl = process.env.INFERENCE_BASE_URL || config.inferenceBaseUrl || "https://text.pollinations.ai";
  const fallbackUrl = "https://text.pollinations.ai";
  const apiKey = process.env.INFERENCE_API_KEY || "";
  let model = options.model || config.activeModel || "openai-fast";

  const tryCall = async (url: string, targetModel: string): Promise<string | null> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 14000);
    const { url: endpoint, isDirectPollinations } = resolveInferenceEndpoint(url);

    const actualModel = isDirectPollinations ? "openai-fast" : targetModel;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: actualModel,
        messages,
        temperature: options.temperature ?? config.temperature ?? 0.2,
        max_tokens: options.max_tokens ?? config.maxOutputTokens ?? 2048,
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.message?.reasoning;
        if (content) return content.trim();
      } else {
        const text = await res.text();
        if (text) return text.trim();
      }
    }
    return null;
  };

  try {
    const result = await tryCall(primaryUrl, model);
    if (result) return result;
  } catch (e) {
    console.warn("Primary non-streaming inference failed, attempting fallback:", e);
  }

  if (primaryUrl !== fallbackUrl) {
    try {
      const fallbackResult = await tryCall(fallbackUrl, "openai-fast");
      if (fallbackResult) return fallbackResult;
    } catch (e) {
      console.error("Fallback non-streaming inference failed:", e);
    }
  }

  throw new Error(`Inference server at ${primaryUrl} is unreachable. Please verify model endpoint in Admin settings.`);
}

/**
 * Low-level HTTP SSE streaming caller
 */
async function callHttpInferenceStream(
  baseUrl: string,
  model: string,
  messages: ChatMessageParam[],
  options: InferenceOptions,
  apiKey: string
): Promise<ReadableStream<Uint8Array> | null> {
  const { url: endpoint, isDirectPollinations } = resolveInferenceEndpoint(baseUrl);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  const actualModel = isDirectPollinations ? "openai-fast" : model;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: actualModel,
      messages,
      temperature: options.temperature ?? 0.2,
      top_p: options.top_p ?? 0.9,
      max_tokens: options.max_tokens ?? 4096,
      stream: true,
    }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (response.ok && response.body) {
    return transformOpenAiStreamToTextStream(response.body);
  }
  return null;
}


/**
 * Transforms an OpenAI SSE byte stream into a pure text token stream
 * Captures both delta.content and delta.reasoning seamlessly
 */
function transformOpenAiStreamToTextStream(upstream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const reader = upstream.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(":")) continue;
            if (trimmed === "data: [DONE]") {
              controller.close();
              return;
            }
            if (trimmed.startsWith("data: ")) {
              try {
                const json = JSON.parse(trimmed.slice(6));
                const delta = json.choices?.[0]?.delta;
                const token = delta?.content || delta?.reasoning;
                if (token) {
                  controller.enqueue(encoder.encode(token));
                }
              } catch {
                // Ignore partial JSON chunks
              }
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

/**
 * Honest error stream returned when all live inference endpoints fail
 * No mock answers or simulated conversations.
 */
function createConnectionErrorStream(details: {
  endpoint: string;
  model: string;
  reason: string;
}): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const errorNotice = `### ⚠️ AI Inference Connection Notice

The application was unable to receive a response from the configured open-source model endpoint.

**Diagnostics:**
- **Target Endpoint URL**: \`${details.endpoint}\`
- **Target Model**: \`${details.model}\`
- **Root Cause**: ${details.reason}

**Actionable Steps:**
1. If using a local model, verify your local inference server is active (e.g. \`ollama serve\` or \`vllm serve\`).
2. Visit the **[Admin & Model Health](/admin)** dashboard to test connectivity or select an active URL endpoint.
3. Once verified, click **Regenerate** below to resend your educational inquiry.`;

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(errorNotice));
      controller.close();
    },
  });
}

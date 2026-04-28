import type { SummaryType } from "@/types/summarizer";

const HF_MODEL_URL =
  "https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6";
const HF_TIMEOUT_MS = 2400;

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function toBulletPoints(text: string, maxItems = 6): string {
  const sentences = splitSentences(text).slice(0, maxItems);
  if (sentences.length === 0) return text;
  return sentences.map((sentence) => `- ${sentence}`).join("\n");
}

function getTargetSentenceCount(summaryType: SummaryType): number {
  switch (summaryType) {
    case "short":
      return 2;
    case "detailed":
      return 5;
    case "bullets":
      return 4;
    default:
      return 3;
  }
}

function extractiveFallback(text: string, summaryType: SummaryType): string {
  const sentences = splitSentences(text);
  if (sentences.length <= 2) {
    return summaryType === "bullets" ? toBulletPoints(text, 2) : text;
  }

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3);

  const frequency = new Map<string, number>();
  for (const word of words) {
    frequency.set(word, (frequency.get(word) ?? 0) + 1);
  }

  const scored = sentences.map((sentence, index) => {
    const sentenceWords = sentence
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3);

    const score = sentenceWords.reduce(
      (sum, word) => sum + (frequency.get(word) ?? 0),
      0,
    );

    return { sentence, index, score };
  });

  const targetCount = Math.min(getTargetSentenceCount(summaryType), sentences.length);
  const selected = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, targetCount)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.sentence);

  const summary = selected.join(" ").trim();
  return summaryType === "bullets" ? toBulletPoints(summary) : summary;
}

async function summarizeWithHuggingFace(
  text: string,
  summaryType: SummaryType,
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HF_TIMEOUT_MS);

  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const token = process.env.HF_API_TOKEN?.trim();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(HF_MODEL_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        inputs: text,
        parameters: {
          min_length: summaryType === "short" ? 30 : 45,
          max_length: summaryType === "detailed" ? 180 : 110,
          do_sample: false,
        },
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as
      | Array<{ summary_text?: string }>
      | { summary_text?: string };

    const summary = Array.isArray(payload)
      ? payload[0]?.summary_text?.trim()
      : payload.summary_text?.trim();

    if (!summary) return null;
    return summaryType === "bullets" ? toBulletPoints(summary) : summary;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function summarizeTextFree(
  text: string,
  summaryType: SummaryType,
): Promise<{ summary: string; source: "huggingface" | "fallback" }> {
  const hfSummary = await summarizeWithHuggingFace(text, summaryType);
  if (hfSummary) {
    return { summary: hfSummary, source: "huggingface" };
  }

  return {
    summary: extractiveFallback(text, summaryType),
    source: "fallback",
  };
}

import type { SummaryType } from "@/types/summarizer";

type SummarizerFn = (
  text: string,
  options: {
    max_length: number;
    min_length: number;
    do_sample: boolean;
  },
) => Promise<Array<{ summary_text: string }>>;

let pipelinePromise: Promise<SummarizerFn> | null = null;

async function getSummarizer(): Promise<SummarizerFn> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { pipeline, env } = await import("@xenova/transformers");
      env.allowLocalModels = false;
      return (await pipeline(
        "summarization",
        "Xenova/distilbart-cnn-12-6",
      )) as SummarizerFn;
    })();
  }
  return pipelinePromise;
}

function toBulletPoints(text: string): string {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 6);

  if (sentences.length === 0) {
    return text;
  }

  return sentences.map((sentence) => `- ${sentence}`).join("\n");
}

function outputLengths(summaryType: SummaryType): {
  minLength: number;
  maxLength: number;
} {
  switch (summaryType) {
    case "short":
      return { minLength: 30, maxLength: 90 };
    case "detailed":
      return { minLength: 80, maxLength: 200 };
    case "bullets":
      return { minLength: 60, maxLength: 170 };
    default:
      return { minLength: 40, maxLength: 120 };
  }
}

export async function summarizeTextLocally(
  text: string,
  summaryType: SummaryType,
): Promise<string> {
  const summarizer = await getSummarizer();
  const { minLength, maxLength } = outputLengths(summaryType);

  const output = await summarizer(text, {
    max_length: maxLength,
    min_length: minLength,
    do_sample: false,
  });

  const summary = output[0]?.summary_text?.trim() ?? "";

  if (!summary) {
    return "";
  }

  if (summaryType === "bullets") {
    return toBulletPoints(summary);
  }

  return summary;
}

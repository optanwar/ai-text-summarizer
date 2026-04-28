"use client";

import { useMemo, useRef, useState } from "react";

import { SummaryOutput } from "@/components/summarizer/SummaryOutput";
import { SummaryTypeSelect } from "@/components/summarizer/SummaryTypeSelect";
import { TextInput } from "@/components/summarizer/TextInput";
import type { SummaryType } from "@/types/summarizer";

const MAX_TEXT_LENGTH = 5000;

export function SummarizerForm() {
  const [text, setText] = useState("");
  const [summaryType, setSummaryType] = useState<SummaryType>("short");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const previousResultRef = useRef<{
    text: string;
    summaryType: SummaryType;
    summary: string;
  } | null>(null);

  const isSubmitDisabled = useMemo(
    () => isLoading || text.trim().length === 0 || text.length > MAX_TEXT_LENGTH,
    [isLoading, text],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please enter some text first.");
      return;
    }

    setError(null);
    const previous = previousResultRef.current;

    if (previous && previous.text === trimmed && previous.summaryType === summaryType) {
      setSummary(previous.summary);
      return;
    }

    setSummary("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          summaryType,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Failed to generate summary.");
      }

      const payload = (await response.json()) as { summary?: string };
      const generatedSummary = payload.summary?.trim();
      if (!generatedSummary) {
        throw new Error("No summary returned by server.");
      }

      setSummary(generatedSummary);
      previousResultRef.current = {
        text: trimmed,
        summaryType,
        summary: generatedSummary,
      };
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error occurred.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy(): Promise<void> {
    if (!summary.trim()) return;

    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      setError("Unable to copy summary to clipboard.");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <header className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          AI Text Summarizer
        </h1>
        <p className="max-w-2xl text-sm text-zinc-600 sm:text-base">
          Generate clear, human-like summaries from long text in seconds with
          a fully free local open-source model.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all"
        >
          <TextInput
            value={text}
            onChange={setText}
            maxLength={MAX_TEXT_LENGTH}
            disabled={isLoading}
          />
          <SummaryTypeSelect
            value={summaryType}
            onChange={setSummaryType}
            disabled={isLoading}
          />

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-white" />
                Summarizing...
              </>
            ) : (
              "Generate Summary"
            )}
          </button>
        </form>

        <SummaryOutput summary={summary} isLoading={isLoading} onCopy={handleCopy} />
      </div>
    </div>
  );
}

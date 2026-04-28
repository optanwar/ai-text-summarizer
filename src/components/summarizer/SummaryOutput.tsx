interface SummaryOutputProps {
  summary: string;
  isLoading: boolean;
  onCopy: () => Promise<void>;
}

export function SummaryOutput({ summary, isLoading, onCopy }: SummaryOutputProps) {
  const hasSummary = summary.trim().length > 0;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900">Generated Summary</h2>
        <button
          type="button"
          onClick={onCopy}
          disabled={!hasSummary}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Copy
        </button>
      </div>

      <div className="min-h-44 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
        {isLoading && !hasSummary ? (
          <div className="flex h-full items-center gap-2 text-sm text-zinc-600">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
            Generating summary...
          </div>
        ) : hasSummary ? (
          <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-800">{summary}</p>
        ) : (
          <p className="text-sm text-zinc-500">
            Your summary will appear here after generation.
          </p>
        )}
      </div>
    </section>
  );
}

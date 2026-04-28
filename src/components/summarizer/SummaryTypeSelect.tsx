import { SUMMARY_TYPES, type SummaryType } from "@/types/summarizer";

const SUMMARY_LABELS: Record<SummaryType, string> = {
  short: "Short summary",
  bullets: "Bullet points",
  detailed: "Detailed summary",
};

interface SummaryTypeSelectProps {
  value: SummaryType;
  onChange: (value: SummaryType) => void;
  disabled?: boolean;
}

export function SummaryTypeSelect({
  value,
  onChange,
  disabled = false,
}: SummaryTypeSelectProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="summaryType" className="text-sm font-medium text-zinc-700">
        Summary Style
      </label>
      <select
        id="summaryType"
        value={value}
        onChange={(event) => onChange(event.target.value as SummaryType)}
        disabled={disabled}
        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {SUMMARY_TYPES.map((type) => (
          <option key={type} value={type}>
            {SUMMARY_LABELS[type]}
          </option>
        ))}
      </select>
    </div>
  );
}

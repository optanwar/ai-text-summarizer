interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  disabled?: boolean;
}

export function TextInput({
  value,
  onChange,
  maxLength,
  disabled = false,
}: TextInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="sourceText" className="text-sm font-medium text-zinc-700">
        Source Text
      </label>
      <textarea
        id="sourceText"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste or type text to summarize..."
        className="min-h-52 w-full rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-6 text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 disabled:cursor-not-allowed disabled:opacity-70"
        maxLength={maxLength}
        disabled={disabled}
      />
      <p className="text-xs text-zinc-500">
        {value.length}/{maxLength} characters
      </p>
    </div>
  );
}

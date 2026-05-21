interface DatePickerProps {
  value?: string;
  onChange: (date: string | undefined) => void;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="text-sm border border-neutral-200 rounded-lg px-3 py-1.5 focus:border-neutral-400 focus:ring-0 outline-none text-neutral-900"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-xs text-neutral-400 hover:text-red-500 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
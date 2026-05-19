import { useState } from 'react';

interface DatePickerProps {
  value?: string;
  onChange: (date: string | undefined) => void;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const getDateColor = () => {
    if (!value) return 'text-neutral-400';
    
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      return 'text-red-500';
    }
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString() || 
        date.toDateString() === tomorrow.toDateString()) {
      return 'text-yellow-600';
    }
    
    return 'text-neutral-900';
  };

  const handleClear = () => {
    onChange(undefined);
    setShowPicker(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className={`text-sm ${getDateColor()} hover:text-neutral-900 transition-colors`}
      >
        {value ? formatDate(value) : 'Set due date'}
      </button>

      {showPicker && (
        <div className="absolute top-full mt-2 left-0 bg-white border border-neutral-200 rounded-lg shadow-lg p-3 z-10">
          <input
            type="date"
            value={value || ''}
            onChange={(e) => {
              onChange(e.target.value || undefined);
              setShowPicker(false);
            }}
            className="text-sm border border-neutral-200 rounded px-2 py-1"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="block mt-2 text-xs text-neutral-400 hover:text-red-500 transition-colors"
            >
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  );
}
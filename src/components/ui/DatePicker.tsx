import { useState } from 'react';
import { formatDateString, isToday } from '../../utils/date';
import { cn } from '../../utils/cn';

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  customDayName?: string | null;
  isAdmin?: boolean;
  onCustomDayNameChange?: (name: string | null) => void;
}

export function DatePicker({
  selectedDate,
  onDateChange,
  customDayName,
  isAdmin,
  onCustomDayNameChange,
}: DatePickerProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  function shift(days: number) {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    onDateChange(`${y}-${m}-${dd}`);
  }

  const viewing = isToday(selectedDate);

  // Build display string — replace weekday with custom name if set
  const formatted = formatDateString(selectedDate);
  const displayDate = customDayName
    ? formatted.replace(/^[^,]+/, customDayName)
    : formatted;

  function handleStartEdit() {
    setEditValue(customDayName || '');
    setEditing(true);
  }

  function handleSave() {
    const trimmed = editValue.trim();
    if (trimmed) {
      onCustomDayNameChange?.(trimmed);
    }
    setEditing(false);
  }

  function handleClear() {
    onCustomDayNameChange?.(null);
    setEditing(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => shift(-1)}
          className={cn(
            'w-12 h-12 flex items-center justify-center rounded-xl text-2xl font-bold transition-colors',
            'bg-white border-2 border-warm-200 text-warm-600 hover:bg-warm-50 active:bg-warm-100',
          )}
          aria-label="Previous day"
        >
          &lsaquo;
        </button>

        <span className="flex-1 text-center text-lg font-semibold text-warm-700">
          {displayDate}
        </span>

        {isAdmin && onCustomDayNameChange && !editing && (
          <button
            onClick={handleStartEdit}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-warm-400 hover:text-warm-600 hover:bg-warm-50 transition-colors"
            aria-label="Edit day name"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
            </svg>
          </button>
        )}

        <button
          onClick={() => shift(1)}
          className={cn(
            'w-12 h-12 flex items-center justify-center rounded-xl text-2xl font-bold transition-colors',
            'bg-white border-2 border-warm-200 text-warm-600 hover:bg-warm-50 active:bg-warm-100',
          )}
          aria-label="Next day"
        >
          &rsaquo;
        </button>

        {!viewing && (
          <button
            onClick={() => {
              const t = new Date();
              const y = t.getFullYear();
              const m = String(t.getMonth() + 1).padStart(2, '0');
              const d = String(t.getDate()).padStart(2, '0');
              onDateChange(`${y}-${m}-${d}`);
            }}
            className={cn(
              'px-4 py-2 rounded-xl text-base font-semibold transition-colors min-h-[48px]',
              'bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700',
            )}
          >
            Today
          </button>
        )}
      </div>

      {/* Admin inline edit */}
      {editing && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder="Custom day name..."
            className="flex-1 px-3 py-2 text-base rounded-xl border-2 border-warm-200 bg-white focus:outline-none focus:border-warm-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
          <button
            onClick={handleSave}
            disabled={!editValue.trim()}
            className="px-4 py-2 bg-teal-500 text-white rounded-xl font-semibold text-base hover:bg-teal-600 disabled:opacity-50 min-h-[44px]"
          >
            Save
          </button>
          {customDayName && (
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-warm-100 text-warm-600 rounded-xl font-semibold text-base hover:bg-warm-200 min-h-[44px]"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-2 text-warm-400 hover:text-warm-600 font-semibold text-base min-h-[44px]"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

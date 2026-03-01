import { formatDateString, isToday } from '../../utils/date';
import { cn } from '../../utils/cn';

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
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

  return (
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
        {formatDateString(selectedDate)}
      </span>

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
  );
}

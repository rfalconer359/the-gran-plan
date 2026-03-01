import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { getSchedules, assignScheduleToDay, clearDayScheduleAssignment } from '../../services/schedules';
import type { Schedule } from '../../types';
import { cn } from '../../utils/cn';

interface SchedulePickerProps {
  familyId: string;
  childId: string;
  date: string;
  currentScheduleId?: string;
  onScheduleSelected: (schedule: Schedule | null) => void;
  onClose: () => void;
}

const dayTypeLabels: Record<string, string> = {
  weekday: 'Weekday',
  weekend: 'Weekend',
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export function SchedulePicker({
  familyId,
  childId,
  date,
  currentScheduleId,
  onScheduleSelected,
  onClose,
}: SchedulePickerProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSchedules(familyId, childId).then((s) => {
      setSchedules(s);
      setLoading(false);
    });
  }, [familyId, childId]);

  async function handleSelect(schedule: Schedule) {
    setSaving(true);
    try {
      await assignScheduleToDay(familyId, childId, date, schedule.id);
      onScheduleSelected(schedule);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    try {
      await clearDayScheduleAssignment(familyId, childId, date);
      onScheduleSelected(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl p-6 pb-8 max-h-[80vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-warm-700">Assign Schedule</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-warm-100 text-warm-500 hover:bg-warm-200 text-xl"
          >
            &times;
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : schedules.length === 0 ? (
          <p className="text-center text-warm-500 py-8 text-lg">
            No schedules created yet. Create one first.
          </p>
        ) : (
          <div className="space-y-3">
            {schedules.map((s) => {
              const isActive = s.id === currentScheduleId;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelect(s)}
                  disabled={saving}
                  className={cn(
                    'w-full text-left p-5 rounded-2xl border-2 transition-all',
                    isActive
                      ? 'border-teal-400 bg-teal-50 ring-2 ring-teal-300'
                      : 'border-warm-100 bg-white hover:border-warm-200',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-semibold text-warm-800">{s.name}</p>
                      <p className="text-warm-500 mt-1">
                        {s.entries.length} {s.entries.length === 1 ? 'activity' : 'activities'}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-warm-100 text-warm-600 rounded-lg text-sm font-medium">
                      {dayTypeLabels[s.dayType] || s.dayType}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {currentScheduleId && (
            <Button
              variant="outline"
              onClick={handleRemove}
              loading={saving}
              className="flex-1"
            >
              Remove Assignment
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

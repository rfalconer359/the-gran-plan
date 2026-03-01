import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFamily } from '../contexts/FamilyContext';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { getSchedules } from '../services/schedules';
import { getChild } from '../services/children';
import type { Schedule, Child } from '../types';
import { categoryConfig } from '../utils/categories';
import { cn } from '../utils/cn';

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}

const dayTypeLabels: Record<string, string> = {
  weekday: 'Weekdays',
  weekend: 'Weekends',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export function ScheduleViewPage() {
  const { childId, scheduleId } = useParams<{ childId: string; scheduleId: string }>();
  const { profile } = useAuth();
  const { family } = useFamily();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!family || !childId || !scheduleId) return;

    Promise.all([
      getChild(family.id, childId),
      getSchedules(family.id, childId),
    ]).then(([c, schedules]) => {
      setChild(c);
      const found = schedules.find((s) => s.id === scheduleId);
      setSchedule(found || null);
      setLoading(false);
    });
  }, [family, childId, scheduleId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!schedule) {
    return <Alert variant="error">Schedule not found.</Alert>;
  }

  const sortedEntries = [...schedule.entries].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-warm-700">{schedule.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            {child && (
              <Link
                to={`/children/${childId}`}
                className="text-lg text-warm-500 hover:text-warm-700 transition-colors"
              >
                {child.name}
              </Link>
            )}
            <span className="px-3 py-1 bg-warm-100 text-warm-600 rounded-lg text-sm font-medium capitalize">
              {dayTypeLabels[schedule.dayType] || schedule.dayType}
            </span>
          </div>
        </div>
        {profile?.role === 'parent' && (
          <Link to={`/children/${childId}/schedules/${scheduleId}`}>
            <Button variant="outline">Edit Schedule</Button>
          </Link>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {sortedEntries.map((entry, index) => {
          const cat = categoryConfig[entry.category];
          const isLast = index === sortedEntries.length - 1;

          return (
            <div key={entry.id} className="flex gap-4">
              {/* Time column */}
              <div className="w-20 flex-shrink-0 text-right pt-4">
                <span className="text-lg font-bold text-warm-700">
                  {formatTime(entry.time)}
                </span>
              </div>

              {/* Timeline connector */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={cn(
                    'w-3 h-3 rounded-full mt-5 flex-shrink-0 ring-2 ring-white',
                    cat.bgColor.replace('bg-', 'bg-').replace('-100', '-400'),
                    // Fallback solid color
                    'bg-warm-400',
                  )}
                  style={{
                    backgroundColor: getAccentColor(entry.category),
                  }}
                />
                {!isLast && (
                  <div className="w-0.5 flex-1 bg-warm-200 min-h-4" />
                )}
              </div>

              {/* Content */}
              <div
                className={cn(
                  'flex-1 mb-3 p-4 rounded-xl border-l-4 bg-white shadow-sm',
                  cat.borderColor,
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="font-semibold text-warm-800 text-lg">
                    {entry.activity}
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-md text-xs font-medium ml-auto',
                      cat.bgColor,
                      cat.textColor,
                    )}
                  >
                    {cat.label}
                  </span>
                </div>
                {entry.details && (
                  <p className="text-warm-500 mt-1 ml-8">{entry.details}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer actions */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="ghost"
          onClick={() => navigate(`/children/${childId}`)}
        >
          Back to {child?.name || 'Child'}
        </Button>
      </div>
    </div>
  );
}

function getAccentColor(category: string): string {
  const colors: Record<string, string> = {
    meal: '#f97316',
    milk: '#f59e0b',
    nap: '#6366f1',
    sleep: '#8b5cf6',
    walk: '#22c55e',
    play: '#ec4899',
    bath: '#06b6d4',
    tummytime: '#84cc16',
    other: '#6b7280',
  };
  return colors[category] || colors.other;
}

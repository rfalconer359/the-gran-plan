import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFamily } from '../contexts/FamilyContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { Spinner } from '../components/ui/Spinner';
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedules,
} from '../services/schedules';
import { getChild } from '../services/children';
import type { ScheduleEntry, ScheduleCategory, DayType, Child } from '../types';
import { categoryConfig } from '../utils/categories';
import { cn } from '../utils/cn';
import { scheduleTemplates, type ScheduleTemplate } from '../data/scheduleTemplates';

const dayTypeOptions: { value: DayType; label: string }[] = [
  { value: 'weekday', label: 'Weekdays' },
  { value: 'weekend', label: 'Weekends' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const categories: ScheduleCategory[] = [
  'meal', 'milk', 'nap', 'sleep', 'walk', 'play', 'bath', 'tummytime', 'other',
];

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export function ScheduleEditorPage() {
  const { childId, scheduleId } = useParams<{ childId: string; scheduleId: string }>();
  const { user } = useAuth();
  const { family } = useFamily();
  const navigate = useNavigate();
  const isEditing = scheduleId && scheduleId !== 'new';

  const [child, setChild] = useState<Child | null>(null);
  const [scheduleName, setScheduleName] = useState('');
  const [dayType, setDayType] = useState<DayType>('weekday');
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!!isEditing);
  const [saving, setSaving] = useState(false);
  const [templatePicked, setTemplatePicked] = useState(!!isEditing);

  useEffect(() => {
    if (!family || !childId) return;

    getChild(family.id, childId).then(setChild);

    if (isEditing) {
      getSchedules(family.id, childId).then((schedules) => {
        const schedule = schedules.find((s) => s.id === scheduleId);
        if (schedule) {
          setScheduleName(schedule.name);
          setDayType(schedule.dayType);
          setEntries([...schedule.entries].sort((a, b) => a.order - b.order));
        }
        setLoading(false);
      });
    }
  }, [family, childId, scheduleId, isEditing]);

  function addEntryAt(position: 'top' | 'bottom' | number) {
    const newEntry: ScheduleEntry = {
      id: generateId(),
      time: '08:00',
      activity: '',
      details: '',
      category: 'other',
      order: 0,
    };

    setEntries((prev) => {
      let updated: ScheduleEntry[];
      if (position === 'top') {
        updated = [newEntry, ...prev];
      } else if (position === 'bottom') {
        updated = [...prev, newEntry];
      } else {
        updated = [...prev.slice(0, position + 1), newEntry, ...prev.slice(position + 1)];
      }
      return updated.map((e, i) => ({ ...e, order: i }));
    });
  }

  function updateEntry(id: string, field: keyof ScheduleEntry, value: string | number) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  }

  function removeEntry(id: string) {
    setEntries((prev) =>
      prev.filter((e) => e.id !== id).map((e, i) => ({ ...e, order: i })),
    );
  }

  function moveEntry(index: number, direction: 'up' | 'down') {
    setEntries((prev) => {
      const arr = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= arr.length) return prev;
      [arr[index], arr[targetIndex]] = [arr[targetIndex], arr[index]];
      return arr.map((e, i) => ({ ...e, order: i }));
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!family || !childId || !user) return;
    if (entries.length === 0) {
      setError('Add at least one activity.');
      return;
    }
    setError('');
    setSaving(true);

    try {
      const orderedEntries = entries.map((e, i) => ({ ...e, order: i }));

      if (isEditing) {
        await updateSchedule(family.id, childId, scheduleId!, {
          name: scheduleName,
          dayType,
          entries: orderedEntries,
        });
      } else {
        await createSchedule(family.id, childId, {
          childId,
          name: scheduleName,
          dayType,
          entries: orderedEntries,
          createdBy: user.uid,
        });
      }
      navigate(`/children/${childId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save schedule.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!family || !childId || !scheduleId) return;
    if (!window.confirm('Delete this schedule? This cannot be undone.')) return;
    await deleteSchedule(family.id, childId, scheduleId);
    navigate(`/children/${childId}`);
  }

  function applyTemplate(template: ScheduleTemplate) {
    setEntries(
      template.entries.map((e) => ({
        ...e,
        id: generateId(),
      })),
    );
    setScheduleName(template.name);
    setTemplatePicked(true);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!templatePicked) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-warm-700">
          Create Schedule
          {child && <span className="text-warm-400"> — {child.name}</span>}
        </h1>
        <p className="text-lg text-warm-500">
          Start from a template or build your schedule from scratch.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {scheduleTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => applyTemplate(template)}
              className="text-left p-5 bg-white rounded-2xl border-2 border-warm-200 hover:border-warm-400 hover:shadow-md transition-all"
            >
              <h3 className="text-xl font-bold text-warm-700">{template.name}</h3>
              <p className="text-warm-400 text-sm font-medium mt-1">{template.ageGroup}</p>
              <p className="text-warm-500 mt-2">{template.description}</p>
              <p className="text-teal-600 font-medium mt-3">
                {template.entries.length} activities
              </p>
            </button>
          ))}

          <button
            type="button"
            onClick={() => setTemplatePicked(true)}
            className="text-left p-5 bg-white rounded-2xl border-2 border-dashed border-warm-200 hover:border-warm-400 hover:shadow-md transition-all"
          >
            <h3 className="text-xl font-bold text-warm-700">Start from Scratch</h3>
            <p className="text-warm-500 mt-2">
              Build your own schedule with a blank canvas.
            </p>
            <p className="text-warm-400 font-medium mt-3">Empty schedule</p>
          </button>
        </div>

        <Button variant="ghost" onClick={() => navigate(`/children/${childId}`)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-warm-700">
        {isEditing ? 'Edit' : 'Create'} Schedule
        {child && <span className="text-warm-400"> — {child.name}</span>}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert variant="error">{error}</Alert>}

        <Card variant="elevated" padding="lg" className="space-y-5">
          <Input
            label="Schedule Name"
            value={scheduleName}
            onChange={(e) => setScheduleName(e.target.value)}
            placeholder="e.g. Regular Weekday Routine"
            required
          />

          <div>
            <label className="block text-lg font-medium text-warm-800 mb-2">
              Day Type
            </label>
            <select
              value={dayType}
              onChange={(e) => setDayType(e.target.value as DayType)}
              className="w-full px-4 py-3 text-lg rounded-xl border-2 border-warm-200 bg-white text-warm-900 focus:outline-none focus:border-warm-500 focus:ring-2 focus:ring-warm-200"
            >
              {dayTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Schedule Entries */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-warm-700">Activities</h2>
            <Button type="button" variant="outline" onClick={() => addEntryAt('bottom')}>
              + Add Activity
            </Button>
          </div>

          {entries.length === 0 && (
            <Card className="text-center py-8">
              <p className="text-warm-500 text-lg mb-4">
                No activities yet. Add your first one!
              </p>
              <Button type="button" onClick={() => addEntryAt('bottom')}>
                + Add Activity
              </Button>
            </Card>
          )}

          {entries.map((entry, index) => {
            const cat = categoryConfig[entry.category];
            return (
              <div key={entry.id}>
                <Card
                  className={cn('border-l-4', cat.borderColor)}
                  padding="sm"
                >
                  <div className="space-y-3">
                    {/* Row 1: Position, time, activity name */}
                    <div className="flex items-center gap-2">
                      <span className="text-warm-400 font-bold text-lg w-8 text-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <input
                        type="time"
                        value={entry.time}
                        onChange={(e) => updateEntry(entry.id, 'time', e.target.value)}
                        className="px-3 py-2 text-lg rounded-xl border-2 border-warm-200 bg-white focus:outline-none focus:border-warm-500"
                      />
                      <input
                        type="text"
                        value={entry.activity}
                        onChange={(e) => updateEntry(entry.id, 'activity', e.target.value)}
                        placeholder="Activity name"
                        className="flex-1 px-3 py-2 text-lg rounded-xl border-2 border-warm-200 bg-white focus:outline-none focus:border-warm-500"
                        required
                      />
                    </div>

                    {/* Row 2: Details */}
                    <input
                      type="text"
                      value={entry.details || ''}
                      onChange={(e) => updateEntry(entry.id, 'details', e.target.value)}
                      placeholder="Details (optional)"
                      className="w-full px-3 py-2 text-base rounded-xl border-2 border-warm-200 bg-white focus:outline-none focus:border-warm-500"
                    />

                    {/* Row 3: Category chips */}
                    <div className="flex flex-wrap gap-2">
                      {categories.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateEntry(entry.id, 'category', c)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                            entry.category === c
                              ? `${categoryConfig[c].bgColor} ${categoryConfig[c].textColor} ring-2 ring-offset-1 ring-current`
                              : 'bg-gray-50 text-gray-400 hover:bg-gray-100',
                          )}
                        >
                          {categoryConfig[c].emoji} {categoryConfig[c].label}
                        </button>
                      ))}
                    </div>

                    {/* Row 4: Move + delete controls — big tap targets */}
                    <div className="flex items-center gap-2 pt-1 border-t border-warm-100">
                      <button
                        type="button"
                        onClick={() => moveEntry(index, 'up')}
                        disabled={index === 0}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl text-base font-medium bg-warm-50 text-warm-600 hover:bg-warm-100 disabled:opacity-30 disabled:hover:bg-warm-50 transition-colors"
                      >
                        ▲ Move Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveEntry(index, 'down')}
                        disabled={index === entries.length - 1}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl text-base font-medium bg-warm-50 text-warm-600 hover:bg-warm-100 disabled:opacity-30 disabled:hover:bg-warm-50 transition-colors"
                      >
                        ▼ Move Down
                      </button>
                      <div className="flex-1" />
                      <button
                        type="button"
                        onClick={() => addEntryAt(index)}
                        className="px-4 py-2 rounded-xl text-base font-medium bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
                      >
                        + Insert Below
                      </button>
                      <button
                        type="button"
                        onClick={() => removeEntry(entry.id)}
                        className="px-4 py-2 rounded-xl text-base font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" size="lg" loading={saving}>
            {isEditing ? 'Save Changes' : 'Create Schedule'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate(`/children/${childId}`)}
          >
            Cancel
          </Button>
          {isEditing && (
            <Button type="button" variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFamily } from '../contexts/FamilyContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { DatePicker } from '../components/ui/DatePicker';
import { DayNotesSection } from '../components/gran/DayNotesSection';
import { SchedulePicker } from '../components/gran/SchedulePicker';
import { EntryNoteForm } from '../components/gran/EntryNoteForm';
import { getChildren } from '../services/children';
import {
  getSchedulesForDay,
  getScheduleById,
  getDayLog,
  toggleEntryCompletion,
} from '../services/schedules';
import { addNote } from '../services/notes';
import { getDayName, setDayName, clearDayName } from '../services/dayNames';
import { isAdmin } from '../config/admin';
import type { Child, Schedule, ScheduleEntry, DayNote } from '../types';
import { formatTime, getTodayString, getDayTypesForDate, getCurrentTimeSlot, isToday } from '../utils/date';
import { categoryConfig } from '../utils/categories';
import { cn } from '../utils/cn';

function findCurrentEntry(entries: ScheduleEntry[]): ScheduleEntry | null {
  const now = getCurrentTimeSlot();
  const sorted = [...entries].sort((a, b) => a.time.localeCompare(b.time));

  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].time <= now) {
      return sorted[i];
    }
  }
  return sorted.length > 0 ? sorted[0] : null;
}

export function DailyViewPage() {
  const { family } = useFamily();
  const { user, profile } = useAuth();
  const isParent = profile?.role === 'parent';
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [completedEntries, setCompletedEntries] = useState<string[]>([]);
  const [dayNotes, setDayNotes] = useState<DayNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickNote, setQuickNote] = useState('');
  const [noteSent, setNoteSent] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [expandedNoteEntryId, setExpandedNoteEntryId] = useState<string | null>(null);
  const [customDayName, setCustomDayName] = useState<string | null>(null);

  const dayTypes = getDayTypesForDate(selectedDate);
  const viewingToday = isToday(selectedDate);

  // Filter notes: day-level vs per-entry
  const dayLevelNotes = useMemo(
    () => dayNotes.filter((n) => !n.entryId),
    [dayNotes],
  );

  const notesByEntryId = useMemo(() => {
    const map: Record<string, DayNote[]> = {};
    for (const note of dayNotes) {
      if (note.entryId) {
        if (!map[note.entryId]) map[note.entryId] = [];
        map[note.entryId].push(note);
      }
    }
    return map;
  }, [dayNotes]);

  useEffect(() => {
    if (!family) {
      setLoading(false);
      return;
    }
    getChildren(family.id).then((kids) => {
      setChildren(kids);
      if (kids.length > 0) setSelectedChild(kids[0]);
      setLoading(false);
    });
  }, [family]);

  // Fetch custom day name whenever date changes
  useEffect(() => {
    let cancelled = false;
    getDayName(selectedDate).then((dn) => {
      if (!cancelled) setCustomDayName(dn?.name ?? null);
    });
    return () => { cancelled = true; };
  }, [selectedDate]);

  // Priority cascade: DayLog pin -> child default -> dayType match -> null
  useEffect(() => {
    if (!family || !selectedChild) return;

    let cancelled = false;

    async function loadScheduleWithPriority() {
      const log = await getDayLog(family!.id, selectedChild!.id, selectedDate);
      const completed = log?.completedEntries || [];
      const notes = log?.dayNotes || [];

      if (cancelled) return;
      setCompletedEntries(completed);
      setDayNotes(notes);

      // 1. Pinned schedule from DayLog
      if (log?.scheduleId) {
        const pinned = await getScheduleById(family!.id, selectedChild!.id, log.scheduleId);
        if (!cancelled) {
          setSchedule(pinned);
          return;
        }
      }

      // 2. Default schedule from child
      if (selectedChild!.defaultScheduleId) {
        const defaultSched = await getScheduleById(
          family!.id,
          selectedChild!.id,
          selectedChild!.defaultScheduleId,
        );
        if (!cancelled) {
          setSchedule(defaultSched);
          if (defaultSched) return;
        }
      }

      // 3. Day type match fallback
      const matched = await getSchedulesForDay(family!.id, selectedChild!.id, dayTypes);
      if (!cancelled) {
        setSchedule(matched.length > 0 ? matched[0] : null);
      }
    }

    loadScheduleWithPriority();

    return () => {
      cancelled = true;
    };
  }, [family, selectedChild, selectedDate]);

  const handleToggle = useCallback(
    async (entryId: string) => {
      if (!family || !selectedChild || !schedule) return;
      const newCompleted = await toggleEntryCompletion(
        family.id,
        selectedChild.id,
        selectedDate,
        schedule.id,
        entryId,
      );
      setCompletedEntries(newCompleted);
    },
    [family, selectedChild, schedule, selectedDate],
  );

  function handleScheduleSelected(newSchedule: Schedule | null) {
    setSchedule(newSchedule);
    setShowSchedulePicker(false);
    // Reset completion state when schedule changes
    if (!newSchedule || newSchedule.id !== schedule?.id) {
      setCompletedEntries([]);
    }
  }

  async function handleCustomDayNameChange(name: string | null) {
    if (!user) return;
    if (name) {
      await setDayName(selectedDate, name, user.uid);
      setCustomDayName(name);
    } else {
      await clearDayName(selectedDate);
      setCustomDayName(null);
    }
  }

  async function handleSendNote() {
    if (!family || !user || !profile || !quickNote.trim()) return;
    await addNote(family.id, user.uid, profile.displayName, profile.role, quickNote.trim());
    setQuickNote('');
    setNoteSent(true);
    setTimeout(() => setNoteSent(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-5xl block mb-4">👶</span>
        <p className="text-xl text-warm-500">No children in the family yet.</p>
        <p className="text-warm-400 mt-2">Ask the parents to add their children.</p>
      </div>
    );
  }

  const currentEntry = schedule && viewingToday ? findCurrentEntry(schedule.entries) : null;
  const sortedEntries = schedule
    ? [...schedule.entries].sort((a, b) => a.order - b.order)
    : [];
  const doneCount = completedEntries.length;
  const totalCount = sortedEntries.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-warm-700">
          {viewingToday ? "Today's Plan" : 'Daily Plan'}
        </h1>
        <div className="flex gap-2">
          {isParent && schedule && selectedChild && (
            <Link
              to={`/children/${selectedChild.id}/schedules/${schedule.id}`}
              className="px-4 py-3 bg-warm-100 text-warm-700 rounded-xl font-bold text-lg hover:bg-warm-200 transition-colors"
            >
              Edit Schedule
            </Link>
          )}
          {!isParent && (
            <button
              onClick={() => setShowEmergency(!showEmergency)}
              className="px-4 py-3 bg-red-100 text-red-700 rounded-xl font-bold text-lg hover:bg-red-200 transition-colors"
            >
              Emergency
            </button>
          )}
        </div>
      </div>

      {/* Date Navigation */}
      <DatePicker
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        customDayName={customDayName}
        isAdmin={isAdmin(user?.uid)}
        onCustomDayNameChange={handleCustomDayNameChange}
      />

      {/* Schedule name + change link (parent-only) */}
      {schedule && (
        <div className="flex items-center gap-3">
          <span className="text-lg text-warm-500">
            Schedule: <span className="font-semibold text-warm-700">{schedule.name}</span>
          </span>
          {isParent && (
            <button
              onClick={() => setShowSchedulePicker(true)}
              className="text-teal-600 font-semibold hover:text-teal-700 text-base"
            >
              Change
            </button>
          )}
        </div>
      )}

      {/* Emergency Info Panel */}
      {showEmergency && selectedChild && (
        <Card className="border-red-300 border-2 bg-red-50">
          <h2 className="text-xl font-bold text-red-700 mb-3">
            Emergency Info — {selectedChild.name}
          </h2>
          {selectedChild.allergies.length > 0 && (
            <div className="mb-3">
              <p className="font-semibold text-red-700 mb-1">Allergies:</p>
              <div className="flex flex-wrap gap-2">
                {selectedChild.allergies.map((a) => (
                  <span key={a} className="px-3 py-1 bg-red-200 text-red-800 rounded-lg font-bold text-lg">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
          {selectedChild.emergencyContacts.map((contact, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl mb-2">
              <div>
                <p className="font-bold text-warm-800 text-lg">{contact.name}</p>
                <p className="text-warm-500">{contact.relationship}</p>
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold text-xl hover:bg-red-600 transition-colors"
              >
                CALL
              </a>
            </div>
          ))}
          {selectedChild.doctorPhone && (
            <div className="flex items-center justify-between p-3 bg-white rounded-xl">
              <div>
                <p className="font-bold text-warm-800 text-lg">
                  {selectedChild.doctorName || 'Doctor'}
                </p>
              </div>
              <a
                href={`tel:${selectedChild.doctorPhone}`}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold text-xl hover:bg-blue-600 transition-colors"
              >
                CALL
              </a>
            </div>
          )}
        </Card>
      )}

      {/* Child selector (if multiple) */}
      {children.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={cn(
                'px-5 py-3 rounded-xl font-semibold text-lg whitespace-nowrap transition-colors',
                selectedChild?.id === child.id
                  ? 'bg-teal-500 text-white'
                  : 'bg-white text-warm-600 border-2 border-warm-200 hover:border-warm-300',
              )}
            >
              {child.name}
            </button>
          ))}
        </div>
      )}

      {/* "Right Now" banner — only when viewing today */}
      {viewingToday && currentEntry && !completedEntries.includes(currentEntry.id) && (
        <Card className="bg-teal-50 border-2 border-teal-300">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-sm font-bold uppercase tracking-wider text-teal-600">
              Right Now
            </span>
            <span className="w-3 h-3 bg-teal-500 rounded-full animate-pulse" />
          </div>
          <p className="text-2xl font-bold text-teal-800">
            {categoryConfig[currentEntry.category].emoji} {currentEntry.activity}
          </p>
          {currentEntry.details && (
            <p className="text-lg text-teal-600 mt-1">{currentEntry.details}</p>
          )}
          <p className="text-teal-500 mt-1">{formatTime(currentEntry.time)}</p>
        </Card>
      )}

      {/* Progress */}
      {schedule && (
        <div className="bg-white rounded-xl p-4 border border-warm-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold text-warm-700">Progress</span>
            <span className="text-lg font-bold text-warm-600">
              {doneCount} of {totalCount} done
            </span>
          </div>
          <div className="w-full h-4 bg-warm-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : '0%' }}
            />
          </div>
        </div>
      )}

      {/* Schedule Checklist */}
      {!schedule ? (
        <Card className="text-center py-8">
          <span className="text-5xl block mb-4">📋</span>
          <p className="text-xl text-warm-500">No schedule for this day.</p>
          {isParent && selectedChild ? (
            <div className="flex flex-col items-center gap-3 mt-3">
              <button
                onClick={() => setShowSchedulePicker(true)}
                className="px-6 py-3 bg-teal-500 text-white rounded-xl font-semibold text-lg hover:bg-teal-600 transition-colors"
              >
                Assign Schedule
              </button>
              <Link
                to={`/children/${selectedChild.id}/schedules/new`}
                className="text-warm-500 hover:text-warm-600 font-medium"
              >
                or create a new schedule
              </Link>
            </div>
          ) : (
            <p className="text-warm-400 mt-2">Ask the parents to assign one.</p>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedEntries.map((entry) => {
            const isDone = completedEntries.includes(entry.id);
            const isCurrent = viewingToday && currentEntry?.id === entry.id && !isDone;
            const cat = categoryConfig[entry.category];
            const entryNotes = notesByEntryId[entry.id] || [];
            const noteCount = entryNotes.length;
            const isExpanded = expandedNoteEntryId === entry.id;

            return (
              <div key={entry.id}>
                <div
                  className={cn(
                    'w-full text-left p-5 rounded-2xl border-2 transition-all',
                    isDone
                      ? 'bg-green-50 border-green-200 opacity-75'
                      : isCurrent
                        ? 'bg-teal-50 border-teal-300 shadow-md'
                        : 'bg-white border-warm-100 hover:border-warm-200',
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox — toggle completion */}
                    <button
                      onClick={() => handleToggle(entry.id)}
                      className={cn(
                        'w-10 h-10 rounded-full border-3 flex items-center justify-center flex-shrink-0 mt-1 text-xl transition-colors',
                        isDone
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-warm-300 hover:border-warm-400',
                      )}
                    >
                      {isDone ? '✓' : ''}
                    </button>

                    {/* Entry content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-warm-500 font-medium">
                          {formatTime(entry.time)}
                        </span>
                        <span className={cn('px-2 py-0.5 rounded-lg text-sm font-medium', cat.bgColor, cat.textColor)}>
                          {cat.emoji} {cat.label}
                        </span>
                      </div>
                      <p
                        className={cn(
                          'text-xl font-semibold',
                          isDone ? 'line-through text-warm-400' : 'text-warm-800',
                        )}
                      >
                        {entry.activity}
                      </p>
                      {entry.details && (
                        <p className={cn('text-lg mt-1', isDone ? 'text-warm-300' : 'text-warm-500')}>
                          {entry.details}
                        </p>
                      )}
                    </div>

                    {/* Note icon button */}
                    <button
                      onClick={() => setExpandedNoteEntryId(isExpanded ? null : entry.id)}
                      className={cn(
                        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors relative mt-1',
                        isExpanded
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-warm-50 text-warm-400 hover:bg-warm-100 hover:text-warm-600',
                      )}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0110 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.102 41.102 0 01-3.55.414c-.28.02-.521.18-.643.413l-1.712 3.293a.75.75 0 01-1.33 0l-1.713-3.293a.783.783 0 00-.642-.413 41.108 41.108 0 01-3.55-.414C1.993 13.245 1 11.986 1 10.574V5.426c0-1.413.993-2.67 2.43-2.902z" clipRule="evenodd" />
                      </svg>
                      {noteCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {noteCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded entry note form */}
                {isExpanded && family && selectedChild && (
                  <EntryNoteForm
                    familyId={family.id}
                    childId={selectedChild.id}
                    date={selectedDate}
                    scheduleId={schedule.id}
                    entryId={entry.id}
                    notes={entryNotes}
                    onNoteAdded={(note) => setDayNotes((prev) => [...prev, note])}
                    onNoteDeleted={(noteId) => setDayNotes((prev) => prev.filter((n) => n.id !== noteId))}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Day Notes */}
      {family && selectedChild && (
        <DayNotesSection
          familyId={family.id}
          childId={selectedChild.id}
          date={selectedDate}
          scheduleId={schedule?.id || ''}
          dayNotes={dayLevelNotes}
          onNoteAdded={(note) => setDayNotes((prev) => [...prev, note])}
          onNoteDeleted={(noteId) => setDayNotes((prev) => prev.filter((n) => n.id !== noteId))}
        />
      )}

      {/* Quick Note */}
      <Card>
        <h2 className="text-xl font-bold text-warm-700 mb-3">Send a Quick Note</h2>
        {noteSent && (
          <Alert variant="success" className="mb-3">
            Note sent!
          </Alert>
        )}
        <div className="flex gap-3">
          <input
            type="text"
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            placeholder={isParent ? "Type a message to the family..." : "Type a message to the parents..."}
            className="flex-1 px-4 py-3 text-lg rounded-xl border-2 border-warm-200 bg-white focus:outline-none focus:border-warm-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendNote();
            }}
          />
          <Button onClick={handleSendNote} disabled={!quickNote.trim()}>
            Send
          </Button>
        </div>
      </Card>

      {/* Schedule Picker overlay */}
      {showSchedulePicker && family && selectedChild && (
        <SchedulePicker
          familyId={family.id}
          childId={selectedChild.id}
          date={selectedDate}
          currentScheduleId={schedule?.id}
          onScheduleSelected={handleScheduleSelected}
          onClose={() => setShowSchedulePicker(false)}
        />
      )}
    </div>
  );
}

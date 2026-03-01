import { useEffect, useState, useCallback } from 'react';
import { useFamily } from '../contexts/FamilyContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { DatePicker } from '../components/ui/DatePicker';
import { DayNotesSection } from '../components/gran/DayNotesSection';
import { getChildren } from '../services/children';
import { getSchedulesForDay, getDayLog, toggleEntryCompletion } from '../services/schedules';
import { addNote } from '../services/notes';
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

export function GranViewPage() {
  const { family } = useFamily();
  const { user, profile } = useAuth();
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

  const dayTypes = getDayTypesForDate(selectedDate);
  const viewingToday = isToday(selectedDate);

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

  useEffect(() => {
    if (!family || !selectedChild) return;
    async function loadSchedule() {
      const schedules = await getSchedulesForDay(family!.id, selectedChild!.id, dayTypes);
      if (schedules.length > 0) {
        setSchedule(schedules[0]);
        const log = await getDayLog(family!.id, selectedChild!.id, selectedDate);
        setCompletedEntries(log?.completedEntries || []);
        setDayNotes(log?.dayNotes || []);
      } else {
        setSchedule(null);
        setCompletedEntries([]);
        setDayNotes([]);
      }
    }
    loadSchedule();
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
        <button
          onClick={() => setShowEmergency(!showEmergency)}
          className="px-4 py-3 bg-red-100 text-red-700 rounded-xl font-bold text-lg hover:bg-red-200 transition-colors"
        >
          🆘 Emergency
        </button>
      </div>

      {/* Date Navigation */}
      <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Emergency Info Panel */}
      {showEmergency && selectedChild && (
        <Card className="border-red-300 border-2 bg-red-50">
          <h2 className="text-xl font-bold text-red-700 mb-3">
            Emergency Info — {selectedChild.name}
          </h2>
          {selectedChild.allergies.length > 0 && (
            <div className="mb-3">
              <p className="font-semibold text-red-700 mb-1">⚠️ Allergies:</p>
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
                📞 CALL
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
                🏥 CALL
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
          <p className="text-warm-400 mt-2">Ask the parents to create one.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedEntries.map((entry) => {
            const isDone = completedEntries.includes(entry.id);
            const isCurrent = viewingToday && currentEntry?.id === entry.id && !isDone;
            const cat = categoryConfig[entry.category];

            return (
              <button
                key={entry.id}
                onClick={() => handleToggle(entry.id)}
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
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full border-3 flex items-center justify-center flex-shrink-0 mt-1 text-xl',
                      isDone
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-warm-300',
                    )}
                  >
                    {isDone ? '✓' : ''}
                  </div>
                  <div className="flex-1">
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
                </div>
              </button>
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
          dayNotes={dayNotes}
          onNoteAdded={(note) => setDayNotes((prev) => [...prev, note])}
          onNoteDeleted={(noteId) => setDayNotes((prev) => prev.filter((n) => n.id !== noteId))}
        />
      )}

      {/* Quick Note */}
      <Card>
        <h2 className="text-xl font-bold text-warm-700 mb-3">💬 Send a Quick Note</h2>
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
            placeholder="Type a message to the parents..."
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
    </div>
  );
}

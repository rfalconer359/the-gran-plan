import { useState, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { PhotoLightbox } from '../ui/PhotoLightbox';
import { addDayNote, deleteDayNote } from '../../services/dayNotes';
import { useAuth } from '../../contexts/AuthContext';
import { relativeTime } from '../../utils/date';
import type { DayNote } from '../../types';

interface DayNotesSectionProps {
  familyId: string;
  childId: string;
  date: string;
  scheduleId: string;
  dayNotes: DayNote[];
  onNoteAdded: (note: DayNote) => void;
  onNoteDeleted: (noteId: string) => void;
}

export function DayNotesSection({
  familyId,
  childId,
  date,
  scheduleId,
  dayNotes,
  onNoteAdded,
  onNoteDeleted,
}: DayNotesSectionProps) {
  const { user, profile } = useAuth();
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    const added = Array.from(newFiles);
    setFiles((prev) => [...prev, ...added]);
    setPreviews((prev) => [...prev, ...added.map((f) => URL.createObjectURL(f))]);
  }

  function removeFile(i: number) {
    URL.revokeObjectURL(previews[i]);
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    if (!user || !profile || (!text.trim() && files.length === 0)) return;
    setSaving(true);
    try {
      const note = await addDayNote(
        familyId,
        childId,
        date,
        scheduleId,
        text.trim(),
        user.uid,
        profile.displayName,
        files,
      );
      onNoteAdded(note);
      setText('');
      previews.forEach((p) => URL.revokeObjectURL(p));
      setFiles([]);
      setPreviews([]);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId: string) {
    await deleteDayNote(familyId, childId, date, noteId);
    onNoteDeleted(noteId);
  }

  return (
    <Card>
      <h2 className="text-xl font-bold text-warm-700 mb-4">Day Notes</h2>

      {/* Existing notes */}
      {dayNotes.length > 0 && (
        <div className="space-y-3 mb-4">
          {dayNotes.map((note) => (
            <div
              key={note.id}
              className="p-4 bg-cream-50 rounded-xl border border-warm-100"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-warm-700">{note.authorName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-warm-400">{relativeTime(note.createdAt)}</span>
                  {user?.uid === note.authorId && (
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-sm text-red-400 hover:text-red-600 font-medium"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              {note.text && <p className="text-lg text-warm-800 mb-2">{note.text}</p>}
              {note.photoUrls.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {note.photoUrls.map((url, i) => (
                    <button
                      key={url}
                      onClick={() => setLightbox({ urls: note.photoUrls, index: i })}
                      className="w-20 h-20 rounded-lg overflow-hidden border-2 border-warm-200 hover:border-teal-400 transition-colors"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New note form */}
      <div className="space-y-3">
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a note about the day..."
          className="min-h-[80px]"
        />

        {/* Photo previews */}
        {previews.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {previews.map((src, i) => (
              <div key={src} className="relative w-20 h-20">
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover rounded-lg border-2 border-warm-200"
                />
                <button
                  onClick={() => removeFile(i)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm font-bold flex items-center justify-center"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Add Photos
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={!text.trim() && files.length === 0}
          >
            Save Note
          </Button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <PhotoLightbox
          photoUrls={lightbox.urls}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </Card>
  );
}

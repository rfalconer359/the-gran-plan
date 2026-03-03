import { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { PhotoLightbox } from '../ui/PhotoLightbox';
import { addDayNote, deleteDayNote } from '../../services/dayNotes';
import { useAuth } from '../../contexts/AuthContext';
import { relativeTime } from '../../utils/date';
import type { DayNote } from '../../types';

interface EntryNoteFormProps {
  familyId: string;
  childId: string;
  date: string;
  scheduleId: string;
  entryId: string;
  notes: DayNote[];
  onNoteAdded: (note: DayNote) => void;
  onNoteDeleted: (noteId: string) => void;
}

export function EntryNoteForm({
  familyId,
  childId,
  date,
  scheduleId,
  entryId,
  notes,
  onNoteAdded,
  onNoteDeleted,
}: EntryNoteFormProps) {
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
        entryId,
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
    <div className="mt-3 ml-14 space-y-3">
      {/* Existing notes for this entry */}
      {notes.map((note) => (
        <div
          key={note.id}
          className="p-3 bg-cream-50 rounded-xl border border-warm-100"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-warm-700 text-base">{note.authorName}</span>
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
          {note.text && <p className="text-lg text-warm-800 mb-1">{note.text}</p>}
          {note.photoUrls.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {note.photoUrls.map((url, i) => (
                <button
                  key={url}
                  onClick={() => setLightbox({ urls: note.photoUrls, index: i })}
                  className="w-16 h-16 rounded-lg overflow-hidden border-2 border-warm-200 hover:border-teal-400 transition-colors"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Add note form */}
      <div className="space-y-2">
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note about this activity..."
          className="min-h-[60px] text-base"
        />

        {previews.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {previews.map((src, i) => (
              <div key={src} className="relative w-16 h-16">
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover rounded-lg border-2 border-warm-200"
                />
                <button
                  onClick={() => removeFile(i)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Photo
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            loading={saving}
            disabled={!text.trim() && files.length === 0}
          >
            Save
          </Button>
        </div>
      </div>

      {lightbox && (
        <PhotoLightbox
          photoUrls={lightbox.urls}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

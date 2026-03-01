import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFamily } from '../contexts/FamilyContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { getNotes, addNote, deleteNote } from '../services/notes';
import type { Note } from '../types';

export function NotesPage() {
  const { user, profile } = useAuth();
  const { family } = useFamily();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!family) {
      setLoading(false);
      return;
    }
    getNotes(family.id).then(setNotes).finally(() => setLoading(false));
  }, [family]);

  async function handleSend() {
    if (!family || !user || !profile || !newNote.trim()) return;
    setSending(true);
    try {
      const note = await addNote(
        family.id,
        user.uid,
        profile.displayName,
        profile.role,
        newNote.trim(),
      );
      setNotes((prev) => [note, ...prev]);
      setNewNote('');
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(noteId: string) {
    if (!family) return;
    await deleteNote(family.id, noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-warm-700">Notes</h1>

      {/* Compose */}
      <Card variant="elevated">
        <div className="space-y-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a note for the family..."
            className="w-full px-4 py-3 text-lg rounded-xl border-2 border-warm-200 bg-white focus:outline-none focus:border-warm-500 min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button onClick={handleSend} loading={sending} disabled={!newNote.trim()}>
              Send Note
            </Button>
          </div>
        </div>
      </Card>

      {/* Notes list */}
      {notes.length === 0 ? (
        <Card className="text-center py-8">
          <span className="text-5xl block mb-4">💬</span>
          <p className="text-xl text-warm-500">No notes yet.</p>
          <p className="text-warm-400 mt-2">Share updates with the family!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-warm-700">{note.authorName}</span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                        note.authorRole === 'parent'
                          ? 'bg-warm-100 text-warm-600'
                          : 'bg-teal-100 text-teal-600',
                      )}
                    >
                      {note.authorRole}
                    </span>
                  </div>
                  <p className="text-lg text-warm-800">{note.content}</p>
                  {note.createdAt && (
                    <p className="text-sm text-warm-400 mt-2">
                      {note.createdAt.toDate?.()
                        ? note.createdAt.toDate().toLocaleString()
                        : ''}
                    </p>
                  )}
                </div>
                {note.authorId === user?.uid && (
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-warm-300 hover:text-red-500 text-lg p-1"
                    title="Delete note"
                  >
                    ✕
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

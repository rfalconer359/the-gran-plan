import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { compressImage } from '../utils/imageCompression';
import type { DayNote } from '../types';

export async function uploadDayNotePhoto(
  familyId: string,
  childId: string,
  date: string,
  noteId: string,
  file: File,
): Promise<string> {
  const path = `families/${familyId}/children/${childId}/dayLogs/${date}/${noteId}/${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function addDayNote(
  familyId: string,
  childId: string,
  date: string,
  scheduleId: string,
  text: string,
  authorId: string,
  authorName: string,
  files: File[],
): Promise<DayNote> {
  const noteId = crypto.randomUUID();

  // Compress and upload photos
  const photoUrls: string[] = [];
  for (const file of files) {
    const compressed = await compressImage(file);
    const url = await uploadDayNotePhoto(familyId, childId, date, noteId, compressed);
    photoUrls.push(url);
  }

  const dayNote: DayNote = {
    id: noteId,
    text,
    photoUrls,
    authorId,
    authorName,
    createdAt: new Date().toISOString(),
  };

  const logRef = doc(db, 'families', familyId, 'children', childId, 'dayLogs', date);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(logRef);
    if (snap.exists()) {
      const existing = snap.data();
      transaction.update(logRef, {
        dayNotes: [...(existing.dayNotes || []), dayNote],
        updatedAt: serverTimestamp(),
      });
    } else {
      transaction.set(logRef, {
        id: date,
        childId,
        scheduleId,
        completedEntries: [],
        notes: [],
        dayNotes: [dayNote],
        updatedAt: serverTimestamp(),
      });
    }
  });

  return dayNote;
}

export async function deleteDayNote(
  familyId: string,
  childId: string,
  date: string,
  noteId: string,
): Promise<void> {
  const logRef = doc(db, 'families', familyId, 'children', childId, 'dayLogs', date);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(logRef);
    if (!snap.exists()) return;
    const existing = snap.data();
    const filtered = (existing.dayNotes || []).filter(
      (n: DayNote) => n.id !== noteId,
    );
    transaction.update(logRef, {
      dayNotes: filtered,
      updatedAt: serverTimestamp(),
    });
  });
}

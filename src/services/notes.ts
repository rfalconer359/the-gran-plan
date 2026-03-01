import {
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Note, UserRole } from '../types';

export async function addNote(
  familyId: string,
  authorId: string,
  authorName: string,
  authorRole: UserRole,
  content: string,
): Promise<Note> {
  const noteRef = doc(collection(db, 'families', familyId, 'notes'));
  const note = {
    id: noteRef.id,
    familyId,
    authorId,
    authorName,
    authorRole,
    content,
    createdAt: serverTimestamp(),
  };
  await setDoc(noteRef, note);
  return note as unknown as Note;
}

export async function getNotes(
  familyId: string,
  maxResults = 50,
): Promise<Note[]> {
  const snap = await getDocs(
    query(
      collection(db, 'families', familyId, 'notes'),
      orderBy('createdAt', 'desc'),
      limit(maxResults),
    ),
  );
  return snap.docs.map((d) => d.data() as Note);
}

export async function deleteNote(familyId: string, noteId: string): Promise<void> {
  await deleteDoc(doc(db, 'families', familyId, 'notes', noteId));
}

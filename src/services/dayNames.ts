import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { DayName } from '../types';

export async function getDayName(date: string): Promise<DayName | null> {
  const snap = await getDoc(doc(db, 'dayNames', date));
  if (!snap.exists()) return null;
  return snap.data() as DayName;
}

export async function setDayName(date: string, name: string, uid: string): Promise<void> {
  await setDoc(doc(db, 'dayNames', date), { date, name, setBy: uid });
}

export async function clearDayName(date: string): Promise<void> {
  await deleteDoc(doc(db, 'dayNames', date));
}

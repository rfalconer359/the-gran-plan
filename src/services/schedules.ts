import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Schedule, DayLog, DayType } from '../types';

export async function createSchedule(
  familyId: string,
  childId: string,
  schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Schedule> {
  const scheduleRef = doc(
    collection(db, 'families', familyId, 'children', childId, 'schedules'),
  );
  const newSchedule = {
    ...schedule,
    id: scheduleRef.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(scheduleRef, newSchedule);
  return newSchedule as unknown as Schedule;
}

export async function updateSchedule(
  familyId: string,
  childId: string,
  scheduleId: string,
  data: Partial<Schedule>,
): Promise<void> {
  await updateDoc(
    doc(db, 'families', familyId, 'children', childId, 'schedules', scheduleId),
    { ...data, updatedAt: serverTimestamp() },
  );
}

export async function deleteSchedule(
  familyId: string,
  childId: string,
  scheduleId: string,
): Promise<void> {
  await deleteDoc(
    doc(db, 'families', familyId, 'children', childId, 'schedules', scheduleId),
  );
}

export async function getSchedules(
  familyId: string,
  childId: string,
): Promise<Schedule[]> {
  const snap = await getDocs(
    collection(db, 'families', familyId, 'children', childId, 'schedules'),
  );
  return snap.docs.map((d) => d.data() as Schedule);
}

export async function getSchedulesForDay(
  familyId: string,
  childId: string,
  dayTypes: DayType[],
): Promise<Schedule[]> {
  const snap = await getDocs(
    query(
      collection(db, 'families', familyId, 'children', childId, 'schedules'),
      where('dayType', 'in', dayTypes),
    ),
  );
  return snap.docs.map((d) => d.data() as Schedule);
}

// Day Logs
export async function getDayLog(
  familyId: string,
  childId: string,
  date: string,
): Promise<DayLog | null> {
  const snap = await getDoc(
    doc(db, 'families', familyId, 'children', childId, 'dayLogs', date),
  );
  return snap.exists() ? (snap.data() as DayLog) : null;
}

export async function updateDayLog(
  familyId: string,
  childId: string,
  date: string,
  data: Partial<DayLog>,
): Promise<void> {
  const logRef = doc(db, 'families', familyId, 'children', childId, 'dayLogs', date);
  const snap = await getDoc(logRef);

  if (snap.exists()) {
    await updateDoc(logRef, { ...data, updatedAt: serverTimestamp() });
  } else {
    await setDoc(logRef, {
      id: date,
      childId,
      ...data,
      completedEntries: data.completedEntries || [],
      notes: data.notes || [],
      updatedAt: serverTimestamp(),
    });
  }
}

export async function toggleEntryCompletion(
  familyId: string,
  childId: string,
  date: string,
  scheduleId: string,
  entryId: string,
): Promise<string[]> {
  const log = await getDayLog(familyId, childId, date);
  const completed = log?.completedEntries || [];

  const newCompleted = completed.includes(entryId)
    ? completed.filter((id) => id !== entryId)
    : [...completed, entryId];

  await updateDayLog(familyId, childId, date, {
    scheduleId,
    completedEntries: newCompleted,
  });

  return newCompleted;
}

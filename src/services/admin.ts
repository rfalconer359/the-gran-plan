import {
  collection,
  collectionGroup,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserProfile, Family, Child, Schedule, DayLog } from '../types';

export async function getAllUsers(): Promise<UserProfile[]> {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as UserProfile);
}

export async function getAllFamilies(): Promise<Family[]> {
  const q = query(collection(db, 'families'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Family);
}

export async function getChildrenForFamily(familyId: string): Promise<Child[]> {
  const snap = await getDocs(collection(db, 'families', familyId, 'children'));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Child);
}

export async function getSchedulesForChild(
  familyId: string,
  childId: string,
): Promise<Schedule[]> {
  const snap = await getDocs(
    collection(db, 'families', familyId, 'children', childId, 'schedules'),
  );
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Schedule);
}

export async function getDayLogsForChild(
  familyId: string,
  childId: string,
  max = 7,
): Promise<DayLog[]> {
  const q = query(
    collection(db, 'families', familyId, 'children', childId, 'dayLogs'),
    orderBy('updatedAt', 'desc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as DayLog);
}

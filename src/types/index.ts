import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'parent' | 'grandparent';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  familyIds: string[];
  createdAt: Timestamp;
}

export interface Family {
  id: string;
  name: string;
  createdBy: string;
  memberIds: string[];
  inviteCode: string;
  createdAt: Timestamp;
}

export interface Invite {
  code: string;
  familyId: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
  photoUrl?: string;
  allergies: string[];
  emergencyContacts: EmergencyContact[];
  doctorName?: string;
  doctorPhone?: string;
  notes?: string;
  defaultScheduleId?: string;
  createdAt: Timestamp;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export type ScheduleCategory =
  | 'meal'
  | 'milk'
  | 'nap'
  | 'sleep'
  | 'walk'
  | 'play'
  | 'bath'
  | 'tummytime'
  | 'other';

export type DayType = 'weekday' | 'weekend' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface ScheduleEntry {
  id: string;
  time: string; // HH:mm format
  activity: string;
  details?: string;
  category: ScheduleCategory;
  order: number;
}

export interface Schedule {
  id: string;
  childId: string;
  name: string;
  dayType: DayType;
  entries: ScheduleEntry[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DayNote {
  id: string;
  text: string;
  photoUrls: string[];
  authorId: string;
  authorName: string;
  entryId?: string;
  createdAt: string; // ISO 8601 (lives inside a doc array, can't use serverTimestamp)
}

export interface DayLog {
  id: string; // date string YYYY-MM-DD
  childId: string;
  scheduleId?: string;
  completedEntries: string[]; // entry IDs
  notes: string[];
  dayNotes: DayNote[];
  updatedAt: Timestamp;
}

export interface Note {
  id: string;
  familyId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: Timestamp;
}

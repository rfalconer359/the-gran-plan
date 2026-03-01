import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  collection,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Family, Invite } from '../types';
import { generateInviteCode } from '../utils/invite';

export async function createFamily(name: string, userId: string): Promise<Family> {
  const familyRef = doc(collection(db, 'families'));
  const inviteCode = generateInviteCode();

  const family = {
    id: familyRef.id,
    name,
    createdBy: userId,
    memberIds: [userId],
    inviteCode,
    createdAt: serverTimestamp(),
  };

  await setDoc(familyRef, family);

  // Store invite code mapping
  await setDoc(doc(db, 'invites', inviteCode), {
    code: inviteCode,
    familyId: familyRef.id,
    createdBy: userId,
    createdAt: serverTimestamp(),
  });

  // Add family to user profile
  await updateDoc(doc(db, 'users', userId), {
    familyIds: arrayUnion(familyRef.id),
  });

  return family as unknown as Family;
}

export async function joinFamily(inviteCode: string, userId: string): Promise<Family> {
  const inviteSnap = await getDoc(doc(db, 'invites', inviteCode.toUpperCase()));
  if (!inviteSnap.exists()) {
    throw new Error('Invalid invite code. Please check and try again.');
  }

  const invite = inviteSnap.data() as Invite;
  const familyRef = doc(db, 'families', invite.familyId);
  const familySnap = await getDoc(familyRef);

  if (!familySnap.exists()) {
    throw new Error('Family not found.');
  }

  const family = familySnap.data() as Family;

  if (family.memberIds.includes(userId)) {
    throw new Error('You are already a member of this family.');
  }

  await updateDoc(familyRef, {
    memberIds: arrayUnion(userId),
  });

  await updateDoc(doc(db, 'users', userId), {
    familyIds: arrayUnion(invite.familyId),
  });

  return { ...family, memberIds: [...family.memberIds, userId] };
}

export async function getFamily(familyId: string): Promise<Family | null> {
  const snap = await getDoc(doc(db, 'families', familyId));
  return snap.exists() ? (snap.data() as Family) : null;
}

export async function getFamilyMembers(memberIds: string[]) {
  const members = await Promise.all(
    memberIds.map(async (uid) => {
      const snap = await getDoc(doc(db, 'users', uid));
      return snap.exists() ? snap.data() : null;
    }),
  );
  return members.filter(Boolean);
}

export async function regenerateInviteCode(familyId: string, oldCode: string): Promise<string> {
  const newCode = generateInviteCode();

  await updateDoc(doc(db, 'families', familyId), {
    inviteCode: newCode,
  });

  // Remove old invite, create new
  await deleteDoc(doc(db, 'invites', oldCode));
  await setDoc(doc(db, 'invites', newCode), {
    code: newCode,
    familyId,
    createdAt: serverTimestamp(),
  });

  return newCode;
}

export async function getUserFamilies(familyIds: string[]): Promise<Family[]> {
  if (familyIds.length === 0) return [];
  const families = await Promise.all(familyIds.map(getFamily));
  return families.filter((f): f is Family => f !== null);
}

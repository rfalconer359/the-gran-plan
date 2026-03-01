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
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { Child } from '../types';

export async function addChild(
  familyId: string,
  child: Omit<Child, 'id' | 'createdAt'>,
): Promise<Child> {
  const childRef = doc(collection(db, 'families', familyId, 'children'));
  const newChild = {
    ...child,
    id: childRef.id,
    createdAt: serverTimestamp(),
  };
  await setDoc(childRef, newChild);
  return newChild as unknown as Child;
}

export async function updateChild(
  familyId: string,
  childId: string,
  data: Partial<Omit<Child, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, 'families', familyId, 'children', childId), data);
}

export async function deleteChild(familyId: string, childId: string): Promise<void> {
  await deleteDoc(doc(db, 'families', familyId, 'children', childId));
}

export async function getChildren(familyId: string): Promise<Child[]> {
  const snap = await getDocs(
    query(collection(db, 'families', familyId, 'children'), orderBy('createdAt')),
  );
  return snap.docs.map((d) => d.data() as Child);
}

export async function getChild(familyId: string, childId: string): Promise<Child | null> {
  const snap = await getDoc(doc(db, 'families', familyId, 'children', childId));
  return snap.exists() ? (snap.data() as Child) : null;
}

export async function uploadChildPhoto(
  familyId: string,
  childId: string,
  file: File,
): Promise<string> {
  const storageRef = ref(storage, `families/${familyId}/children/${childId}/photo`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  await updateChild(familyId, childId, { photoUrl: url });
  return url;
}

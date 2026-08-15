import {
  collection,
  doc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { getUserId } from './auth';
import type { Item } from '@/types';

const PAGE_SIZE = 50;

function itemsRef(roomId: string) {
  return collection(db, 'rooms', roomId, 'items');
}

function itemRef(roomId: string, itemId: string) {
  return doc(db, 'rooms', roomId, 'items', itemId);
}

export async function addItem(params: {
  roomId: string;
  title: string;
  description?: string;
  listingType: 'lost' | 'found';
  tags?: string[];
}): Promise<Item> {
  const userId = getUserId();
  const id = crypto.randomUUID().slice(0, 8);
  const now = new Date().toISOString();

  const item: Item = {
    id,
    title: params.title,
    description: params.description || undefined,
    listingType: params.listingType,
    postedBy: userId,
    createdAt: now,
    tags: params.tags || [],
    isReturned: false,
  };

  await setDoc(itemRef(params.roomId, id), item);
  return item;
}

export function watchItems(
  roomId: string,
  callback: (items: Item[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = query(
    itemsRef(roomId),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((doc) => doc.data() as Item);
      callback(items);
    },
    (error) => {
      onError?.(error);
    },
  );
}

export async function getItems(roomId: string): Promise<Item[]> {
  const q = query(
    itemsRef(roomId),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Item);
}

export async function markReturned(roomId: string, itemId: string): Promise<void> {
  await updateDoc(itemRef(roomId, itemId), {
    isReturned: true,
    returnedAt: new Date().toISOString(),
  });
}

export async function updatePhotoUrl(
  roomId: string,
  itemId: string,
  photoUrl: string,
): Promise<void> {
  await updateDoc(itemRef(roomId, itemId), { photoUrl });
}

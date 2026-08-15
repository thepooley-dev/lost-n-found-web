import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { getUserId } from './auth';
import { generateRoomCode } from './room-code';
import type { Room } from '@/types';

const MAX_RETRIES = 5;

export async function createRoom(name?: string): Promise<Room> {
  const userId = getUserId();

  for (let i = 0; i < MAX_RETRIES; i++) {
    const id = generateRoomCode();
    const ref = doc(db, 'rooms', id);
    const existing = await getDoc(ref);

    if (!existing.exists()) {
      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const room: Room = {
        id,
        ...(name ? { name } : {}),
        createdAt: now,
        expiresAt,
        createdBy: userId,
        isPrivate: true,
      };

      await setDoc(ref, room);
      return room;
    }
  }

  throw new Error('Failed to generate a unique room code');
}

export async function getRoom(roomId: string): Promise<Room | null> {
  const ref = doc(db, 'rooms', roomId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return snap.data() as Room;
}

export async function isRoomExpired(roomId: string): Promise<boolean> {
  const room = await getRoom(roomId);
  if (!room) return true;
  return new Date(room.expiresAt) < new Date();
}

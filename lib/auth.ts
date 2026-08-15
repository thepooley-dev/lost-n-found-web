import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase';

export async function ensureSignedIn(): Promise<User> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  const credential = await signInAnonymously(auth);
  return credential.user!;
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export function getUserId(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('User not signed in. Call ensureSignedIn() first.');
  }
  return uid;
}

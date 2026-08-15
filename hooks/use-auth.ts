'use client';

import { useEffect, useState } from 'react';
import { onAuthChange, ensureSignedIn } from '@/lib/auth';
import type { User } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoading(false);
      } else {
        try {
          const newUser = await ensureSignedIn();
          setUser(newUser);
        } catch (error) {
          console.error('Auth error:', error);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}

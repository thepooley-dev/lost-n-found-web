'use client';

import { useEffect, useState } from 'react';
import { watchItems } from '@/lib/items';
import type { Item } from '@/types';

export function useItems(roomId: string) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = watchItems(
      roomId,
      (newItems) => {
        setItems(newItems);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [roomId]);

  return { items, loading, error };
}

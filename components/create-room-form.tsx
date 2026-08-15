'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRoom } from '@/lib/rooms';
import { ensureSignedIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function CreateRoomForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate() {
    setIsLoading(true);
    try {
      await ensureSignedIn();
      const room = await createRoom(name.trim() || undefined);
      router.push(`/room/${room.id}`);
    } catch (error) {
      toast.error('Failed to create room. Please try again.');
      console.error('Create room error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="room-name">Room name (optional)</Label>
        <Input
          id="room-name"
          placeholder="e.g. Sarah's Wedding"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <Button
        className="w-full"
        size="lg"
        onClick={handleCreate}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          'Create Room'
        )}
      </Button>
    </div>
  );
}

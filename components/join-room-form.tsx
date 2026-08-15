'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRoom } from '@/lib/rooms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function JoinRoomForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleJoin() {
    const trimmed = code.trim();
    if (!trimmed) return;

    setIsLoading(true);
    try {
      const room = await getRoom(trimmed);

      if (!room) {
        toast.error('Room not found. Check the code and try again.');
        return;
      }

      if (new Date(room.expiresAt) < new Date()) {
        toast.error('This room has expired.');
        return;
      }

      router.push(`/room/${trimmed}`);
    } catch (error) {
      toast.error('Failed to join room. Please try again.');
      console.error('Join room error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="room-code">Room code</Label>
        <Input
          id="room-code"
          placeholder="e.g. sunny-dance-42"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isLoading}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
        />
      </div>
      <Button
        className="w-full"
        size="lg"
        variant="outline"
        onClick={handleJoin}
        disabled={isLoading || !code.trim()}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Joining...
          </>
        ) : (
          'Join Room'
        )}
      </Button>
    </div>
  );
}

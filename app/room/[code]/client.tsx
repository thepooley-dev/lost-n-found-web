'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRoom } from '@/lib/rooms';
import { useItems } from '@/hooks/use-items';
import { ensureSignedIn } from '@/lib/auth';
import type { Room } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Share2, Plus, Check, Loader2, ArrowLeft } from 'lucide-react';
import { ShareSheet } from '@/components/share-sheet';
import { AddItemSheet } from '@/components/add-item-sheet';
import { markReturned } from '@/lib/items';
import { toast } from 'sonner';

export default function RoomPageClient({ roomId }: { roomId: string }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  const { items, loading: itemsLoading, error: itemsError } = useItems(roomId);

  useEffect(() => {
    async function load() {
      try {
        await ensureSignedIn();
        const roomData = await getRoom(roomId);
        setRoom(roomData);
      } catch (error) {
        console.error('Failed to load room:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [roomId]);

  async function handleMarkReturned(itemId: string) {
    try {
      await markReturned(roomId, itemId);
    } catch {
      toast.error('Failed to mark as returned');
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">Room not found</p>
          <p className="text-gray-500">This room may have expired or been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="border-b bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold text-lg">Room: {roomId}</h1>
            {room.name && <p className="text-sm text-gray-500">{room.name}</p>}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowShare(true)}>
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {itemsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : itemsError ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-lg font-medium">Something went wrong</p>
            <p className="text-gray-500">Please try again later.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No items yet.<br />Tap + to add a lost or found item.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-3">
                <div className="flex gap-3">
                  {item.photoUrl && (
                    <img
                      src={item.photoUrl}
                      alt={item.title}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                    />
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={item.isReturned ? 'default' : 'secondary'}
                        className={`text-xs ${
                          item.isReturned
                            ? 'bg-blue-100 text-blue-700'
                            : item.listingType === 'lost'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {item.isReturned ? 'RETURNED' : item.listingType.toUpperCase()}
                      </Badge>
                      <span className="font-semibold text-sm truncate">{item.title}</span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500 truncate">{item.description}</p>
                    )}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px] py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {!item.isReturned && (
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleMarkReturned(item.id)}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Mark Returned
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setShowAddItem(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Sheets */}
      <ShareSheet
        open={showShare}
        onOpenChange={setShowShare}
        roomId={roomId}
      />
      <AddItemSheet
        open={showAddItem}
        onOpenChange={setShowAddItem}
        roomId={roomId}
      />
    </div>
  );
}

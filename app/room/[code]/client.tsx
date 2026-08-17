'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getRoom } from '@/lib/rooms';
import { useItems } from '@/hooks/use-items';
import { ensureSignedIn } from '@/lib/auth';
import type { Room, Item } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Share2, Plus, Check, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { ShareDialog } from '@/components/share-dialog';
import { AddItemDialog } from '@/components/add-item-dialog';
import { ItemDetailDialog } from '@/components/item-detail-dialog';
import { RoomSkeleton, ItemCardSkeleton } from '@/components/skeletons';
import { markReturned } from '@/lib/items';
import { toast } from 'sonner';

export default function RoomPageClient({ roomId }: { roomId: string }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [detailItem, setDetailItem] = useState<Item | null>(null);

  const { items, loading: itemsLoading, error: itemsError } = useItems(roomId);

  const isStandalone = typeof window !== 'undefined'
    ? window.matchMedia('(display-mode: standalone)').matches
    : false;

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

  const handleCardClick = useCallback((item: Item) => {
    if (isStandalone) {
      setDetailItem(item);
    } else {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(item.id)) {
          next.delete(item.id);
        } else {
          next.add(item.id);
        }
        return next;
      });
    }
  }, [isStandalone]);

  if (loading) {
    return <RoomSkeleton />;
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

      {/* Items grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {itemsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => {
              const isExpanded = expandedIds.has(item.id);
              return (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleCardClick(item)}
                >
                  <CardContent className="p-3">
                    {/* Compact view - always visible */}
                    <div className="flex items-center gap-3">
                      {item.photoUrl && (
                        <img
                          src={item.photoUrl}
                          alt={item.title}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={item.isReturned ? 'default' : 'secondary'}
                            className={`text-[10px] ${
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
                      </div>
                      {!isStandalone && (
                        <div className="flex-shrink-0 text-gray-400">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      )}
                    </div>

                    {/* Expanded view - browser only */}
                    {isExpanded && !isStandalone && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        {item.photoUrl && (
                          <img
                            src={item.photoUrl}
                            alt={item.title}
                            className="w-full max-h-64 object-cover rounded-lg"
                          />
                        )}
                        {item.description && (
                          <p className="text-xs text-gray-500">{item.description}</p>
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
                        {!item.isReturned && (
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkReturned(item.id);
                              }}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Mark Returned
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
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

      {/* Dialogs */}
      <ShareDialog
        open={showShare}
        onOpenChange={setShowShare}
        roomId={roomId}
      />
      <AddItemDialog
        open={showAddItem}
        onOpenChange={setShowAddItem}
        roomId={roomId}
      />
      <ItemDetailDialog
        item={detailItem}
        open={!!detailItem}
        onOpenChange={(open) => { if (!open) setDetailItem(null); }}
        onMarkReturned={handleMarkReturned}
      />
    </div>
  );
}

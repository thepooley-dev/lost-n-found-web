'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import type { Item } from '@/types';

interface ItemDetailDialogProps {
  item: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkReturned: (itemId: string) => void;
}

export function ItemDetailDialog({ item, open, onOpenChange, onMarkReturned }: ItemDetailDialogProps) {
  if (!item) return null;

  const statusColor = item.isReturned
    ? 'bg-blue-100 text-blue-700'
    : item.listingType === 'lost'
    ? 'bg-orange-100 text-orange-700'
    : 'bg-green-100 text-green-700';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge className={statusColor}>
              {item.isReturned ? 'RETURNED' : item.listingType.toUpperCase()}
            </Badge>
            <span>{item.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {item.photoUrl && (
            <img
              src={item.photoUrl}
              alt={item.title}
              className="w-full max-h-64 object-cover rounded-lg"
            />
          )}

          {item.description && (
            <p className="text-sm text-gray-600">{item.description}</p>
          )}

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {!item.isReturned && (
            <Button
              className="w-full"
              onClick={() => {
                onMarkReturned(item.id);
                onOpenChange(false);
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark Returned
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

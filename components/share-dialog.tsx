'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
}

export function ShareDialog({ open, onOpenChange, roomId }: ShareDialogProps) {
  const roomUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/room/${roomId}`
    : '';

  function copyCode() {
    navigator.clipboard.writeText(roomId);
    toast.success('Room code copied!');
  }

  async function shareRoom() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lost & Found Room',
          text: `Join my Lost & Found room!\n\nRoom code: ${roomId}`,
          url: roomUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      copyCode();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Share Room</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          <p className="text-sm text-gray-500">
            Scan this QR code or share the room code
          </p>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <QRCodeSVG value={roomUrl} size={200} />
          </div>

          <div className="flex items-center gap-3 bg-gray-100 px-4 py-3 rounded-xl">
            <span className="text-2xl font-bold tracking-wide">{roomId}</span>
            <Button variant="ghost" size="icon" onClick={copyCode}>
              <Copy className="h-5 w-5" />
            </Button>
          </div>

          <Button className="w-full" size="lg" onClick={shareRoom}>
            <Share2 className="h-5 w-5 mr-2" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

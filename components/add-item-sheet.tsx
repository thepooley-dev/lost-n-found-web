'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Camera, X } from 'lucide-react';
import { addItem, updatePhotoUrl } from '@/lib/items';
import { uploadPhoto } from '@/lib/storage';
import { locationTags, itemTags } from '@/lib/tags';
import { toast } from 'sonner';

interface AddItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
}

export function AddItemSheet({ open, onOpenChange, roomId }: AddItemSheetProps) {
  const [listingType, setListingType] = useState<'lost' | 'found'>('lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [customTag, setCustomTag] = useState('');
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }

  function addCustomTag() {
    const tag = customTag.trim().toLowerCase();
    if (tag && tag.length <= 30 && !selectedTags.has(tag)) {
      setSelectedTags((prev) => new Set(prev).add(tag));
      setCustomTag('');
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  function resetForm() {
    setTitle('');
    setDescription('');
    setSelectedTags(new Set());
    setCustomTag('');
    setPhoto(null);
    setPhotoPreview(null);
    setListingType('lost');
    setTagsExpanded(false);
  }

  async function handleSubmit() {
    if (!title.trim() || title.length > 100 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const item = await addItem({
        roomId,
        title: title.trim(),
        description: description.trim() || undefined,
        listingType,
        tags: Array.from(selectedTags),
      });

      if (photo) {
        try {
          const url = await uploadPhoto(roomId, item.id, photo);
          await updatePhotoUrl(roomId, item.id, url);
        } catch (uploadError) {
          console.error('Photo upload failed:', uploadError);
          toast.error('Item saved, but photo upload failed');
        }
      }

      resetForm();
      onOpenChange(false);
    } catch {
      toast.error('Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!isSubmitting) onOpenChange(v); }}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Item</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-4">
          {/* Lost / Found toggle */}
          <div className="flex gap-2">
            <Button
              variant={listingType === 'lost' ? 'default' : 'outline'}
              className={listingType === 'lost' ? 'bg-orange-600 hover:bg-orange-700' : ''}
              onClick={() => setListingType('lost')}
            >
              Lost
            </Button>
            <Button
              variant={listingType === 'found' ? 'default' : 'outline'}
              className={listingType === 'found' ? 'bg-green-600 hover:bg-green-700' : ''}
              onClick={() => setListingType('found')}
            >
              Found
            </Button>
          </div>

          {/* Photo + Title row */}
          <div className="flex gap-3">
            <label className="flex-shrink-0 w-24 h-24 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="h-8 w-8 text-gray-400" />
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
            <div className="flex-1 space-y-2">
              <Label htmlFor="title">What is it?</Label>
              <Input
                id="title"
                placeholder="e.g. Black clutch"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="e.g. Found near the cake table"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>

          {/* Tags */}
          <div>
            <button
              className="flex items-center gap-2 text-sm font-medium w-full py-1"
              onClick={() => setTagsExpanded(!tagsExpanded)}
            >
              Tags
              {selectedTags.size > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedTags.size}
                </Badge>
              )}
              <span className="ml-auto text-gray-400">
                {tagsExpanded ? '▲' : '▼'}
              </span>
            </button>

            {tagsExpanded && (
              <div className="space-y-3 mt-2">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Location tags</p>
                  <div className="flex flex-wrap gap-1">
                    {locationTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.has(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Item tags</p>
                  <div className="flex flex-wrap gap-1">
                    {itemTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.has(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Custom tag input */}
          <div className="flex gap-2">
            <Input
              placeholder="Custom tag"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
              maxLength={30}
            />
            <Button variant="secondary" onClick={addCustomTag}>
              Add
            </Button>
          </div>

          {/* Selected tags */}
          {selectedTags.size > 0 && (
            <div className="flex flex-wrap gap-1">
              {Array.from(selectedTags).map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* Submit */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={!title.trim() || title.length > 100 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Item'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

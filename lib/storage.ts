import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import imageCompression from 'browser-image-compression';

export async function uploadPhoto(
  roomId: string,
  itemId: string,
  file: File,
): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
  });

  const ext = compressed.name.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const storageRef = ref(storage, `rooms/${roomId}/items/${itemId}.${ext}`);

  await uploadBytes(storageRef, compressed, { contentType });
  return getDownloadURL(storageRef);
}

export async function deletePhoto(roomId: string, itemId: string): Promise<void> {
  const storageRef = ref(storage, `rooms/${roomId}/items/${itemId}.jpg`);
  await deleteObject(storageRef);
}

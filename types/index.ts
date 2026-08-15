export interface Room {
  id: string;
  name?: string;
  createdAt: string;
  expiresAt: string;
  createdBy: string;
  isPrivate: boolean;
}

export interface Item {
  id: string;
  title: string;
  description?: string;
  listingType: 'lost' | 'found';
  postedBy: string;
  createdAt: string;
  tags: string[];
  isReturned: boolean;
  returnedAt?: string;
  photoUrl?: string;
}

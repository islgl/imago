export interface Image {
  id: string;
  key: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  albumId: string | null;
  isPublic: boolean;
  isStarred: boolean;
  createdAt: number;
  deletedAt: number | null;
  url: string;
  publicUrl: string | null;
}

export interface Album {
  id: string;
  name: string;
  createdAt: number;
  imageCount: number;
}

export type NavView = 'all' | 'starred' | 'recent' | 'trash' | 'settings' | 'album';
export type ViewMode = 'grid' | 'list';
export type SortBy = 'date' | 'name' | 'size';

export interface Storage {
  usedBytes: number;
  imageCount: number;
}

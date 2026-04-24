export interface Env {
  R2: R2Bucket;
  DB: D1Database;
  ASSETS: Fetcher;
  RL_KV: KVNamespace;
  ENVIRONMENT: string;
  IMAGO_PASSWORD: string;
  ALLOWED_REFERERS: string;
  RATE_LIMIT_RPM: string;
}

export interface ImageRow {
  id: string;
  key: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  album_id: string | null;
  is_public: number;
  is_starred: number;
  created_at: number;
  deleted_at: number | null;
}

export interface AlbumRow {
  id: string;
  name: string;
  created_at: number;
}

export interface ImageDTO {
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

export interface AlbumDTO {
  id: string;
  name: string;
  createdAt: number;
  imageCount: number;
}

export function toImageDTO(row: ImageRow, origin: string): ImageDTO {
  return {
    id: row.id,
    key: row.key,
    filename: row.filename,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    width: row.width,
    height: row.height,
    albumId: row.album_id,
    isPublic: row.is_public === 1,
    isStarred: row.is_starred === 1,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
    url: `${origin}/api/images/${row.id}/raw`,
    publicUrl: row.is_public === 1 ? `${origin}/p/${row.key}` : null,
  };
}

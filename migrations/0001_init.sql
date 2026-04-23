-- Imago MVP schema
-- Images stored in R2, metadata here

CREATE TABLE albums (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE images (
  id          TEXT PRIMARY KEY,
  key         TEXT NOT NULL UNIQUE,
  filename    TEXT NOT NULL,
  mime_type   TEXT NOT NULL,
  size_bytes  INTEGER NOT NULL,
  width       INTEGER,
  height      INTEGER,
  album_id    TEXT REFERENCES albums(id) ON DELETE SET NULL,
  is_public   INTEGER NOT NULL DEFAULT 0,
  is_starred  INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL,
  deleted_at  INTEGER
);

CREATE INDEX idx_images_created ON images(created_at DESC);
CREATE INDEX idx_images_album   ON images(album_id);
CREATE INDEX idx_images_deleted ON images(deleted_at);

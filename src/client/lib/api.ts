import type { Image, Album, Storage } from '../types';

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('imago-auth-expired'));
    throw new Error('unauthorized');
  }
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${res.status}: ${txt}`);
  }
  return res.json() as Promise<T>;
}

export async function listImages(params: {
  view?: string;
  album?: string;
  sort?: string;
  q?: string;
}): Promise<Image[]> {
  const qs = new URLSearchParams();
  if (params.view) qs.set('view', params.view);
  if (params.album) qs.set('album', params.album);
  if (params.sort) qs.set('sort', params.sort);
  if (params.q) qs.set('q', params.q);
  const { items } = await request<{ items: Image[] }>(`/api/images?${qs}`);
  return items;
}

export async function uploadImage(
  file: File,
  opts: { albumId?: string | null; isPublic?: boolean } = {},
  onProgress?: (pct: number) => void,
): Promise<Image> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append('file', file);
    if (opts.albumId) fd.append('album_id', opts.albumId);
    fd.append('is_public', opts.isPublic ? '1' : '0');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/images');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress((e.loaded / e.total) * 100);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as Image);
      } else {
        reject(new Error(`${xhr.status}: ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error('network error'));
    xhr.send(fd);
  });
}

export async function patchImage(id: string, body: Partial<Pick<Image, 'isStarred' | 'isPublic' | 'albumId' | 'filename'>>): Promise<Image> {
  return request<Image>(`/api/images/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      is_starred: body.isStarred,
      is_public: body.isPublic,
      album_id: body.albumId,
      filename: body.filename,
    }),
  });
}

export async function deleteImage(id: string): Promise<void> {
  await request(`/api/images/${id}`, { method: 'DELETE' });
}

export async function restoreImage(id: string): Promise<Image> {
  return request<Image>(`/api/images/${id}/restore`, { method: 'POST' });
}

export async function permanentDeleteImage(id: string): Promise<void> {
  await request(`/api/images/${id}/permanent`, { method: 'DELETE' });
}

export async function listAlbums(): Promise<Album[]> {
  const { items } = await request<{ items: Album[] }>('/api/albums');
  return items;
}

export async function createAlbum(name: string): Promise<Album> {
  return request<Album>('/api/albums', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
}

export async function deleteAlbum(id: string): Promise<void> {
  await request(`/api/albums/${id}`, { method: 'DELETE' });
}

export async function getStorage(): Promise<Storage> {
  return request<Storage>('/api/me/storage');
}

export async function signImage(id: string, ttl: number): Promise<{ signedUrl: string; expiresAt: number }> {
  return request<{ signedUrl: string; expiresAt: number }>(`/api/images/${id}/sign?ttl=${ttl}`);
}

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Gallery } from './components/Gallery';
import { DetailPanel } from './components/DetailPanel';
import { UploadModal } from './components/UploadModal';
import { SettingsPanel } from './components/SettingsPanel';
import { ContextMenu } from './components/ContextMenu';
import { LoginScreen } from './components/LoginScreen';
import {
  listImages,
  listAlbums,
  getStorage,
  deleteImage,
  patchImage,
  createAlbum,
} from './lib/api';
import type { Album, Image, NavView, SortBy, ViewMode } from './types';

export function App() {
  const authSWR = useSWR(
    'auth',
    async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return false;
      const data = (await res.json()) as { authed: boolean };
      return data.authed;
    },
    { revalidateOnFocus: false },
  );

  useEffect(() => {
    const onExpired = () => authSWR.mutate();
    window.addEventListener('imago-auth-expired', onExpired);
    return () => window.removeEventListener('imago-auth-expired', onExpired);
  }, [authSWR]);

  if (authSWR.isLoading || authSWR.data === undefined) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--sidebar-bg)',
          color: 'var(--text-3)',
          fontSize: 13,
        }}
      >
        Loading…
      </div>
    );
  }

  if (!authSWR.data) {
    return <LoginScreen onSuccess={() => authSWR.mutate()} />;
  }

  return <AppInner onLoggedOut={() => authSWR.mutate()} />;
}

function AppInner({ onLoggedOut }: { onLoggedOut: () => void }) {
  const [view, setView] = useState<NavView>('all');
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Image | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ctxMenu, setCtxMenu] = useState<{ img: Image; x: number; y: number } | null>(null);

  // Build query params for listImages based on current view
  const listKey = useMemo(() => {
    const params: Record<string, string> = { sort: sortBy };
    if (view === 'album' && activeAlbumId) params.album = activeAlbumId;
    else if (view === 'starred' || view === 'recent' || view === 'trash') params.view = view;
    if (searchQuery.trim()) params.q = searchQuery.trim();
    return params;
  }, [view, activeAlbumId, sortBy, searchQuery]);

  const imagesSWR = useSWR(
    view === 'settings' ? null : ['images', listKey],
    () => listImages(listKey),
    { revalidateOnFocus: false },
  );
  const albumsSWR = useSWR('albums', listAlbums, { revalidateOnFocus: false });
  const storageSWR = useSWR('storage', getStorage, { revalidateOnFocus: false });

  // Sidebar counts — fetch an all-images list to populate nav counts
  const countsSWR = useSWR(['counts'], async () => {
    const [all, starred, recent, trash] = await Promise.all([
      listImages({}),
      listImages({ view: 'starred' }),
      listImages({ view: 'recent' }),
      listImages({ view: 'trash' }),
    ]);
    return { all: all.length, starred: starred.length, recent: recent.length, trash: trash.length };
  }, { revalidateOnFocus: false });

  const images = imagesSWR.data ?? [];
  const albums: Album[] = albumsSWR.data ?? [];

  const refreshAll = () => {
    imagesSWR.mutate();
    albumsSWR.mutate();
    storageSWR.mutate();
    countsSWR.mutate();
  };

  const handleNav = (v: NavView, albumId?: string) => {
    setView(v);
    setActiveAlbumId(v === 'album' ? albumId ?? null : null);
    setDetail(null);
    setSelected([]);
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const handleCopy = async (img: Image) => {
    const url = img.publicUrl ?? img.url;
    await navigator.clipboard.writeText(url);
  };

  const handleDelete = async (img: Image) => {
    await deleteImage(img.id);
    setDetail(null);
    refreshAll();
  };

  const handleBulkDelete = async () => {
    await Promise.all(selected.map((id) => deleteImage(id)));
    setSelected([]);
    refreshAll();
  };

  const handleBulkCopy = async () => {
    const urls = images
      .filter((i) => selected.includes(i.id))
      .map((i) => i.publicUrl ?? i.url)
      .join('\n');
    await navigator.clipboard.writeText(urls);
  };

  const handleToggleStar = async (img: Image) => {
    const updated = await patchImage(img.id, { isStarred: !img.isStarred });
    setDetail((d) => (d && d.id === img.id ? updated : d));
    refreshAll();
  };

  const handleTogglePublic = async (img: Image) => {
    const updated = await patchImage(img.id, { isPublic: !img.isPublic });
    setDetail((d) => (d && d.id === img.id ? updated : d));
    refreshAll();
  };

  const handleCreateAlbum = async () => {
    const name = window.prompt('Album name');
    if (!name || !name.trim()) return;
    await createAlbum(name.trim());
    albumsSWR.mutate();
  };

  const handleDownload = (img: Image) => {
    const a = document.createElement('a');
    a.href = img.url;
    a.download = img.filename;
    a.click();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    onLoggedOut();
  };

  const navTitle = useMemo(() => {
    if (view === 'all') return 'All images';
    if (view === 'starred') return 'Starred';
    if (view === 'recent') return 'Recent';
    if (view === 'trash') return 'Trash';
    if (view === 'settings') return 'Settings';
    if (view === 'album') return albums.find((a) => a.id === activeAlbumId)?.name ?? 'Album';
    return '';
  }, [view, activeAlbumId, albums]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', width: '100%' }}>
      <Sidebar
        view={view}
        activeAlbumId={activeAlbumId}
        albums={albums}
        allCount={countsSWR.data?.all ?? 0}
        starredCount={countsSWR.data?.starred ?? 0}
        recentCount={countsSWR.data?.recent ?? 0}
        trashCount={countsSWR.data?.trash ?? 0}
        storage={storageSWR.data ?? null}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onNav={handleNav}
        onUpload={() => setShowUpload(true)}
        onCreateAlbum={handleCreateAlbum}
      />

      {view === 'settings' ? (
        <SettingsPanel storage={storageSWR.data ?? null} onLogout={handleLogout} />
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <TopBar
            title={navTitle}
            count={images.length}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortBy={sortBy}
            setSortBy={setSortBy}
            selected={selected}
            onClearSel={() => setSelected([])}
            onBulkDelete={handleBulkDelete}
            onBulkCopy={handleBulkCopy}
          />
          <Gallery
            imgs={images}
            viewMode={viewMode}
            selected={selected}
            onSelect={toggleSelect}
            onOpen={(img) => {
              setDetail(img);
              setSelected([]);
            }}
            onCopy={handleCopy}
            onContextMenu={(img, x, y) => setCtxMenu({ img, x, y })}
            onUpload={() => setShowUpload(true)}
            loading={imagesSWR.isLoading}
          />
        </div>
      )}

      {detail && (
        <DetailPanel
          img={detail}
          albums={albums}
          onClose={() => setDetail(null)}
          onDelete={handleDelete}
          onToggleStar={handleToggleStar}
          onTogglePublic={handleTogglePublic}
        />
      )}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={() => refreshAll()}
        />
      )}
      {ctxMenu && (
        <ContextMenu
          img={ctxMenu.img}
          x={ctxMenu.x}
          y={ctxMenu.y}
          onClose={() => setCtxMenu(null)}
          onOpen={(img) => setDetail(img)}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onToggleStar={handleToggleStar}
          onTogglePublic={handleTogglePublic}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

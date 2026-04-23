<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a1814,100:2d2820&height=220&text=imago&fontSize=90&fontColor=f5e4c0&fontAlignY=40&desc=Your%20private%20image%20archive&descSize=22&descAlignY=63&descColor=c8b89acc&animation=fadeIn" width="100%" />

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=500&size=18&duration=2800&pause=600&color=888888&center=true&vCenter=true&width=600&height=36&lines=Upload+PNG%2C+JPG%2C+WebP%2C+GIF+and+SVG;Organize+into+albums+%C2%B7+star+%C2%B7+search;Copy+public+links+with+one+click" />

<br/>

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F6821F?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![R2](https://img.shields.io/badge/Cloudflare_R2-F6821F?style=flat-square&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/r2)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## Features

### 📤 Upload
- Drag-and-drop or click to select — **PNG, JPG, WebP, GIF, SVG**
- Multi-file batch upload with per-file progress
- Up to 20 MB per file, stored in **Cloudflare R2**

### 🗂️ Organize
- **Albums** — group images into named collections
- **Star** — mark favourites for quick access
- **Trash** — soft-delete with a separate trash view
- **Recent** — auto-filtered view of the last uploads

### 🔗 Share
- Toggle any image between **private** and **public**
- Public images get a permanent, CDN-served URL at `/p/:key`
- One-click copy of direct URL, Markdown embed, and HTML snippet

### 🔍 Browse
- Full-text **search** across filenames
- **Grid** and **list** view modes
- Sort by upload date, filename, or file size
- Context menu on right-click

---

## Stack

<div align="center">

<img src="https://skillicons.dev/icons?i=cloudflare,ts,react,vite&theme=dark" />

</div>

| Layer    | Technology |
|----------|------------|
| Runtime  | Cloudflare Workers |
| Storage  | Cloudflare R2 |
| Database | Cloudflare D1 (SQLite) |
| API      | Hono |
| Frontend | React 18 + Vite |
| Auth     | Password + signed session cookie |

---

## Self-Hosting

### 1. Clone & install

```bash
git clone https://github.com/islgl/imago.git
cd imago
npm install
```

### 2. Create Cloudflare resources

```bash
# R2 buckets
npx wrangler r2 bucket create imago-images
npx wrangler r2 bucket create imago-images-dev

# D1 database — copy the database_id from the output
npx wrangler d1 create imago
```

Update `wrangler.toml` with the `database_id` from the D1 create step.

### 3. Configure secrets

```bash
# Set your login password
npx wrangler secret put IMAGO_PASSWORD
```

### 4. Run the database migration

```bash
# Apply to local dev
npm run db:migrate:local

# Apply to production
npm run db:migrate
```

### 5. Set your domain

Edit `wrangler.toml` and update the `routes` pattern to your domain (or remove it to use the default `*.workers.dev` URL):

```toml
routes = [
  { pattern = "your-domain.com", custom_domain = true }
]
```

### 6. Develop locally

```bash
npm run dev
# Vite frontend → http://localhost:5173
# Worker API    → http://localhost:8787
```

### 7. Deploy

```bash
npm run deploy
```

---

## Project Layout

```
imago/
├── src/
│   ├── client/
│   │   ├── components/     # Sidebar, Gallery, ImageCard, DetailPanel …
│   │   ├── lib/            # API client, utility helpers
│   │   ├── styles/         # globals.css (oklch tokens, dark mode)
│   │   └── App.tsx         # Root — auth gate + main layout
│   └── worker/
│       ├── router/         # images, albums, auth, public routes
│       └── lib/            # Session auth, R2 helpers
├── migrations/             # D1 schema: albums + images tables
├── wrangler.toml           # Worker, R2, D1 bindings
└── vite.config.ts
```

---

## License

[MIT](LICENSE)

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2d2820,100:1a1814&height=100&section=footer" width="100%" />
</div>

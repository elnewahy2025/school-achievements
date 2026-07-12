# 🏆 School Achievements

A polished, full-featured web app for showcasing student achievements — built with a vibrant Kahoot-inspired theme, Arabic RTL support, and dark/light mode.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![SQLite](https://img.shields.io/badge/SQLite-WAL-blue?logo=sqlite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript)

---

## ✨ Features

### 🖼️ Public Gallery (no login)
- **Featured Carousel** — hero showcase of top-pinned achievements with cinematic cards
- **Stats Banner** — animated count-up numbers (achievements, teachers, departments, files)
- **"New This Week"** — horizontal scrollable feed of recent additions
- **Grid + Calendar View** — toggle between card grid and monthly calendar browse
- **Search Autocomplete** — instant dropdown suggestions as you type
- **Category/Tag Filters** — filter by department, teacher, category, or free-text search
- **Achievement Cards** — image preview, department badge, category tags, teacher attribution, reaction counts
- **Lightbox** — full-screen carousel with image navigation, description, PDF downloads
- **Emoji Reactions** — 🎉👏❤️🏆⭐🔥 toggle reactions per achievement (tracked per visitor)
- **Responsive Grid** — 1 → 4 columns based on viewport
- **Skeleton Loading** — animated placeholders while content loads

### 🔗 Achievement Detail Pages (`/achievement/[id]`)
- Shareable URLs — send a direct link to anyone
- Full image gallery with thumbnails + carousel
- Teacher profile link
- Emoji reaction bar with live counts
- Social share buttons (Twitter, Facebook, WhatsApp, copy link)
- PDF export (certificate-style)
- PDF attachment downloads

### 👩‍🏫 Teacher Profile Pages (`/teacher/[id]`)
- Hero banner with department gradient + avatar
- Bio section, department, achievement count, total reactions
- Grid of all their achievements

### 📊 Teacher Dashboard (login required)
- Personal welcome header with department badge
- Stats: total / personal / department / file counts
- Full achievement list with edit and delete actions
- **PDF Export** — download all achievements as a formatted report
- Drag-and-drop upload: title, description, department, date, categories, multiple image/PDF files

### 🛡️ Admin Console (admin only)
- **Tab 1 — School Settings:** name, manager name, phone, address, logo URL, tagline
- **Tab 2 — Departments:** add, list, delete (with safe-guards against deletion of departments in use)
- **Tab 3 — Teacher Accounts:** create accounts with username/password/full name/department/bio/admin flag
- **Tab 4 — Featured/Pinned:** toggle any achievement as Featured (carousel) or Pinned (sorted to top)

### 🌓 Dark/Light Mode
- Sun/Moon toggle in the navbar
- CSS variable-based theme switching with full light mode overrides
- Preference saved to localStorage

### 🌍 Arabic RTL / English
- **EN / عربي** toggle in the navbar
- 100+ translated strings covering every page and component
- Full RTL layout support — `dir="rtl"` on `<html>`, flipped panels, Arabic date formatting
- Preference saved to localStorage

### 🔐 Auth & Security
- Iron-session based cookie sessions (httpOnly, signed/encrypted)
- Role-based access control on every protected endpoint
- bcrypt-hashed passwords (10 rounds)
- File type validation: jpg/png/webp/gif (10MB) and PDF (20MB)
- Zod schema validation on all input
- SQL injection-safe (parameterized queries throughout)
- Per-visitor reaction tracking via cookies

---

## 📁 Project Structure

```
school-achievements/
├── app/
│   ├── achievement/[id]/page.tsx    # Achievement detail page
│   ├── admin/page.tsx               # Admin console (4 tabs)
│   ├── api/
│   │   ├── achievements/            # CRUD + file + reaction management
│   │   ├── auth/                    # Login, logout, session
│   │   ├── departments/route.ts
│   │   ├── gallery/route.ts         # Public gallery (filterable)
│   │   ├── settings/route.ts
│   │   ├── stats/route.ts           # Animated stats data
│   │   └── teachers/                # Accounts + profiles
│   ├── gallery/[id]/page.tsx
│   ├── globals.css                  # Light/dark mode + RTL styles
│   ├── layout.tsx
│   ├── login/page.tsx
│   ├── page.tsx                     # Public gallery (home)
│   └── teacher/
│       ├── [id]/page.tsx            # Teacher profile
│       ├── create/page.tsx
│       ├── dashboard/page.tsx
│       └── edit/[id]/page.tsx
├── components/
│   ├── AuthContext.tsx
│   ├── CalendarView.tsx             # Monthly calendar grid
│   ├── DeleteModal.tsx
│   ├── Navbar.tsx                   # Nav + theme/lang toggles
│   └── SettingsContext.tsx          # Theme + language state
├── data/                            # SQLite database (auto-created)
├── lib/
│   ├── auth.ts                      # Iron-session helpers
│   ├── db.ts                        # Database schema + migrations
│   ├── exportPdf.ts                 # PDF generation utilities
│   └── i18n.ts                      # EN/AR translations (100+ keys)
├── public/uploads/                  # Uploaded files (git-ignored)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** (recommended: 20 LTS)
- **npm** (comes with Node)

### Install & Run

```bash
git clone https://github.com/elnewahy2025/school-achievements.git
cd school-achievements
npm install
npm run dev
```

Open **http://localhost:3000**

### Default Login

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |

> ⚠️ Change this password immediately in production!

---

## 🪟 Deploy on Windows 11

### Option 1: Run Locally

1. Install **Node.js 20 LTS** from https://nodejs.org (check "Add to PATH")
2. Install **Git** from https://git-scm.com/download/win
3. Open PowerShell:
```powershell
git clone https://github.com/elnewahy2025/school-achievements.git
cd school-achievements
npm install
npm run dev
```
4. Open http://localhost:3000

### Option 2: Production Build

```powershell
npm run build    # Optimized production build
npm start        # Start production server on :3000
```

### Option 3: PM2 (Always Running)

```powershell
npm install -g pm2
npm run build
pm2 start npm --name "school-achievements" -- start
pm2 save
pm2-startup install    # Run once as Administrator
```

### Option 4: Vercel (Free)

1. Push to GitHub (already done!)
2. Go to https://vercel.com → Import repo → Deploy

---

## 🗄️ Database

SQLite via `better-sqlite3` with WAL mode.

| Table | Purpose |
|-------|---------|
| `settings` | School name, manager, phone, address, logo, tagline |
| `departments` | Department names (unique) |
| `accounts` | Users with bcrypt passwords, bio, avatar, admin flag |
| `achievements` | Title, description, department, featured, pinned, reactions, categories |
| `files` | File metadata (images + PDFs) linked to achievements |
| `reactions_log` | Per-visitor emoji reaction tracking |

Auto-migration: new columns are added automatically on first run.

---

## 🎨 Customization

### Theme Colors (`tailwind.config.ts`)
```typescript
colors: {
  kahoot: { purple: '#7b2ff2', red: '#e21b3c', blue: '#1368ce', green: '#26890c', orange: '#ff6b35', yellow: '#f9a825' },
  dark: { 900: '#0f0f23', 800: '#1a1a2e', 700: '#222244', 600: '#2d2d5e' },
}
```

### Department Colors (`app/page.tsx`)
```typescript
const DEPT_COLORS: Record<string, string> = {
  'Science': 'from-emerald-500 to-teal-600',
  'Mathematics': 'from-blue-500 to-indigo-600',
  // Add your departments here
};
```

---

## 📝 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/settings` | Public | School settings |
| `GET` | `/api/departments` | Public | All departments |
| `GET` | `/api/gallery` | Public | Achievements (filterable) |
| `GET` | `/api/stats` | Public | Achievement/teacher/dept counts |
| `POST` | `/api/auth/login` | Public | Login |
| `POST` | `/api/auth/logout` | Auth | Destroy session |
| `GET` | `/api/auth/session` | Auth | Current session |
| `GET` | `/api/achievements` | Auth | Achievements (scoped) |
| `POST` | `/api/achievements` | Auth | Create |
| `PUT` | `/api/achievements` | Auth | Update (incl. featured/pinned) |
| `POST` | `/api/achievements/:id/delete` | Auth | Delete |
| `GET` | `/api/achievements/:id/detail` | Public | Single achievement + teacher |
| `POST` | `/api/achievements/:id/upload` | Auth | Upload files |
| `GET` | `/api/achievements/:id/files` | Public | List files |
| `DELETE` | `/api/achievements/:id/files/:fileId` | Auth | Delete file |
| `POST` | `/api/achievements/:id/react` | Public | Toggle emoji reaction |
| `POST` | `/api/departments` | Admin | Create department |
| `DELETE` | `/api/departments` | Admin | Delete department |
| `GET` | `/api/teachers` | Admin | List accounts |
| `POST` | `/api/teachers` | Admin | Create account |
| `GET` | `/api/teachers/:id` | Public | Teacher profile + achievements |
| `PUT` | `/api/settings` | Admin | Update settings |

---

## 📄 License

MIT — use freely for your school or organization.

---

Built with ❤️ and Kahoot-inspired vibes.

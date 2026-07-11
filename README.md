# 🏆 School Achievements

A polished, full-featured web app for showcasing student achievements — built with a vibrant Kahoot-inspired theme.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![SQLite](https://img.shields.io/badge/SQLite-WAL-blue?logo=sqlite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript)

---

## ✨ Features

### 🖼️ Public Gallery (no login)
- Animated hero with school name, tagline, and manager info
- Filter by department, teacher name, and search query
- Achievement cards with image preview, department badge, teacher attribution, and event date
- Click any card → full-screen lightbox with image carousel, full description, and downloadable PDF attachments
- Responsive grid (1 → 4 columns based on viewport)
- Skeleton loading states and friendly empty states

### 📊 Teacher Dashboard (login required)
- Personal welcome header with department badge
- Stats: total / personal / department / file counts
- Full achievement list with edit and delete actions
- Drag-and-drop upload modal: title, description, department, date, multiple image/PDF files
- Teachers see their own uploads + same-department achievements

### 🛡️ Admin Console (admin only)
- **Tab 1 — School Settings:** name, manager name, phone, address, logo URL, tagline
- **Tab 2 — Departments:** add, list, delete (with safe-guards against deletion of departments in use)
- **Tab 3 — Teacher Accounts:** create accounts with username/password/full name/department/admin flag

### 🔐 Auth & Security
- Iron-session based cookie sessions (httpOnly, signed/encrypted)
- Role-based access control on every protected endpoint
- bcrypt-hashed passwords (10 rounds)
- File type validation: jpg/png/webp/gif (10MB) and PDF (20MB)
- Zod schema validation on all input
- SQL injection-safe (parameterized queries throughout)

---

## 📁 Project Structure

```
school-achievements/
├── app/
│   ├── admin/page.tsx              # Admin console (3 tabs)
│   ├── api/
│   │   ├── achievements/           # CRUD + file management
│   │   │   ├── [id]/
│   │   │   │   ├── delete/route.ts
│   │   │   │   ├── files/[fileId]/route.ts
│   │   │   │   ├── files/route.ts
│   │   │   │   └── upload/route.ts
│   │   │   └── route.ts
│   │   ├── auth/                   # Login, logout, session
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── session/route.ts
│   │   ├── departments/route.ts
│   │   ├── gallery/route.ts
│   │   ├── settings/route.ts
│   │   ├── setup/admin/route.ts
│   │   └── teachers/route.ts
│   ├── gallery/[id]/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── login/page.tsx
│   ├── page.tsx                    # Public gallery (home)
│   └── teacher/
│       ├── create/page.tsx
│       ├── dashboard/page.tsx
│       └── edit/[id]/page.tsx
├── components/
│   ├── AuthContext.tsx
│   ├── DeleteModal.tsx
│   └── Navbar.tsx
├── data/                           # SQLite database (auto-created)
├── lib/
│   ├── auth.ts                     # Iron-session helpers
│   └── db.ts                       # Database schema + queries
├── public/uploads/                 # Uploaded files (git-ignored)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (recommended: 20 LTS)
- **npm** (comes with Node) or **yarn** or **pnpm**

### Install & Run

```bash
# Clone the repository
git clone https://github.com/elnewahy2025/school-achievements.git
cd school-achievements

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open **http://localhost:3000** in your browser.

### Default Login

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |

> ⚠️ Change this password immediately in production!

---

## 🪟 Deploy on Windows 11

### Option 1: Run Locally on Windows

#### Step 1 — Install Node.js

1. Go to **https://nodejs.org**
2. Download the **LTS** version (20.x)
3. Run the installer — accept defaults, make sure **"Add to PATH"** is checked
4. Open **PowerShell** or **Command Prompt** and verify:
   ```powershell
   node --version    # Should show v20.x.x
   npm --version     # Should show 10.x.x
   ```

#### Step 2 — Install Git (if not installed)

1. Go to **https://git-scm.com/download/win**
2. Download and install with defaults
3. Verify in PowerShell:
   ```powershell
   git --version
   ```

#### Step 3 — Clone & Install

Open **PowerShell** and run:

```powershell
# Clone the repo
git clone https://github.com/elnewahy2025/school-achievements.git
cd school-achievements

# Install all dependencies
npm install
```

#### Step 4 — Run Development Server

```powershell
npm run dev
```

Open **http://localhost:3000** — you're live!

#### Step 5 — Build for Production

```powershell
# Create an optimized production build
npm run build

# Start the production server
npm start
```

The app now runs on **http://localhost:3000** with optimized performance.

---

### Option 2: Deploy with PM2 (Always Running)

PM2 keeps your app running 24/7, even after reboots.

```powershell
# Install PM2 globally
npm install -g pm2

# Build the project
npm run build

# Start with PM2
pm2 start npm --name "school-achievements" -- start

# Save PM2 process list (auto-start on boot)
pm2 save

# Windows startup (run once as Administrator)
pm2-startup install
```

Useful PM2 commands:
```powershell
pm2 status              # Check running processes
pm2 logs                # View live logs
pm2 restart school-achievements
pm2 stop school-achievements
pm2 delete school-achievements
```

---

### Option 3: Deploy to a Cloud Platform

#### Vercel (Recommended — Free Tier)

1. Push your code to GitHub (already done!)
2. Go to **https://vercel.com**
3. Sign in with your GitHub account
4. Click **"Add New Project"**
5. Select the `school-achievements` repository
6. Click **Deploy** — done!

> ⚠️ For Vercel: The SQLite database is ephemeral. For production, consider switching to a hosted database like PlanetScale, Supabase, or Turso.

#### Railway

1. Go to **https://railway.app**
2. Connect your GitHub repo
3. Railway auto-detects Next.js and deploys
4. Add a volume mount for the `data/` directory to persist the database

#### Docker (Self-Hosted)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
RUN mkdir -p data

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

```bash
docker build -t school-achievements .
docker run -p 3000:3000 -v school-data:/app/data school-achievements
```

---

## 🗄️ Database

The app uses **SQLite** via `better-sqlite3` with WAL mode for performance.

- Database file: `data/school.db` (auto-created on first run)
- Tables: `settings`, `departments`, `accounts`, `achievements`, `files`
- Foreign keys enabled with cascade deletes
- All queries use parameterized statements (SQL injection safe)

### Schema Overview

| Table | Purpose |
|-------|---------|
| `settings` | School name, manager, phone, address, logo, tagline |
| `departments` | Department names (unique) |
| `accounts` | User accounts with bcrypt passwords + admin flag |
| `achievements` | Achievement records with title, description, department, teacher |
| `files` | File metadata (images + PDFs) linked to achievements |

---

## 🔧 Environment Variables

Create a `.env.local` file (already included):

```env
SESSION_SECRET=your-super-secret-key-change-this
```

| Variable | Required | Description |
|----------|----------|-------------|
| `SESSION_SECRET` | Yes | Secret key for iron-session encryption (min 32 chars) |

---

## 🎨 Customization

### Change Theme Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  kahoot: {
    purple: '#7b2ff2',   // Primary accent
    red: '#e21b3c',      // Danger / delete
    blue: '#1368ce',      // Info / edit
    green: '#26890c',     // Success
    orange: '#ff6b35',    // Warning
    yellow: '#f9a825',    // Highlights
  },
  dark: {
    900: '#0f0f23',       // Background
    800: '#1a1a2e',       // Card background
    700: '#222244',       // Input background
    600: '#2d2d5e',       // Borders
  },
}
```

### Add Department Colors

Edit the `DEPT_COLORS` map in `app/page.tsx`:

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
| `GET` | `/api/settings` | Public | Get school settings |
| `GET` | `/api/departments` | Public | List all departments |
| `GET` | `/api/gallery` | Public | List achievements (filterable) |
| `POST` | `/api/auth/login` | Public | Login with username/password |
| `POST` | `/api/auth/logout` | Auth | Destroy session |
| `GET` | `/api/auth/session` | Auth | Get current session |
| `GET` | `/api/achievements` | Auth | List achievements (scoped by role) |
| `POST` | `/api/achievements` | Auth | Create achievement |
| `PUT` | `/api/achievements` | Auth | Update achievement |
| `POST` | `/api/achievements/:id/delete` | Auth | Delete achievement |
| `POST` | `/api/achievements/:id/upload` | Auth | Upload files |
| `GET` | `/api/achievements/:id/files` | Public | List files |
| `DELETE` | `/api/achievements/:id/files/:fileId` | Auth | Delete a file |
| `POST` | `/api/departments` | Admin | Create department |
| `DELETE` | `/api/departments` | Admin | Delete department |
| `GET` | `/api/teachers` | Admin | List teacher accounts |
| `POST` | `/api/teachers` | Admin | Create teacher account |
| `PUT` | `/api/settings` | Admin | Update school settings |
| `POST` | `/api/setup/admin` | Public | Create initial admin |

---

## 🛡️ Security Notes

- **Change the default admin password** before any public deployment
- **Use a strong `SESSION_SECRET`** (32+ random characters)
- **Regenerate `SESSION_SECRET`** if it's ever exposed
- The `SESSION_SECRET` in `.env.local` is the default — replace it
- File uploads are validated by MIME type and size limits
- All database queries use parameterized statements

---

## 📄 License

MIT — use freely for your school or organization.

---

Built with ❤️ and Kahoot-inspired vibes.

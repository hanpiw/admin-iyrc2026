# 🚀 Admin IYRC 2026

Admin IYRC 2026 adalah web dashboard berbasis **Next.js** yang digunakan untuk mengelola data peserta, lomba, user, serta aktivitas sistem dalam satu platform terpusat. Aplikasi ini dirancang untuk kebutuhan manajemen kompetisi (IYRC 2026) dengan fokus pada efisiensi operasional dan kemudahan monitoring data.

---

## 📌 Deskripsi Aplikasi

Aplikasi ini berfungsi sebagai **admin panel** untuk:

- Manajemen data peserta (CRUD, import/export Excel)
- Manajemen lomba & kategori
- Monitoring aktivitas (audit logs / history)
- Manajemen user (role & akses)
- Pengaturan sistem (settings)
- Autentikasi admin

Struktur dibuat modular dengan pendekatan feature-based untuk mempermudah scaling dan maintenance.

---

## 🧰 Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React (Icons)

### Backend / Services
- Supabase (Auth + Database + SSR support)

### Utilities
- XLSX (Import/export data peserta)
- next-themes (Dark/Light mode)

---

## 📁 Project Structure

```bash
admin-iyrc2026-main/
│
├── public/                 # Static assets
├── src/
│   ├── app/                # Routing (Next.js App Router)
│   │   ├── (dashboard)/    # Protected dashboard pages
│   │   │   ├── history/
│   │   │   ├── lomba/
│   │   │   ├── lomba-management/
│   │   │   ├── master-data/
│   │   │   ├── settings/
│   │   │   └── user-management/
│   │   ├── login/          # Auth page
│   │   └── layout.tsx      # Root layout
│   │
│   ├── components/         # Global reusable components
│   │   ├── layout/         # Navbar, Sidebar, Layout Wrapper
│   │   └── theme/          # Theme configuration
│   │
│   ├── features/           # Feature-based modules
│   │   ├── peserta/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── lomba/
│   │   └── history/
│   │
│   ├── lib/                # Shared utilities & configs
│   │   └── supabase/       # Supabase client & middleware
│   │
│   └── middleware.ts       # Route protection
│
├── schema.sql              # Database schema
├── package.json
└── next.config.ts
```

---

## ⚙️ Getting Started

First, clone the repository:

```bash
git clone https://github.com/username/admin-iyrc2026.git
cd admin-iyrc2026
```

Install dependencies:

```bash
npm install
```

Setup environment variables by creating a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Setup database:

- Open Supabase dashboard
- Go to SQL Editor
- Import and run `schema.sql`

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🔐 Authentication

- Menggunakan Supabase Auth
- Middleware digunakan untuk proteksi route dashboard
- User harus login untuk mengakses halaman admin

---

## 📊 Fitur Utama

### 👥 Peserta
- Tambah, edit, hapus peserta
- Import Excel
- Export data
- Search & filtering

### 🏆 Lomba
- Manajemen data lomba
- Detail per kategori

### 📜 History / Audit Log
- Tracking aktivitas admin
- Monitoring perubahan data

### ⚙️ Settings
- Konfigurasi sistem

### 👤 User Management
- Role-based access
- CRUD user

---

## 🧠 Arsitektur & Pendekatan

Aplikasi menggunakan pendekatan:

- Feature-based architecture (modular & scalable)
- Separation of concerns:
  - `components` → UI
  - `hooks` → logic
  - `services` → data fetching
- SSR Supabase integration untuk performa & keamanan

---

## 📌 Notes

Beberapa peningkatan yang bisa dilakukan:

- Validasi form (Zod / Yup)
- State management (Zustand / Redux)
- Unit testing
- Role permission lebih granular

---

## 🤝 Contributing

Pull request terbuka untuk improvement. Silakan fork repository ini dan kembangkan sesuai kebutuhan.

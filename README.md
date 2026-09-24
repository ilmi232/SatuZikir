# SatuZikir

Majelis zikir daring real-time: jamaah mengetuk tasbih bersama menuju target campaign, menitipkan doa di dinding hajat, dan admin mengelola campaign (dengan bantuan AI).

Stack: Next.js 16 (App Router, Turbopack), React 19, Tailwind 4, Supabase (Postgres + Realtime + Auth).

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local   # isi variabel sesuai kebutuhan
npm run dev
```

Tanpa `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY`, aplikasi berjalan dalam **mode demo**: data hanya tersimpan di localStorage browser, dan `/admin/login` menyediakan tombol "Masuk Mode Demo". Endpoint AI hanya aktif di mode demo saat development.

## Setup Supabase (production)

1. Jalankan seluruh isi [`supabase_schema.sql`](supabase_schema.sql) di Supabase SQL Editor (idempotent, aman dijalankan ulang).
2. Buat user admin di **Authentication → Users → Add user** (email + kata sandi).
3. Daftarkan user itu sebagai admin:
   ```sql
   INSERT INTO admins (user_id)
   SELECT id FROM auth.users WHERE email = 'email-admin@contoh.com';
   ```
4. Isi `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan `NEXT_PUBLIC_SITE_URL` di environment deployment.

## Model keamanan

- **Campaign**: publik hanya bisa membaca (draft tersembunyi). Tulis/hapus hanya untuk user di tabel `admins` (RLS `is_admin()`).
- **Hitungan tasbih**: hanya lewat RPC `increment_counter` (1–100 ketukan per panggilan, campaign draft ditolak).
- **Doa**: publik boleh menambah (3–500 karakter, anti-duplikat, maks. 20/menit per campaign) dan meng-aamiin-kan lewat RPC `increment_amin`. Hanya admin yang boleh menghapus (moderasi di `/admin`).
- **AI** (`/api/ai/generate-campaign`): wajib token sesi admin; API key hanya dibaca dari env server (`GEMINI_API_KEY`, `NVIDIA_API_KEY`), tidak pernah dari request.

## Scripts

- `npm run dev` — server development
- `npm run build` — build production
- `npm run lint` — ESLint

# SatuZikir

Majelis zikir daring real-time: jamaah mengetuk tasbih bersama menuju target campaign, menitipkan doa di dinding hajat, dan admin mengelola campaign (dengan bantuan AI).

Stack: Next.js 16 (App Router, Turbopack), React 19, Tailwind 4, Supabase (Postgres + Realtime + Auth).

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local   # isi variabel sesuai kebutuhan
npm run dev
```

Tanpa `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY`, aplikasi berjalan dalam **mode demo**: data hanya tersimpan di localStorage browser. Login admin tetap memakai `ADMIN_PIN` dan `ADMIN_SESSION_SECRET` dari `.env.local`.

## Setup Supabase (production)

1. Jalankan seluruh isi [`supabase_schema.sql`](supabase_schema.sql) di Supabase SQL Editor (idempotent, aman dijalankan ulang).
2. Isi environment variables di Vercel (tipe **Secret** untuk yang rahasia):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`
   - `ADMIN_PIN` (6 digit), `ADMIN_SESSION_SECRET` (≥32 karakter acak), `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY` (opsional: `GEMINI_MODELS`, `NVIDIA_API_KEY`)

## Model keamanan

- **Admin**: login dengan PIN 6 digit yang diperiksa di server; sukses menghasilkan cookie sesi httpOnly bertanda tangan HMAC (berlaku 12 jam). Salah PIN 5x dari satu IP → jeda 15 menit; 20x salah dari semua IP dalam 1 jam → login dikunci 1 jam (tercatat di tabel `admin_login_failures`).
- **Operasi admin** (buat/edit/hapus campaign, koreksi hitungan, hapus doa, AI, skema SQL) hanya lewat route `/api/admin/*` dan `/api/ai/*` yang memeriksa sesi; server memakai service role key.
- **Publik (anon key)**: hanya membaca campaign non-draft, menambah hitungan lewat RPC `increment_counter` (1–100 per panggilan), menitip doa (3–500 karakter, anti-duplikat, maks. 20/menit per campaign), dan meng-aamiin-kan lewat RPC `increment_amin`.

## Scripts

- `npm run dev` — server development
- `npm run build` — build production
- `npm run lint` — ESLint

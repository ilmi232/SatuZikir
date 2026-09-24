-- =======================================================
-- SKEMA DATABASE SATUZIKIR (SUPABASE POSTGRESQL PRODUCTION)
-- Version: 3.1 (Admin PIN via Server + RLS Ketat + Validasi RPC, Idempotent)
--
-- Admin login memakai PIN yang diperiksa di server (env ADMIN_PIN). Semua
-- penulisan data admin dilakukan server dengan SUPABASE_SERVICE_ROLE_KEY,
-- yang melewati RLS. Publik (anon key) hanya bisa membaca, menitip doa,
-- dan menambah hitungan lewat RPC.
-- =======================================================

-- 1. Enable UUID & Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabel Campaigns (Amalan Zikir Bersama Jamaah)
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) DEFAULT 'syifa',
    description TEXT,
    arabic_text TEXT NOT NULL,
    latin_text TEXT,
    translation_text TEXT,
    target_count BIGINT NOT NULL DEFAULT 1000,
    current_count BIGINT NOT NULL DEFAULT 0,
    image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pastikan kolom category ada jika tabel dibuat dari versi sebelumnya
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'syifa';

-- 3. Tabel Prayers (Titip Hajat / Doa Jamaah & Dinding Doa)
CREATE TABLE IF NOT EXISTS prayers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(100) DEFAULT 'Hamba Allah',
    prayer_text TEXT NOT NULL,
    amin_count INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Izinkan campaign_id bernilai NULL untuk Dinding Doa Global (/hajat)
ALTER TABLE prayers ALTER COLUMN campaign_id DROP NOT NULL;

-- Batas panjang teks doa (anti spam). NOT VALID agar data lama tidak memblokir migrasi.
ALTER TABLE prayers DROP CONSTRAINT IF EXISTS prayers_text_length;
ALTER TABLE prayers ADD CONSTRAINT prayers_text_length
    CHECK (char_length(btrim(prayer_text)) BETWEEN 3 AND 500) NOT VALID;
ALTER TABLE prayers DROP CONSTRAINT IF EXISTS prayers_name_length;
ALTER TABLE prayers ADD CONSTRAINT prayers_name_length
    CHECK (name IS NULL OR char_length(name) <= 60) NOT VALID;

-- 4. Catatan login admin yang gagal (untuk jeda/kunci setelah salah PIN).
-- Tanpa policy RLS: hanya server (service role) yang bisa membaca/menulis.
CREATE TABLE IF NOT EXISTS admin_login_failures (
    id BIGSERIAL PRIMARY KEY,
    ip TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_login_failures_created ON admin_login_failures(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_login_failures_ip ON admin_login_failures(ip, created_at DESC);

-- 5. Indeks Performa
CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);
CREATE INDEX IF NOT EXISTS idx_prayers_campaign_id ON prayers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_prayers_created_at ON prayers(created_at DESC);

-- 6. Stored Procedure: Atomic Increment Counter
-- Hanya menerima 1..100 ketukan per panggilan dan menolak campaign draft.
CREATE OR REPLACE FUNCTION increment_counter(target_campaign_id UUID, amount INT)
RETURNS BIGINT AS $$
DECLARE
    new_total BIGINT;
BEGIN
    IF amount IS NULL OR amount < 1 OR amount > 100 THEN
        RAISE EXCEPTION 'Jumlah ketukan tidak valid (1-100 per kiriman)';
    END IF;

    UPDATE campaigns
    SET current_count = current_count + amount,
        updated_at = timezone('utc'::text, now()),
        status = CASE
            WHEN (current_count + amount) >= target_count THEN 'completed'
            ELSE status
        END
    WHERE id = target_campaign_id
      AND status IN ('active', 'completed')
    RETURNING current_count INTO new_total;

    IF new_total IS NULL THEN
        RAISE EXCEPTION 'Campaign tidak ditemukan atau belum dibuka';
    END IF;

    RETURN new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Stored Procedure: Atomic Increment Amin (satu-satunya jalan publik mengubah amin_count)
CREATE OR REPLACE FUNCTION increment_amin(prayer_id UUID)
RETURNS INT AS $$
DECLARE
    new_amin INT;
BEGIN
    UPDATE prayers
    SET amin_count = amin_count + 1
    WHERE id = prayer_id
    RETURNING amin_count INTO new_amin;

    RETURN COALESCE(new_amin, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Trigger anti-spam doa: tolak doa kembar dalam 10 menit
-- dan batasi 20 doa per menit per campaign (atau global).
CREATE OR REPLACE FUNCTION guard_prayer_insert()
RETURNS TRIGGER AS $$
BEGIN
    NEW.prayer_text := btrim(NEW.prayer_text);
    NEW.name := COALESCE(NULLIF(btrim(NEW.name), ''), 'Hamba Allah');
    NEW.amin_count := 1;
    NEW.created_at := timezone('utc'::text, now());

    IF EXISTS (
        SELECT 1 FROM prayers
        WHERE lower(prayer_text) = lower(NEW.prayer_text)
          AND created_at > now() - interval '10 minutes'
    ) THEN
        RAISE EXCEPTION 'Doa yang sama baru saja dikirim';
    END IF;

    IF (
        SELECT count(*) FROM prayers
        WHERE campaign_id IS NOT DISTINCT FROM NEW.campaign_id
          AND created_at > now() - interval '1 minute'
    ) >= 20 THEN
        RAISE EXCEPTION 'Terlalu banyak doa masuk, coba lagi sebentar';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_guard_prayer_insert ON prayers;
CREATE TRIGGER trg_guard_prayer_insert
    BEFORE INSERT ON prayers
    FOR EACH ROW EXECUTE FUNCTION guard_prayer_insert();

-- 9. Realtime Replication Configuration
ALTER TABLE campaigns REPLICA IDENTITY FULL;
ALTER TABLE prayers REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'campaigns'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'prayers'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE prayers;
    END IF;
END $$;

-- 10. Row Level Security (RLS) & Kebijakan Akses
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_login_failures ENABLE ROW LEVEL SECURITY;

-- Reset policies agar eksekusi script selalu idempotent (termasuk policy versi lama)
DROP POLICY IF EXISTS "Public can view campaigns" ON campaigns;
DROP POLICY IF EXISTS "Allow public and anon to manage campaigns" ON campaigns;
DROP POLICY IF EXISTS "Public can view published campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins manage campaigns" ON campaigns;
DROP POLICY IF EXISTS "Public can view prayers" ON prayers;
DROP POLICY IF EXISTS "Public can insert prayers" ON prayers;
DROP POLICY IF EXISTS "Allow public to update prayers" ON prayers;
DROP POLICY IF EXISTS "Admins delete prayers" ON prayers;

-- Bersihkan mekanisme admin berbasis Supabase Auth dari versi 3.0
DROP TABLE IF EXISTS admins CASCADE;
DROP FUNCTION IF EXISTS is_admin();

-- Campaigns: publik hanya melihat campaign yang sudah dibuka (bukan draft).
-- Tidak ada policy tulis: create/update/delete hanya lewat server (service role).
CREATE POLICY "Public can view published campaigns"
ON campaigns FOR SELECT
USING (status <> 'draft');

-- Prayers: publik bisa melihat doa
CREATE POLICY "Public can view prayers"
ON prayers FOR SELECT
USING (true);

-- Prayers: publik bisa menitipkan doa (tanpa login); batas dijaga constraint & trigger
CREATE POLICY "Public can insert prayers"
ON prayers FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Prayers: tidak ada UPDATE/DELETE publik — amin hanya lewat increment_amin(),
-- moderasi (hapus doa) hanya lewat server (service role).

-- Hak eksekusi Stored Procedure
REVOKE EXECUTE ON FUNCTION increment_counter(UUID, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION increment_amin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_counter(UUID, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_amin(UUID) TO anon, authenticated;

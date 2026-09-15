export const SUPABASE_PRODUCTION_SQL = `-- =======================================================
-- SKEMA DATABASE SATUZIKIR (SUPABASE POSTGRESQL PRODUCTION)
-- Version: 2.5 (Production Ready & Idempotent)
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

-- 4. Indeks Performa Tinggi (Query Cepat < 5ms)
CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);
CREATE INDEX IF NOT EXISTS idx_prayers_campaign_id ON prayers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_prayers_created_at ON prayers(created_at DESC);

-- 5. Stored Procedure: Atomic Increment Counter (Anti Race-Condition)
-- Menjamin jutaan ketukan serentak tidak akan hilang (lost update)
CREATE OR REPLACE FUNCTION increment_counter(target_campaign_id UUID, amount INT)
RETURNS BIGINT AS $$
DECLARE
    new_total BIGINT;
BEGIN
    UPDATE campaigns
    SET current_count = current_count + amount,
        updated_at = timezone('utc'::text, now()),
        status = CASE 
            WHEN (current_count + amount) >= target_count THEN 'completed' 
            ELSE status 
        END
    WHERE id = target_campaign_id
    RETURNING current_count INTO new_total;

    RETURN COALESCE(new_total, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Stored Procedure: Atomic Increment Amin (Doa Jamaah)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Realtime Replication Configuration
-- Aktifkan replikasi penuh agar payload broadcast membawa data lengkap
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

-- 8. Row Level Security (RLS) & Kebijakan Akses
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

-- Reset policies agar eksekusi script selalu idempotent
DROP POLICY IF EXISTS "Public can view campaigns" ON campaigns;
DROP POLICY IF EXISTS "Allow public and anon to manage campaigns" ON campaigns;
DROP POLICY IF EXISTS "Public can view prayers" ON prayers;
DROP POLICY IF EXISTS "Public can insert prayers" ON prayers;
DROP POLICY IF EXISTS "Allow public to update prayers" ON prayers;

-- Campaigns: Publik bisa membaca semua campaign
CREATE POLICY "Public can view campaigns"
ON campaigns FOR SELECT
USING (true);

-- Campaigns: Akses kelola campaign (Admin & Anon API)
CREATE POLICY "Allow public and anon to manage campaigns"
ON campaigns FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Prayers: Publik bisa melihat doa
CREATE POLICY "Public can view prayers"
ON prayers FOR SELECT
USING (true);

-- Prayers: Publik bisa menitipkan doa (tanpa login)
CREATE POLICY "Public can insert prayers"
ON prayers FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Prayers: Publik bisa mengaminkan doa
CREATE POLICY "Allow public to update prayers"
ON prayers FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Hak eksekusi Stored Procedure untuk publik anon & authenticated
GRANT EXECUTE ON FUNCTION increment_counter(UUID, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_amin(UUID) TO anon, authenticated;
`;

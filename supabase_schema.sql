-- =======================================================
-- SKEMA DATABASE SATUZIKIR (SUPABASE POSTGRESQL)
-- =======================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabel Campaigns (Amalan Zikir Bersama)
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
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

-- 3. Tabel Prayers (Titip Hajat / Doa Jamaah)
CREATE TABLE IF NOT EXISTS prayers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(100) DEFAULT 'Hamba Allah',
    prayer_text TEXT NOT NULL,
    amin_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Index untuk Performa Tinggi
CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_prayers_campaign_id ON prayers(campaign_id);

-- 5. Stored Procedure: Atomic Increment Counter
-- Fungsi ini menjamin jutaan klik serentak tidak akan mengalami race condition (lost update).
CREATE OR REPLACE FUNCTION increment_counter(target_campaign_id UUID, amount INT)
RETURNS BIGINT AS $$
DECLARE
    new_total BIGINT;
BEGIN
    UPDATE campaigns
    SET current_count = current_count + amount,
        updated_at = timezone('utc'::text, now())
    WHERE id = target_campaign_id
    RETURNING current_count INTO new_total;

    RETURN new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Stored Procedure: Atomic Increment Amin (Doa)
CREATE OR REPLACE FUNCTION increment_amin(prayer_id UUID)
RETURNS INT AS $$
DECLARE
    new_amin INT;
BEGIN
    UPDATE prayers
    SET amin_count = amin_count + 1
    WHERE id = prayer_id
    RETURNING amin_count INTO new_amin;

    RETURN new_amin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Realtime Replication
-- Mengaktifkan pengiriman data Realtime ke browser saat counter atau doa berubah
ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE prayers;

-- 8. Row Level Security (RLS)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

-- Kebijakan untuk Publik (Tanpa Login):
-- Siapapun bisa membaca data campaign aktif
CREATE POLICY "Public can view campaigns"
ON campaigns FOR SELECT
USING (true);

-- Siapapun bisa memanggil RPC increment_counter (karena SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION increment_counter(UUID, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_amin(UUID) TO anon, authenticated;

-- Publik bisa melihat doa
CREATE POLICY "Public can view prayers"
ON prayers FOR SELECT
USING (true);

-- Publik bisa menambah doa (tanpa login)
CREATE POLICY "Public can insert prayers"
ON prayers FOR INSERT
WITH CHECK (true);

-- Admin (Authenticated) bisa mengelola campaign
CREATE POLICY "Admins can manage campaigns"
ON campaigns FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can manage prayers"
ON prayers FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 9. Data Awal (Seeding Contoh Campaign: Shalawat Nariyah 4.444x)
INSERT INTO campaigns (title, slug, description, arabic_text, latin_text, translation_text, target_count, current_count, status, image_url)
VALUES (
    'Shalawat Nariyah 4.444x untuk Kemudahan & Hajat Bersama',
    'shalawat-nariyah-4444',
    'Mari bersama-sama melantunkan Shalawat Nariyah sebanyak 4.444 kali untuk memohon kemudahan segala urusan, keberkahan hidup, dan perlindungan bagi seluruh umat.',
    'اللَّهُمَّ صَلِّ صَلاَةً كَامِلَةً وَسَلِّمْ سَلاَماً تَامّاً عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ الْعُقَدُ وَتَنْفَرِجُ بِهِ الْكُرَبُ وَتُقْضَى بِهِ الْحَوَائِجُ وَتُنَالُ بِهِ الرَّغَائِبُ وَحُسْنُ الْخَوَاتِيمِ وَيُسْتَسْقَى الْغَمَامُ بِوَجْهِهِ الْكَرِيمِ وَعَلَى آلِهِ وَصَحْبِهِ فِي كُلِّ لَمْحَةٍ وَنَفَسٍ بِعَدَدِ كُلِّ مَعْلُومٍ لَكَ',
    'Allâhumma shalli shalâtan kâmilatan wa sallim salâman tâmman `alâ sayyidinâ Muhammadinilladzî tanhallu bihil `uqadu wa tanfariju bihil kurabu wa tuqdlâ bihil hawâ-iju wa tunâlu bihir raghâ-ibu wa husnul khawâtîmi wa yustasqal ghamâmu biwajhihil karîmi wa `alâ âlihi wa shahbihî fî kulli lamhatin wa nafasin bi`adadi kulli ma`lûmin laka.',
    'Ya Allah, limpahkanlah shalawat yang sempurna dan keselamatan yang paripurna kepada junjungan kami Nabi Muhammad, yang dengannya terlepas segala ikatan, terbebas dari segala kesedihan, terpenuhi segala kebutuhan, tercapai segala keinginan dan akhir hidup yang baik, serta dicurahkan hujan rahmat berkat kemuliaan wajahnya, juga kepada keluarga dan para sahabatnya pada setiap kejap mata dan hembusan nafas sebanyak hitungan segala yang Engkau ketahui.',
    4444,
    1820,
    'active',
    'https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=1000&auto=format&fit=crop'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO campaigns (title, slug, description, arabic_text, latin_text, translation_text, target_count, current_count, status, image_url)
VALUES (
    'Sayyidul Istighfar 10.000x Mengetuk Pintu Ampunan',
    'sayyidul-istighfar-10000',
    'Amalan memohon ampunan terbaik yang diajarkan Rasulullah SAW, dibaca bersama-sama sebagai wujud tawadhu dan pembersih hati.',
    'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    'Allâhumma anta rabbî lâ ilâha illâ anta, khalaqtanî wa anâ `abduka, wa anâ `alâ `ahdika wa wa`dika mastatha`tu, a`ûdzu bika min syarri mâ shana`tu, abû-u laka bini`matika `alayya, wa abû-u bidzanbî faghfir lî fa-innahû lâ yaghfirudz dzunûba illâ anta.',
    'Ya Allah, Engkaulah Tuhanku, tidak ada tuhan yang berhak disembah selain Engkau. Engkau yang menciptakan aku dan aku adalah hamba-Mu. Aku memegang teguh perjanjian dan janji-Mu semampuku. Aku berlindung kepada-Mu dari keburukan yang kuperbuat. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku, maka ampunilah aku, sesungguhnya tidak ada yang dapat mengampuni dosa selain Engkau.',
    10000,
    6430,
    'active',
    'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?q=80&w=1000&auto=format&fit=crop'
)
ON CONFLICT (slug) DO NOTHING;

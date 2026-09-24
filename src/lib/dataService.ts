import { Campaign, Prayer } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';
import { supabaseAnonKey, supabaseUrl } from './supabaseConfig';
import { adminApi } from './adminAuth';

// Mode Supabase: semua operasi ke server, error diteruskan ke pemanggil agar UI
// bisa memberi tahu pengguna. Mode lokal (Supabase belum dikonfigurasi): data
// disimpan di localStorage browser ini saja, untuk demo/pengembangan.

export const PRAYER_TEXT_MIN = 3;
export const PRAYER_TEXT_MAX = 500;
export const PRAYER_NAME_MAX = 60;

// Helper to check valid UUID
function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// Purge legacy mock storage
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('satuzikir_campaigns_v2');
    localStorage.removeItem('satuzikir_prayers_v2');
  } catch {
    // ignore
  }
}

function readLocal<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocal<T>(key: string, items: T[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Ignore storage quota
  }
}

const getLocalCampaigns = () => readLocal<Campaign>('satuzikir_campaigns_v3');
const saveLocalCampaigns = (list: Campaign[]) => writeLocal('satuzikir_campaigns_v3', list);
const getLocalPrayers = () => readLocal<Prayer>('satuzikir_prayers_v3');
const saveLocalPrayers = (list: Prayer[]) => writeLocal('satuzikir_prayers_v3', list);

const AMINED_KEY = 'satuzikir_amined_prayers';

function newId(prefix: string): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${prefix}_${Date.now()}`;
}

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('satuzikir_sync_v2');
  } catch {
    broadcastChannel = null;
  }
}

/** Resolve slug atau UUID campaign ke UUID di Supabase. */
async function resolveCampaignUuid(idOrSlug: string): Promise<string | null> {
  if (isValidUUID(idOrSlug)) return idOrSlug;
  const { data, error } = await supabase!.from('campaigns').select('id').eq('slug', idOrSlug).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.id ?? null;
}

function validatePrayer(name: string, prayerText: string) {
  const text = prayerText.trim();
  if (text.length < PRAYER_TEXT_MIN) throw new Error('Isi doa terlalu pendek.');
  if (text.length > PRAYER_TEXT_MAX) throw new Error(`Isi doa maksimal ${PRAYER_TEXT_MAX} karakter.`);
  if (name.trim().length > PRAYER_NAME_MAX) throw new Error(`Nama maksimal ${PRAYER_NAME_MAX} karakter.`);
}

type CampaignInput = Omit<Campaign, 'id' | 'created_at'> & { id?: string };

export const DataService = {
  /**
   * Get campaigns. Draft hanya ikut jika includeDrafts (halaman admin).
   */
  async getCampaigns({ includeDrafts = false }: { includeDrafts?: boolean } = {}): Promise<Campaign[]> {
    let list: Campaign[];
    if (isSupabaseConfigured && includeDrafts) {
      // Draft tidak bisa dibaca publik (RLS), jadi admin mengambil lewat server
      const { campaigns } = await adminApi<{ campaigns: Campaign[] }>('/api/admin/campaigns');
      return campaigns;
    } else if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      list = data as Campaign[];
    } else {
      list = getLocalCampaigns();
    }
    return includeDrafts ? list : list.filter((c) => c.status !== 'draft');
  },

  /**
   * Get single campaign by slug or UUID. Null jika tidak ada.
   */
  async getCampaignBySlug(
    slug: string,
    { includeDrafts = false }: { includeDrafts?: boolean } = {}
  ): Promise<Campaign | null> {
    let campaign: Campaign | null;
    if (isSupabaseConfigured && supabase) {
      const query = supabase.from('campaigns').select('*');
      const { data, error } = await (isValidUUID(slug) ? query.eq('id', slug) : query.eq('slug', slug)).maybeSingle();
      if (error) throw new Error(error.message);
      campaign = (data as Campaign) ?? null;
    } else {
      campaign = getLocalCampaigns().find((c) => c.slug === slug || c.id === slug) ?? null;
    }
    if (campaign && campaign.status === 'draft' && !includeDrafts) return null;
    return campaign;
  },

  /**
   * Atomic increment counter (RPC di Supabase). Mengembalikan total terbaru.
   */
  async incrementCounter(campaignId: string, amount: number): Promise<number> {
    if (amount <= 0) return 0;

    if (isSupabaseConfigured && supabase) {
      const targetUuid = await resolveCampaignUuid(campaignId);
      if (!targetUuid) throw new Error('Campaign tidak ditemukan.');

      const { data, error } = await supabase.rpc('increment_counter', {
        target_campaign_id: targetUuid,
        amount,
      });
      if (error) throw new Error(error.message);
      return Number(data);
    }

    // Local Storage mode
    const campaigns = getLocalCampaigns();
    const index = campaigns.findIndex((c) => c.id === campaignId || c.slug === campaignId);
    if (index === -1) return 0;

    const newCount = Number(campaigns[index].current_count) + amount;
    const updated: Campaign = {
      ...campaigns[index],
      current_count: newCount,
      status: newCount >= campaigns[index].target_count ? 'completed' : campaigns[index].status,
    };
    campaigns[index] = updated;
    saveLocalCampaigns(campaigns);

    broadcastChannel?.postMessage({
      type: 'COUNTER_INCREMENTED',
      campaignId,
      newCount: updated.current_count,
      status: updated.status,
    });

    return updated.current_count;
  },

  /**
   * Kirim sisa ketukan saat halaman ditutup/disembunyikan. Memakai
   * fetch keepalive agar request tetap terkirim walau tab sudah ditutup.
   * campaignId harus UUID (campaign yang sudah dimuat).
   */
  flushCounterOnExit(campaignId: string, amount: number) {
    if (amount <= 0) return;

    if (!isSupabaseConfigured) {
      void this.incrementCounter(campaignId, amount);
      return;
    }

    try {
      void fetch(`${supabaseUrl}/rest/v1/rpc/increment_counter`, {
        method: 'POST',
        keepalive: true,
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target_campaign_id: campaignId, amount }),
      }).catch(() => {});
    } catch {
      // ignore — halaman sedang ditutup
    }
  },

  /**
   * Realtime subscription for a campaign counter
   */
  subscribeToCampaign(campaignId: string, onUpdate: (campaign: Partial<Campaign>) => void) {
    if (isSupabaseConfigured && supabase) {
      const isUuid = isValidUUID(campaignId);
      const filter = isUuid ? `id=eq.${campaignId}` : undefined;

      const channel = supabase
        .channel(`campaign-rt-${campaignId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'campaigns',
            ...(filter ? { filter } : {}),
          },
          (payload) => {
            if (payload.new) {
              const updated = payload.new as Campaign;
              if (!filter && updated.slug !== campaignId && updated.id !== campaignId) {
                return;
              }
              onUpdate(updated);
            }
          }
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'COUNTER_INCREMENTED' && event.data?.campaignId === campaignId) {
        onUpdate({
          current_count: event.data.newCount,
          status: event.data.status,
        });
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleMessage);
      return () => {
        broadcastChannel?.removeEventListener('message', handleMessage);
      };
    }

    return () => {};
  },

  /**
   * Get prayers ('global' = semua doa untuk Dinding Doa)
   */
  async getPrayers(campaignId?: string): Promise<Prayer[]> {
    const isGlobal = !campaignId || campaignId === 'global';

    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('prayers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!isGlobal) {
        const uuid = await resolveCampaignUuid(campaignId);
        if (!uuid) return [];
        query = query.eq('campaign_id', uuid);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as Prayer[];
    }

    const prayers = getLocalPrayers();
    return isGlobal ? prayers : prayers.filter((p) => p.campaign_id === campaignId);
  },

  /**
   * Submit prayer
   */
  async submitPrayer(campaignId: string, name: string, prayerText: string): Promise<Prayer> {
    validatePrayer(name, prayerText);
    const isGlobal = !campaignId || campaignId === 'global';

    if (isSupabaseConfigured && supabase) {
      const targetUuid = isGlobal ? null : await resolveCampaignUuid(campaignId);
      const { data, error } = await supabase
        .from('prayers')
        .insert({
          campaign_id: targetUuid,
          name: name.trim() || 'Hamba Allah',
          prayer_text: prayerText.trim(),
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Prayer;
    }

    const newPrayer: Prayer = {
      id: newId('p'),
      campaign_id: campaignId,
      name: name.trim() || 'Hamba Allah',
      prayer_text: prayerText.trim(),
      amin_count: 1,
      created_at: new Date().toISOString(),
    };
    const prayers = getLocalPrayers();
    prayers.unshift(newPrayer);
    saveLocalPrayers(prayers);

    broadcastChannel?.postMessage({ type: 'NEW_PRAYER', prayer: newPrayer });
    return newPrayer;
  },

  /** Apakah perangkat ini sudah meng-aamiin-kan doa tersebut. */
  hasAmined(prayerId: string): boolean {
    return readLocal<string>(AMINED_KEY).includes(prayerId);
  },

  /**
   * Increment Amin (sekali per doa per perangkat)
   */
  async aminPrayer(prayerId: string): Promise<number | null> {
    if (this.hasAmined(prayerId)) return null;
    writeLocal(AMINED_KEY, [...readLocal<string>(AMINED_KEY), prayerId].slice(-500));

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('increment_amin', { prayer_id: prayerId });
      if (error) throw new Error(error.message);
      return Number(data);
    }

    const prayers = getLocalPrayers();
    const item = prayers.find((p) => p.id === prayerId);
    if (!item) return null;

    item.amin_count = (item.amin_count || 0) + 1;
    saveLocalPrayers(prayers);
    broadcastChannel?.postMessage({ type: 'PRAYER_AMIN', prayerId, newAmin: item.amin_count });
    return item.amin_count;
  },

  /**
   * Realtime subscription for Prayers
   */
  subscribeToPrayers(
    campaignId: string,
    onNewPrayer: (prayer: Prayer) => void,
    onAminUpdate: (prayerId: string, newAmin: number) => void
  ) {
    const isGlobal = !campaignId || campaignId === 'global';

    if (isSupabaseConfigured && supabase) {
      const filter = !isGlobal && isValidUUID(campaignId) ? `campaign_id=eq.${campaignId}` : undefined;

      const channel = supabase
        .channel(`prayers-rt-${campaignId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'prayers',
            ...(filter ? { filter } : {}),
          },
          (payload) => {
            if (payload.new) {
              onNewPrayer(payload.new as Prayer);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'prayers',
            ...(filter ? { filter } : {}),
          },
          (payload) => {
            if (payload.new) {
              const updated = payload.new as Prayer;
              onAminUpdate(updated.id, updated.amin_count);
            }
          }
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NEW_PRAYER') {
        const prayer = event.data.prayer as Prayer;
        if (isGlobal || prayer.campaign_id === campaignId) onNewPrayer(prayer);
      } else if (event.data?.type === 'PRAYER_AMIN') {
        onAminUpdate(event.data.prayerId, event.data.newAmin);
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleMessage);
      return () => {
        broadcastChannel?.removeEventListener('message', handleMessage);
      };
    }

    return () => {};
  },

  /**
   * Hapus doa (moderasi admin)
   */
  async deletePrayer(prayerId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await adminApi(`/api/admin/prayers/${encodeURIComponent(prayerId)}`, { method: 'DELETE' });
      return;
    }
    saveLocalPrayers(getLocalPrayers().filter((p) => p.id !== prayerId));
  },

  /**
   * Save Campaign (Create or Update) — lewat route admin di server.
   * Update TIDAK menyentuh current_count agar ketukan jamaah yang masuk selama
   * admin mengedit tidak tertimpa; koreksi hitungan pakai setCampaignCount().
   */
  async saveCampaign(campaign: CampaignInput): Promise<Campaign> {
    const fields = {
      title: campaign.title,
      slug: campaign.slug,
      category: campaign.category || 'syifa',
      description: campaign.description,
      arabic_text: campaign.arabic_text,
      latin_text: campaign.latin_text,
      translation_text: campaign.translation_text,
      target_count: campaign.target_count,
      status: campaign.status,
      image_url: campaign.image_url,
    };

    if (isSupabaseConfigured) {
      const existingId = campaign.id && isValidUUID(campaign.id) ? campaign.id : null;
      const { campaign: saved } = existingId
        ? await adminApi<{ campaign: Campaign }>(`/api/admin/campaigns/${existingId}`, {
            method: 'PATCH',
            body: JSON.stringify(fields),
          })
        : await adminApi<{ campaign: Campaign }>('/api/admin/campaigns', {
            method: 'POST',
            body: JSON.stringify({ ...fields, current_count: campaign.current_count || 0 }),
          });
      return saved;
    }

    // Local Storage mode
    const list = getLocalCampaigns();
    const idx = campaign.id ? list.findIndex((c) => c.id === campaign.id) : -1;
    if (idx !== -1) {
      const updated = { ...list[idx], ...fields, updated_at: new Date().toISOString() };
      list[idx] = updated;
      saveLocalCampaigns(list);
      return updated;
    }

    if (list.some((c) => c.slug === campaign.slug)) {
      throw new Error('Slug campaign sudah dipakai. Ubah judulnya sedikit.');
    }
    const newCampaign: Campaign = {
      ...campaign,
      id: newId('c'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.unshift(newCampaign);
    saveLocalCampaigns(list);
    return newCampaign;
  },

  /**
   * Koreksi/reset hitungan campaign (admin)
   */
  async setCampaignCount(campaign: Campaign, count: number): Promise<void> {
    const status: Campaign['status'] = count >= campaign.target_count ? 'completed' : campaign.status;

    if (isSupabaseConfigured) {
      await adminApi(`/api/admin/campaigns/${campaign.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ current_count: count, status }),
      });
      return;
    }

    const list = getLocalCampaigns();
    const idx = list.findIndex((c) => c.id === campaign.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], current_count: count, status };
      saveLocalCampaigns(list);
    }
  },

  /**
   * Delete Campaign
   */
  async deleteCampaign(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      await adminApi(`/api/admin/campaigns/${encodeURIComponent(id)}`, { method: 'DELETE' });
      return;
    }

    saveLocalCampaigns(getLocalCampaigns().filter((c) => c.id !== id && c.slug !== id));
  },

  /**
   * Upload campaign dari localStorage (mode demo) ke Supabase lewat server
   */
  async migrateLocalToSupabase(): Promise<{ success: boolean; migrated: number; error?: string }> {
    if (!isSupabaseConfigured) {
      return { success: false, migrated: 0, error: 'Koneksi Supabase belum aktif di .env.local' };
    }

    const { migrated, errors } = await adminApi<{ migrated: number; errors: string[] }>(
      '/api/admin/campaigns/import',
      { method: 'POST', body: JSON.stringify({ campaigns: getLocalCampaigns() }) }
    );
    return { success: errors.length === 0, migrated, error: errors[0] };
  },
};

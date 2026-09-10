import { Campaign, Prayer } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const INITIAL_MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1b48b6f-87df-4e2b-9831-294b4cf43e51',
    title: 'Shalawat Nariyah 4.444x untuk Kesembuhan Saudara Kita',
    slug: 'shalawat-nariyah-4444',
    category: 'syifa',
    description: 'Niat istighasah bersama untuk kesembuhan kerabat dan jamaah yang terbaring di rumah sakit.',
    arabic_text: 'اللَّهُمَّ صَلِّ صَلاَةً كَامِلَةً وَسَلِّمْ سَلاَمًا تَامًّا عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ الْعُقَدُ وَتَنْفَرِجُ بِهِ الْكُرَبُ وَتُقْضَى بِهِ الْحَوَائِجُ وَتُنَالُ بِهِ الرَّغَائِبُ وَحُسْنُ الْخَوَاتِيمِ وَيُسْتَسْقَى الْغَمَامُ بِوَجْهِهِ الْكَرِيمِ وَعَلَى آلِهِ وَصَحْبِهِ فِي كُلِّ لَمْحَةٍ وَنَفَسٍ بِعَدَدِ كُلِّ مَعْلُومٍ لَكَ',
    latin_text: "Allâhumma shalli shalâtan kâmilatan wa sallim salâman tâmman 'alâ sayyidinâ Muhammadinilladzî tanhallu bihil 'uqadu wa tanfariju bihil kurabu...",
    translation_text: 'Ya Allah, limpahkanlah shalawat yang sempurna dan keselamatan yang utuh kepada junjungan kami Nabi Muhammad, yang melaluinya terurai segala ikatan dan terangkat segala duka...',
    target_count: 4444,
    current_count: 3120,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'a8e99b62-12fd-4a21-88fc-8473b185bc02',
    title: 'Istighfar 100.000x Tarhib Ramadan',
    slug: 'istighfar-100000',
    category: 'ramadan',
    description: 'Membersihkan jiwa dan menyucikan hati menyambut datangnya bulan penuh ampunan dan rahmat.',
    arabic_text: 'أَسْتَغْفِرُ اللّٰهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ',
    latin_text: "Astaghfirullâhal 'azhîma wa atûbu ilaih.",
    translation_text: 'Aku memohon ampunan kepada Allah Yang Maha Agung dan bertaubat kepada-Nya.',
    target_count: 100000,
    current_count: 64250,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'f32c918a-442b-4221-a1b9-8bc43d411122',
    title: "Hasbunallah Wa Ni'mal Wakil 10.000x",
    slug: 'hasbunallah-10000',
    category: 'tolak-bala',
    description: 'Doa perisai umat memohon ketenteraman, perdamaian saudara, dan perlindungan dari marabahaya.',
    arabic_text: 'حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكِيلُ نِعْمَ الْمَوْلَىٰ وَنِعْمَ النَّصِيرُ',
    latin_text: "Hasbunallâhu wa ni'mal wakîl, ni'mal maulâ wa ni'man nashîr.",
    translation_text: 'Cukuplah Allah menjadi Penolong kami dan Allah adalah sebaik-baik Pelindung.',
    target_count: 10000,
    current_count: 8910,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'e49b8172-3321-4112-98ab-102938475612',
    title: 'Shalawat Tibbil Qulub 10.000x Penyejuk Jiwa',
    slug: 'tibbil-qulub-10000',
    category: 'syifa',
    description: 'Kesehatan keluarga besar jamaah Nusantara dan penenang kegelisahan hati.',
    arabic_text: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ طِبِّ الْقُلُوبِ وَدَوَائِهَا وَعَافِيَةِ الأَبْدَانِ وَشِفَائِهَا وَنُورِ الأَبْصَارِ وَضِيَائِهَا وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ',
    latin_text: "Allâhumma shalli 'alâ sayyidinâ Muhammadin thibbil qulûbi wa dawâ-ihâ...",
    translation_text: 'Ya Allah limpahkanlah rahmat kepada junjungan kami Nabi Muhammad, sebagai obat hati dan penawarnya, penyehat badan dan kesembuhannya...',
    target_count: 10000,
    current_count: 8432,
    status: 'active',
    created_at: new Date().toISOString(),
  }
];

const INITIAL_MOCK_PRAYERS: Prayer[] = [
  {
    id: 'p1',
    campaign_id: 'c1b48b6f-87df-4e2b-9831-294b4cf43e51',
    name: 'Siti Aminah (Surabaya)',
    prayer_text: 'Mohon kesembuhan berkah operasi Ibu di RS Sardjito, semoga diangkat penyakitnya. Aamiin.',
    amin_count: 142,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'p2',
    campaign_id: 'c1b48b6f-87df-4e2b-9831-294b4cf43e51',
    name: 'Fulan bin Fulan (Bandung)',
    prayer_text: 'Semoga ikhtiar anak kami dipermudah dan dijadikan anak yang sholeh pecinta majelis zikir.',
    amin_count: 89,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'p3',
    campaign_id: 'c1b48b6f-87df-4e2b-9831-294b4cf43e51',
    name: 'Hamba Allah (Yogyakarta)',
    prayer_text: 'Bismillah dilancarkan rezeki yang halal berkah dan dijauhkan dari marabahaya.',
    amin_count: 104,
    created_at: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
  }
];

// Helper to check valid UUID
function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function getLocalCampaigns(): Campaign[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_CAMPAIGNS;
  try {
    const raw = localStorage.getItem('satuzikir_campaigns_v2');
    if (raw) {
      return JSON.parse(raw);
    }
    localStorage.setItem('satuzikir_campaigns_v2', JSON.stringify(INITIAL_MOCK_CAMPAIGNS));
    return INITIAL_MOCK_CAMPAIGNS;
  } catch {
    return INITIAL_MOCK_CAMPAIGNS;
  }
}

function saveLocalCampaigns(campaigns: Campaign[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('satuzikir_campaigns_v2', JSON.stringify(campaigns));
  } catch {
    // Ignore storage quota
  }
}

function getLocalPrayers(): Prayer[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_PRAYERS;
  try {
    const raw = localStorage.getItem('satuzikir_prayers_v2');
    if (raw) {
      return JSON.parse(raw);
    }
    localStorage.setItem('satuzikir_prayers_v2', JSON.stringify(INITIAL_MOCK_PRAYERS));
    return INITIAL_MOCK_PRAYERS;
  } catch {
    return INITIAL_MOCK_PRAYERS;
  }
}

function saveLocalPrayers(prayers: Prayer[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('satuzikir_prayers_v2', JSON.stringify(prayers));
  } catch {
    // Ignore storage quota
  }
}

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('satuzikir_sync_v2');
  } catch {
    broadcastChannel = null;
  }
}

export const DataService = {
  /**
   * Get all campaigns (Supabase Live with fallback to Local Storage)
   */
  async getCampaigns(): Promise<Campaign[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          if (data.length === 0) {
            // Table exists but is empty -> Auto seed initial campaigns
            await DataService.seedDatabase();
            const recheck = await supabase
              .from('campaigns')
              .select('*')
              .order('created_at', { ascending: false });
            if (recheck.data && recheck.data.length > 0) {
              saveLocalCampaigns(recheck.data as Campaign[]);
              return recheck.data as Campaign[];
            }
          } else {
            saveLocalCampaigns(data as Campaign[]);
            return data as Campaign[];
          }
        }
      } catch (err) {
        console.warn('Supabase getCampaigns failed, falling back to local storage', err);
      }
    }
    return getLocalCampaigns();
  },

  /**
   * Get single campaign by slug or UUID
   */
  async getCampaignBySlug(slug: string): Promise<Campaign | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const isUuid = isValidUUID(slug);
        let query = supabase.from('campaigns').select('*');
        if (isUuid) {
          query = query.eq('id', slug);
        } else {
          query = query.eq('slug', slug);
        }

        const { data, error } = await query.maybeSingle();
        if (!error && data) {
          return data as Campaign;
        }
      } catch (err) {
        console.warn('Supabase getCampaignBySlug failed, falling back to local storage', err);
      }
    }
    const local = getLocalCampaigns();
    return local.find((c) => c.slug === slug || c.id === slug) || local[0] || null;
  },

  /**
   * Atomic increment counter (Anti-Race Condition via RPC)
   */
  async incrementCounter(campaignId: string, amount: number): Promise<number> {
    if (amount <= 0) return 0;

    if (isSupabaseConfigured && supabase) {
      try {
        let targetUuid = campaignId;
        if (!isValidUUID(campaignId)) {
          // If a slug was passed, find its UUID
          const { data: c } = await supabase
            .from('campaigns')
            .select('id')
            .eq('slug', campaignId)
            .maybeSingle();
          if (c?.id) targetUuid = c.id;
        }

        if (isValidUUID(targetUuid)) {
          const { data, error } = await supabase.rpc('increment_counter', {
            target_campaign_id: targetUuid,
            amount,
          });

          if (!error && typeof data === 'number' && data > 0) {
            // Also keep local storage aligned
            const campaigns = getLocalCampaigns();
            const index = campaigns.findIndex((c) => c.id === targetUuid || c.slug === campaignId);
            if (index !== -1) {
              campaigns[index].current_count = data;
              saveLocalCampaigns(campaigns);
            }
            return data;
          }
        }
      } catch (err) {
        console.warn('Supabase RPC increment_counter fallback to local', err);
      }
    }

    // Local Storage Fallback
    const campaigns = getLocalCampaigns();
    const index = campaigns.findIndex((c) => c.id === campaignId || c.slug === campaignId);
    if (index !== -1) {
      const updated = {
        ...campaigns[index],
        current_count: Number(campaigns[index].current_count) + amount,
        status:
          Number(campaigns[index].current_count) + amount >= campaigns[index].target_count
            ? ('completed' as const)
            : campaigns[index].status,
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
    }

    return 0;
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
      if (
        event.data?.type === 'COUNTER_INCREMENTED' &&
        (event.data?.campaignId === campaignId || event.data?.slug === campaignId)
      ) {
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
   * Get prayers (Dinding Doa / Specific Campaign)
   */
  async getPrayers(campaignId?: string): Promise<Prayer[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('prayers')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (campaignId && campaignId !== 'global') {
          if (isValidUUID(campaignId)) {
            query = query.eq('campaign_id', campaignId);
          } else {
            const { data: c } = await supabase
              .from('campaigns')
              .select('id')
              .eq('slug', campaignId)
              .maybeSingle();
            if (c?.id) {
              query = query.eq('campaign_id', c.id);
            }
          }
        }

        const { data, error } = await query;
        if (!error && data) {
          return data as Prayer[];
        }
      } catch (err) {
        console.warn('Supabase getPrayers fallback to local', err);
      }
    }

    const prayers = getLocalPrayers();
    if (campaignId && campaignId !== 'global') {
      const filtered = prayers.filter((p) => p.campaign_id === campaignId);
      return filtered.length > 0 ? filtered : prayers;
    }
    return prayers;
  },

  /**
   * Submit prayer
   */
  async submitPrayer(campaignId: string, name: string, prayerText: string): Promise<Prayer> {
    const newPrayer: Prayer = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'p_' + Date.now(),
      campaign_id: campaignId,
      name: name.trim() || 'Hamba Allah',
      prayer_text: prayerText.trim(),
      amin_count: 1,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        let targetUuid: string | null = null;
        if (campaignId && campaignId !== 'global') {
          if (isValidUUID(campaignId)) {
            targetUuid = campaignId;
          } else {
            const { data: c } = await supabase
              .from('campaigns')
              .select('id')
              .eq('slug', campaignId)
              .maybeSingle();
            targetUuid = c?.id || null;
          }
        }

        const { data, error } = await supabase
          .from('prayers')
          .insert({
            campaign_id: targetUuid,
            name: newPrayer.name,
            prayer_text: newPrayer.prayer_text,
            amin_count: 1,
          })
          .select()
          .single();

        if (!error && data) {
          return data as Prayer;
        }
      } catch (err) {
        console.warn('Supabase submitPrayer fallback to local', err);
      }
    }

    const prayers = getLocalPrayers();
    prayers.unshift(newPrayer);
    saveLocalPrayers(prayers);

    broadcastChannel?.postMessage({
      type: 'NEW_PRAYER',
      prayer: newPrayer,
    });

    return newPrayer;
  },

  /**
   * Increment Amin
   */
  async aminPrayer(prayerId: string): Promise<number> {
    if (isSupabaseConfigured && supabase && isValidUUID(prayerId)) {
      try {
        const { data, error } = await supabase.rpc('increment_amin', {
          prayer_id: prayerId,
        });
        if (!error && typeof data === 'number') {
          return data;
        }
      } catch (err) {
        console.warn('Supabase increment_amin fallback to local', err);
      }
    }

    const prayers = getLocalPrayers();
    const item = prayers.find((p) => p.id === prayerId);
    if (item) {
      item.amin_count = (item.amin_count || 0) + 1;
      saveLocalPrayers(prayers);

      broadcastChannel?.postMessage({
        type: 'PRAYER_AMIN',
        prayerId,
        newAmin: item.amin_count,
      });

      return item.amin_count;
    }
    return 1;
  },

  /**
   * Realtime subscription for Prayers
   */
  subscribeToPrayers(
    campaignId: string,
    onNewPrayer: (prayer: Prayer) => void,
    onAminUpdate: (prayerId: string, newAmin: number) => void
  ) {
    if (isSupabaseConfigured && supabase) {
      const isUuid = isValidUUID(campaignId);
      const filter = campaignId && campaignId !== 'global' && isUuid ? `campaign_id=eq.${campaignId}` : undefined;

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
        onNewPrayer(event.data.prayer);
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
   * Save Campaign (Create or Update)
   */
  async saveCampaign(campaign: Omit<Campaign, 'id' | 'created_at'> & { id?: string }): Promise<Campaign> {
    if (isSupabaseConfigured && supabase) {
      try {
        const isUuid = campaign.id && isValidUUID(campaign.id);
        if (isUuid) {
          const { data, error } = await supabase
            .from('campaigns')
            .update({
              title: campaign.title,
              slug: campaign.slug,
              category: campaign.category || 'syifa',
              description: campaign.description,
              arabic_text: campaign.arabic_text,
              latin_text: campaign.latin_text,
              translation_text: campaign.translation_text,
              target_count: campaign.target_count,
              current_count: campaign.current_count,
              status: campaign.status,
              image_url: campaign.image_url,
              updated_at: new Date().toISOString(),
            })
            .eq('id', campaign.id!)
            .select()
            .single();

          if (!error && data) {
            return data as Campaign;
          }
        } else {
          const { data, error } = await supabase
            .from('campaigns')
            .insert({
              title: campaign.title,
              slug: campaign.slug,
              category: campaign.category || 'syifa',
              description: campaign.description,
              arabic_text: campaign.arabic_text,
              latin_text: campaign.latin_text,
              translation_text: campaign.translation_text,
              target_count: campaign.target_count,
              current_count: campaign.current_count || 0,
              status: campaign.status || 'active',
              image_url: campaign.image_url,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (!error && data) {
            return data as Campaign;
          }
        }
      } catch (err) {
        console.warn('Supabase saveCampaign fallback to local', err);
      }
    }

    // Local Storage Fallback
    const list = getLocalCampaigns();
    if (campaign.id) {
      const idx = list.findIndex((c) => c.id === campaign.id || c.slug === campaign.slug);
      if (idx !== -1) {
        const updated = { ...list[idx], ...campaign, updated_at: new Date().toISOString() };
        list[idx] = updated;
        saveLocalCampaigns(list);
        return updated;
      }
    }

    const newCampaign: Campaign = {
      ...campaign,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'c_' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.unshift(newCampaign);
    saveLocalCampaigns(list);
    return newCampaign;
  },

  /**
   * Delete Campaign
   */
  async deleteCampaign(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const isUuid = isValidUUID(id);
        const query = isUuid
          ? supabase.from('campaigns').delete().eq('id', id)
          : supabase.from('campaigns').delete().eq('slug', id);

        const { error } = await query;
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase deleteCampaign fallback to local', err);
      }
    }

    const list = getLocalCampaigns();
    const filtered = list.filter((c) => c.id !== id && c.slug !== id);
    saveLocalCampaigns(filtered);
    return true;
  },

  /**
   * Seed default initial campaigns and prayers into Supabase
   */
  async seedDatabase(): Promise<{ success: boolean; count: number; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, count: 0, error: 'Supabase belum diatur' };
    }

    try {
      let insertedCount = 0;
      for (const camp of INITIAL_MOCK_CAMPAIGNS) {
        const { error } = await supabase.from('campaigns').upsert(
          {
            title: camp.title,
            slug: camp.slug,
            category: camp.category || 'syifa',
            description: camp.description,
            arabic_text: camp.arabic_text,
            latin_text: camp.latin_text,
            translation_text: camp.translation_text,
            target_count: camp.target_count,
            current_count: camp.current_count,
            status: camp.status,
            created_at: camp.created_at,
          },
          { onConflict: 'slug' }
        );
        if (!error) insertedCount++;
      }

      // Seed sample prayers
      const { data: nariyah } = await supabase
        .from('campaigns')
        .select('id')
        .eq('slug', 'shalawat-nariyah-4444')
        .maybeSingle();

      if (nariyah?.id) {
        await supabase.from('prayers').insert([
          {
            campaign_id: nariyah.id,
            name: 'Siti Aminah (Surabaya)',
            prayer_text: 'Mohon kesembuhan berkah operasi Ibu di RS Sardjito, semoga diangkat penyakitnya. Aamiin.',
            amin_count: 142,
          },
          {
            campaign_id: null,
            name: 'Hamba Allah (Yogyakarta)',
            prayer_text: 'Bismillah dilancarkan rezeki yang halal berkah dan dijauhkan dari marabahaya.',
            amin_count: 104,
          },
        ]);
      }

      return { success: true, count: insertedCount };
    } catch (err) {
      return { success: false, count: 0, error: (err as Error).message };
    }
  },

  /**
   * Migrate and upload all current local storage campaigns to Supabase
   */
  async migrateLocalToSupabase(): Promise<{ success: boolean; migrated: number; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, migrated: 0, error: 'Koneksi Supabase belum aktif di .env.local' };
    }

    const localList = getLocalCampaigns();
    let count = 0;

    for (const c of localList) {
      const { error } = await supabase.from('campaigns').upsert(
        {
          title: c.title,
          slug: c.slug,
          category: c.category || 'syifa',
          description: c.description,
          arabic_text: c.arabic_text,
          latin_text: c.latin_text,
          translation_text: c.translation_text,
          target_count: c.target_count,
          current_count: c.current_count,
          status: c.status,
          created_at: c.created_at,
        },
        { onConflict: 'slug' }
      );
      if (!error) count++;
    }

    return { success: true, migrated: count };
  }
};

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
  async getCampaigns(): Promise<Campaign[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data as Campaign[];
      }
    }
    return getLocalCampaigns();
  },

  async getCampaignBySlug(slug: string): Promise<Campaign | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('slug', slug)
        .single();
      if (!error && data) {
        return data as Campaign;
      }
    }
    const local = getLocalCampaigns();
    return local.find((c) => c.slug === slug || c.id === slug) || local[0] || null;
  },

  async incrementCounter(campaignId: string, amount: number): Promise<number> {
    if (amount <= 0) return 0;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('increment_counter', {
          target_campaign_id: campaignId,
          amount,
        });
        if (!error && typeof data === 'number') {
          return data;
        }
      } catch {
        // fallback
      }
    }

    const campaigns = getLocalCampaigns();
    const index = campaigns.findIndex((c) => c.id === campaignId || c.slug === campaignId);
    if (index !== -1) {
      const updated = {
        ...campaigns[index],
        current_count: Number(campaigns[index].current_count) + amount,
        status:
          Number(campaigns[index].current_count) + amount >= campaigns[index].target_count
            ? 'completed'
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

  subscribeToCampaign(campaignId: string, onUpdate: (campaign: Partial<Campaign>) => void) {
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel(`campaign-${campaignId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'campaigns',
            filter: `id=eq.${campaignId}`,
          },
          (payload) => {
            if (payload.new) {
              onUpdate(payload.new as Campaign);
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

  async getPrayers(campaignId: string): Promise<Prayer[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('prayers')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data as Prayer[];
      }
    }
    const prayers = getLocalPrayers();
    const filtered = prayers.filter((p) => p.campaign_id === campaignId);
    return filtered.length > 0 ? filtered : prayers;
  },

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
      const { data, error } = await supabase
        .from('prayers')
        .insert({
          campaign_id: campaignId,
          name: newPrayer.name,
          prayer_text: newPrayer.prayer_text,
          amin_count: 1,
        })
        .select()
        .single();
      if (!error && data) {
        return data as Prayer;
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

  async aminPrayer(prayerId: string): Promise<number> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('increment_amin', {
        prayer_id: prayerId,
      });
      if (!error && typeof data === 'number') {
        return data;
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

  subscribeToPrayers(
    campaignId: string,
    onNewPrayer: (prayer: Prayer) => void,
    onAminUpdate: (prayerId: string, newAmin: number) => void
  ) {
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel(`prayers-${campaignId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'prayers',
            filter: `campaign_id=eq.${campaignId}`,
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
            filter: `campaign_id=eq.${campaignId}`,
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

  async saveCampaign(campaign: Omit<Campaign, 'id' | 'created_at'> & { id?: string }): Promise<Campaign> {
    if (isSupabaseConfigured && supabase) {
      if (campaign.id) {
        const { data, error } = await supabase
          .from('campaigns')
          .update({
            ...campaign,
            updated_at: new Date().toISOString(),
          })
          .eq('id', campaign.id)
          .select()
          .single();
        if (!error && data) return data as Campaign;
      } else {
        const { data, error } = await supabase
          .from('campaigns')
          .insert({
            ...campaign,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (!error && data) return data as Campaign;
      }
    }

    const list = getLocalCampaigns();
    if (campaign.id) {
      const idx = list.findIndex((c) => c.id === campaign.id);
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

  async deleteCampaign(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('campaigns').delete().eq('id', id);
      if (!error) return true;
    }
    const list = getLocalCampaigns();
    const filtered = list.filter((c) => c.id !== id);
    saveLocalCampaigns(filtered);
    return true;
  }
};

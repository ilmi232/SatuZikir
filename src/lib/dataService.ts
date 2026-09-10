import { Campaign, Prayer } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const INITIAL_MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1b48b6f-87df-4e2b-9831-294b4cf43e51',
    title: 'Shalawat Nariyah 4.444x untuk Kemudahan & Hajat Bersama',
    slug: 'shalawat-nariyah-4444',
    description: 'Mari bersama-sama melantunkan Shalawat Nariyah sebanyak 4.444 kali untuk memohon kemudahan segala urusan, keberkahan hidup, dan keselamatan bagi seluruh umat.',
    arabic_text: 'اللَّهُمَّ صَلِّ صَلاَةً كَامِلَةً وَسَلِّمْ سَلاَماً تَامّاً عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ الْعُقَدُ وَتَنْفَرِجُ بِهِ الْكُرَبُ وَتُقْضَى بِهِ الْحَوَائِجُ وَتُنَالُ بِهِ الرَّغَائِبُ وَحُسْنُ الْخَوَاتِيمِ وَيُسْتَسْقَى الْغَمَامُ بِوَجْهِهِ الْكَرِيمِ وَعَلَى آلِهِ وَصَحْبِهِ فِي كُلِّ لَمْحَةٍ وَنَفَسٍ بِعَدَدِ كُلِّ مَعْلُومٍ لَكَ',
    latin_text: 'Allâhumma shalli shalâtan kâmilatan wa sallim salâman tâmman `alâ sayyidinâ Muhammadinilladzî tanhallu bihil `uqadu wa tanfariju bihil kurabu wa tuqdlâ bihil hawâ-iju wa tunâlu bihir raghâ-ibu wa husnul khawâtîmi wa yustasqal ghamâmu biwajhihil karîmi wa `alâ âlihi wa shahbihî fî kulli lamhatin wa nafasin bi`adadi kulli ma`lûmin laka.',
    translation_text: 'Ya Allah, limpahkanlah shalawat yang sempurna dan keselamatan yang paripurna kepada junjungan kami Nabi Muhammad, yang dengannya terlepas segala ikatan, terbebas dari segala kesedihan, terpenuhi segala kebutuhan, tercapai segala keinginan dan akhir hidup yang baik, serta dicurahkan hujan rahmat berkat kemuliaan wajahnya, juga kepada keluarga dan para sahabatnya pada setiap kejap mata dan hembusan nafas sebanyak hitungan segala yang Engkau ketahui.',
    target_count: 4444,
    current_count: 2180,
    image_url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=1000&auto=format&fit=crop',
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'a8e99b62-12fd-4a21-88fc-8473b185bc02',
    title: 'Sayyidul Istighfar 10.000x Mengetuk Pintu Ampunan',
    slug: 'sayyidul-istighfar-10000',
    description: 'Amalan memohon ampunan terbaik yang diajarkan Rasulullah SAW, dibaca bersama-sama sebagai wujud tawadhu dan pembersih hati dari segala khilaf.',
    arabic_text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    latin_text: 'Allâhumma anta rabbî lâ ilâha illâ anta, khalaqtanî wa anâ `abduka, wa anâ `alâ `ahdika wa wa`dika mastatha`tu, a`ûdzu bika min syarri mâ shana`tu, abû-u laka bini`matika `alayya, wa abû-u bidzanbî faghfir lî fa-innahû lâ yaghfirudz dzunûba illâ anta.',
    translation_text: 'Ya Allah, Engkaulah Tuhanku, tidak ada tuhan yang berhak disembah selain Engkau. Engkau yang menciptakan aku dan aku adalah hamba-Mu. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku, maka ampunilah aku.',
    target_count: 10000,
    current_count: 6720,
    image_url: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?q=80&w=1000&auto=format&fit=crop',
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'f32c918a-442b-4221-a1b9-8bc43d411122',
    title: 'Hasbunallah Wa Ni\'mal Wakil 1.000x Penguat Hati',
    slug: 'hasbunallah-1000',
    description: 'Zikir penyerahan diri dan perlindungan tertinggi kepada Allah SWT dalam menghadapi berbagai ujian hidup.',
    arabic_text: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ نِعْمَ الْمَوْلَىٰ وَنِعْمَ النَّصِيرُ',
    latin_text: 'Hasbunallâhu wa ni`mal wakîl, ni`mal maulâ wa ni`man nashîr.',
    translation_text: 'Cukuplah Allah menjadi Penolong kami dan Allah adalah sebaik-baik Pelindung, Dia adalah sebaik-baik Pemimpin dan sebaik-baik Penolong.',
    target_count: 1000,
    current_count: 1000,
    image_url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1000&auto=format&fit=crop',
    status: 'completed',
    created_at: new Date().toISOString(),
  }
];

const INITIAL_MOCK_PRAYERS: Prayer[] = [
  {
    id: 'p1',
    campaign_id: 'c1b48b6f-87df-4e2b-9831-294b4cf43e51',
    name: 'Hamba Allah (Surabaya)',
    prayer_text: 'Mohon doa agar orang tua kami diberikan kesembuhan dari sakit dan diangkat penyakitnya. Aamiin.',
    amin_count: 42,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'p2',
    campaign_id: 'c1b48b6f-87df-4e2b-9831-294b4cf43e51',
    name: 'Ahmad & Keluarga',
    prayer_text: 'Semoga anak-anak kami dijadikan anak yang sholeh-sholehah, hafal Al-Quran dan berbakti.',
    amin_count: 28,
    created_at: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
  },
  {
    id: 'p3',
    campaign_id: 'c1b48b6f-87df-4e2b-9831-294b4cf43e51',
    name: 'Fatimah',
    prayer_text: 'Bismillah dilancarkan hajat ikhtiar usaha dan dibukakan pintu rezeki yang berkah berlimpah.',
    amin_count: 35,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  }
];

// In-Memory & LocalStorage Store for fallback/demo
function getLocalCampaigns(): Campaign[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_CAMPAIGNS;
  try {
    const raw = localStorage.getItem('satuzikir_campaigns');
    if (raw) {
      return JSON.parse(raw);
    }
    localStorage.setItem('satuzikir_campaigns', JSON.stringify(INITIAL_MOCK_CAMPAIGNS));
    return INITIAL_MOCK_CAMPAIGNS;
  } catch {
    return INITIAL_MOCK_CAMPAIGNS;
  }
}

function saveLocalCampaigns(campaigns: Campaign[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('satuzikir_campaigns', JSON.stringify(campaigns));
  } catch {
    // Ignore storage quota
  }
}

function getLocalPrayers(): Prayer[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_PRAYERS;
  try {
    const raw = localStorage.getItem('satuzikir_prayers');
    if (raw) {
      return JSON.parse(raw);
    }
    localStorage.setItem('satuzikir_prayers', JSON.stringify(INITIAL_MOCK_PRAYERS));
    return INITIAL_MOCK_PRAYERS;
  } catch {
    return INITIAL_MOCK_PRAYERS;
  }
}

function saveLocalPrayers(prayers: Prayer[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('satuzikir_prayers', JSON.stringify(prayers));
  } catch {
    // Ignore storage quota
  }
}

// BroadcastChannel for instant cross-tab sync in browser
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('satuzikir_sync');
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
    return local.find((c) => c.slug === slug || c.id === slug) || null;
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

    // Local / Demo Increment
    const campaigns = getLocalCampaigns();
    const index = campaigns.findIndex((c) => c.id === campaignId);
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

      // Broadcast to other tabs
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

    // Local Broadcast listener
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
    return prayers.filter((p) => p.campaign_id === campaignId);
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
      if (event.data?.type === 'NEW_PRAYER' && event.data?.prayer?.campaign_id === campaignId) {
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

  // Admin CRUD
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

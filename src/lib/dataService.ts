import { Campaign, Prayer } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

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

function getLocalCampaigns(): Campaign[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('satuzikir_campaigns_v3');
    if (raw) {
      return JSON.parse(raw);
    }
    return [];
  } catch {
    return [];
  }
}

function saveLocalCampaigns(campaigns: Campaign[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('satuzikir_campaigns_v3', JSON.stringify(campaigns));
  } catch {
    // Ignore storage quota
  }
}

function getLocalPrayers(): Prayer[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('satuzikir_prayers_v3');
    if (raw) {
      return JSON.parse(raw);
    }
    return [];
  } catch {
    return [];
  }
}

function saveLocalPrayers(prayers: Prayer[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('satuzikir_prayers_v3', JSON.stringify(prayers));
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
          saveLocalCampaigns(data as Campaign[]);
          return data as Campaign[];
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
        const payload = {
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
        };

        if (isUuid) {
          const { data, error } = await supabase
            .from('campaigns')
            .update(payload)
            .eq('id', campaign.id)
            .select()
            .single();

          if (!error && data) {
            const list = getLocalCampaigns();
            const idx = list.findIndex((c) => c.id === data.id || c.slug === data.slug);
            if (idx !== -1) {
              list[idx] = data as Campaign;
              saveLocalCampaigns(list);
            }
            return data as Campaign;
          }
        } else if (campaign.slug) {
          // Check if exists by slug in Supabase
          const { data: existing } = await supabase
            .from('campaigns')
            .select('id')
            .eq('slug', campaign.slug)
            .maybeSingle();

          if (existing?.id) {
            const { data, error } = await supabase
              .from('campaigns')
              .update(payload)
              .eq('id', existing.id)
              .select()
              .single();

            if (!error && data) {
              const list = getLocalCampaigns();
              const idx = list.findIndex((c) => c.id === data.id || c.slug === data.slug);
              if (idx !== -1) {
                list[idx] = data as Campaign;
                saveLocalCampaigns(list);
              }
              return data as Campaign;
            }
          }

          // Insert new campaign
          const { data, error } = await supabase
            .from('campaigns')
            .insert({
              ...payload,
              current_count: campaign.current_count || 0,
              status: campaign.status || 'active',
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (!error && data) {
            return data as Campaign;
          }
        } else {
          // Insert new campaign
          const { data, error } = await supabase
            .from('campaigns')
            .insert({
              ...payload,
              current_count: campaign.current_count || 0,
              status: campaign.status || 'active',
              created_at: new Date().toISOString(),
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

        await query;
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

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey.length > 20
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

export interface SupabaseHealthResult {
  isConfigured: boolean;
  connected: boolean;
  latencyMs?: number;
  url?: string;
  error?: string;
}

/**
 * Perform a live health-check ping against the Supabase instance
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealthResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      isConfigured: false,
      connected: false,
      error: 'Variabel NEXT_PUBLIC_SUPABASE_URL dan ANON_KEY belum diisi di .env.local',
    };
  }

  const start = performance.now();
  try {
    const { error } = await supabase
      .from('campaigns')
      .select('id', { count: 'exact', head: true });

    const latencyMs = Math.round(performance.now() - start);

    if (error) {
      return {
        isConfigured: true,
        connected: false,
        latencyMs,
        url: supabaseUrl,
        error: error.message,
      };
    }

    return {
      isConfigured: true,
      connected: true,
      latencyMs,
      url: supabaseUrl,
    };
  } catch (err) {
    return {
      isConfigured: true,
      connected: false,
      url: supabaseUrl,
      error: (err as Error).message || 'Gagal tersambung ke Supabase server.',
    };
  }
}

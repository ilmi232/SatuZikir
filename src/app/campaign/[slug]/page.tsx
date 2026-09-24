import type { Metadata } from 'next';
import type { Campaign } from '@/types';
import { isSupabaseConfigured, supabaseAnonKey as anonKey, supabaseUrl as url } from '@/lib/supabaseConfig';
import CampaignRoom from './CampaignRoom';

type Props = { params: Promise<{ slug: string }> };

type CampaignPreview = Pick<Campaign, 'title' | 'description' | 'current_count' | 'target_count' | 'status'>;

/** Ambil data ringkas campaign di server untuk preview link (WhatsApp, dsb). */
async function fetchCampaignPreview(slug: string): Promise<CampaignPreview | null> {
  if (!isSupabaseConfigured) return null;

  const column = /^[0-9a-f-]{36}$/i.test(slug) ? 'id' : 'slug';
  const query = new URLSearchParams({
    select: 'title,description,current_count,target_count,status',
    [column]: `eq.${slug}`,
    limit: '1',
  });

  try {
    const res = await fetch(`${url}/rest/v1/campaigns?${query}`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as CampaignPreview[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await fetchCampaignPreview(slug);
  if (!campaign || campaign.status === 'draft') {
    return { title: 'Ruang Zikir - SatuZikir' };
  }

  const progress = `${Number(campaign.current_count).toLocaleString('id-ID')} dari ${Number(campaign.target_count).toLocaleString('id-ID')} butir terkumpul`;
  const description = campaign.description ? `${progress}. ${campaign.description}` : progress;
  const title = `${campaign.title} - SatuZikir`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'SatuZikir',
      images: [{ url: '/logo-app.jpg' }],
    },
  };
}

export default async function CampaignPage({ params }: Props) {
  const { slug } = await params;
  return <CampaignRoom slug={slug} />;
}

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  arabic_text: string;
  latin_text: string;
  translation_text: string;
  target_count: number;
  current_count: number;
  image_url?: string;
  status: 'active' | 'completed' | 'draft';
  created_at: string;
  updated_at?: string;
}

export interface Prayer {
  id: string;
  campaign_id: string;
  name: string;
  prayer_text: string;
  amin_count: number;
  created_at: string;
}

export interface DhikrSessionStats {
  personalCount: number;
  currentRound: number; // e.g. 1 to 33
  totalRounds: number;
}

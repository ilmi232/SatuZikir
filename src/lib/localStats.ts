export interface UserStats {
  totalButir: number;
  totalMajelis: number;
  totalKhatam: number;
  streakDays: number;
  lastActiveDate: string;
  weeklyData: number[]; // 7 days (Mon-Sun)
  sessions: SessionEntry[];
}

export interface SessionEntry {
  campaignId: string;
  campaignName: string;
  campaignSlug: string;
  count: number;
  isKhatam: boolean;
  timestamp: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  colorClass: string;
  isUnlocked: boolean;
  progress?: number;
  progressText?: string;
}

const DEFAULT_STATS: UserStats = {
  totalButir: 0,
  totalMajelis: 0,
  totalKhatam: 0,
  streakDays: 0,
  lastActiveDate: '',
  weeklyData: [0, 0, 0, 0, 0, 0, 0],
  sessions: [],
};

const STATS_KEY = 'satuzikir_user_stats';

export function getUserStats(): UserStats {
  if (typeof window === 'undefined') {
    return DEFAULT_STATS;
  }
  
  try {
    const data = localStorage.getItem(STATS_KEY);
    if (!data) return DEFAULT_STATS;
    const parsed = JSON.parse(data) as UserStats;
    return {
      ...DEFAULT_STATS,
      ...parsed,
      weeklyData: parsed.weeklyData?.length === 7 ? parsed.weeklyData : [...DEFAULT_STATS.weeklyData],
      sessions: parsed.sessions || [],
    };
  } catch (e) {
    console.error('Failed to parse user stats', e);
    return DEFAULT_STATS;
  }
}

export function recordSession(campaignId: string, campaignName: string, campaignSlug: string, count: number, isKhatam: boolean): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stats = getUserStats();
    
    stats.totalButir += count;
    stats.totalMajelis += 1;
    if (isKhatam) {
      stats.totalKhatam += 1;
    }
    
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    const dayOfWeek = (today.getDay() + 6) % 7; 
    
    if (stats.lastActiveDate) {
      const lastActive = new Date(stats.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);
      const current = new Date(todayString);
      current.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(current.getTime() - lastActive.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        stats.streakDays += 1;
      } else if (diffDays > 1) {
        stats.streakDays = 1;
        
        const lastActiveWeekStart = new Date(lastActive);
        lastActiveWeekStart.setDate(lastActive.getDate() - ((lastActive.getDay() + 6) % 7));
        
        const currentWeekStart = new Date(current);
        currentWeekStart.setDate(current.getDate() - ((current.getDay() + 6) % 7));
        
        if (lastActiveWeekStart.getTime() !== currentWeekStart.getTime()) {
           stats.weeklyData = [0, 0, 0, 0, 0, 0, 0];
        }
      }
    } else {
      stats.streakDays = 1;
    }
    
    stats.lastActiveDate = todayString;
    stats.weeklyData[dayOfWeek] += count;
    
    const newSession: SessionEntry = {
      campaignId,
      campaignName,
      campaignSlug,
      count,
      isKhatam,
      timestamp: new Date().toISOString(),
    };
    
    stats.sessions = [newSession, ...stats.sessions].slice(0, 10);
    
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to record session', e);
  }
}

export function calculateBadges(stats: UserStats): Badge[] {
  const badges: Badge[] = [];
  
  badges.push({
    id: 'fajar_berzikir',
    name: 'Fajar Berzikir',
    description: 'Telah mengikuti minimal 7 majelis zikir. Cahaya keistiqomahan mulai berpendar di hatimu.',
    icon: 'wb_twilight',
    colorClass: 'bg-[#904d00]',
    isUnlocked: stats.totalMajelis >= 7,
    progress: stats.totalMajelis < 7 ? Math.min(100, Math.round((stats.totalMajelis / 7) * 100)) : undefined,
    progressText: stats.totalMajelis < 7 ? `${stats.totalMajelis}/7 Majelis` : undefined,
  });

  badges.push({
    id: 'pilar_khatam_10k',
    name: 'Pilar Khatam 10k',
    description: 'Telah menyumbangkan 10.000 butir zikir. Kamu adalah pilar kokoh dalam majelis ini.',
    icon: 'workspace_premium',
    colorClass: 'bg-[#904d00]',
    isUnlocked: stats.totalButir >= 10000,
    progress: stats.totalButir < 10000 ? Math.min(100, Math.round((stats.totalButir / 10000) * 100)) : undefined,
    progressText: stats.totalButir < 10000 ? `${stats.totalButir.toLocaleString('id-ID')}/10.000 Butir` : undefined,
  });
  
  badges.push({
    id: 'penyambung_doa',
    name: 'Penyambung Doa',
    description: 'Setia mendoakan bersama 50 majelis. Doamu menyambung harapan jamaah.',
    icon: 'volunteer_activism',
    colorClass: 'bg-[#003527]',
    isUnlocked: stats.totalMajelis >= 50,
    progress: stats.totalMajelis < 50 ? Math.min(100, Math.round((stats.totalMajelis / 50) * 100)) : undefined,
    progressText: stats.totalMajelis < 50 ? `${stats.totalMajelis}/50 Majelis` : undefined,
  });
  
  badges.push({
    id: 'mujahid_40_hari',
    name: 'Mujahid 40 Hari',
    description: 'Tidak pernah putus zikir selama 40 hari. Istiqomahmu membakar semangat.',
    icon: 'military_tech',
    colorClass: stats.streakDays >= 40 ? 'bg-[#064e3b]' : 'bg-[#eaedff]',
    isUnlocked: stats.streakDays >= 40,
    progress: stats.streakDays < 40 ? Math.min(100, Math.round((stats.streakDays / 40) * 100)) : undefined,
    progressText: stats.streakDays < 40 ? `${stats.streakDays}/40 Hari` : undefined,
  });
  
  badges.push({
    id: 'khadim_shalawat',
    name: 'Khadim Shalawat',
    description: 'Menyumbangkan banyak bacaan, mengkhidmati lafaz suci bersama majelis.',
    icon: 'favorite',
    colorClass: 'bg-[#003527]',
    isUnlocked: stats.totalButir >= 10000,
    progress: stats.totalButir < 10000 ? Math.min(100, Math.round((stats.totalButir / 10000) * 100)) : undefined,
    progressText: stats.totalButir < 10000 ? `${stats.totalButir.toLocaleString('id-ID')}/10.000 Butir` : undefined,
  });

  return badges;
}

export function getStreakText(days: number): string {
  if (days === 0) return 'Belum ada hari berzikir beruntun';
  if (days === 1) return '1 Hari Istiqomah';
  return `${days} Hari Terpelihara`;
}

export function clearStats(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STATS_KEY);
  } catch (e) {
    console.error('Failed to clear stats', e);
  }
}

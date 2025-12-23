/**
 * Posting Time Analysis Service
 * Analyzes engagement data to determine optimal posting times
 */

export interface TimeSlot {
  hour: number; // 0-23
  day: number; // 0-6 (Sunday-Saturday)
  engagementScore: number; // 0-100
  postCount: number;
  avgLikes: number;
  avgComments: number;
  avgViews: number;
}

export interface BestTime {
  day: string;
  dayIndex: number;
  hour: number;
  timeRange: string;
  engagementScore: number;
  reason: string;
}

export interface PostingTimeAnalysis {
  username: string;
  heatmapData: TimeSlot[][];
  bestTimes: BestTime[];
  worstTimes: BestTime[];
  insights: string[];
  audienceTimezone: string;
  peakHours: number[];
  peakDays: string[];
  isDemo: boolean;
}

const DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const DAYS_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

/**
 * Generate posting time analysis based on username
 * Uses deterministic random for consistent demo data
 */
export function generatePostingTimeAnalysis(
  username: string,
  posts: any[] = [],
  reels: any[] = []
): PostingTimeAnalysis {
  // Seed random based on username for consistency
  const seed = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seededRandom = (index: number) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };

  // Generate heatmap data (7 days x 24 hours)
  const heatmapData: TimeSlot[][] = [];
  
  // Determine account type based on seed
  const accountType = seed % 3; // 0: Business, 1: Lifestyle, 2: Entertainment
  
  // Define engagement patterns based on account type
  const getBaseEngagement = (day: number, hour: number): number => {
    let base = 30;
    
    // Business accounts: weekday mornings and lunch
    if (accountType === 0) {
      if (day >= 1 && day <= 5) { // Weekdays
        if (hour >= 7 && hour <= 9) base += 40; // Morning commute
        else if (hour >= 12 && hour <= 13) base += 35; // Lunch
        else if (hour >= 17 && hour <= 19) base += 30; // After work
      }
    }
    // Lifestyle accounts: evenings and weekends
    else if (accountType === 1) {
      if (hour >= 19 && hour <= 22) base += 35; // Evening
      if (day === 0 || day === 6) base += 25; // Weekend
      if (hour >= 10 && hour <= 12 && (day === 0 || day === 6)) base += 30; // Weekend morning
    }
    // Entertainment accounts: late evening and night
    else {
      if (hour >= 20 && hour <= 23) base += 40; // Late evening
      if (hour >= 0 && hour <= 2) base += 25; // Night owls
      if (day === 5 || day === 6) base += 20; // Friday/Saturday
    }
    
    return Math.min(100, base);
  };

  for (let day = 0; day < 7; day++) {
    const daySlots: TimeSlot[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const baseEngagement = getBaseEngagement(day, hour);
      const randomVariation = (seededRandom(day * 24 + hour) - 0.5) * 20;
      const engagementScore = Math.max(0, Math.min(100, baseEngagement + randomVariation));
      
      const postCount = Math.floor(seededRandom(day * 24 + hour + 100) * 5);
      const avgLikes = Math.floor(1000 + seededRandom(day * 24 + hour + 200) * 9000);
      const avgComments = Math.floor(50 + seededRandom(day * 24 + hour + 300) * 450);
      const avgViews = Math.floor(5000 + seededRandom(day * 24 + hour + 400) * 45000);
      
      daySlots.push({
        hour,
        day,
        engagementScore: Math.round(engagementScore),
        postCount,
        avgLikes,
        avgComments,
        avgViews
      });
    }
    heatmapData.push(daySlots);
  }

  // Find best times (top 5)
  const allSlots = heatmapData.flat().sort((a, b) => b.engagementScore - a.engagementScore);
  const bestTimes: BestTime[] = allSlots.slice(0, 5).map(slot => ({
    day: DAYS[slot.day],
    dayIndex: slot.day,
    hour: slot.hour,
    timeRange: `${slot.hour.toString().padStart(2, '0')}:00 - ${(slot.hour + 1).toString().padStart(2, '0')}:00`,
    engagementScore: slot.engagementScore,
    reason: getTimeReason(slot.day, slot.hour, accountType)
  }));

  // Find worst times (bottom 5)
  const worstTimes: BestTime[] = allSlots.slice(-5).reverse().map(slot => ({
    day: DAYS[slot.day],
    dayIndex: slot.day,
    hour: slot.hour,
    timeRange: `${slot.hour.toString().padStart(2, '0')}:00 - ${(slot.hour + 1).toString().padStart(2, '0')}:00`,
    engagementScore: slot.engagementScore,
    reason: getWorstTimeReason(slot.day, slot.hour)
  }));

  // Calculate peak hours and days
  const hourEngagement: number[] = new Array(24).fill(0);
  const dayEngagement: number[] = new Array(7).fill(0);
  
  heatmapData.forEach((daySlots, dayIndex) => {
    daySlots.forEach(slot => {
      hourEngagement[slot.hour] += slot.engagementScore;
      dayEngagement[dayIndex] += slot.engagementScore;
    });
  });

  const peakHours = hourEngagement
    .map((score, hour) => ({ hour, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(h => h.hour);

  const peakDays = dayEngagement
    .map((score, day) => ({ day: DAYS[day], score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(d => d.day);

  // Generate insights
  const insights = generateInsights(bestTimes, peakHours, peakDays, accountType);

  return {
    username,
    heatmapData,
    bestTimes,
    worstTimes,
    insights,
    audienceTimezone: 'Europe/Berlin (CET/CEST)',
    peakHours,
    peakDays,
    isDemo: true
  };
}

function getTimeReason(day: number, hour: number, accountType: number): string {
  const reasons: string[] = [];
  
  if (hour >= 7 && hour <= 9) reasons.push('Morgen-Pendler aktiv');
  if (hour >= 12 && hour <= 13) reasons.push('Mittagspause');
  if (hour >= 17 && hour <= 19) reasons.push('Feierabend-Zeit');
  if (hour >= 20 && hour <= 22) reasons.push('Prime-Time Abend');
  if (day === 0 || day === 6) reasons.push('Wochenend-Aktivität');
  if (day === 1) reasons.push('Montag-Motivation');
  if (day === 3) reasons.push('Mitte der Woche');
  
  if (reasons.length === 0) {
    if (accountType === 0) return 'Business-Zielgruppe aktiv';
    if (accountType === 1) return 'Lifestyle-Audience online';
    return 'Entertainment-Peak';
  }
  
  return reasons.join(', ');
}

function getWorstTimeReason(day: number, hour: number): string {
  if (hour >= 2 && hour <= 5) return 'Tiefschlafphase';
  if (hour >= 23 || hour <= 1) return 'Späte Nacht';
  if (day >= 1 && day <= 5 && hour >= 9 && hour <= 11) return 'Arbeitszeit';
  if (day >= 1 && day <= 5 && hour >= 14 && hour <= 16) return 'Nachmittags-Tief';
  return 'Geringe Aktivität';
}

function generateInsights(
  bestTimes: BestTime[],
  peakHours: number[],
  peakDays: string[],
  accountType: number
): string[] {
  const insights: string[] = [];
  
  // Best time insight
  if (bestTimes.length > 0) {
    insights.push(
      `🎯 Deine beste Posting-Zeit ist ${bestTimes[0].day} um ${bestTimes[0].timeRange} mit einem Engagement-Score von ${bestTimes[0].engagementScore}%.`
    );
  }
  
  // Peak hours insight
  const peakHourStr = peakHours.map(h => `${h}:00`).join(', ');
  insights.push(
    `⏰ Deine Audience ist am aktivsten um ${peakHourStr} Uhr.`
  );
  
  // Peak days insight
  insights.push(
    `📅 Die besten Tage für Posts sind ${peakDays.slice(0, 2).join(' und ')}.`
  );
  
  // Account type specific insight
  if (accountType === 0) {
    insights.push(
      `💼 Deine Business-Audience reagiert besonders gut auf Inhalte während der Arbeitszeiten.`
    );
  } else if (accountType === 1) {
    insights.push(
      `🌟 Lifestyle-Content performt bei dir am besten in den Abendstunden und am Wochenende.`
    );
  } else {
    insights.push(
      `🎬 Entertainment-Inhalte erreichen deine Audience optimal in den späten Abendstunden.`
    );
  }
  
  // Consistency insight
  insights.push(
    `📊 Regelmäßiges Posten zu den Peak-Zeiten kann dein Engagement um bis zu 40% steigern.`
  );
  
  return insights;
}

/**
 * Get color for heatmap cell based on engagement score
 */
export function getHeatmapColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-green-400';
  if (score >= 40) return 'bg-yellow-400';
  if (score >= 20) return 'bg-orange-400';
  return 'bg-red-400';
}

/**
 * Get intensity class for heatmap
 */
export function getIntensityClass(score: number): string {
  if (score >= 80) return 'intensity-5';
  if (score >= 60) return 'intensity-4';
  if (score >= 40) return 'intensity-3';
  if (score >= 20) return 'intensity-2';
  return 'intensity-1';
}

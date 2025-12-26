/**
 * AI Insights Service
 * Extracts and prioritizes key insights from Instagram analysis data
 * Uses pattern recognition and statistical analysis to identify actionable insights
 */

import type { InstagramAnalysis } from "../instagram";

export interface AIInsight {
  id: string;
  category: 'performance' | 'engagement' | 'content' | 'timing' | 'growth' | 'viral' | 'warning';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metric?: {
    value: number | string;
    label: string;
    trend?: 'up' | 'down' | 'stable';
    benchmark?: number | string;
  };
  actionItems: string[];
  confidence: number; // 0-100
  dataPoints: string[]; // Which data points were used
}

export interface AIInsightsResult {
  username: string;
  generatedAt: string;
  insights: AIInsight[];
  summary: {
    totalInsights: number;
    criticalCount: number;
    highPriorityCount: number;
    topCategories: string[];
    overallHealth: 'excellent' | 'good' | 'needs_attention' | 'critical';
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

// Industry benchmarks for comparison
const BENCHMARKS = {
  engagementRate: {
    excellent: 6,
    good: 3,
    average: 1.5,
    poor: 0.5
  },
  viralScore: {
    excellent: 85,
    good: 70,
    average: 50,
    poor: 30
  },
  hookScore: {
    excellent: 85,
    good: 70,
    average: 55,
    poor: 40
  },
  reelsPerformance: {
    viewsToFollowerRatio: {
      excellent: 0.5,
      good: 0.2,
      average: 0.1,
      poor: 0.05
    }
  }
};

/**
 * Generate AI insights from Instagram analysis data
 */
export function generateAIInsights(analysis: InstagramAnalysis): AIInsightsResult {
  const insights: AIInsight[] = [];
  const username = analysis.profile.username;

  // 1. Engagement Analysis
  insights.push(...analyzeEngagement(analysis));

  // 2. Viral Potential Analysis
  insights.push(...analyzeViralPotential(analysis));

  // 3. Content Performance Analysis
  insights.push(...analyzeContentPerformance(analysis));

  // 4. Posting Patterns Analysis
  insights.push(...analyzePostingPatterns(analysis));

  // 5. Growth Indicators
  insights.push(...analyzeGrowthIndicators(analysis));

  // 6. Hook & Caption Analysis
  insights.push(...analyzeHooksAndCaptions(analysis));

  // 7. Reels vs Posts Comparison
  insights.push(...compareReelsVsPosts(analysis));

  // Sort by priority and confidence
  const sortedInsights = sortInsightsByPriority(insights);

  // Generate summary
  const summary = generateSummary(sortedInsights);

  // Generate recommendations
  const recommendations = generateRecommendations(sortedInsights, analysis);

  return {
    username,
    generatedAt: new Date().toISOString(),
    insights: sortedInsights.slice(0, 15), // Top 15 insights
    summary,
    recommendations
  };
}

/**
 * Analyze engagement metrics
 */
function analyzeEngagement(analysis: InstagramAnalysis): AIInsight[] {
  const insights: AIInsight[] = [];
  const { metrics, profile } = analysis;
  const engagementRate = metrics.engagementRate;

  // Engagement Rate Insight
  let engagementLevel: 'excellent' | 'good' | 'average' | 'poor';
  let priority: AIInsight['priority'];
  
  if (engagementRate >= BENCHMARKS.engagementRate.excellent) {
    engagementLevel = 'excellent';
    priority = 'medium';
  } else if (engagementRate >= BENCHMARKS.engagementRate.good) {
    engagementLevel = 'good';
    priority = 'medium';
  } else if (engagementRate >= BENCHMARKS.engagementRate.average) {
    engagementLevel = 'average';
    priority = 'high';
  } else {
    engagementLevel = 'poor';
    priority = 'critical';
  }

  insights.push({
    id: `engagement-rate-${Date.now()}`,
    category: 'engagement',
    priority,
    title: engagementLevel === 'excellent' || engagementLevel === 'good' 
      ? 'Starke Engagement-Rate' 
      : 'Engagement-Rate unter Durchschnitt',
    description: getEngagementDescription(engagementRate, engagementLevel, profile.followerCount),
    metric: {
      value: `${engagementRate.toFixed(2)}%`,
      label: 'Engagement Rate',
      trend: engagementRate >= BENCHMARKS.engagementRate.good ? 'up' : 'down',
      benchmark: `${BENCHMARKS.engagementRate.good}%`
    },
    actionItems: getEngagementActions(engagementLevel),
    confidence: 95,
    dataPoints: ['avgLikes', 'avgComments', 'followerCount']
  });

  // Likes to Comments Ratio
  const likesToComments = metrics.avgLikes / Math.max(metrics.avgComments, 1);
  if (likesToComments > 100) {
    insights.push({
      id: `likes-comments-ratio-${Date.now()}`,
      category: 'engagement',
      priority: 'high',
      title: 'Niedrige Kommentar-Rate',
      description: `Deine Posts erhalten ${Math.round(likesToComments)}x mehr Likes als Kommentare. Das deutet auf passives Engagement hin. Kommentare sind wertvoller für den Algorithmus.`,
      metric: {
        value: `${Math.round(likesToComments)}:1`,
        label: 'Likes zu Kommentare',
        benchmark: '50:1'
      },
      actionItems: [
        'Stelle Fragen in deinen Captions',
        'Nutze kontroverse oder diskussionswürdige Themen',
        'Antworte schnell auf Kommentare um Diskussionen anzuregen',
        'Verwende Call-to-Actions wie "Schreib mir deine Meinung"'
      ],
      confidence: 90,
      dataPoints: ['avgLikes', 'avgComments']
    });
  }

  return insights;
}

/**
 * Analyze viral potential
 */
function analyzeViralPotential(analysis: InstagramAnalysis): AIInsight[] {
  const insights: AIInsight[] = [];
  const { viralScore, viralFactors } = analysis;

  // Overall Viral Score
  let viralLevel: string;
  let priority: AIInsight['priority'];

  if (viralScore >= BENCHMARKS.viralScore.excellent) {
    viralLevel = 'excellent';
    priority = 'low';
  } else if (viralScore >= BENCHMARKS.viralScore.good) {
    viralLevel = 'good';
    priority = 'medium';
  } else if (viralScore >= BENCHMARKS.viralScore.average) {
    viralLevel = 'average';
    priority = 'high';
  } else {
    viralLevel = 'poor';
    priority = 'critical';
  }

  insights.push({
    id: `viral-score-${Date.now()}`,
    category: 'viral',
    priority,
    title: viralScore >= 70 ? 'Hohes Viral-Potenzial' : 'Viral-Potenzial optimierbar',
    description: getViralScoreDescription(viralScore, viralLevel),
    metric: {
      value: viralScore,
      label: 'Viral Score',
      trend: viralScore >= 70 ? 'up' : 'stable',
      benchmark: 70
    },
    actionItems: getViralScoreActions(viralFactors),
    confidence: 88,
    dataPoints: ['viralScore', 'viralFactors']
  });

  // Weakest Viral Factor
  const weakestFactor = Object.entries(viralFactors)
    .sort(([, a], [, b]) => a - b)[0];

  if (weakestFactor && weakestFactor[1] < 60) {
    insights.push({
      id: `weak-factor-${Date.now()}`,
      category: 'viral',
      priority: 'high',
      title: `Schwachstelle: ${getFactorName(weakestFactor[0])}`,
      description: getWeakFactorDescription(weakestFactor[0], weakestFactor[1]),
      metric: {
        value: weakestFactor[1],
        label: getFactorName(weakestFactor[0]),
        benchmark: 70
      },
      actionItems: getFactorImprovementActions(weakestFactor[0]),
      confidence: 85,
      dataPoints: ['viralFactors']
    });
  }

  // Strongest Viral Factor (leverage it)
  const strongestFactor = Object.entries(viralFactors)
    .sort(([, a], [, b]) => b - a)[0];

  if (strongestFactor && strongestFactor[1] >= 80) {
    insights.push({
      id: `strong-factor-${Date.now()}`,
      category: 'viral',
      priority: 'medium',
      title: `Stärke nutzen: ${getFactorName(strongestFactor[0])}`,
      description: `Dein ${getFactorName(strongestFactor[0])} Score von ${strongestFactor[1]} ist überdurchschnittlich. Nutze diese Stärke als Grundlage für deinen Content.`,
      metric: {
        value: strongestFactor[1],
        label: getFactorName(strongestFactor[0]),
        trend: 'up'
      },
      actionItems: [
        `Baue mehr Content um deine ${getFactorName(strongestFactor[0])}-Stärke auf`,
        'Analysiere welche Posts diese Stärke am besten nutzen',
        'Teile deine Erfolgsformel mit ähnlichen Content-Formaten'
      ],
      confidence: 82,
      dataPoints: ['viralFactors']
    });
  }

  return insights;
}

/**
 * Analyze content performance
 */
function analyzeContentPerformance(analysis: InstagramAnalysis): AIInsight[] {
  const insights: AIInsight[] = [];
  const { reels, posts, metrics } = analysis;

  // Find top performing content
  const allContent = [
    ...reels.map(r => ({ ...r, type: 'reel' as const })),
    ...posts.filter(p => p.isVideo).map(p => ({ ...p, type: 'video' as const }))
  ];

  if (allContent.length > 0) {
    const topContent = allContent.sort((a, b) => 
      (b.viewCount || b.playCount || 0) - (a.viewCount || a.playCount || 0)
    )[0];

    const avgViews = metrics.avgViews;
    const topViews = topContent.viewCount || topContent.playCount || 0;
    const performanceMultiplier = topViews / Math.max(avgViews, 1);

    if (performanceMultiplier > 3) {
      insights.push({
        id: `top-performer-${Date.now()}`,
        category: 'content',
        priority: 'high',
        title: 'Viral-Hit identifiziert',
        description: `Dein Top-Content hat ${performanceMultiplier.toFixed(1)}x mehr Views als dein Durchschnitt. Analysiere was diesen Content besonders macht und repliziere das Format.`,
        metric: {
          value: formatNumber(topViews),
          label: 'Top Video Views',
          trend: 'up',
          benchmark: formatNumber(avgViews)
        },
        actionItems: [
          'Analysiere Hook, Thumbnail und Caption des Top-Contents',
          'Erstelle ähnliche Inhalte mit dem gleichen Format',
          'Teste verschiedene Variationen des erfolgreichen Formats',
          'Poste zu ähnlichen Zeiten wie der Top-Content'
        ],
        confidence: 92,
        dataPoints: ['reels', 'posts', 'viewCount']
      });
    }
  }

  // Content Consistency
  if (posts.length >= 5) {
    const likesVariance = calculateVariance(posts.map(p => p.likeCount));
    const avgLikes = metrics.avgLikes;
    const coefficientOfVariation = Math.sqrt(likesVariance) / avgLikes;

    if (coefficientOfVariation > 0.8) {
      insights.push({
        id: `content-consistency-${Date.now()}`,
        category: 'content',
        priority: 'medium',
        title: 'Inkonsistente Performance',
        description: 'Deine Content-Performance schwankt stark. Das deutet darauf hin, dass du noch nicht dein optimales Format gefunden hast.',
        actionItems: [
          'Identifiziere Muster in deinen Top-Performern',
          'Fokussiere dich auf 2-3 Content-Formate die funktionieren',
          'Teste systematisch neue Ideen statt zufällig zu posten'
        ],
        confidence: 78,
        dataPoints: ['posts', 'likeCount']
      });
    }
  }

  return insights;
}

/**
 * Analyze posting patterns
 */
function analyzePostingPatterns(analysis: InstagramAnalysis): AIInsight[] {
  const insights: AIInsight[] = [];
  const { posts, reels } = analysis;

  const allContent = [...posts, ...reels];
  
  if (allContent.length >= 3) {
    // Calculate posting frequency
    const timestamps = allContent.map(c => c.timestamp).sort((a, b) => b - a);
    const daysBetweenPosts: number[] = [];
    
    for (let i = 1; i < timestamps.length; i++) {
      const daysDiff = (timestamps[i - 1] - timestamps[i]) / (24 * 60 * 60);
      daysBetweenPosts.push(daysDiff);
    }

    const avgDaysBetween = daysBetweenPosts.reduce((a, b) => a + b, 0) / daysBetweenPosts.length;

    if (avgDaysBetween > 7) {
      insights.push({
        id: `posting-frequency-${Date.now()}`,
        category: 'timing',
        priority: 'critical',
        title: 'Zu seltenes Posten',
        description: `Du postest durchschnittlich alle ${Math.round(avgDaysBetween)} Tage. Der Instagram-Algorithmus bevorzugt aktive Creator. Mindestens 3-5 Posts pro Woche sind empfohlen.`,
        metric: {
          value: `${Math.round(avgDaysBetween)} Tage`,
          label: 'Durchschnittlicher Abstand',
          benchmark: '1-2 Tage'
        },
        actionItems: [
          'Erstelle einen Content-Kalender',
          'Batch-produziere Content für die Woche',
          'Nutze Scheduling-Tools für konsistentes Posten',
          'Starte mit mindestens 3 Posts pro Woche'
        ],
        confidence: 95,
        dataPoints: ['posts', 'reels', 'timestamp']
      });
    } else if (avgDaysBetween <= 1) {
      insights.push({
        id: `posting-frequency-good-${Date.now()}`,
        category: 'timing',
        priority: 'low',
        title: 'Gute Posting-Frequenz',
        description: `Du postest regelmäßig (alle ${avgDaysBetween.toFixed(1)} Tage). Das ist optimal für den Algorithmus.`,
        metric: {
          value: `${avgDaysBetween.toFixed(1)} Tage`,
          label: 'Durchschnittlicher Abstand',
          trend: 'up'
        },
        actionItems: [
          'Halte diese Frequenz bei',
          'Fokussiere dich auf Qualität statt mehr Quantität',
          'Experimentiere mit verschiedenen Posting-Zeiten'
        ],
        confidence: 90,
        dataPoints: ['posts', 'reels', 'timestamp']
      });
    }
  }

  return insights;
}

/**
 * Analyze growth indicators
 */
function analyzeGrowthIndicators(analysis: InstagramAnalysis): AIInsight[] {
  const insights: AIInsight[] = [];
  const { profile, metrics } = analysis;

  // Follower to Following Ratio
  const ratio = profile.followerCount / Math.max(profile.followingCount, 1);

  if (ratio < 1 && profile.followerCount > 1000) {
    insights.push({
      id: `follow-ratio-${Date.now()}`,
      category: 'growth',
      priority: 'high',
      title: 'Ungünstiges Follower-Verhältnis',
      description: `Du folgst mehr Accounts (${formatNumber(profile.followingCount)}) als dir folgen (${formatNumber(profile.followerCount)}). Das kann als Spam-Verhalten gewertet werden.`,
      metric: {
        value: `${ratio.toFixed(2)}:1`,
        label: 'Follower zu Following',
        benchmark: '> 1:1'
      },
      actionItems: [
        'Entfolge inaktive oder irrelevante Accounts',
        'Fokussiere dich auf organisches Wachstum durch guten Content',
        'Vermeide Follow-Unfollow-Taktiken'
      ],
      confidence: 88,
      dataPoints: ['followerCount', 'followingCount']
    });
  } else if (ratio > 10) {
    insights.push({
      id: `follow-ratio-good-${Date.now()}`,
      category: 'growth',
      priority: 'low',
      title: 'Starkes Follower-Verhältnis',
      description: `Dein Follower-zu-Following-Verhältnis von ${ratio.toFixed(0)}:1 zeigt eine starke organische Reichweite.`,
      metric: {
        value: `${ratio.toFixed(0)}:1`,
        label: 'Follower zu Following',
        trend: 'up'
      },
      actionItems: [
        'Nutze deine Reichweite für Kooperationen',
        'Erwäge Brand-Deals oder Sponsorings',
        'Baue deine Community weiter aus'
      ],
      confidence: 85,
      dataPoints: ['followerCount', 'followingCount']
    });
  }

  // Account Size Category
  const accountSize = getAccountSizeCategory(profile.followerCount);
  insights.push({
    id: `account-size-${Date.now()}`,
    category: 'growth',
    priority: 'low',
    title: `${accountSize.name} Account`,
    description: accountSize.description,
    metric: {
      value: formatNumber(profile.followerCount),
      label: 'Follower'
    },
    actionItems: accountSize.tips,
    confidence: 100,
    dataPoints: ['followerCount']
  });

  return insights;
}

/**
 * Analyze hooks and captions
 */
function analyzeHooksAndCaptions(analysis: InstagramAnalysis): AIInsight[] {
  const insights: AIInsight[] = [];
  const { viralFactors, posts, reels } = analysis;

  // Hook Score Analysis
  if (viralFactors.hook < 60) {
    insights.push({
      id: `hook-weak-${Date.now()}`,
      category: 'content',
      priority: 'critical',
      title: 'Schwache Hooks',
      description: `Dein Hook-Score von ${viralFactors.hook} zeigt, dass deine ersten 3 Sekunden nicht fesselnd genug sind. 70% der Viewer entscheiden in den ersten 3 Sekunden ob sie weiterschauen.`,
      metric: {
        value: viralFactors.hook,
        label: 'Hook Score',
        benchmark: 70
      },
      actionItems: [
        'Starte mit einer kontroversen Aussage oder Frage',
        'Zeige das Endergebnis zuerst (Pattern Interrupt)',
        'Nutze Text-Overlays in den ersten Sekunden',
        'Vermeide langsame Intros - direkt zum Punkt'
      ],
      confidence: 90,
      dataPoints: ['viralFactors.hook']
    });
  }

  // Caption Analysis
  if (viralFactors.caption < 65) {
    insights.push({
      id: `caption-weak-${Date.now()}`,
      category: 'content',
      priority: 'high',
      title: 'Captions optimierbar',
      description: `Dein Caption-Score von ${viralFactors.caption} deutet auf Verbesserungspotenzial hin. Gute Captions erhöhen die Verweildauer und Interaktion.`,
      metric: {
        value: viralFactors.caption,
        label: 'Caption Score',
        benchmark: 70
      },
      actionItems: [
        'Nutze die erste Zeile als Hook (wird in der Preview angezeigt)',
        'Strukturiere lange Captions mit Absätzen',
        'Füge einen klaren Call-to-Action am Ende hinzu',
        'Erzähle Geschichten statt nur zu beschreiben'
      ],
      confidence: 85,
      dataPoints: ['viralFactors.caption']
    });
  }

  // Hashtag Analysis
  if (viralFactors.hashtags < 60) {
    insights.push({
      id: `hashtags-weak-${Date.now()}`,
      category: 'content',
      priority: 'medium',
      title: 'Hashtag-Strategie verbessern',
      description: `Dein Hashtag-Score von ${viralFactors.hashtags} zeigt Optimierungspotenzial. Die richtige Hashtag-Strategie kann deine Reichweite verdoppeln.`,
      metric: {
        value: viralFactors.hashtags,
        label: 'Hashtag Score',
        benchmark: 70
      },
      actionItems: [
        'Nutze 3-5 relevante Hashtags statt 30 generische',
        'Mische große (1M+), mittlere (100K-1M) und kleine (<100K) Hashtags',
        'Erstelle einen Branded Hashtag für deine Community',
        'Recherchiere Hashtags deiner Top-Konkurrenten'
      ],
      confidence: 80,
      dataPoints: ['viralFactors.hashtags']
    });
  }

  return insights;
}

/**
 * Compare Reels vs Posts performance
 */
function compareReelsVsPosts(analysis: InstagramAnalysis): AIInsight[] {
  const insights: AIInsight[] = [];
  const { reels, posts, profile } = analysis;

  if (reels.length > 0 && posts.length > 0) {
    const avgReelViews = reels.reduce((sum, r) => sum + (r.viewCount || r.playCount || 0), 0) / reels.length;
    const avgReelLikes = reels.reduce((sum, r) => sum + r.likeCount, 0) / reels.length;
    
    const videoPosts = posts.filter(p => p.isVideo);
    const imagePosts = posts.filter(p => !p.isVideo);
    
    const avgPostLikes = posts.reduce((sum, p) => sum + p.likeCount, 0) / posts.length;

    // Reels vs Posts comparison
    if (avgReelLikes > avgPostLikes * 1.5) {
      insights.push({
        id: `reels-outperform-${Date.now()}`,
        category: 'content',
        priority: 'high',
        title: 'Reels performen besser',
        description: `Deine Reels erhalten ${((avgReelLikes / avgPostLikes - 1) * 100).toFixed(0)}% mehr Likes als normale Posts. Fokussiere dich stärker auf Reels.`,
        metric: {
          value: `+${((avgReelLikes / avgPostLikes - 1) * 100).toFixed(0)}%`,
          label: 'Reels vs Posts',
          trend: 'up'
        },
        actionItems: [
          'Erhöhe deinen Reels-Anteil auf 70-80%',
          'Konvertiere erfolgreiche Post-Ideen in Reels',
          'Nutze Trending Audio für mehr Reichweite',
          'Experimentiere mit verschiedenen Reel-Längen'
        ],
        confidence: 88,
        dataPoints: ['reels', 'posts', 'likeCount']
      });
    }

    // Views to Follower Ratio
    const viewsToFollowerRatio = avgReelViews / profile.followerCount;
    if (viewsToFollowerRatio < 0.1) {
      insights.push({
        id: `low-reach-${Date.now()}`,
        category: 'performance',
        priority: 'critical',
        title: 'Niedrige Reichweite',
        description: `Deine Reels erreichen nur ${(viewsToFollowerRatio * 100).toFixed(1)}% deiner Follower. Das deutet auf Probleme mit dem Algorithmus hin.`,
        metric: {
          value: `${(viewsToFollowerRatio * 100).toFixed(1)}%`,
          label: 'Reichweite',
          benchmark: '20%+'
        },
        actionItems: [
          'Poste zu Zeiten wenn deine Follower aktiv sind',
          'Verbessere deine Hooks für längere Watch-Time',
          'Interagiere mehr mit deiner Community',
          'Vermeide Shadowban-Trigger (Spam, gekaufte Follower)'
        ],
        confidence: 92,
        dataPoints: ['reels', 'viewCount', 'followerCount']
      });
    }
  }

  return insights;
}

// Helper Functions

function getEngagementDescription(rate: number, level: string, followers: number): string {
  const sizeContext = followers > 100000 ? 'Für große Accounts' : followers > 10000 ? 'Für mittelgroße Accounts' : 'Für kleinere Accounts';
  
  switch (level) {
    case 'excellent':
      return `${sizeContext} ist eine Engagement-Rate von ${rate.toFixed(2)}% hervorragend. Deine Community ist sehr aktiv und engagiert.`;
    case 'good':
      return `${sizeContext} ist ${rate.toFixed(2)}% eine solide Engagement-Rate. Es gibt noch Potenzial nach oben.`;
    case 'average':
      return `${rate.toFixed(2)}% liegt im Durchschnitt. Mit gezielten Maßnahmen kannst du das Engagement deutlich steigern.`;
    default:
      return `${rate.toFixed(2)}% ist unter dem Durchschnitt. Fokussiere dich auf Community-Building und interaktiven Content.`;
  }
}

function getEngagementActions(level: string): string[] {
  switch (level) {
    case 'excellent':
      return [
        'Halte deine aktuelle Strategie bei',
        'Nutze dein hohes Engagement für Kooperationen',
        'Experimentiere mit neuen Formaten ohne Risiko'
      ];
    case 'good':
      return [
        'Stelle mehr Fragen in deinen Captions',
        'Antworte schneller auf Kommentare',
        'Nutze Stories für mehr Interaktion'
      ];
    default:
      return [
        'Fokussiere auf Nischen-Content statt breite Themen',
        'Baue eine engere Beziehung zu deiner Community auf',
        'Nutze Umfragen und Q&As in Stories',
        'Antworte auf jeden Kommentar in den ersten 30 Minuten'
      ];
  }
}

function getViralScoreDescription(score: number, level: string): string {
  switch (level) {
    case 'excellent':
      return `Ein Viral Score von ${score} ist ausgezeichnet. Dein Content hat hohes Potenzial viral zu gehen.`;
    case 'good':
      return `Mit ${score} Punkten hast du gutes Viral-Potenzial. Kleine Optimierungen können große Wirkung haben.`;
    case 'average':
      return `${score} Punkte zeigen durchschnittliches Viral-Potenzial. Fokussiere dich auf deine Schwachstellen.`;
    default:
      return `Ein Score von ${score} deutet auf Verbesserungsbedarf hin. Analysiere erfolgreiche Accounts in deiner Nische.`;
  }
}

function getViralScoreActions(factors: InstagramAnalysis['viralFactors']): string[] {
  const actions: string[] = [];
  const weakFactors = Object.entries(factors)
    .filter(([, value]) => value < 70)
    .sort(([, a], [, b]) => a - b);

  weakFactors.slice(0, 3).forEach(([factor]) => {
    actions.push(...getFactorImprovementActions(factor).slice(0, 1));
  });

  return actions.length > 0 ? actions : ['Halte deine aktuelle Strategie bei', 'Experimentiere mit neuen Formaten'];
}

function getFactorName(factor: string): string {
  const names: Record<string, string> = {
    hook: 'Hook',
    emotion: 'Emotion',
    shareability: 'Teilbarkeit',
    replay: 'Replay-Wert',
    caption: 'Caption',
    hashtags: 'Hashtags'
  };
  return names[factor] || factor;
}

function getWeakFactorDescription(factor: string, value: number): string {
  const descriptions: Record<string, string> = {
    hook: `Dein Hook-Score von ${value} zeigt, dass die ersten Sekunden deiner Videos nicht fesselnd genug sind.`,
    emotion: `Ein Emotions-Score von ${value} bedeutet, dass dein Content wenig emotionale Reaktionen auslöst.`,
    shareability: `Mit ${value} Punkten bei Teilbarkeit wird dein Content selten geteilt.`,
    replay: `Der Replay-Wert von ${value} zeigt, dass Viewer deine Videos selten mehrfach anschauen.`,
    caption: `Ein Caption-Score von ${value} deutet auf Verbesserungspotenzial bei deinen Texten hin.`,
    hashtags: `${value} Punkte bei Hashtags zeigen eine suboptimale Hashtag-Strategie.`
  };
  return descriptions[factor] || `Der ${factor}-Score von ${value} liegt unter dem Optimum.`;
}

function getFactorImprovementActions(factor: string): string[] {
  const actions: Record<string, string[]> = {
    hook: [
      'Starte mit einer provokanten Frage oder Aussage',
      'Zeige das Endergebnis in den ersten 2 Sekunden',
      'Nutze Pattern Interrupts (unerwartete Elemente)',
      'Verwende Text-Overlays für sofortige Aufmerksamkeit'
    ],
    emotion: [
      'Erzähle persönliche Geschichten',
      'Nutze Humor oder überraschende Wendungen',
      'Zeige echte Emotionen und Verletzlichkeit',
      'Sprich universelle Erfahrungen an'
    ],
    shareability: [
      'Erstelle "Tag einen Freund"-Content',
      'Biete Mehrwert der geteilt werden will',
      'Nutze kontroverse aber respektvolle Themen',
      'Erstelle Memes oder relateable Content'
    ],
    replay: [
      'Füge versteckte Details ein die man beim ersten Mal verpasst',
      'Nutze schnelle Schnitte mit viel Information',
      'Erstelle Tutorial-Content der mehrfach angeschaut wird',
      'Baue Überraschungen am Ende ein'
    ],
    caption: [
      'Nutze die erste Zeile als Hook',
      'Strukturiere mit Absätzen und Emojis',
      'Erzähle eine Geschichte statt nur zu beschreiben',
      'Füge einen klaren Call-to-Action hinzu'
    ],
    hashtags: [
      'Recherchiere Hashtags deiner Top-Konkurrenten',
      'Mische große und kleine Hashtags',
      'Nutze 3-5 hochrelevante statt 30 generische',
      'Erstelle einen eigenen Branded Hashtag'
    ]
  };
  return actions[factor] || ['Analysiere erfolgreiche Accounts in deiner Nische'];
}

function getAccountSizeCategory(followers: number): { name: string; description: string; tips: string[] } {
  if (followers >= 1000000) {
    return {
      name: 'Mega-Influencer',
      description: `Mit ${formatNumber(followers)} Followern gehörst du zu den Top-Accounts. Fokussiere auf Qualität und Brand-Deals.`,
      tips: [
        'Nutze deine Reichweite für hochwertige Kooperationen',
        'Diversifiziere auf andere Plattformen',
        'Baue eigene Produkte oder Services auf'
      ]
    };
  } else if (followers >= 100000) {
    return {
      name: 'Macro-Influencer',
      description: `${formatNumber(followers)} Follower machen dich zu einem etablierten Creator. Du hast signifikante Reichweite.`,
      tips: [
        'Verhandle bessere Deals mit Marken',
        'Baue eine E-Mail-Liste auf',
        'Erwäge einen Manager oder Agentur'
      ]
    };
  } else if (followers >= 10000) {
    return {
      name: 'Micro-Influencer',
      description: `Mit ${formatNumber(followers)} Followern hast du eine engagierte Community. Micro-Influencer haben oft die beste Engagement-Rate.`,
      tips: [
        'Fokussiere auf Nischen-Kooperationen',
        'Baue enge Beziehungen zu deiner Community',
        'Nutze dein hohes Engagement als Verkaufsargument'
      ]
    };
  } else if (followers >= 1000) {
    return {
      name: 'Nano-Influencer',
      description: `${formatNumber(followers)} Follower sind ein guter Start. Fokussiere auf Wachstum und Community-Building.`,
      tips: [
        'Poste konsistent und regelmäßig',
        'Interagiere aktiv mit anderen Accounts',
        'Finde deine Nische und bleib dabei'
      ]
    };
  } else {
    return {
      name: 'Starter',
      description: `Du bist am Anfang deiner Creator-Reise. Jetzt ist die beste Zeit um zu experimentieren.`,
      tips: [
        'Teste verschiedene Content-Formate',
        'Lerne von erfolgreichen Accounts in deiner Nische',
        'Fokussiere auf Qualität statt Quantität'
      ]
    };
  }
}

function sortInsightsByPriority(insights: AIInsight[]): AIInsight[] {
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return insights.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.confidence - a.confidence;
  });
}

function generateSummary(insights: AIInsight[]): AIInsightsResult['summary'] {
  const criticalCount = insights.filter(i => i.priority === 'critical').length;
  const highPriorityCount = insights.filter(i => i.priority === 'high').length;
  
  const categoryCount: Record<string, number> = {};
  insights.forEach(i => {
    categoryCount[i.category] = (categoryCount[i.category] || 0) + 1;
  });
  
  const topCategories = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat);

  let overallHealth: AIInsightsResult['summary']['overallHealth'];
  if (criticalCount >= 3) {
    overallHealth = 'critical';
  } else if (criticalCount >= 1 || highPriorityCount >= 4) {
    overallHealth = 'needs_attention';
  } else if (highPriorityCount >= 2) {
    overallHealth = 'good';
  } else {
    overallHealth = 'excellent';
  }

  return {
    totalInsights: insights.length,
    criticalCount,
    highPriorityCount,
    topCategories,
    overallHealth
  };
}

function generateRecommendations(insights: AIInsight[], analysis: InstagramAnalysis): AIInsightsResult['recommendations'] {
  const immediate: string[] = [];
  const shortTerm: string[] = [];
  const longTerm: string[] = [];

  // Immediate actions from critical insights
  insights
    .filter(i => i.priority === 'critical')
    .slice(0, 3)
    .forEach(i => {
      immediate.push(i.actionItems[0]);
    });

  // Short-term from high priority
  insights
    .filter(i => i.priority === 'high')
    .slice(0, 3)
    .forEach(i => {
      shortTerm.push(i.actionItems[0]);
    });

  // Long-term strategic recommendations
  if (analysis.profile.followerCount < 10000) {
    longTerm.push('Baue deine Follower-Basis auf 10K für den Swipe-Up Feature');
  }
  if (analysis.metrics.engagementRate < 3) {
    longTerm.push('Arbeite an einer engeren Community-Bindung');
  }
  longTerm.push('Diversifiziere auf andere Plattformen (TikTok, YouTube Shorts)');

  return {
    immediate: immediate.length > 0 ? immediate : ['Analysiere deine Top-Performer und repliziere das Format'],
    shortTerm: shortTerm.length > 0 ? shortTerm : ['Optimiere deine Posting-Zeiten', 'Verbessere deine Hooks'],
    longTerm
  };
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function calculateVariance(numbers: number[]): number {
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  return numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
}

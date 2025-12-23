/**
 * AI Reels Analysis Service
 * Analyzes Instagram Reels using AI for Hook, AIDA, and HAPSS frameworks
 */

// Types for Reel Analysis
export interface HookAnalysis {
  score: number; // 0-100
  duration: string;
  type: 'question' | 'statement' | 'visual' | 'sound' | 'pattern_interrupt';
  effectiveness: 'weak' | 'moderate' | 'strong' | 'viral';
  description: string;
  improvements: string[];
}

export interface AIDAAnalysis {
  attention: {
    score: number;
    elements: string[];
    description: string;
  };
  interest: {
    score: number;
    elements: string[];
    description: string;
  };
  desire: {
    score: number;
    elements: string[];
    description: string;
  };
  action: {
    score: number;
    elements: string[];
    description: string;
  };
  overallScore: number;
}

export interface HAPSSAnalysis {
  hook: {
    score: number;
    timestamp: string;
    description: string;
  };
  attention: {
    score: number;
    timestamp: string;
    description: string;
  };
  problem: {
    score: number;
    timestamp: string;
    description: string;
  };
  story: {
    score: number;
    timestamp: string;
    description: string;
  };
  solution: {
    score: number;
    timestamp: string;
    description: string;
  };
  overallScore: number;
}

export interface ViralPattern {
  name: string;
  confidence: number;
  description: string;
  examples: string[];
}

export interface ReelTranscription {
  fullText: string;
  segments: {
    timestamp: string;
    text: string;
    type: 'speech' | 'text_overlay' | 'caption';
  }[];
  language: string;
  duration: number;
}

export interface ReelAnalysisResult {
  transcription: ReelTranscription;
  hookAnalysis: HookAnalysis;
  aidaAnalysis: AIDAAnalysis;
  hapssAnalysis: HAPSSAnalysis;
  viralPatterns: ViralPattern[];
  overallViralScore: number;
  recommendations: string[];
  isDemo: boolean;
}

// Hook types and their characteristics
const hookTypes = {
  question: ['Wusstest du', 'Hast du', 'Warum', 'Wie', 'Was wäre wenn', 'Kennst du'],
  statement: ['Das wird', 'Ich zeige dir', 'Hier ist', 'So geht', 'Der Grund warum'],
  pattern_interrupt: ['STOP', 'WARTE', 'ACHTUNG', 'Das musst du sehen', 'Unglaublich'],
  visual: ['POV:', 'Watch this', 'Schau mal', 'Das passiert wenn'],
  sound: ['trending sound', 'viral audio', 'original sound']
};

// Generate demo transcription based on username
function generateDemoTranscription(username: string): ReelTranscription {
  const seed = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => min + (seed % (max - min));
  
  const demoTranscripts = [
    {
      fullText: "Wusstest du, dass 90% der erfolgreichen Reels in den ersten 3 Sekunden einen starken Hook haben? Hier sind die 3 wichtigsten Elemente: Erstens, eine provokante Frage. Zweitens, ein visueller Pattern Interrupt. Und drittens, ein klarer Mehrwert. Speicher dir dieses Reel für später!",
      segments: [
        { timestamp: "0:00-0:03", text: "Wusstest du, dass 90% der erfolgreichen Reels in den ersten 3 Sekunden einen starken Hook haben?", type: 'speech' as const },
        { timestamp: "0:03-0:06", text: "Hier sind die 3 wichtigsten Elemente:", type: 'speech' as const },
        { timestamp: "0:06-0:10", text: "Erstens, eine provokante Frage.", type: 'speech' as const },
        { timestamp: "0:10-0:14", text: "Zweitens, ein visueller Pattern Interrupt.", type: 'speech' as const },
        { timestamp: "0:14-0:18", text: "Und drittens, ein klarer Mehrwert.", type: 'speech' as const },
        { timestamp: "0:18-0:22", text: "Speicher dir dieses Reel für später!", type: 'speech' as const }
      ],
      language: "de",
      duration: 22
    },
    {
      fullText: "STOP! Scroll nicht weiter. Das hier wird dein Instagram-Game für immer verändern. Die meisten Creator machen diesen einen Fehler: Sie posten ohne Strategie. Aber ich zeige dir jetzt die 5-Sekunden-Regel die alles verändert. Folge mir für mehr!",
      segments: [
        { timestamp: "0:00-0:02", text: "STOP! Scroll nicht weiter.", type: 'speech' as const },
        { timestamp: "0:02-0:05", text: "Das hier wird dein Instagram-Game für immer verändern.", type: 'speech' as const },
        { timestamp: "0:05-0:10", text: "Die meisten Creator machen diesen einen Fehler: Sie posten ohne Strategie.", type: 'speech' as const },
        { timestamp: "0:10-0:16", text: "Aber ich zeige dir jetzt die 5-Sekunden-Regel die alles verändert.", type: 'speech' as const },
        { timestamp: "0:16-0:18", text: "Folge mir für mehr!", type: 'speech' as const }
      ],
      language: "de",
      duration: 18
    },
    {
      fullText: "POV: Du entdeckst gerade den Grund warum deine Reels nicht viral gehen. Es liegt nicht am Algorithmus. Es liegt an deinem Hook. In den ersten 0.5 Sekunden entscheidet sich alles. Hier ist was funktioniert: Bewegung, Text, Emotion. Teste es selbst!",
      segments: [
        { timestamp: "0:00-0:03", text: "POV: Du entdeckst gerade den Grund warum deine Reels nicht viral gehen.", type: 'speech' as const },
        { timestamp: "0:03-0:06", text: "Es liegt nicht am Algorithmus. Es liegt an deinem Hook.", type: 'speech' as const },
        { timestamp: "0:06-0:10", text: "In den ersten 0.5 Sekunden entscheidet sich alles.", type: 'speech' as const },
        { timestamp: "0:10-0:15", text: "Hier ist was funktioniert: Bewegung, Text, Emotion.", type: 'speech' as const },
        { timestamp: "0:15-0:17", text: "Teste es selbst!", type: 'speech' as const }
      ],
      language: "de",
      duration: 17
    }
  ];

  return demoTranscripts[seed % demoTranscripts.length];
}

// Analyze hook quality
function analyzeHook(transcription: ReelTranscription): HookAnalysis {
  const firstSegment = transcription.segments[0]?.text || '';
  
  let hookType: HookAnalysis['type'] = 'statement';
  let score = 60;
  
  // Detect hook type
  for (const [type, patterns] of Object.entries(hookTypes)) {
    if (patterns.some(p => firstSegment.toLowerCase().includes(p.toLowerCase()))) {
      hookType = type as HookAnalysis['type'];
      break;
    }
  }

  // Score based on hook type and characteristics
  if (hookType === 'pattern_interrupt') score = 85;
  else if (hookType === 'question') score = 78;
  else if (hookType === 'visual') score = 75;
  else if (hookType === 'statement') score = 65;

  // Bonus for short, punchy hooks
  if (firstSegment.length < 50) score += 5;
  if (firstSegment.includes('!') || firstSegment.includes('?')) score += 5;

  const effectiveness: HookAnalysis['effectiveness'] = 
    score >= 80 ? 'viral' : score >= 70 ? 'strong' : score >= 55 ? 'moderate' : 'weak';

  const improvements: string[] = [];
  if (score < 80) {
    improvements.push('Starte mit einer provokanten Frage oder Statement');
    improvements.push('Nutze Pattern Interrupts wie "STOP" oder "WARTE"');
    improvements.push('Halte den Hook unter 3 Sekunden');
  }
  if (hookType !== 'pattern_interrupt') {
    improvements.push('Teste Pattern Interrupts für höhere Retention');
  }

  return {
    score: Math.min(100, score),
    duration: '0:00-0:03',
    type: hookType,
    effectiveness,
    description: `Der Hook nutzt eine ${hookType === 'question' ? 'Frage' : hookType === 'pattern_interrupt' ? 'Pattern Interrupt' : hookType === 'visual' ? 'visuelle Technik' : 'Statement-Technik'} um Aufmerksamkeit zu erzeugen.`,
    improvements
  };
}

// Analyze AIDA framework
function analyzeAIDA(transcription: ReelTranscription): AIDAAnalysis {
  const fullText = transcription.fullText.toLowerCase();
  const segments = transcription.segments;

  // Attention (first segment)
  const attentionScore = segments[0]?.text.length > 0 ? 
    (segments[0].text.includes('?') || segments[0].text.includes('!') ? 85 : 70) : 50;

  // Interest (middle segments)
  const hasNumbers = /\d+/.test(fullText);
  const hasLists = fullText.includes('erstens') || fullText.includes('1.') || fullText.includes('hier sind');
  const interestScore = 60 + (hasNumbers ? 15 : 0) + (hasLists ? 15 : 0);

  // Desire (emotional triggers)
  const emotionalWords = ['verändern', 'geheim', 'erfolg', 'viral', 'wichtig', 'müssen', 'beste'];
  const emotionalCount = emotionalWords.filter(w => fullText.includes(w)).length;
  const desireScore = 55 + (emotionalCount * 10);

  // Action (CTA)
  const ctaWords = ['folge', 'speicher', 'teile', 'kommentier', 'like', 'teste', 'probier'];
  const hasCTA = ctaWords.some(w => fullText.includes(w));
  const actionScore = hasCTA ? 80 : 45;

  return {
    attention: {
      score: Math.min(100, attentionScore),
      elements: ['Hook in ersten 3 Sekunden', segments[0]?.text.includes('?') ? 'Frage-Format' : 'Statement-Format'],
      description: 'Die Aufmerksamkeit wird durch den initialen Hook erzeugt.'
    },
    interest: {
      score: Math.min(100, interestScore),
      elements: hasNumbers ? ['Zahlen/Statistiken', 'Konkrete Fakten'] : ['Storytelling'],
      description: hasLists ? 'Listenformat hält das Interesse aufrecht.' : 'Narrative Struktur für Interesse.'
    },
    desire: {
      score: Math.min(100, desireScore),
      elements: emotionalWords.filter(w => fullText.includes(w)).map(w => `Emotionales Wort: "${w}"`),
      description: 'Emotionale Trigger erzeugen Verlangen nach mehr.'
    },
    action: {
      score: Math.min(100, actionScore),
      elements: hasCTA ? ['Klarer CTA vorhanden'] : ['CTA fehlt oder ist schwach'],
      description: hasCTA ? 'Deutlicher Call-to-Action am Ende.' : 'Kein klarer Call-to-Action erkennbar.'
    },
    overallScore: Math.round((attentionScore + interestScore + desireScore + actionScore) / 4)
  };
}

// Analyze HAPSS framework
function analyzeHAPSS(transcription: ReelTranscription): HAPSSAnalysis {
  const segments = transcription.segments;
  const fullText = transcription.fullText.toLowerCase();

  // Hook (0-3 seconds)
  const hookScore = segments[0]?.text.length > 20 ? 75 : 60;

  // Attention (keeping viewer engaged)
  const attentionWords = ['schau', 'sieh', 'wichtig', 'achtung', 'aufgepasst', 'moment'];
  const hasAttention = attentionWords.some(w => fullText.includes(w));
  const attentionScore = hasAttention ? 78 : 50;

  // Problem (clear problem statement)
  const problemIndicators = ['das problem', 'der grund', 'warum', 'weil'];
  const hasProblem = problemIndicators.some(p => fullText.includes(p));
  const problemScore = hasProblem ? 82 : 55;

  // Solution (clear solution)
  const solutionWords = ['lösung', 'hier ist', 'so geht', 'ich zeige', 'tipp', 'trick', 'methode'];
  const hasSolution = solutionWords.some(w => fullText.includes(w));
  const solutionScore = hasSolution ? 85 : 50;

  // Story (narrative element)
  const storyIndicators = ['ich', 'mein', 'als ich', 'früher', 'heute'];
  const hasStory = storyIndicators.some(s => fullText.includes(s));
  const storyScore = hasStory ? 72 : 45;

  return {
    hook: {
      score: Math.min(100, hookScore),
      timestamp: '0:00-0:03',
      description: 'Initialer Hook um Scroll zu stoppen'
    },
    attention: {
      score: Math.min(100, attentionScore),
      timestamp: '0:03-0:08',
      description: hasAttention ? 'Aufmerksamkeit wird durch visuelle Elemente gehalten' : 'Attention-Elemente könnten stärker sein'
    },
    problem: {
      score: Math.min(100, problemScore),
      timestamp: '0:08-0:12',
      description: hasProblem ? 'Klares Problem wird identifiziert' : 'Problem sollte klarer definiert werden'
    },
    solution: {
      score: Math.min(100, solutionScore),
      timestamp: '0:12-0:18',
      description: hasSolution ? 'Konkrete Lösung wird präsentiert' : 'Lösung könnte konkreter sein'
    },
    story: {
      score: Math.min(100, storyScore),
      timestamp: '0:00-0:22',
      description: hasStory ? 'Persönliche Story-Elemente vorhanden' : 'Mehr persönliche Elemente würden helfen'
    },
    overallScore: Math.round((hookScore + attentionScore + problemScore + storyScore + solutionScore) / 5)
  };
}

// Detect viral patterns
function detectViralPatterns(transcription: ReelTranscription, hookAnalysis: HookAnalysis): ViralPattern[] {
  const patterns: ViralPattern[] = [];
  const fullText = transcription.fullText.toLowerCase();

  // Pattern: Listicle
  if (fullText.includes('erstens') || fullText.includes('1.') || /\d+ (tipps?|tricks?|gründe?|wege?)/.test(fullText)) {
    patterns.push({
      name: 'Listicle-Format',
      confidence: 85,
      description: 'Nummerierte Listen performen 40% besser als unstrukturierte Inhalte',
      examples: ['3 Tipps für...', '5 Gründe warum...', 'Die 7 besten...']
    });
  }

  // Pattern: Pattern Interrupt
  if (hookAnalysis.type === 'pattern_interrupt') {
    patterns.push({
      name: 'Pattern Interrupt',
      confidence: 90,
      description: 'Unterbricht den Scroll-Reflex und erhöht Watch-Time um 60%',
      examples: ['STOP!', 'WARTE!', 'Das musst du sehen']
    });
  }

  // Pattern: Question Hook
  if (hookAnalysis.type === 'question') {
    patterns.push({
      name: 'Frage-Hook',
      confidence: 78,
      description: 'Fragen aktivieren Neugier und erhöhen Completion Rate',
      examples: ['Wusstest du...?', 'Hast du dich je gefragt...?', 'Warum...?']
    });
  }

  // Pattern: POV Format
  if (fullText.includes('pov')) {
    patterns.push({
      name: 'POV-Format',
      confidence: 82,
      description: 'Point-of-View Content erzeugt emotionale Verbindung',
      examples: ['POV: Du bist...', 'POV: Wenn...', 'POV: Der Moment wenn...']
    });
  }

  // Pattern: Educational Content
  if (fullText.includes('zeige') || fullText.includes('lerne') || fullText.includes('tipp')) {
    patterns.push({
      name: 'Educational Content',
      confidence: 75,
      description: 'Lehrreiche Inhalte werden 3x häufiger gespeichert',
      examples: ['Ich zeige dir...', 'Lerne wie...', 'Der beste Tipp für...']
    });
  }

  // Pattern: Urgency/FOMO
  if (fullText.includes('jetzt') || fullText.includes('sofort') || fullText.includes('bevor')) {
    patterns.push({
      name: 'Urgency/FOMO',
      confidence: 72,
      description: 'Dringlichkeit erhöht Engagement und Shares',
      examples: ['Jetzt handeln!', 'Bevor es zu spät ist', 'Nur heute']
    });
  }

  return patterns;
}

// Generate recommendations
function generateRecommendations(
  hookAnalysis: HookAnalysis,
  aidaAnalysis: AIDAAnalysis,
  hapssAnalysis: HAPSSAnalysis,
  patterns: ViralPattern[]
): string[] {
  const recommendations: string[] = [];

  // Hook recommendations
  if (hookAnalysis.score < 75) {
    recommendations.push('🎯 Hook verstärken: Nutze Pattern Interrupts oder provokante Fragen in den ersten 0.5 Sekunden');
  }

  // AIDA recommendations
  if (aidaAnalysis.attention.score < 70) {
    recommendations.push('👀 Aufmerksamkeit: Starte mit Bewegung, Text-Overlay oder einem überraschenden Statement');
  }
  if (aidaAnalysis.action.score < 70) {
    recommendations.push('📢 CTA hinzufügen: Fordere klar zum Folgen, Speichern oder Kommentieren auf');
  }

  // HAPSS recommendations
  if (hapssAnalysis.attention.score < 65) {
    recommendations.push('👀 Attention verstärken: Halte die Aufmerksamkeit mit visuellen Pattern Interrupts');
  }
  if (hapssAnalysis.solution.score < 70) {
    recommendations.push('💡 Lösung konkretisieren: Gib spezifische, umsetzbare Tipps');
  }
  if (hapssAnalysis.story.score < 60) {
    recommendations.push('📖 Story-Element: Füge persönliche Erfahrungen oder Beispiele hinzu');
  }

  // Pattern recommendations
  if (!patterns.some(p => p.name === 'Listicle-Format')) {
    recommendations.push('📝 Listicle-Format testen: "3 Tipps für..." performen oft besser');
  }

  // General recommendations
  if (recommendations.length < 3) {
    recommendations.push('⏱️ Optimal: Halte Reels zwischen 15-30 Sekunden für beste Performance');
    recommendations.push('🔄 Teste verschiedene Hook-Typen und analysiere die Ergebnisse');
  }

  return recommendations.slice(0, 5);
}

// Main analysis function
export async function analyzeReel(username: string, reelUrl?: string): Promise<ReelAnalysisResult> {
  // For now, generate demo analysis (in production, this would use actual AI transcription)
  const transcription = generateDemoTranscription(username);
  const hookAnalysis = analyzeHook(transcription);
  const aidaAnalysis = analyzeAIDA(transcription);
  const hapssAnalysis = analyzeHAPSS(transcription);
  const viralPatterns = detectViralPatterns(transcription, hookAnalysis);
  
  const overallViralScore = Math.round(
    (hookAnalysis.score * 0.3) +
    (aidaAnalysis.overallScore * 0.25) +
    (hapssAnalysis.overallScore * 0.25) +
    (viralPatterns.length * 5) +
    (viralPatterns.reduce((acc, p) => acc + p.confidence, 0) / Math.max(1, viralPatterns.length) * 0.2)
  );

  const recommendations = generateRecommendations(hookAnalysis, aidaAnalysis, hapssAnalysis, viralPatterns);

  return {
    transcription,
    hookAnalysis,
    aidaAnalysis,
    hapssAnalysis,
    viralPatterns,
    overallViralScore: Math.min(100, overallViralScore),
    recommendations,
    isDemo: true
  };
}

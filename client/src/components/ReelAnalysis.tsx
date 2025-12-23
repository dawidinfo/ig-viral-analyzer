import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Sparkles, 
  Play, 
  Zap, 
  Target, 
  MessageSquare,
  TrendingUp,
  Lightbulb,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  BookOpen,
  Feather,
  Brain,
  Quote,
  Star,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ReelAnalysisProps {
  username: string;
}

const ScoreCircle = ({ score, label, color }: { score: number; label: string; color: string }) => {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted/30"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{score}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );
};

// Klassische Copywriting-Formeln
const CopywritingFormulas = ({ transcription, hookScore }: { transcription: string; hookScore: number }) => {
  // Analyse basierend auf klassischen Formeln
  const analyzeHopkins = () => {
    // Claude Hopkins: Scientific Advertising - Spezifität, Testen, Beweise
    const hasSpecifics = /\d+|prozent|%|euro|€|\$|minuten|sekunden|tage/i.test(transcription);
    const hasProof = /beweis|studie|wissenschaft|getestet|ergebnis|resultat/i.test(transcription);
    const hasCuriosity = /geheimnis|entdecke|erfahre|warum|wie/i.test(transcription);
    
    return {
      score: (hasSpecifics ? 35 : 0) + (hasProof ? 35 : 0) + (hasCuriosity ? 30 : 0),
      elements: [
        hasSpecifics ? '✓ Spezifische Zahlen/Daten' : '✗ Mehr konkrete Zahlen nutzen',
        hasProof ? '✓ Beweise/Belege vorhanden' : '✗ Beweise hinzufügen',
        hasCuriosity ? '✓ Neugier wird geweckt' : '✗ Mehr Neugier erzeugen'
      ]
    };
  };

  const analyzeOgilvy = () => {
    // David Ogilvy: Headlines, Benefits, Story
    const hasBenefit = /vorteil|nutzen|gewinn|erreichen|verbessern|steigern|mehr|besser/i.test(transcription);
    const hasStory = /ich|mein|als ich|früher|damals|erfahrung/i.test(transcription);
    const hasHeadline = transcription.split(' ').slice(0, 10).some(w => 
      /!|\?|stopp|achtung|wichtig|neu|jetzt/i.test(w)
    );
    
    return {
      score: (hasBenefit ? 35 : 0) + (hasStory ? 35 : 0) + (hasHeadline ? 30 : 0),
      elements: [
        hasBenefit ? '✓ Klarer Nutzen kommuniziert' : '✗ Nutzen deutlicher machen',
        hasStory ? '✓ Persönliche Geschichte' : '✗ Story-Element hinzufügen',
        hasHeadline ? '✓ Starker Einstieg' : '✗ Headline-Technik verbessern'
      ]
    };
  };

  const analyzeSchwartz = () => {
    // Eugene Schwartz: Awareness Levels, Desire Intensification
    const hasAwareness = /kennst du|weißt du|hast du|problem|herausforderung/i.test(transcription);
    const hasDesire = /stell dir vor|imagine|träum|wunsch|ziel|erreichen/i.test(transcription);
    const hasUrgency = /jetzt|sofort|heute|schnell|limitiert|nur noch/i.test(transcription);
    
    return {
      score: (hasAwareness ? 35 : 0) + (hasDesire ? 35 : 0) + (hasUrgency ? 30 : 0),
      elements: [
        hasAwareness ? '✓ Awareness angesprochen' : '✗ Bewusstsein schaffen',
        hasDesire ? '✓ Verlangen geweckt' : '✗ Desire verstärken',
        hasUrgency ? '✓ Dringlichkeit erzeugt' : '✗ Urgency hinzufügen'
      ]
    };
  };

  const hopkins = analyzeHopkins();
  const ogilvy = analyzeOgilvy();
  const schwartz = analyzeSchwartz();

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <Award className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-lg">Klassische Copywriting-Meister</h4>
          <p className="text-sm text-muted-foreground">Analyse nach Hopkins, Ogilvy & Schwartz</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Claude Hopkins */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base">Claude Hopkins</CardTitle>
            </div>
            <CardDescription className="text-xs">"Scientific Advertising" (1923)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Wissenschaftlichkeit</span>
              <span className="text-lg font-bold text-blue-400">{hopkins.score}%</span>
            </div>
            <Progress value={hopkins.score} className="h-2 mb-3" />
            <div className="space-y-1">
              {hopkins.elements.map((el, i) => (
                <p key={i} className={`text-xs ${el.startsWith('✓') ? 'text-green-400' : 'text-amber-400'}`}>
                  {el}
                </p>
              ))}
            </div>
            <div className="mt-3 p-2 bg-blue-500/10 rounded-lg">
              <Quote className="w-3 h-3 text-blue-400 mb-1" />
              <p className="text-xs italic text-muted-foreground">
                "Spezifische Fakten sind überzeugender als vage Behauptungen."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* David Ogilvy */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Feather className="w-5 h-5 text-purple-400" />
              <CardTitle className="text-base">David Ogilvy</CardTitle>
            </div>
            <CardDescription className="text-xs">"Ogilvy on Advertising" (1983)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Storytelling</span>
              <span className="text-lg font-bold text-purple-400">{ogilvy.score}%</span>
            </div>
            <Progress value={ogilvy.score} className="h-2 mb-3" />
            <div className="space-y-1">
              {ogilvy.elements.map((el, i) => (
                <p key={i} className={`text-xs ${el.startsWith('✓') ? 'text-green-400' : 'text-amber-400'}`}>
                  {el}
                </p>
              ))}
            </div>
            <div className="mt-3 p-2 bg-purple-500/10 rounded-lg">
              <Quote className="w-3 h-3 text-purple-400 mb-1" />
              <p className="text-xs italic text-muted-foreground">
                "Die beste Werbung erzählt eine Geschichte."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Eugene Schwartz */}
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-400" />
              <CardTitle className="text-base">Eugene Schwartz</CardTitle>
            </div>
            <CardDescription className="text-xs">"Breakthrough Advertising" (1966)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Desire Building</span>
              <span className="text-lg font-bold text-green-400">{schwartz.score}%</span>
            </div>
            <Progress value={schwartz.score} className="h-2 mb-3" />
            <div className="space-y-1">
              {schwartz.elements.map((el, i) => (
                <p key={i} className={`text-xs ${el.startsWith('✓') ? 'text-green-400' : 'text-amber-400'}`}>
                  {el}
                </p>
              ))}
            </div>
            <div className="mt-3 p-2 bg-green-500/10 rounded-lg">
              <Quote className="w-3 h-3 text-green-400 mb-1" />
              <p className="text-xs italic text-muted-foreground">
                "Du kannst kein Verlangen erschaffen - nur kanalisieren."
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gesamtbewertung */}
      <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-xl border border-amber-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-amber-400" />
            <div>
              <p className="font-semibold">Copywriting-Meister Score</p>
              <p className="text-xs text-muted-foreground">Durchschnitt aller klassischen Formeln</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-amber-400">
              {Math.round((hopkins.score + ogilvy.score + schwartz.score) / 3)}%
            </p>
            <p className="text-xs text-muted-foreground">von 100%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ReelAnalysis({ username }: ReelAnalysisProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['transcription', 'hook', 'aida', 'hapss', 'copywriting', 'recommendations'])
  );
  
  const { data: analysis, isLoading, error } = trpc.instagram.analyzeReel.useQuery(
    { username },
    { enabled: !!username }
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold">AI Reel-Analyse</h3>
            <p className="text-sm text-muted-foreground">Analysiere Content-Struktur...</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex items-center gap-3 text-destructive">
        <AlertCircle className="w-5 h-5" />
        <span>Fehler beim Laden der Analyse</span>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
  };

  return (
    <div className="space-y-8">
      {/* Header with Scores */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center glow-purple">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl">AI Reel-Analyse</h3>
              <p className="text-sm text-muted-foreground">Hook, AIDA & HAPSS Framework</p>
            </div>
          </div>
          {analysis.isDemo && (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              Demo-Analyse
            </Badge>
          )}
        </div>

        {/* Score Overview */}
        <div className="grid grid-cols-4 gap-6 p-6 bg-gradient-to-r from-violet-500/5 via-cyan-500/5 to-green-500/5 rounded-2xl border border-white/10">
          <ScoreCircle 
            score={analysis.hookAnalysis.score} 
            label="Hook" 
            color={getScoreColor(analysis.hookAnalysis.score)} 
          />
          <ScoreCircle 
            score={analysis.aidaAnalysis.overallScore} 
            label="AIDA" 
            color={getScoreColor(analysis.aidaAnalysis.overallScore)} 
          />
          <ScoreCircle 
            score={analysis.hapssAnalysis.overallScore} 
            label="HAPSS" 
            color={getScoreColor(analysis.hapssAnalysis.overallScore)} 
          />
          <ScoreCircle 
            score={analysis.overallViralScore} 
            label="Viral" 
            color={getScoreColor(analysis.overallViralScore)} 
          />
        </div>

        {/* Viral Patterns */}
        {analysis.viralPatterns.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {analysis.viralPatterns.map((pattern, idx) => (
              <Badge 
                key={idx} 
                className="bg-primary/20 text-primary border-primary/30"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                {pattern.name} ({pattern.confidence}%)
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* ==================== HOT-TRANSKRIPTION ==================== */}
      <div className="glass-card rounded-2xl p-6 border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-red-500/5">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('transcription')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center animate-pulse">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg flex items-center gap-2">
                🔥 HOT-Transkription
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
                  HOOK ANALYSE
                </Badge>
              </h4>
              <p className="text-sm text-muted-foreground">Schau genau hin - so baut der Creator seinen Hook!</p>
            </div>
          </div>
          {expandedSections.has('transcription') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
        
        <AnimatePresence>
          {expandedSections.has('transcription') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 space-y-3">
                {analysis.transcription.segments.map((segment, idx) => (
                  <div 
                    key={idx} 
                    className={`flex gap-3 p-4 rounded-xl transition-all ${
                      idx === 0 
                        ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500/30 ring-2 ring-orange-500/20' 
                        : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Badge 
                        variant="outline" 
                        className={`shrink-0 font-mono text-xs ${
                          idx === 0 ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : ''
                        }`}
                      >
                        {segment.timestamp}
                      </Badge>
                      {idx === 0 && (
                        <Badge className="bg-red-500 text-white text-[10px] px-1">
                          HOOK
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${idx === 0 ? 'font-semibold text-orange-200' : ''}`}>
                        {segment.text}
                      </p>
                      {idx === 0 && (
                        <p className="text-xs text-orange-400 mt-2 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Die ersten Worte entscheiden über Scroll oder Stop!
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Transkription Insights */}
              <div className="mt-4 p-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-sm">Hook-Insight</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {analysis.hookAnalysis.score >= 80 
                    ? '🔥 Exzellenter Hook! Die ersten 3 Sekunden sind perfekt optimiert für maximale Aufmerksamkeit.'
                    : analysis.hookAnalysis.score >= 60
                    ? '⚡ Solider Hook, aber noch Potenzial. Teste stärkere Pattern Interrupts oder provokantere Einstiege.'
                    : '⚠️ Der Hook braucht Arbeit. Starte mit einer Frage, Kontroverse oder überraschenden Aussage.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================== HOOK ANALYSE ==================== */}
      <div className="glass-card rounded-2xl p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('hook')}
        >
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h4 className="font-bold text-lg">Hook-Analyse</h4>
            <Badge className={`${
              analysis.hookAnalysis.effectiveness === 'viral' ? 'bg-green-500/20 text-green-400' :
              analysis.hookAnalysis.effectiveness === 'strong' ? 'bg-blue-500/20 text-blue-400' :
              analysis.hookAnalysis.effectiveness === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {analysis.hookAnalysis.effectiveness === 'viral' ? '🔥 Viral' :
               analysis.hookAnalysis.effectiveness === 'strong' ? '💪 Stark' :
               analysis.hookAnalysis.effectiveness === 'moderate' ? '⚡ Moderat' : '⚠️ Schwach'}
            </Badge>
          </div>
          {expandedSections.has('hook') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
        
        <AnimatePresence>
          {expandedSections.has('hook') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">Hook-Typ</p>
                    <p className="font-semibold capitalize">{analysis.hookAnalysis.type.replace('_', ' ')}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">Zeitfenster</p>
                    <p className="font-semibold">{analysis.hookAnalysis.duration}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{analysis.hookAnalysis.description}</p>
                
                {analysis.hookAnalysis.improvements.length > 0 && (
                  <div className="space-y-2 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      Verbesserungsvorschläge:
                    </p>
                    {analysis.hookAnalysis.improvements.map((imp, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-amber-400">→</span>
                        <span className="text-muted-foreground">{imp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================== AIDA FRAMEWORK ==================== */}
      <div className="glass-card rounded-2xl p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('aida')}
        >
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-purple-400" />
            <h4 className="font-bold text-lg">AIDA-Framework</h4>
            <span className="text-sm text-muted-foreground">(Attention, Interest, Desire, Action)</span>
          </div>
          {expandedSections.has('aida') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
        
        <AnimatePresence>
          {expandedSections.has('aida') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 space-y-4">
                {[
                  { key: 'attention', label: 'Attention', icon: '👀', data: analysis.aidaAnalysis.attention, color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30' },
                  { key: 'interest', label: 'Interest', icon: '🎯', data: analysis.aidaAnalysis.interest, color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' },
                  { key: 'desire', label: 'Desire', icon: '❤️', data: analysis.aidaAnalysis.desire, color: 'from-pink-500/20 to-red-500/20 border-pink-500/30' },
                  { key: 'action', label: 'Action', icon: '🚀', data: analysis.aidaAnalysis.action, color: 'from-green-500/20 to-emerald-500/20 border-green-500/30' },
                ].map((item) => (
                  <div key={item.key} className={`p-5 bg-gradient-to-r ${item.color} rounded-xl border`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="font-semibold text-lg">{item.label}</span>
                      </div>
                      <span className="text-2xl font-bold" style={{ color: getScoreColor(item.data.score) }}>
                        {item.data.score}%
                      </span>
                    </div>
                    <Progress value={item.data.score} className="h-2 mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">{item.data.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.data.elements.map((el, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-white/5">
                          {el}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================== HAPSS FRAMEWORK ==================== */}
      <div className="glass-card rounded-2xl p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('hapss')}
        >
          <div className="flex items-center gap-3">
            <Play className="w-6 h-6 text-green-400" />
            <h4 className="font-bold text-lg">HAPSS-Framework</h4>
            <span className="text-sm text-muted-foreground">(Hook, Attention, Problem, Solution, Story)</span>
          </div>
          {expandedSections.has('hapss') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
        
        <AnimatePresence>
          {expandedSections.has('hapss') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 space-y-4">
                {[
                  { key: 'hook', label: 'Hook', icon: '🎣', data: analysis.hapssAnalysis.hook, desc: 'Aufmerksamkeit in den ersten 3 Sekunden' },
                  { key: 'attention', label: 'Attention', icon: '👀', data: analysis.hapssAnalysis.attention, desc: 'Aufmerksamkeit halten & Zuschauer binden' },
                  { key: 'problem', label: 'Problem', icon: '❓', data: analysis.hapssAnalysis.problem, desc: 'Schmerzpunkt klar identifizieren' },
                  { key: 'solution', label: 'Solution', icon: '💡', data: analysis.hapssAnalysis.solution, desc: 'Lösung präsentieren' },
                  { key: 'story', label: 'Story', icon: '📖', data: analysis.hapssAnalysis.story, desc: 'Persönliche Geschichte einbinden' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{item.data.timestamp}</span>
                        </div>
                      </div>
                      <Progress value={item.data.score} className="h-2 mb-2" />
                      <p className="text-xs text-muted-foreground">{item.data.description}</p>
                      <p className="text-xs text-primary/70 mt-1">{item.desc}</p>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: getScoreColor(item.data.score) }}>
                      {item.data.score}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================== COPYWRITING MEISTER ==================== */}
      <div className="glass-card rounded-2xl p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('copywriting')}
        >
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-amber-400" />
            <h4 className="font-bold text-lg">Copywriting-Meister Analyse</h4>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              Hopkins • Ogilvy • Schwartz
            </Badge>
          </div>
          {expandedSections.has('copywriting') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
        
        <AnimatePresence>
          {expandedSections.has('copywriting') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <CopywritingFormulas 
                transcription={analysis.transcription.fullText} 
                hookScore={analysis.hookAnalysis.score}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================== EMPFEHLUNGEN ==================== */}
      <div className="glass-card rounded-2xl p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('recommendations')}
        >
          <div className="flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-amber-400" />
            <h4 className="font-bold text-lg">KI-Empfehlungen</h4>
          </div>
          {expandedSections.has('recommendations') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
        
        <AnimatePresence>
          {expandedSections.has('recommendations') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 space-y-3">
                {analysis.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

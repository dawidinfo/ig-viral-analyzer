import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  ChevronUp
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

export default function ReelAnalysis({ username }: ReelAnalysisProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('hook');
  
  const { data: analysis, isLoading, error } = trpc.instagram.analyzeReel.useQuery(
    { username },
    { enabled: !!username }
  );

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6">
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
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <span>Fehler beim Laden der Analyse</span>
        </div>
      </div>
    );
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center glow-purple">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Reel-Analyse</h3>
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
        <div className="grid grid-cols-4 gap-4 mb-6">
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

      {/* Transcription */}
      <div className="glass-card rounded-2xl p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('transcription')}
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h4 className="font-semibold">Transkription</h4>
          </div>
          {expandedSection === 'transcription' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        
        <AnimatePresence>
          {expandedSection === 'transcription' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3">
                {analysis.transcription.segments.map((segment, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                    <Badge variant="outline" className="shrink-0 font-mono text-xs">
                      {segment.timestamp}
                    </Badge>
                    <p className="text-sm">{segment.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hook Analysis */}
      <div className="glass-card rounded-2xl p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('hook')}
        >
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h4 className="font-semibold">Hook-Analyse</h4>
            <Badge className={`${
              analysis.hookAnalysis.effectiveness === 'viral' ? 'bg-green-500/20 text-green-400' :
              analysis.hookAnalysis.effectiveness === 'strong' ? 'bg-blue-500/20 text-blue-400' :
              analysis.hookAnalysis.effectiveness === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {analysis.hookAnalysis.effectiveness === 'viral' ? 'Viral' :
               analysis.hookAnalysis.effectiveness === 'strong' ? 'Stark' :
               analysis.hookAnalysis.effectiveness === 'moderate' ? 'Moderat' : 'Schwach'}
            </Badge>
          </div>
          {expandedSection === 'hook' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        
        <AnimatePresence>
          {expandedSection === 'hook' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Hook-Typ</p>
                    <p className="font-medium capitalize">{analysis.hookAnalysis.type.replace('_', ' ')}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Zeitfenster</p>
                    <p className="font-medium">{analysis.hookAnalysis.duration}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{analysis.hookAnalysis.description}</p>
                
                {analysis.hookAnalysis.improvements.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Verbesserungsvorschläge:</p>
                    {analysis.hookAnalysis.improvements.map((imp, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
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

      {/* AIDA Analysis */}
      <div className="glass-card rounded-2xl p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('aida')}
        >
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-purple-400" />
            <h4 className="font-semibold">AIDA-Framework</h4>
            <span className="text-sm text-muted-foreground">(Attention, Interest, Desire, Action)</span>
          </div>
          {expandedSection === 'aida' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        
        <AnimatePresence>
          {expandedSection === 'aida' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-4">
                {[
                  { key: 'attention', label: 'Attention', icon: '👀', data: analysis.aidaAnalysis.attention },
                  { key: 'interest', label: 'Interest', icon: '🎯', data: analysis.aidaAnalysis.interest },
                  { key: 'desire', label: 'Desire', icon: '❤️', data: analysis.aidaAnalysis.desire },
                  { key: 'action', label: 'Action', icon: '🚀', data: analysis.aidaAnalysis.action },
                ].map((item) => (
                  <div key={item.key} className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <span className="font-bold" style={{ color: getScoreColor(item.data.score) }}>
                        {item.data.score}%
                      </span>
                    </div>
                    <Progress value={item.data.score} className="h-2 mb-2" />
                    <p className="text-sm text-muted-foreground">{item.data.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.data.elements.map((el, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
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

      {/* HAPSS Analysis */}
      <div className="glass-card rounded-2xl p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('hapss')}
        >
          <div className="flex items-center gap-3">
            <Play className="w-5 h-5 text-green-400" />
            <h4 className="font-semibold">HAPSS-Framework</h4>
            <span className="text-sm text-muted-foreground">(Hook, Agitate, Problem, Solution, Story)</span>
          </div>
          {expandedSection === 'hapss' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        
        <AnimatePresence>
          {expandedSection === 'hapss' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3">
                {[
                  { key: 'hook', label: 'Hook', icon: '🎣', data: analysis.hapssAnalysis.hook },
                  { key: 'attention', label: 'Attention', icon: '👀', data: analysis.hapssAnalysis.attention },
                  { key: 'problem', label: 'Problem', icon: '❓', data: analysis.hapssAnalysis.problem },
                  { key: 'story', label: 'Story', icon: '📖', data: analysis.hapssAnalysis.story },
                  { key: 'solution', label: 'Solution', icon: '💡', data: analysis.hapssAnalysis.solution },
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{item.data.timestamp}</span>
                        </div>
                      </div>
                      <Progress value={item.data.score} className="h-1.5 mb-1" />
                      <p className="text-xs text-muted-foreground">{item.data.description}</p>
                    </div>
                    <span className="font-bold text-lg" style={{ color: getScoreColor(item.data.score) }}>
                      {item.data.score}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recommendations */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h4 className="font-semibold">KI-Empfehlungen</h4>
        </div>
        <div className="space-y-3">
          {analysis.recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

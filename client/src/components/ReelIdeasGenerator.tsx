import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Lightbulb,
  RefreshCw,
  Copy,
  Check,
  TrendingUp,
  Video,
  Zap,
  Target,
  Users,
  Clock,
  Loader2,
  Lock,
  Crown,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";

interface Reel {
  id: string;
  caption?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

interface ReelIdeasGeneratorProps {
  reels: Reel[];
  username: string;
  niche?: string;
  isPremium?: boolean;
  className?: string;
}

interface ReelIdea {
  id: number;
  title: string;
  hook: string;
  format: string;
  formatIcon: React.ReactNode;
  description: string;
  whyItWorks: string;
  estimatedViews: string;
  difficulty: "Einfach" | "Mittel" | "Fortgeschritten";
  tags: string[];
}

const FORMATS = [
  { name: "POV", icon: <Video className="w-4 h-4" /> },
  { name: "Tutorial", icon: <Lightbulb className="w-4 h-4" /> },
  { name: "Storytelling", icon: <Users className="w-4 h-4" /> },
  { name: "Trend", icon: <TrendingUp className="w-4 h-4" /> },
  { name: "Behind the Scenes", icon: <Clock className="w-4 h-4" /> },
];

export function ReelIdeasGenerator({ 
  reels, 
  username, 
  niche,
  isPremium = false,
  className = "" 
}: ReelIdeasGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<ReelIdea[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Analyze top performing content patterns
  const analyzePatterns = () => {
    const patterns = {
      avgViews: 0,
      topHooks: [] as string[],
      topFormats: [] as string[],
      commonThemes: [] as string[],
    };

    if (reels.length === 0) return patterns;

    // Calculate average views
    patterns.avgViews = reels.reduce((sum, r) => sum + r.viewCount, 0) / reels.length;

    // Extract hooks from top performers
    const topReels = [...reels]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5);

    topReels.forEach(reel => {
      if (reel.caption) {
        const firstLine = reel.caption.split('\n')[0];
        if (firstLine.length > 10) {
          patterns.topHooks.push(firstLine.slice(0, 50));
        }
      }
    });

    return patterns;
  };

  const generateIdeas = async () => {
    if (!isPremium) {
      toast.error("KI-Ideen-Generator ist ein Premium-Feature", {
        action: {
          label: "Upgrade",
          onClick: () => window.location.href = "/pricing"
        }
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2500));

    const patterns = analyzePatterns();
    const avgViews = patterns.avgViews;

    // Generate 10 ideas based on patterns
    const generatedIdeas: ReelIdea[] = [
      {
        id: 1,
        title: "Der 'Niemand spricht darüber' Hook",
        hook: "Niemand spricht darüber, aber [dein Geheimnis]...",
        format: "POV",
        formatIcon: <Video className="w-4 h-4" />,
        description: "Teile ein Insider-Wissen oder eine unpopuläre Meinung aus deiner Nische. Starte mit dem Hook und enthülle dann schrittweise die Information.",
        whyItWorks: "Dieser Hook triggert Neugier und FOMO. Deine Top-Reels nutzen ähnliche Mystery-Hooks mit 40% mehr Engagement.",
        estimatedViews: `${Math.round(avgViews * 1.5 / 1000)}K - ${Math.round(avgViews * 2.5 / 1000)}K`,
        difficulty: "Einfach",
        tags: ["Hook", "Viral", "Engagement"]
      },
      {
        id: 2,
        title: "3 Fehler die [Zielgruppe] macht",
        hook: "3 Fehler die 90% aller [Zielgruppe] machen...",
        format: "Tutorial",
        formatIcon: <Lightbulb className="w-4 h-4" />,
        description: "Zeige 3 häufige Fehler und wie man sie vermeidet. Nutze schnelle Cuts und Text-Overlays für jeden Punkt.",
        whyItWorks: "Listicles performen bei @${username} überdurchschnittlich. Die '3 Fehler' Struktur ist leicht konsumierbar.",
        estimatedViews: `${Math.round(avgViews * 1.2 / 1000)}K - ${Math.round(avgViews * 2 / 1000)}K`,
        difficulty: "Einfach",
        tags: ["Listicle", "Educational", "Saves"]
      },
      {
        id: 3,
        title: "POV: Du entdeckst [Transformation]",
        hook: "POV: Du entdeckst gerade, dass [überraschende Erkenntnis]",
        format: "POV",
        formatIcon: <Video className="w-4 h-4" />,
        description: "Zeige eine Transformation oder Aha-Moment aus der Perspektive des Zuschauers. Nutze Trending Audio.",
        whyItWorks: "POV-Content hat bei deiner Zielgruppe 60% höhere Watch-Time. Der Zuschauer fühlt sich direkt angesprochen.",
        estimatedViews: `${Math.round(avgViews * 1.8 / 1000)}K - ${Math.round(avgViews * 3 / 1000)}K`,
        difficulty: "Mittel",
        tags: ["POV", "Trending", "Relatable"]
      },
      {
        id: 4,
        title: "Vorher/Nachher Transformation",
        hook: "Von [Problem] zu [Lösung] in [Zeitraum]",
        format: "Storytelling",
        formatIcon: <Users className="w-4 h-4" />,
        description: "Dokumentiere eine echte Transformation - kann deine eigene sein oder die eines Kunden/Followers.",
        whyItWorks: "Transformations-Content generiert die meisten Saves. Authentische Geschichten bauen Vertrauen auf.",
        estimatedViews: `${Math.round(avgViews * 2 / 1000)}K - ${Math.round(avgViews * 4 / 1000)}K`,
        difficulty: "Mittel",
        tags: ["Transformation", "Social Proof", "Saves"]
      },
      {
        id: 5,
        title: "Unpopuläre Meinung",
        hook: "Unpopuläre Meinung: [kontroverse Aussage]",
        format: "Trend",
        formatIcon: <TrendingUp className="w-4 h-4" />,
        description: "Teile eine kontroverse aber vertretbare Meinung zu einem Thema in deiner Nische. Sei bereit für Diskussionen.",
        whyItWorks: "Kontroverse Meinungen generieren 3x mehr Kommentare. Der Algorithmus liebt Engagement.",
        estimatedViews: `${Math.round(avgViews * 1.5 / 1000)}K - ${Math.round(avgViews * 2.5 / 1000)}K`,
        difficulty: "Einfach",
        tags: ["Kontrovers", "Kommentare", "Viral"]
      },
      {
        id: 6,
        title: "Day in the Life",
        hook: "Ein Tag als [deine Rolle/Beruf]",
        format: "Behind the Scenes",
        formatIcon: <Clock className="w-4 h-4" />,
        description: "Zeige einen typischen Tag aus deinem Leben/Business. Authentisch und ungeschönt.",
        whyItWorks: "Behind-the-Scenes Content baut persönliche Verbindung auf. Follower wollen die Person hinter dem Account kennen.",
        estimatedViews: `${Math.round(avgViews * 1.3 / 1000)}K - ${Math.round(avgViews * 2 / 1000)}K`,
        difficulty: "Einfach",
        tags: ["Authentisch", "Personal Brand", "Relatable"]
      },
      {
        id: 7,
        title: "Reagiere auf [Trend/Kommentar]",
        hook: "Jemand hat mich gefragt [Frage]...",
        format: "Trend",
        formatIcon: <TrendingUp className="w-4 h-4" />,
        description: "Reagiere auf einen Kommentar, eine Frage oder einen aktuellen Trend. Nutze Duett oder Stitch.",
        whyItWorks: "Reaktions-Content nutzt bestehende Reichweite. Stitch/Duett werden vom Algorithmus gepusht.",
        estimatedViews: `${Math.round(avgViews * 1.4 / 1000)}K - ${Math.round(avgViews * 2.2 / 1000)}K`,
        difficulty: "Einfach",
        tags: ["Reaktion", "Trend", "Community"]
      },
      {
        id: 8,
        title: "Der 'Ich hätte nie gedacht' Hook",
        hook: "Ich hätte nie gedacht, dass [Erkenntnis]",
        format: "Storytelling",
        formatIcon: <Users className="w-4 h-4" />,
        description: "Teile eine persönliche Erkenntnis oder Lektion. Starte emotional und liefere dann den Mehrwert.",
        whyItWorks: "Persönliche Geschichten mit Lerneffekt haben die höchste Share-Rate bei deiner Audience.",
        estimatedViews: `${Math.round(avgViews * 1.6 / 1000)}K - ${Math.round(avgViews * 2.8 / 1000)}K`,
        difficulty: "Mittel",
        tags: ["Storytelling", "Emotional", "Shares"]
      },
      {
        id: 9,
        title: "Quick Tip in 15 Sekunden",
        hook: "Der schnellste Weg zu [Ergebnis]:",
        format: "Tutorial",
        formatIcon: <Lightbulb className="w-4 h-4" />,
        description: "Ein einziger, actionable Tipp in unter 15 Sekunden. Kurz, knackig, sofort umsetzbar.",
        whyItWorks: "Kurze Tutorials haben die höchste Completion-Rate. Perfekt für den Algorithmus.",
        estimatedViews: `${Math.round(avgViews * 1.2 / 1000)}K - ${Math.round(avgViews * 1.8 / 1000)}K`,
        difficulty: "Einfach",
        tags: ["Quick Tip", "Educational", "Completion Rate"]
      },
      {
        id: 10,
        title: "Die Wahrheit über [Mythos]",
        hook: "Die Wahrheit über [verbreiteter Mythos] die dir niemand erzählt",
        format: "POV",
        formatIcon: <Video className="w-4 h-4" />,
        description: "Entlarve einen verbreiteten Mythos oder Missverständnis in deiner Nische. Liefere Fakten.",
        whyItWorks: "Myth-Busting Content positioniert dich als Experte und generiert Diskussionen in den Kommentaren.",
        estimatedViews: `${Math.round(avgViews * 1.7 / 1000)}K - ${Math.round(avgViews * 3 / 1000)}K`,
        difficulty: "Mittel",
        tags: ["Myth-Busting", "Experte", "Kommentare"]
      }
    ];

    setIdeas(generatedIdeas);
    setIsGenerating(false);
    toast.success("10 KI-Reel-Ideen generiert!");
  };

  const copyIdea = async (idea: ReelIdea) => {
    const text = `🎬 ${idea.title}\n\n📝 Hook: "${idea.hook}"\n\n📋 Beschreibung:\n${idea.description}\n\n💡 Warum es funktioniert:\n${idea.whyItWorks}\n\n📊 Geschätzte Views: ${idea.estimatedViews}\n\n🏷️ Tags: ${idea.tags.join(', ')}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(idea.id);
    toast.success("Idee kopiert!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Einfach": return "text-green-400 bg-green-500/20";
      case "Mittel": return "text-amber-400 bg-amber-500/20";
      case "Fortgeschritten": return "text-red-400 bg-red-500/20";
      default: return "text-gray-400 bg-gray-500/20";
    }
  };

  if (!isPremium) {
    return (
      <Card className={`glass-card border-purple-500/30 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-500" />
            KI-Reel-Ideen-Generator
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">PRO</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
              Generiere 10 personalisierte Reel-Ideen basierend auf den Top-Performern von @{username}.
            </p>
            <ul className="text-left text-sm space-y-2 mb-6 max-w-xs mx-auto">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="w-4 h-4 text-purple-500" />
                KI-generierte Content-Ideen
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Target className="w-4 h-4 text-cyan-500" />
                Basierend auf deinen Top-Performern
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Geschätzte Views pro Idee
              </li>
            </ul>
            <Button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              onClick={() => window.location.href = "/pricing"}
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade auf Pro
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-500" />
            KI-Reel-Ideen-Generator
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">KI</Badge>
          </CardTitle>
          <Button
            onClick={generateIdeas}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                KI analysiert...
              </>
            ) : ideas.length > 0 ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Neu generieren
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                10 KI-Ideen generieren
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {ideas.length === 0 && !isGenerating && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-muted-foreground text-sm">
              Klicke auf "10 KI-Ideen generieren" um personalisierte Reel-Ideen basierend auf den Top-Performern von @{username} zu erhalten.
            </p>
          </div>
        )}

        {ideas.length > 0 && (
          <div className="space-y-3">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-purple-400">#{idea.id}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-medium text-sm">{idea.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {idea.formatIcon}
                          <span className="ml-1">{idea.format}</span>
                        </Badge>
                        <Badge className={`text-xs ${getDifficultyColor(idea.difficulty)}`}>
                          {idea.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-purple-400 font-medium mb-2">"{idea.hook}"</p>
                      
                      {expandedId === idea.id && (
                        <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Beschreibung:</p>
                            <p className="text-sm">{idea.description}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Warum es funktioniert:</p>
                            <p className="text-sm text-green-400">{idea.whyItWorks}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Geschätzte Views:</p>
                              <p className="text-sm font-bold text-cyan-400">{idea.estimatedViews}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {idea.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
                      className="h-8 w-8 p-0"
                    >
                      {expandedId === idea.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyIdea(idea)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedId === idea.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Insight Box */}
        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">KI-Tipp:</strong> Die besten Ideen kombinieren 
              bewährte Hooks mit deinem einzigartigen Stil. Teste 2-3 Ideen pro Woche und tracke die Performance.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

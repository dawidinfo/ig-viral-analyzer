import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  Copy, 
  Check,
  RefreshCw,
  Lightbulb,
  Zap,
  Target,
  MessageSquare,
  Hash,
  TrendingUp,
  Loader2,
  Lock,
  Crown
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface Reel {
  id: string;
  caption?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

interface CaptionGeneratorProps {
  reels: Reel[];
  username: string;
  niche?: string;
  className?: string;
  isPremium?: boolean;
}

interface GeneratedCaption {
  id: number;
  style: string;
  styleIcon: React.ReactNode;
  caption: string;
  hashtags: string[];
  hook: string;
  cta: string;
}

const CAPTION_STYLES = [
  { id: 1, name: "Hook-Fokus", icon: <Zap className="w-4 h-4" />, description: "Starker Einstieg" },
  { id: 2, name: "Storytelling", icon: <MessageSquare className="w-4 h-4" />, description: "Emotionale Story" },
  { id: 3, name: "Listicle", icon: <Target className="w-4 h-4" />, description: "Nummerierte Tipps" },
  { id: 4, name: "Frage", icon: <Lightbulb className="w-4 h-4" />, description: "Engagement-Trigger" },
  { id: 5, name: "Kontrovers", icon: <TrendingUp className="w-4 h-4" />, description: "Polarisierend" },
];

export function CaptionGenerator({ reels, username, niche, className = "", isPremium = false }: CaptionGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<GeneratedCaption[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null);

  // Extract top hashtags from successful reels
  const topHashtags = (() => {
    const hashtagMap = new Map<string, { count: number; totalEngagement: number }>();
    
    reels.forEach(reel => {
      if (!reel.caption) return;
      const hashtags = reel.caption.match(/#\w+/g) || [];
      const engagement = reel.viewCount > 0 
        ? ((reel.likeCount + reel.commentCount) / reel.viewCount) * 100 
        : 0;
      
      hashtags.forEach(tag => {
        const existing = hashtagMap.get(tag.toLowerCase()) || { count: 0, totalEngagement: 0 };
        existing.count += 1;
        existing.totalEngagement += engagement;
        hashtagMap.set(tag.toLowerCase(), existing);
      });
    });

    return Array.from(hashtagMap.entries())
      .map(([tag, data]) => ({ tag, avgEngagement: data.totalEngagement / data.count, count: data.count }))
      .filter(h => h.count >= 2)
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 10)
      .map(h => h.tag);
  })();

  // Extract successful hooks from top reels
  const topHooks = (() => {
    return reels
      .filter(r => r.caption && r.viewCount > 0)
      .sort((a, b) => {
        const engA = (a.likeCount + a.commentCount) / a.viewCount;
        const engB = (b.likeCount + b.commentCount) / b.viewCount;
        return engB - engA;
      })
      .slice(0, 5)
      .map(r => {
        const firstLine = r.caption?.split('\n')[0] || '';
        return firstLine.slice(0, 100);
      })
      .filter(h => h.length > 10);
  })();

  // Generate captions using patterns from top performers
  const generateCaptions = async () => {
    if (!topic.trim()) {
      toast.error("Bitte gib ein Thema für dein Reel ein");
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation (in production, this would call your AI API)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const hookPatterns = [
      `🔥 ${topic} - Das musst du wissen!`,
      `POV: Du entdeckst gerade ${topic}`,
      `Niemand spricht darüber: ${topic}`,
      `3 Dinge über ${topic}, die dein Leben verändern`,
      `Unpopuläre Meinung: ${topic} ist...`,
    ];

    const ctaPatterns = [
      "💾 Speichern für später!",
      "👇 Schreib mir deine Meinung in die Kommentare!",
      "🔔 Folge für mehr solchen Content!",
      "📩 Teile das mit jemandem, der das braucht!",
      "❓ Was denkst du? Stimmt das?",
    ];

    const storyPatterns = [
      `Ich hätte nie gedacht, dass ${topic} so einen Unterschied macht.\n\nAber dann ist das passiert...`,
      `Vor 6 Monaten wusste ich nichts über ${topic}.\n\nHeute? Komplett anderes Leben.`,
      `Die Wahrheit über ${topic}, die dir niemand erzählt:\n\n`,
      `Ich habe ${topic} getestet und das Ergebnis hat mich schockiert.\n\n`,
      `Warum ${topic} der Gamechanger ist, auf den du gewartet hast:\n\n`,
    ];

    const selectedHashtags = topHashtags.length > 0 
      ? topHashtags.slice(0, 5) 
      : [`#${topic.replace(/\s+/g, '').toLowerCase()}`, '#reels', '#viral', '#trending', '#fyp'];

    const captions: GeneratedCaption[] = CAPTION_STYLES.map((style, index) => {
      let caption = "";
      let hook = hookPatterns[index];
      let cta = ctaPatterns[index];

      switch (style.id) {
        case 1: // Hook-Fokus
          caption = `${hook}\n\n${storyPatterns[0].replace(`${topic}`, topic)}\n\n${cta}`;
          break;
        case 2: // Storytelling
          caption = `${storyPatterns[1].replace(`${topic}`, topic)}\n\nHier sind meine Top 3 Learnings:\n\n1️⃣ ...\n2️⃣ ...\n3️⃣ ...\n\n${cta}`;
          hook = storyPatterns[1].split('\n')[0];
          break;
        case 3: // Listicle
          caption = `3 ${topic}-Tipps, die wirklich funktionieren:\n\n1️⃣ Tipp eins hier\n\n2️⃣ Tipp zwei hier\n\n3️⃣ Tipp drei hier\n\nWelchen Tipp probierst du zuerst? 👇`;
          hook = `3 ${topic}-Tipps, die wirklich funktionieren:`;
          cta = "Welchen Tipp probierst du zuerst? 👇";
          break;
        case 4: // Frage
          caption = `Kennst du das auch bei ${topic}? 🤔\n\n[Beschreibe das Problem]\n\nHier ist die Lösung, die bei mir funktioniert hat:\n\n✅ Punkt 1\n✅ Punkt 2\n✅ Punkt 3\n\n${cta}`;
          hook = `Kennst du das auch bei ${topic}? 🤔`;
          break;
        case 5: // Kontrovers
          caption = `Unpopuläre Meinung: ${topic} ist überbewertet.\n\nHier ist warum:\n\n❌ Grund 1\n❌ Grund 2\n❌ Grund 3\n\nABER... es gibt eine Alternative.\n\n${cta}`;
          hook = `Unpopuläre Meinung: ${topic} ist überbewertet.`;
          break;
      }

      return {
        id: style.id,
        style: style.name,
        styleIcon: style.icon,
        caption,
        hashtags: selectedHashtags,
        hook,
        cta,
      };
    });

    setGeneratedCaptions(captions);
    setIsGenerating(false);
    toast.success("5 Captions generiert!");
  };

  const copyCaption = async (caption: GeneratedCaption) => {
    const fullCaption = `${caption.caption}\n\n${caption.hashtags.join(' ')}`;
    await navigator.clipboard.writeText(fullCaption);
    setCopiedId(caption.id);
    toast.success("Caption kopiert!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isPremium) {
    return (
      <Card className={`glass-card ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            KI-Caption-Generator
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">PRO</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Generiere optimierte Captions basierend auf deinen Top-Performern mit KI.
            </p>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
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
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              KI-Caption-Generator
            </CardTitle>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">KI</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Worum geht es in deinem Reel?</label>
            <Textarea
              placeholder="z.B. Produktivitäts-Tipps für Unternehmer, Fitness-Motivation, Rezept für gesundes Frühstück..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[80px] bg-muted/30"
            />
          </div>

          {/* Style Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Caption-Stil (optional)</label>
            <div className="flex flex-wrap gap-2">
              {CAPTION_STYLES.map(style => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(selectedStyle === style.id ? null : style.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                    selectedStyle === style.id
                      ? "bg-purple-500 text-white"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {style.icon}
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={generateCaptions}
            disabled={isGenerating || !topic.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                KI generiert Captions...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                5 Captions generieren
              </>
            )}
          </Button>
        </div>

        {/* Top Hashtags Info */}
        {topHashtags.length > 0 && (
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-medium">Deine Top-Hashtags (basierend auf Performance)</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {topHashtags.slice(0, 8).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Generated Captions */}
        {generatedCaptions.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Generierte Captions
            </h4>
            
            {generatedCaptions
              .filter(c => selectedStyle === null || c.id === selectedStyle)
              .map(caption => (
                <div
                  key={caption.id}
                  className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-purple-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                        {caption.styleIcon}
                      </div>
                      <span className="text-sm font-medium">{caption.style}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyCaption(caption)}
                      className="h-8"
                    >
                      {copiedId === caption.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-sm whitespace-pre-line mb-3">{caption.caption}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {caption.hashtags.map(tag => (
                      <span key={tag} className="text-xs text-purple-400">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Insight Box */}
        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">KI-Tipp:</strong> Die besten Captions von @{username} 
              nutzen starke Hooks in der ersten Zeile. Kombiniere emotionale Trigger mit einem klaren CTA am Ende.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

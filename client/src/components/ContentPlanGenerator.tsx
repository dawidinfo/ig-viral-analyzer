import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Sparkles, 
  Target, 
  Users, 
  Lightbulb,
  FileText,
  Clock,
  Hash,
  Mic,
  Scissors,
  Lock,
  Crown,
  ChevronRight,
  Check,
  Brain,
  Zap,
  TrendingUp,
  MessageSquare,
  Play,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TargetAudienceProfile {
  niche: string;
  painPoints: string;
  usps: string;
  benefits: string;
  tonality: string;
  contentStyle: string;
}

interface ContentPlanItem {
  day: number;
  topic: string;
  hook: string;
  framework: "HAPSS" | "AIDA";
  scriptStructure: string[];
  cutRecommendation: string;
  hashtags: string[];
  bestTime: string;
  trendingAudio: string;
  copywritingTip: string;
}

interface ContentPlanGeneratorProps {
  isPro: boolean;
  analysisData?: {
    topReels?: any[];
    postingTimes?: any;
    hashtags?: string[];
    avgEngagement?: number;
  };
  onUpgrade?: () => void;
}

export function ContentPlanGenerator({ isPro, analysisData, onUpgrade }: ContentPlanGeneratorProps) {
  const [profile, setProfile] = useState<TargetAudienceProfile>({
    niche: "",
    painPoints: "",
    usps: "",
    benefits: "",
    tonality: "professional",
    contentStyle: "educational"
  });
  const [planDays, setPlanDays] = useState<10 | 20 | 30>(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<ContentPlanItem[] | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Demo Content Plan für Blur-Vorschau
  const demoContentPlan: ContentPlanItem[] = [
    {
      day: 1,
      topic: "Pain Point Opener - Das größte Problem deiner Zielgruppe",
      hook: "90% machen diesen Fehler und verlieren täglich Kunden...",
      framework: "HAPSS",
      scriptStructure: [
        "Hook: Schockierende Statistik (0-3 Sek)",
        "Attention: Problem visualisieren (3-8 Sek)",
        "Problem: Konsequenzen aufzeigen (8-15 Sek)",
        "Story: Eigene Erfahrung teilen (15-25 Sek)",
        "Solution: Deine Lösung präsentieren (25-35 Sek)"
      ],
      cutRecommendation: "Schnelle Schnitte alle 2-3 Sekunden, B-Roll bei Problem-Teil",
      hashtags: ["#businesstipps", "#unternehmertum", "#erfolg", "#marketing"],
      bestTime: "Dienstag 18:00",
      trendingAudio: "Original Sound - Storytelling",
      copywritingTip: "Hopkins: Beginne mit dem stärksten Benefit, nicht mit Features"
    },
    {
      day: 2,
      topic: "Behind the Scenes - Authentizität zeigen",
      hook: "Das zeigt dir niemand... So sieht mein Alltag wirklich aus",
      framework: "AIDA",
      scriptStructure: [
        "Attention: Neugier wecken (0-3 Sek)",
        "Interest: Einblick geben (3-12 Sek)",
        "Desire: Transformation zeigen (12-22 Sek)",
        "Action: CTA zum Folgen (22-30 Sek)"
      ],
      cutRecommendation: "Natürliche Schnitte, weniger poliert, authentisch",
      hashtags: ["#behindthescenes", "#dayinmylife", "#entrepreneur"],
      bestTime: "Mittwoch 12:00",
      trendingAudio: "Trending - Chill Vibes",
      copywritingTip: "Ogilvy: Authentizität schlägt Perfektion - zeige die echte Person"
    },
    {
      day: 3,
      topic: "Transformation Story - Vorher/Nachher",
      hook: "Vor 6 Monaten war ich am Tiefpunkt. Heute...",
      framework: "HAPSS",
      scriptStructure: [
        "Hook: Emotionaler Einstieg (0-3 Sek)",
        "Attention: Vorher-Zustand (3-10 Sek)",
        "Problem: Was nicht funktioniert hat (10-18 Sek)",
        "Story: Der Wendepunkt (18-28 Sek)",
        "Solution: Das Ergebnis + Wie du es auch schaffst (28-40 Sek)"
      ],
      cutRecommendation: "Langsame Schnitte bei emotionalen Momenten, schnell bei Action",
      hashtags: ["#transformation", "#success", "#motivation", "#growth"],
      bestTime: "Donnerstag 19:00",
      trendingAudio: "Emotional - Inspiring",
      copywritingTip: "Schwartz: Sprich die tiefsten Wünsche deiner Zielgruppe an"
    }
  ];

  const generateContentPlan = async () => {
    if (!isPro) {
      onUpgrade?.();
      return;
    }
    
    setIsGenerating(true);
    // Simuliere KI-Generierung
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generiere Plan basierend auf Profil und Analyse
    const plan: ContentPlanItem[] = [];
    const frameworks: ("HAPSS" | "AIDA")[] = ["HAPSS", "AIDA"];
    const times = ["Montag 18:00", "Dienstag 12:00", "Mittwoch 19:00", "Donnerstag 18:00", "Freitag 12:00", "Samstag 10:00", "Sonntag 19:00"];
    const copywritingTips = [
      "Hopkins: Beginne mit dem stärksten Benefit",
      "Ogilvy: Nutze spezifische Zahlen statt vager Aussagen",
      "Schwartz: Sprich die Awareness-Stufe deiner Zielgruppe an",
      "Hopkins: Teste verschiedene Headlines gegeneinander",
      "Ogilvy: Die Headline ist 80% deines Erfolgs",
      "Schwartz: Verstärke existierende Wünsche, erschaffe keine neuen"
    ];

    for (let i = 1; i <= planDays; i++) {
      const framework = frameworks[i % 2];
      plan.push({
        day: i,
        topic: `Content-Idee ${i}: ${profile.niche || "Deine Nische"} - ${["Pain Point", "Lösung", "Story", "Tutorial", "Behind the Scenes"][i % 5]}`,
        hook: `Hook für Tag ${i} basierend auf: ${profile.painPoints || "Deine Pain Points"}`,
        framework,
        scriptStructure: framework === "HAPSS" 
          ? ["Hook (0-3s)", "Attention (3-8s)", "Problem (8-15s)", "Story (15-25s)", "Solution (25-35s)"]
          : ["Attention (0-3s)", "Interest (3-12s)", "Desire (12-22s)", "Action (22-30s)"],
        cutRecommendation: "Schnitte alle 2-3 Sekunden für maximale Aufmerksamkeit",
        hashtags: ["#" + (profile.niche || "business").toLowerCase().replace(/\s/g, ""), "#content", "#viral", "#reels"],
        bestTime: times[i % 7],
        trendingAudio: "Trending Audio der Woche",
        copywritingTip: copywritingTips[i % copywritingTips.length]
      });
    }
    
    setGeneratedPlan(plan);
    setIsGenerating(false);
    setActiveTab("plan");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">KI Content-Plan Generator</h2>
            <p className="text-muted-foreground">Erstelle deinen personalisierten Reel-Plan</p>
          </div>
        </div>
        {!isPro && (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            <Crown className="w-3 h-3 mr-1" />
            Pro Feature
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Zielgruppen-Profil
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Plan-Einstellungen
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Content-Plan
          </TabsTrigger>
        </TabsList>

        {/* Zielgruppen-Profil Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-500" />
                Definiere deine Zielgruppe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="niche">Nische / Branche</Label>
                  <Input
                    id="niche"
                    placeholder="z.B. Fitness, Business, Lifestyle..."
                    value={profile.niche}
                    onChange={(e) => setProfile({ ...profile, niche: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tonality">Tonalität</Label>
                  <Select 
                    value={profile.tonality} 
                    onValueChange={(value) => setProfile({ ...profile, tonality: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wähle einen Stil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professionell</SelectItem>
                      <SelectItem value="casual">Locker & Freundlich</SelectItem>
                      <SelectItem value="motivational">Motivierend</SelectItem>
                      <SelectItem value="educational">Lehrreich</SelectItem>
                      <SelectItem value="entertaining">Unterhaltend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="painPoints">Pain Points deiner Zielgruppe</Label>
                <Textarea
                  id="painPoints"
                  placeholder="Welche Probleme hat deine Zielgruppe? Was frustriert sie? Was hält sie nachts wach?"
                  value={profile.painPoints}
                  onChange={(e) => setProfile({ ...profile, painPoints: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usps">Deine USPs (Unique Selling Points)</Label>
                <Textarea
                  id="usps"
                  placeholder="Was macht dich einzigartig? Warum sollten Leute dir folgen?"
                  value={profile.usps}
                  onChange={(e) => setProfile({ ...profile, usps: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits für deine Follower</Label>
                <Textarea
                  id="benefits"
                  placeholder="Was bekommen deine Follower von dir? Welchen Mehrwert bietest du?"
                  value={profile.benefits}
                  onChange={(e) => setProfile({ ...profile, benefits: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentStyle">Content-Stil</Label>
                <Select 
                  value={profile.contentStyle} 
                  onValueChange={(value) => setProfile({ ...profile, contentStyle: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wähle deinen Stil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="educational">Educational (Tipps & Tricks)</SelectItem>
                    <SelectItem value="storytelling">Storytelling (Geschichten)</SelectItem>
                    <SelectItem value="entertainment">Entertainment (Unterhaltung)</SelectItem>
                    <SelectItem value="behind-scenes">Behind the Scenes</SelectItem>
                    <SelectItem value="mixed">Mix aus allem</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={() => setActiveTab("settings")} 
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600"
              >
                Weiter zu Plan-Einstellungen
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plan-Einstellungen Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-500" />
                Plan-Einstellungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Zeitraum wählen</Label>
                <div className="grid grid-cols-3 gap-4">
                  {[10, 20, 30].map((days) => (
                    <button
                      key={days}
                      onClick={() => setPlanDays(days as 10 | 20 | 30)}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                        planDays === days
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-border hover:border-violet-500/50"
                      }`}
                    >
                      <div className="text-3xl font-bold text-center">{days}</div>
                      <div className="text-sm text-muted-foreground text-center">Tage</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-violet-500" />
                  Was wird generiert:
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    {planDays} konkrete Reel-Ideen mit Hooks
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    HAPSS & AIDA Framework-Auswahl pro Reel
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Script-Struktur mit Zeitangaben
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Schnitt-Empfehlungen für maximale Retention
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Optimale Posting-Zeiten
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Hashtag-Vorschläge
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Copywriting-Tipps (Hopkins, Ogilvy, Schwartz)
                  </li>
                </ul>
              </div>

              <Button 
                onClick={generateContentPlan}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 py-6 text-lg"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    KI generiert deinen Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {planDays}-Tage Content-Plan generieren
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content-Plan Tab */}
        <TabsContent value="plan" className="space-y-6">
          {/* Blur Overlay für Free User */}
          {!isPro && (
            <div className="relative">
              {/* Geblurrte Vorschau */}
              <div className="filter blur-sm pointer-events-none select-none">
                <div className="grid gap-4">
                  {demoContentPlan.map((item, index) => (
                    <Card key={index} className="border-border/50 bg-card/50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {item.day}
                            </div>
                            <div>
                              <h4 className="font-semibold">{item.topic}</h4>
                              <Badge variant="outline" className="mt-1">{item.framework}</Badge>
                            </div>
                          </div>
                          <Badge className="bg-emerald-500/20 text-emerald-500">{item.bestTime}</Badge>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 mb-4">
                          <p className="text-sm font-medium">🎣 Hook:</p>
                          <p className="text-muted-foreground">{item.hook}</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">📝 Script-Struktur:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {item.scriptStructure.map((step, i) => (
                                <li key={i}>• {step}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">✂️ Schnitt-Tipp:</p>
                            <p className="text-sm text-muted-foreground">{item.cutRecommendation}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Overlay mit Upgrade CTA */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background via-background/80 to-transparent">
                <Card className="max-w-md mx-auto border-violet-500/50 bg-card/95 backdrop-blur-xl shadow-2xl">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Content-Plan freischalten</h3>
                    <p className="text-muted-foreground mb-6">
                      Erhalte deinen personalisierten {planDays}-Tage Content-Plan mit KI-generierten Hooks, 
                      Script-Strukturen und Copywriting-Tipps.
                    </p>
                    <div className="space-y-3 text-left mb-6">
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Konkrete Reel-Ideen für jeden Tag</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>HAPSS & AIDA Framework-Auswahl</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Hopkins, Ogilvy, Schwartz Tipps</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Optimale Posting-Zeiten</span>
                      </div>
                    </div>
                    <Button 
                      onClick={onUpgrade}
                      className="w-full bg-gradient-to-r from-violet-500 to-purple-600 py-6"
                    >
                      <Crown className="w-5 h-5 mr-2" />
                      Upgrade auf Pro
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Ab €49/Monat • Jederzeit kündbar
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Generierter Plan für Pro User */}
          {isPro && generatedPlan && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Dein {planDays}-Tage Content-Plan</h3>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Als PDF exportieren
                </Button>
              </div>
              
              {generatedPlan.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-border/50 bg-card/50 hover:border-violet-500/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            {item.day}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{item.topic}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={
                                item.framework === "HAPSS" 
                                  ? "border-violet-500 text-violet-500" 
                                  : "border-cyan-500 text-cyan-500"
                              }>
                                {item.framework}
                              </Badge>
                              <Badge className="bg-emerald-500/20 text-emerald-500 border-0">
                                <Clock className="w-3 h-3 mr-1" />
                                {item.bestTime}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hook */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 mb-4">
                        <p className="text-sm font-bold text-amber-500 mb-1 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          HOOK
                        </p>
                        <p className="text-lg font-medium">"{item.hook}"</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        {/* Script-Struktur */}
                        <div className="p-4 rounded-xl bg-muted/50">
                          <p className="text-sm font-bold mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-violet-500" />
                            Script-Struktur
                          </p>
                          <ul className="space-y-2">
                            {item.scriptStructure.map((step, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs text-violet-500 font-bold">{i + 1}</span>
                                </div>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Schnitt & Audio */}
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-muted/50">
                            <p className="text-sm font-bold mb-2 flex items-center gap-2">
                              <Scissors className="w-4 h-4 text-cyan-500" />
                              Schnitt-Empfehlung
                            </p>
                            <p className="text-sm text-muted-foreground">{item.cutRecommendation}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-muted/50">
                            <p className="text-sm font-bold mb-2 flex items-center gap-2">
                              <Mic className="w-4 h-4 text-pink-500" />
                              Audio-Tipp
                            </p>
                            <p className="text-sm text-muted-foreground">{item.trendingAudio}</p>
                          </div>
                        </div>
                      </div>

                      {/* Hashtags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.hashtags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Copywriting Tip */}
                      <div className="p-3 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                        <p className="text-sm flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <span className="font-medium">Copywriting-Tipp:</span>
                          <span className="text-muted-foreground">{item.copywritingTip}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Leerer Zustand für Pro User ohne generierten Plan */}
          {isPro && !generatedPlan && (
            <Card className="border-dashed border-2 border-border">
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Noch kein Plan generiert</h3>
                <p className="text-muted-foreground mb-6">
                  Fülle dein Zielgruppen-Profil aus und generiere deinen personalisierten Content-Plan.
                </p>
                <Button onClick={() => setActiveTab("profile")}>
                  Jetzt starten
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ContentPlanGenerator;

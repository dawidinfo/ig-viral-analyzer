import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
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
  Star,
  Download,
  Music
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
  userId?: number;
  analysisData?: {
    topReels?: any[];
    postingTimes?: any;
    hashtags?: string[];
    avgEngagement?: number;
  };
  onUpgrade?: () => void;
}

export function ContentPlanGenerator({ isPro, userId, analysisData, onUpgrade }: ContentPlanGeneratorProps) {
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
  
  // New: Mode selection and profile-based generation
  const [generationMode, setGenerationMode] = useState<"manual" | "profile">("manual");
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editedItem, setEditedItem] = useState<ContentPlanItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [planName, setPlanName] = useState("");

  // Fetch saved analyses for profile-based generation
  const dashboardData = trpc.dashboard.getData.useQuery(
    { userId: userId || 0 },
    { enabled: !!userId && isPro }
  );
  const savedAnalysesList = dashboardData.data?.savedAnalyses || [];

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

  // tRPC mutation for generating content plan
  const generatePlanMutation = trpc.dashboard.generateContentPlan.useMutation({
    onSuccess: (data) => {
      // Transform API response to match local ContentPlanItem format
      const transformedPlan: ContentPlanItem[] = data.items.map((item: any) => ({
        day: item.day,
        topic: item.topic,
        hook: item.hook,
        framework: item.framework,
        scriptStructure: [
          `Hook: ${item.scriptStructure.hook} (${item.scriptStructure.hookDuration})`,
          `Body: ${item.scriptStructure.body} (${item.scriptStructure.bodyDuration})`,
          `CTA: ${item.scriptStructure.cta} (${item.scriptStructure.ctaDuration})`
        ],
        cutRecommendation: item.cutRecommendation,
        hashtags: item.hashtags,
        bestTime: item.bestPostingTime,
        trendingAudio: "Trending Audio",
        copywritingTip: `${item.copywritingTip.author}: ${item.copywritingTip.tip}`
      }));
      setGeneratedPlan(transformedPlan);
      setIsGenerating(false);
      setActiveTab("plan");
      toast.success(`${planDays}-Tage Content-Plan erfolgreich generiert!`);
    },
    onError: (error) => {
      setIsGenerating(false);
      toast.error(error.message || "Fehler beim Generieren des Content-Plans");
    }
  });

  // Save content plan mutation
  const saveContentPlanMutation = trpc.dashboard.saveContentPlan.useMutation({
    onSuccess: () => {
      setIsSaving(false);
      toast.success("Content-Plan erfolgreich gespeichert!");
    },
    onError: (error: any) => {
      setIsSaving(false);
      toast.error(error.message || "Fehler beim Speichern des Content-Plans");
    }
  });

  // Save content plan to database
  const saveContentPlanToDb = async () => {
    if (!userId || !generatedPlan) return;
    
    setIsSaving(true);
    const name = generationMode === "profile" && selectedAnalysis 
      ? `Content-Plan für @${selectedAnalysis.username} (${planDays} Tage)`
      : `${planDays}-Tage Content-Plan - ${profile.niche || "Allgemein"}`;
    
    saveContentPlanMutation.mutate({
      userId,
      name,
      profile: {
        niche: generationMode === "profile" ? (selectedAnalysis?.niche || "Instagram") : profile.niche,
        painPoints: generationMode === "profile" ? [] : profile.painPoints.split(",").map(s => s.trim()).filter(Boolean),
        usps: generationMode === "profile" ? [] : profile.usps.split(",").map(s => s.trim()).filter(Boolean),
        benefits: generationMode === "profile" ? [] : profile.benefits.split(",").map(s => s.trim()).filter(Boolean),
        tonality: profile.tonality
      },
      duration: planDays,
      framework: "mixed" as const,
      planItems: generatedPlan.map(item => ({
        day: item.day,
        topic: item.topic,
        hook: item.hook,
        framework: item.framework,
        scriptStructure: {
          hook: item.scriptStructure[0] || "",
          hookDuration: "0-3s",
          body: item.scriptStructure[1] || "",
          bodyDuration: "3-25s",
          cta: item.scriptStructure[2] || "",
          ctaDuration: "25-35s"
        },
        cutRecommendation: item.cutRecommendation,
        hashtags: item.hashtags,
        bestPostingTime: item.bestTime,
        trendingAudio: { name: item.trendingAudio, url: "" },
        copywritingTip: { author: "Expert", tip: item.copywritingTip }
      }))
    });
  };

  // New: Profile-based content plan mutation
  const generateFromProfileMutation = trpc.dashboard.generateFromProfile.useMutation({
    onSuccess: (data) => {
      const transformedPlan: ContentPlanItem[] = data.items.map((item: any) => ({
        day: item.day,
        topic: item.topic,
        hook: item.hook,
        framework: item.framework,
        scriptStructure: [
          `Hook: ${item.scriptStructure.hook} (${item.scriptStructure.hookDuration})`,
          `Body: ${item.scriptStructure.body} (${item.scriptStructure.bodyDuration})`,
          `CTA: ${item.scriptStructure.cta} (${item.scriptStructure.ctaDuration})`
        ],
        cutRecommendation: item.cutRecommendation,
        hashtags: item.hashtags,
        bestTime: item.bestPostingTime,
        trendingAudio: item.trendingAudio?.name || "Trending Audio",
        copywritingTip: `${item.copywritingTip.author}: ${item.copywritingTip.tip}`
      }));
      setGeneratedPlan(transformedPlan);
      setIsGenerating(false);
      setActiveTab("plan");
      toast.success(`${planDays}-Tage Content-Plan basierend auf @${selectedAnalysis?.username} generiert!`);
    },
    onError: (error) => {
      setIsGenerating(false);
      toast.error(error.message || "Fehler beim Generieren des Profil-basierten Content-Plans");
    }
  });

  const generateContentPlan = async () => {
    if (!isPro) {
      onUpgrade?.();
      return;
    }

    if (!userId) {
      toast.error("Bitte melde dich an um einen Content-Plan zu generieren");
      return;
    }

    setIsGenerating(true);

    // Profile-based generation mode
    if (generationMode === "profile") {
      if (!selectedAnalysis) {
        toast.error("Bitte wähle ein analysiertes Profil aus");
        setIsGenerating(false);
        return;
      }

      generateFromProfileMutation.mutate({
        userId,
        profileData: {
          username: selectedAnalysis.username,
          platform: "instagram" as const,
          topReels: selectedAnalysis.topReels?.map((r: any) => ({
            caption: r.caption,
            likes: r.likes,
            comments: r.comments,
            views: r.views,
            hashtags: r.hashtags
          })),
          postingTimes: selectedAnalysis.postingTimes,
          commonHashtags: selectedAnalysis.hashtags || selectedAnalysis.topHashtags,
          avgEngagement: selectedAnalysis.engagementRate || selectedAnalysis.avgEngagement,
          followerCount: selectedAnalysis.followers || selectedAnalysis.followerCount,
          niche: selectedAnalysis.niche || selectedAnalysis.category,
          contentStyle: selectedAnalysis.contentStyle || "educational"
        },
        duration: String(planDays) as "10" | "20" | "30"
      });
      return;
    }

    // Manual generation mode
    if (!profile.niche) {
      toast.error("Bitte gib deine Nische an");
      setIsGenerating(false);
      return;
    }
    
    // Parse comma-separated strings into arrays
    const painPointsArray = profile.painPoints.split(",").map(s => s.trim()).filter(Boolean);
    const uspsArray = profile.usps.split(",").map(s => s.trim()).filter(Boolean);
    const benefitsArray = profile.benefits.split(",").map(s => s.trim()).filter(Boolean);

    generatePlanMutation.mutate({
      userId,
      profile: {
        niche: profile.niche,
        painPoints: painPointsArray.length > 0 ? painPointsArray : ["Keine Pain Points angegeben"],
        usps: uspsArray.length > 0 ? uspsArray : ["Keine USPs angegeben"],
        benefits: benefitsArray.length > 0 ? benefitsArray : ["Keine Benefits angegeben"],
        tonality: profile.tonality,
      },
      duration: String(planDays) as "10" | "20" | "30"
    });
  };

  // Edit a content plan item
  const startEditing = (index: number) => {
    if (generatedPlan) {
      setEditingItemIndex(index);
      setEditedItem({ ...generatedPlan[index] });
    }
  };

  const saveEdit = () => {
    if (editedItem !== null && editingItemIndex !== null && generatedPlan) {
      const updatedPlan = [...generatedPlan];
      updatedPlan[editingItemIndex] = editedItem;
      setGeneratedPlan(updatedPlan);
      setEditingItemIndex(null);
      setEditedItem(null);
      toast.success("Änderungen gespeichert!");
    }
  };

  const cancelEdit = () => {
    setEditingItemIndex(null);
    setEditedItem(null);
  };

  // PDF Export function
  const exportToPDF = async () => {
    if (!generatedPlan || generatedPlan.length === 0) {
      toast.error("Bitte generiere zuerst einen Content-Plan");
      return;
    }

    toast.info("PDF wird erstellt...");

    // Create PDF content as HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Content-Plan - ${profile.niche || 'Mein Plan'}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
          h1 { color: #7c3aed; border-bottom: 3px solid #7c3aed; padding-bottom: 10px; }
          h2 { color: #6366f1; margin-top: 30px; }
          .header { background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
          .header h1 { color: white; border: none; margin: 0; }
          .header p { margin: 10px 0 0 0; opacity: 0.9; }
          .profile { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .profile h3 { margin-top: 0; color: #7c3aed; }
          .day-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
          .day-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
          .day-number { background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
          .framework { background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
          .topic { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 10px; }
          .hook { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; margin: 15px 0; font-style: italic; }
          .section { margin: 15px 0; }
          .section-title { font-weight: 600; color: #475569; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
          .section-title::before { content: ''; width: 4px; height: 16px; background: #7c3aed; border-radius: 2px; }
          .script-step { background: #f8fafc; padding: 8px 12px; margin: 4px 0; border-radius: 6px; font-size: 14px; }
          .hashtags { display: flex; flex-wrap: wrap; gap: 8px; }
          .hashtag { background: #ede9fe; color: #7c3aed; padding: 4px 10px; border-radius: 12px; font-size: 13px; }
          .meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0; }
          .meta-item { font-size: 13px; }
          .meta-label { color: #64748b; }
          .meta-value { font-weight: 600; color: #1e293b; }
          .tip { background: #fef3c7; padding: 12px; border-radius: 8px; margin-top: 15px; font-size: 13px; }
          .tip-author { font-weight: 600; color: #92400e; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📅 ${planDays}-Tage Content-Plan</h1>
          <p>Generiert für: ${profile.niche || 'Deine Nische'} | ${new Date().toLocaleDateString('de-DE')}</p>
        </div>
        
        <div class="profile">
          <h3>🎯 Zielgruppen-Profil</h3>
          <p><strong>Nische:</strong> ${profile.niche || '-'}</p>
          <p><strong>Pain Points:</strong> ${profile.painPoints || '-'}</p>
          <p><strong>USPs:</strong> ${profile.usps || '-'}</p>
          <p><strong>Benefits:</strong> ${profile.benefits || '-'}</p>
          <p><strong>Tonalität:</strong> ${profile.tonality || '-'}</p>
        </div>

        <h2>🎬 Dein Content-Plan</h2>
        
        ${generatedPlan.map(item => `
          <div class="day-card">
            <div class="day-header">
              <span class="day-number">Tag ${item.day}</span>
              <span class="framework">${item.framework}</span>
            </div>
            <div class="topic">${item.topic}</div>
            <div class="hook">
              <strong>🎣 Hook:</strong> "${item.hook}"
            </div>
            
            <div class="section">
              <div class="section-title">📝 Script-Struktur</div>
              ${item.scriptStructure.map(step => `<div class="script-step">${step}</div>`).join('')}
            </div>
            
            <div class="section">
              <div class="section-title">✂️ Schnitt-Empfehlung</div>
              <p>${item.cutRecommendation}</p>
            </div>
            
            <div class="section">
              <div class="section-title">#️⃣ Hashtags</div>
              <div class="hashtags">
                ${item.hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join('')}
              </div>
            </div>
            
            <div class="meta">
              <div class="meta-item">
                <div class="meta-label">⏰ Beste Zeit</div>
                <div class="meta-value">${item.bestTime}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">🎵 Audio</div>
                <div class="meta-value">${item.trendingAudio}</div>
              </div>
            </div>
            
            <div class="tip">
              <span class="tip-author">💡 Copywriting-Tipp:</span> ${item.copywritingTip}
            </div>
          </div>
        `).join('')}
        
        <div class="footer">
          <p>Erstellt mit ReelSpy.ai - KI-powered Instagram Analyse</p>
          <p>www.reelspy.ai</p>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open in new window for printing/saving as PDF
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
      toast.success("PDF-Vorschau geöffnet! Nutze 'Als PDF speichern' im Druckdialog.");
    } else {
      // Fallback: Download as HTML
      const a = document.createElement('a');
      a.href = url;
      a.download = `content-plan-${planDays}-tage-${profile.niche || 'plan'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Content-Plan als HTML heruntergeladen!");
    }
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-violet-500/10 to-purple-600/10 rounded-2xl border border-violet-500/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">KI Content-Plan Generator</h2>
            <p className="text-muted-foreground">Erstelle deinen personalisierten Reel-Plan</p>
          </div>
        </div>
        {!isPro && (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-4 py-2">
            <Crown className="w-4 h-4 mr-2" />
            Pro Feature
          </Badge>
        )}
      </div>

      {/* Mode Selection */}
      <Card className="border-2 border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5 text-violet-500" />
                Generierungs-Modus
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Wähle wie dein Content-Plan erstellt werden soll
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={generationMode === "manual" ? "default" : "outline"}
                size="sm"
                onClick={() => setGenerationMode("manual")}
                className={generationMode === "manual" ? "bg-gradient-to-r from-violet-500 to-purple-600" : ""}
              >
                <FileText className="w-4 h-4 mr-2" />
                Manuell
              </Button>
              <Button
                variant={generationMode === "profile" ? "default" : "outline"}
                size="sm"
                onClick={() => setGenerationMode("profile")}
                className={generationMode === "profile" ? "bg-gradient-to-r from-cyan-500 to-blue-600" : ""}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                KI-Analyse
              </Button>
            </div>
          </div>

          {/* Profile Selection for KI-Analyse Mode */}
          {generationMode === "profile" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border/50"
            >
              <Label className="mb-2 block">Wähle ein analysiertes Profil</Label>
              <Select
                value={selectedAnalysis?.id?.toString() || ""}
                onValueChange={(value) => {
                  const analysis = savedAnalysesList.find((a: any) => a.id.toString() === value);
                  setSelectedAnalysis(analysis);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Wähle ein Profil aus deinen Analysen..." />
                </SelectTrigger>
                <SelectContent>
                  {savedAnalysesList.length === 0 ? (
                    <SelectItem value="none" disabled>Keine gespeicherten Analysen</SelectItem>
                  ) : (
                    savedAnalysesList.map((analysis: any) => (
                      <SelectItem key={analysis.id} value={analysis.id.toString()}>
                        @{analysis.username} - {analysis.followers?.toLocaleString() || "?"} Follower
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedAnalysis && (
                <div className="mt-3 p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      {selectedAnalysis.username?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-semibold">@{selectedAnalysis.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedAnalysis.followers?.toLocaleString() || "?"} Follower • 
                        {selectedAnalysis.engagementRate ? ` ${Number(selectedAnalysis.engagementRate).toFixed(2)}% Engagement` : ""}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    <Sparkles className="w-4 h-4 inline mr-1 text-cyan-500" />
                    Der Content-Plan wird basierend auf den Top-Reels und Engagement-Mustern dieses Profils generiert.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab Navigation mit klarem aktivem Indikator */}
        <div className="mb-8">
          <TabsList className="grid w-full grid-cols-3 p-2 bg-zinc-900/80 rounded-2xl border-2 border-zinc-700 gap-2">
          <TabsTrigger 
            value="profile" 
            className="flex items-center gap-2 py-3 px-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/30 data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-zinc-800 transition-all font-medium"
          >
            <Target className="w-4 h-4" />
            Zielgruppen-Profil
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="flex items-center gap-2 py-3 px-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/30 data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-zinc-800 transition-all font-medium"
          >
            <Sparkles className="w-4 h-4" />
            Plan-Einstellungen
          </TabsTrigger>
          <TabsTrigger 
            value="plan" 
            className="flex items-center gap-2 py-3 px-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/30 data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-zinc-800 transition-all font-medium"
          >
            <FileText className="w-4 h-4" />
            Content-Plan
          </TabsTrigger>
        </TabsList>
        </div>

        {/* Zielgruppen-Profil Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-2 border-zinc-700 bg-zinc-900/50 shadow-xl">
            <CardHeader className="border-b border-zinc-700/50 pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span>Definiere deine Zielgruppe</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="niche" className="text-sm font-semibold text-zinc-300">Nische / Branche</Label>
                  <Input
                    id="niche"
                    placeholder="z.B. Fitness, Business, Lifestyle..."
                    value={profile.niche}
                    onChange={(e) => setProfile({ ...profile, niche: e.target.value })}
                    className="h-12 bg-zinc-800/50 border-2 border-zinc-600 focus:border-violet-500 rounded-xl text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tonality" className="text-sm font-semibold text-zinc-300">Tonalität</Label>
                  <Select 
                    value={profile.tonality} 
                    onValueChange={(value) => setProfile({ ...profile, tonality: value })}
                  >
                    <SelectTrigger className="h-12 bg-zinc-800/50 border-2 border-zinc-600 focus:border-violet-500 rounded-xl">
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
                <Label htmlFor="painPoints" className="text-sm font-semibold text-zinc-300">Pain Points deiner Zielgruppe</Label>
                <Textarea
                  id="painPoints"
                  placeholder="Welche Probleme hat deine Zielgruppe? Was frustriert sie? Was hält sie nachts wach?"
                  value={profile.painPoints}
                  onChange={(e) => setProfile({ ...profile, painPoints: e.target.value })}
                  rows={3}
                  className="bg-zinc-800/50 border-2 border-zinc-600 focus:border-violet-500 rounded-xl text-white placeholder:text-zinc-500 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usps" className="text-sm font-semibold text-zinc-300">Deine USPs (Unique Selling Points)</Label>
                <Textarea
                  id="usps"
                  placeholder="Was macht dich einzigartig? Warum sollten Leute dir folgen?"
                  value={profile.usps}
                  onChange={(e) => setProfile({ ...profile, usps: e.target.value })}
                  rows={3}
                  className="bg-zinc-800/50 border-2 border-zinc-600 focus:border-violet-500 rounded-xl text-white placeholder:text-zinc-500 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits" className="text-sm font-semibold text-zinc-300">Benefits für deine Follower</Label>
                <Textarea
                  id="benefits"
                  placeholder="Was bekommen deine Follower von dir? Welchen Mehrwert bietest du?"
                  value={profile.benefits}
                  onChange={(e) => setProfile({ ...profile, benefits: e.target.value })}
                  rows={3}
                  className="bg-zinc-800/50 border-2 border-zinc-600 focus:border-violet-500 rounded-xl text-white placeholder:text-zinc-500 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentStyle" className="text-sm font-semibold text-zinc-300">Content-Stil</Label>
                <Select 
                  value={profile.contentStyle} 
                  onValueChange={(value) => setProfile({ ...profile, contentStyle: value })}
                >
                  <SelectTrigger className="h-12 bg-zinc-800/50 border-2 border-zinc-600 focus:border-violet-500 rounded-xl">
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
          <Card className="border-2 border-zinc-700 bg-zinc-900/50 shadow-xl">
            <CardHeader className="border-b border-zinc-700/50 pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span>Plan-Einstellungen</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-zinc-300">Zeitraum wählen</Label>
                <div className="grid grid-cols-3 gap-4">
                  {[10, 20, 30].map((days) => (
                    <button
                      key={days}
                      onClick={() => setPlanDays(days as 10 | 20 | 30)}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                        planDays === days
                          ? "border-violet-500 bg-violet-500/20 shadow-lg shadow-violet-500/20"
                          : "border-zinc-600 bg-zinc-800/50 hover:border-violet-500/50 hover:bg-zinc-800"
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
                    <Card key={index} className="border-2 border-border bg-card shadow-sm">
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
                <div className="flex gap-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={saveContentPlanToDb}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-emerald-500 to-green-600"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Speichern...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Plan speichern
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportToPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Als PDF exportieren
                  </Button>
                </div>
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

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  FileText,
  Trash2,
  Star,
  StarOff,
  ChevronDown,
  ChevronUp,
  Clock,
  Hash,
  Sparkles,
  Download,
  Target,
  Users,
  MessageSquare,
  Scissors,
  Music,
  Lightbulb,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SavedContentPlansTabProps {
  userId?: number;
  isPro: boolean;
}

interface PlanItem {
  day: number;
  topic: string;
  hook: string;
  framework: string;
  scriptStructure: string[];
  cutRecommendation: string;
  hashtags: string[];
  bestTime: string;
  trendingAudio: string;
  copywritingTip: string;
}

export function SavedContentPlansTab({ userId, isPro }: SavedContentPlansTabProps) {
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  
  // Fetch saved content plans
  const { data: savedPlans, isLoading, refetch } = trpc.dashboard.getAll.useQuery(
    { userId: userId || 0 },
    { enabled: !!userId }
  );

  // Delete mutation
  const deleteMutation = trpc.dashboard.delete.useMutation({
    onSuccess: () => {
      toast.success("Content-Plan gelöscht");
      setSelectedPlan(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Löschen");
    },
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = trpc.dashboard.togglePlanFavorite.useMutation({
    onSuccess: (data) => {
      toast.success(data.isFavorite ? "Als Favorit markiert" : "Favorit entfernt");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Aktualisieren");
    },
  });

  const handleDelete = (planId: number) => {
    if (!userId) return;
    deleteMutation.mutate({ planId, userId });
  };

  const handleToggleFavorite = (planId: number) => {
    if (!userId) return;
    toggleFavoriteMutation.mutate({ planId, userId });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // PDF Export function
  const handleExportPDF = async (plan: any) => {
    toast.loading("PDF wird erstellt...", { id: "pdf-export" });
    
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Popup blockiert. Bitte erlaube Popups für diese Seite.", { id: "pdf-export" });
        return;
      }

      const htmlContent = generatePDFContent(plan);
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          toast.success("PDF-Export bereit!", { id: "pdf-export" });
        }, 500);
      };
    } catch (error) {
      toast.error("Fehler beim PDF-Export", { id: "pdf-export" });
    }
  };

  const generatePDFContent = (plan: any) => {
    const planItems = plan.planItems || [];
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${plan.name} - Content-Plan</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
            color: #1a1a1a;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #8b5cf6;
          }
          .header h1 {
            font-size: 28px;
            color: #8b5cf6;
            margin-bottom: 10px;
          }
          .header .meta {
            color: #666;
            font-size: 14px;
          }
          .profile-section {
            background: #f8f7ff;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
          }
          .profile-section h2 {
            font-size: 16px;
            color: #8b5cf6;
            margin-bottom: 15px;
          }
          .profile-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .profile-item {
            font-size: 14px;
          }
          .profile-item span {
            color: #666;
          }
          .day-card {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            margin-bottom: 20px;
            page-break-inside: avoid;
            overflow: hidden;
          }
          .day-header {
            background: linear-gradient(135deg, #8b5cf6, #a855f7);
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .day-number {
            font-size: 18px;
            font-weight: bold;
          }
          .framework-badge {
            background: rgba(255,255,255,0.2);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
          }
          .day-content {
            padding: 20px;
          }
          .topic {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .hook {
            background: #fef3c7;
            padding: 12px 15px;
            border-radius: 8px;
            font-style: italic;
            margin-bottom: 15px;
            border-left: 4px solid #f59e0b;
          }
          .section {
            margin-bottom: 15px;
          }
          .section-title {
            font-size: 12px;
            font-weight: 600;
            color: #8b5cf6;
            text-transform: uppercase;
            margin-bottom: 8px;
          }
          .section-content {
            font-size: 14px;
            color: #374151;
          }
          .script-item {
            background: #f3f4f6;
            padding: 10px 15px;
            border-radius: 8px;
            margin-bottom: 8px;
          }
          .hashtags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .hashtag {
            background: #e0e7ff;
            color: #4f46e5;
            padding: 4px 10px;
            border-radius: 15px;
            font-size: 12px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
          }
          .meta-item {
            font-size: 13px;
          }
          .meta-label {
            color: #666;
            font-size: 11px;
            text-transform: uppercase;
          }
          .tip-box {
            background: #ecfdf5;
            border: 1px solid #10b981;
            padding: 12px 15px;
            border-radius: 8px;
            margin-top: 15px;
          }
          .tip-box .label {
            font-size: 11px;
            color: #10b981;
            font-weight: 600;
            margin-bottom: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #9ca3af;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
            .day-card { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📅 ${plan.name}</h1>
          <div class="meta">
            ${plan.duration} Tage Content-Plan • Erstellt am ${formatDate(plan.createdAt)} • Framework: ${plan.framework}
          </div>
        </div>

        ${plan.profile ? `
        <div class="profile-section">
          <h2>👥 Zielgruppen-Profil</h2>
          <div class="profile-grid">
            <div class="profile-item"><span>Nische:</span> ${plan.profile.niche || '-'}</div>
            <div class="profile-item"><span>Tonalität:</span> ${plan.profile.tonality || '-'}</div>
          </div>
        </div>
        ` : ''}

        ${planItems.map((item: PlanItem) => `
          <div class="day-card">
            <div class="day-header">
              <span class="day-number">Tag ${item.day}</span>
              <span class="framework-badge">${item.framework}</span>
            </div>
            <div class="day-content">
              <div class="topic">${item.topic}</div>
              <div class="hook">"${item.hook}"</div>
              
              ${item.scriptStructure?.length ? `
              <div class="section">
                <div class="section-title">📝 Script-Struktur</div>
                ${item.scriptStructure.map((line: string) => `
                  <div class="script-item">${line}</div>
                `).join('')}
              </div>
              ` : ''}

              ${item.cutRecommendation ? `
              <div class="section">
                <div class="section-title">✂️ Schnitt-Empfehlung</div>
                <div class="section-content">${item.cutRecommendation}</div>
              </div>
              ` : ''}

              ${item.hashtags?.length ? `
              <div class="section">
                <div class="section-title"># Hashtags</div>
                <div class="hashtags">
                  ${item.hashtags.map((tag: string) => `<span class="hashtag">${tag}</span>`).join('')}
                </div>
              </div>
              ` : ''}

              <div class="meta-grid">
                ${item.bestTime ? `
                <div class="meta-item">
                  <div class="meta-label">⏰ Beste Posting-Zeit</div>
                  ${item.bestTime}
                </div>
                ` : ''}
                ${item.trendingAudio ? `
                <div class="meta-item">
                  <div class="meta-label">🎵 Trending Audio</div>
                  ${item.trendingAudio}
                </div>
                ` : ''}
              </div>

              ${item.copywritingTip ? `
              <div class="tip-box">
                <div class="label">💡 Copywriting-Tipp</div>
                ${item.copywritingTip}
              </div>
              ` : ''}
            </div>
          </div>
        `).join('')}

        <div class="footer">
          Generiert mit ReelSpy.ai • ${new Date().toLocaleDateString('de-DE')}
        </div>
      </body>
      </html>
    `;
  };

  if (!userId) {
    return (
      <Card className="border-2 border-zinc-700 bg-zinc-900/50">
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">Bitte melde dich an, um deine Content-Pläne zu sehen.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-2 border-zinc-700 bg-zinc-900/50">
        <CardContent className="py-12 text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Lade Content-Pläne...</p>
        </CardContent>
      </Card>
    );
  }

  if (!savedPlans || savedPlans.length === 0) {
    return (
      <Card className="border-2 border-zinc-700 bg-zinc-900/50">
        <CardHeader className="border-b border-zinc-700/50">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span>Gespeicherte Content-Pläne</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Noch keine Content-Pläne gespeichert</p>
          <p className="text-sm text-muted-foreground">
            Erstelle deinen ersten Content-Plan im "Content-Plan Generator" Tab.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Detail View - direkt auf der Seite
  if (selectedPlan) {
    return (
      <div className="space-y-6">
        {/* Header mit Zurück-Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setSelectedPlan(null)}
            className="border-zinc-600 hover:border-zinc-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Übersicht
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleFavorite(selectedPlan.id)}
              className="border-zinc-600 hover:border-yellow-500/50"
            >
              {selectedPlan.isFavorite === 1 ? (
                <>
                  <StarOff className="w-4 h-4 mr-1" />
                  Favorit entfernen
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-1" />
                  Als Favorit
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportPDF(selectedPlan)}
              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
            >
              <Download className="w-4 h-4 mr-1" />
              PDF Export
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Löschen
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Content-Plan löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Möchtest du "{selectedPlan.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(selectedPlan.id)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Plan Header Card */}
        <Card className="border-2 border-zinc-700 bg-zinc-900/50">
          <CardHeader className="border-b border-zinc-700/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="flex items-center gap-2">
                    {selectedPlan.name}
                    {selectedPlan.isFavorite === 1 && (
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    )}
                  </span>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground font-normal mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {selectedPlan.duration} Tage
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(selectedPlan.createdAt)}
                    </span>
                  </div>
                </div>
              </CardTitle>
              <Badge variant="outline" className="border-violet-500/50 text-violet-400 text-sm px-3 py-1">
                {selectedPlan.framework}
              </Badge>
            </div>
          </CardHeader>
          
          {/* Profile Info */}
          {selectedPlan.profile && (
            <CardContent className="pt-4">
              <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                <h3 className="text-sm font-semibold text-violet-400 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Zielgruppen-Profil
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">Nische</span>
                    <span className="text-white">{selectedPlan.profile.niche || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Tonalität</span>
                    <span className="text-white">{selectedPlan.profile.tonality || "-"}</span>
                  </div>
                  {selectedPlan.profile.painPoints?.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground block text-xs">Pain Points</span>
                      <span className="text-white">{selectedPlan.profile.painPoints.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* All Plan Items - direkt auf der Seite */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            Content-Plan ({selectedPlan.planItems?.length || 0} Tage)
          </h2>
          
          {selectedPlan.planItems?.map((item: PlanItem, index: number) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-2 border-zinc-700 rounded-xl overflow-hidden bg-zinc-900/50"
            >
              {/* Day Header */}
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-4 flex items-center justify-between">
                <span className="font-bold text-white text-lg">Tag {item.day}</span>
                <Badge className="bg-white/20 text-white border-0 text-sm">
                  {item.framework}
                </Badge>
              </div>
              
              <div className="p-5 space-y-5">
                {/* Topic & Hook */}
                <div>
                  <h4 className="text-xl font-semibold text-white mb-3">{item.topic}</h4>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-amber-200 italic text-lg">"{item.hook}"</p>
                  </div>
                </div>

                {/* Script Structure */}
                {item.scriptStructure?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-violet-400 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Script-Struktur
                    </h5>
                    <div className="space-y-2">
                      {item.scriptStructure.map((line: string, i: number) => (
                        <div key={i} className="bg-zinc-800/70 rounded-lg p-4 text-zinc-300 border border-zinc-700/50">
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cut Recommendation */}
                {item.cutRecommendation && (
                  <div>
                    <h5 className="text-sm font-semibold text-violet-400 mb-3 flex items-center gap-2">
                      <Scissors className="w-4 h-4" />
                      Schnitt-Empfehlung
                    </h5>
                    <p className="text-zinc-300 bg-zinc-800/70 rounded-lg p-4 border border-zinc-700/50">
                      {item.cutRecommendation}
                    </p>
                  </div>
                )}

                {/* Hashtags */}
                {item.hashtags?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-violet-400 mb-3 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Hashtags
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {item.hashtags.map((tag: string, i: number) => (
                        <Badge key={i} variant="outline" className="border-blue-500/50 text-blue-400 px-3 py-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-700">
                  {item.bestTime && (
                    <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3" />
                        Beste Posting-Zeit
                      </span>
                      <span className="text-white font-medium">{item.bestTime}</span>
                    </div>
                  )}
                  {item.trendingAudio && (
                    <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <Music className="w-3 h-3" />
                        Trending Audio
                      </span>
                      <span className="text-white font-medium">{item.trendingAudio}</span>
                    </div>
                  )}
                </div>

                {/* Copywriting Tip */}
                {item.copywritingTip && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                    <h5 className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Copywriting-Tipp
                    </h5>
                    <p className="text-emerald-200">{item.copywritingTip}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Übersicht aller Pläne
  return (
    <Card className="border-2 border-zinc-700 bg-zinc-900/50">
      <CardHeader className="border-b border-zinc-700/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span>Gespeicherte Content-Pläne</span>
          </CardTitle>
          <Badge variant="outline" className="border-violet-500/50 text-violet-400">
            {savedPlans.length} Pläne
          </Badge>
        </div>
        <CardDescription className="mt-2">
          Alle deine generierten Content-Pläne an einem Ort
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <AnimatePresence>
            {savedPlans.map((plan: any) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border-2 border-zinc-700 rounded-xl bg-zinc-800/50 overflow-hidden hover:border-violet-500/50 transition-colors cursor-pointer"
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white truncate">{plan.name}</h3>
                        {plan.isFavorite === 1 && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {plan.duration} Tage
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(plan.createdAt)}
                        </span>
                        {plan.profile?.niche && (
                          <span className="flex items-center gap-1">
                            <Target className="w-3.5 h-3.5" />
                            {plan.profile.niche}
                          </span>
                        )}
                        {plan.planItems?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            {plan.planItems.length} Tage Content
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge 
                        variant="outline" 
                        className={`${
                          plan.framework === "HAPSS" 
                            ? "border-emerald-500/50 text-emerald-400" 
                            : plan.framework === "AIDA"
                            ? "border-blue-500/50 text-blue-400"
                            : "border-violet-500/50 text-violet-400"
                        }`}
                      >
                        {plan.framework}
                      </Badge>
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

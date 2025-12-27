import { useState, useRef } from "react";
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
  Eye,
  X,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  const [detailViewPlan, setDetailViewPlan] = useState<any | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  
  // Fetch saved content plans
  const { data: savedPlans, isLoading, refetch } = trpc.dashboard.getAll.useQuery(
    { userId: userId || 0 },
    { enabled: !!userId }
  );

  // Delete mutation
  const deleteMutation = trpc.dashboard.delete.useMutation({
    onSuccess: () => {
      toast.success("Content-Plan gelöscht");
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
      // Create printable content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Popup blockiert. Bitte erlaube Popups für diese Seite.", { id: "pdf-export" });
        return;
      }

      const htmlContent = generatePDFContent(plan);
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then print
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
            display: flex;
            align-items: center;
            gap: 6px;
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
            ${plan.profile.painPoints?.length ? `<div class="profile-item"><span>Pain Points:</span> ${plan.profile.painPoints.join(', ')}</div>` : ''}
            ${plan.profile.usps?.length ? `<div class="profile-item"><span>USPs:</span> ${plan.profile.usps.join(', ')}</div>` : ''}
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

  return (
    <>
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
                  className="border-2 border-zinc-700 rounded-xl bg-zinc-800/50 overflow-hidden hover:border-zinc-600 transition-colors"
                >
                  {/* Plan Header */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                  >
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
                        {expandedPlanId === plan.id ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedPlanId === plan.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-zinc-700"
                      >
                        <div className="p-4 space-y-4">
                          {/* Profile Info */}
                          {plan.profile && (
                            <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-700/50">
                              <h4 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                                <Users className="w-4 h-4 text-violet-400" />
                                Zielgruppen-Profil
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Nische:</span>{" "}
                                  <span className="text-white">{plan.profile.niche || "-"}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Tonalität:</span>{" "}
                                  <span className="text-white">{plan.profile.tonality || "-"}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Plan Items Preview */}
                          {plan.planItems && plan.planItems.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-violet-400" />
                                Content-Übersicht ({plan.planItems.length} Tage)
                              </h4>
                              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                                {plan.planItems.slice(0, 3).map((item: PlanItem, index: number) => (
                                  <div 
                                    key={index}
                                    className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-700/50"
                                  >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <span className="text-xs font-semibold text-violet-400">Tag {item.day}</span>
                                      <Badge variant="outline" className="text-xs border-zinc-600">
                                        {item.framework}
                                      </Badge>
                                    </div>
                                    <p className="text-sm font-medium text-white mb-1">{item.topic}</p>
                                    <p className="text-xs text-muted-foreground italic">"{item.hook}"</p>
                                  </div>
                                ))}
                                {plan.planItems.length > 3 && (
                                  <p className="text-xs text-muted-foreground text-center py-2">
                                    + {plan.planItems.length - 3} weitere Tage
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-700/50">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDetailViewPlan(plan);
                                }}
                                className="bg-violet-600 hover:bg-violet-700"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Vollständig anzeigen
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExportPDF(plan);
                                }}
                                className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                PDF Export
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFavorite(plan.id);
                                }}
                                className="border-zinc-600 hover:border-yellow-500/50"
                              >
                                {plan.isFavorite === 1 ? (
                                  <>
                                    <StarOff className="w-4 h-4 mr-1" />
                                    Entfernen
                                  </>
                                ) : (
                                  <>
                                    <Star className="w-4 h-4 mr-1" />
                                    Favorit
                                  </>
                                )}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Löschen
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Content-Plan löschen?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Möchtest du "{plan.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(plan.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Löschen
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Full Detail View Dialog */}
      <Dialog open={!!detailViewPlan} onOpenChange={() => setDetailViewPlan(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-zinc-900 border-zinc-700">
          <DialogHeader className="border-b border-zinc-700 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                {detailViewPlan?.name}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => detailViewPlan && handleExportPDF(detailViewPlan)}
                  className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Download className="w-4 h-4 mr-1" />
                  PDF Export
                </Button>
              </div>
            </div>
            {detailViewPlan && (
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {detailViewPlan.duration} Tage
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(detailViewPlan.createdAt)}
                </span>
                <Badge variant="outline" className="border-violet-500/50 text-violet-400">
                  {detailViewPlan.framework}
                </Badge>
              </div>
            )}
          </DialogHeader>
          
          <ScrollArea className="h-[calc(90vh-180px)] pr-4">
            {detailViewPlan && (
              <div className="space-y-4 py-4">
                {/* Profile Section */}
                {detailViewPlan.profile && (
                  <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                    <h3 className="text-sm font-semibold text-violet-400 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Zielgruppen-Profil
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block text-xs">Nische</span>
                        <span className="text-white">{detailViewPlan.profile.niche || "-"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Tonalität</span>
                        <span className="text-white">{detailViewPlan.profile.tonality || "-"}</span>
                      </div>
                      {detailViewPlan.profile.painPoints?.length > 0 && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground block text-xs">Pain Points</span>
                          <span className="text-white">{detailViewPlan.profile.painPoints.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* All Plan Items */}
                {detailViewPlan.planItems?.map((item: PlanItem, index: number) => (
                  <div 
                    key={index}
                    className="border-2 border-zinc-700 rounded-xl overflow-hidden bg-zinc-800/30"
                  >
                    {/* Day Header */}
                    <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 flex items-center justify-between">
                      <span className="font-bold text-white">Tag {item.day}</span>
                      <Badge className="bg-white/20 text-white border-0">
                        {item.framework}
                      </Badge>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      {/* Topic */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">{item.topic}</h4>
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                          <p className="text-amber-200 italic">"{item.hook}"</p>
                        </div>
                      </div>

                      {/* Script Structure */}
                      {item.scriptStructure?.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-violet-400 mb-2 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Script-Struktur
                          </h5>
                          <div className="space-y-2">
                            {item.scriptStructure.map((line: string, i: number) => (
                              <div key={i} className="bg-zinc-900/50 rounded-lg p-3 text-sm text-zinc-300">
                                {line}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cut Recommendation */}
                      {item.cutRecommendation && (
                        <div>
                          <h5 className="text-sm font-semibold text-violet-400 mb-2 flex items-center gap-2">
                            <Scissors className="w-4 h-4" />
                            Schnitt-Empfehlung
                          </h5>
                          <p className="text-sm text-zinc-300 bg-zinc-900/50 rounded-lg p-3">
                            {item.cutRecommendation}
                          </p>
                        </div>
                      )}

                      {/* Hashtags */}
                      {item.hashtags?.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-violet-400 mb-2 flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            Hashtags
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {item.hashtags.map((tag: string, i: number) => (
                              <Badge key={i} variant="outline" className="border-blue-500/50 text-blue-400">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Meta Info */}
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-700">
                        {item.bestTime && (
                          <div>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                              <Clock className="w-3 h-3" />
                              Beste Posting-Zeit
                            </span>
                            <span className="text-sm text-white">{item.bestTime}</span>
                          </div>
                        )}
                        {item.trendingAudio && (
                          <div>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                              <Music className="w-3 h-3" />
                              Trending Audio
                            </span>
                            <span className="text-sm text-white">{item.trendingAudio}</span>
                          </div>
                        )}
                      </div>

                      {/* Copywriting Tip */}
                      {item.copywritingTip && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                          <h5 className="text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3" />
                            Copywriting-Tipp
                          </h5>
                          <p className="text-sm text-emerald-200">{item.copywritingTip}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

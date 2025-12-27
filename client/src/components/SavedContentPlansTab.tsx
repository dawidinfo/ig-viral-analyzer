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
  Eye,
  ChevronDown,
  ChevronUp,
  Clock,
  Hash,
  Sparkles,
  Download,
  Target,
  Users,
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

export function SavedContentPlansTab({ userId, isPro }: SavedContentPlansTabProps) {
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  
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
                              {plan.planItems.slice(0, 5).map((item: any, index: number) => (
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
                              {plan.planItems.length > 5 && (
                                <p className="text-xs text-muted-foreground text-center py-2">
                                  + {plan.planItems.length - 5} weitere Tage
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-700/50">
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

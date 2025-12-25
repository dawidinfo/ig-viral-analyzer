import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Lightbulb, 
  TrendingUp, 
  Calendar, 
  Target,
  Sparkles,
  ArrowRight,
  Crown,
  Zap,
  Play,
  Clock,
  Users,
  BarChart3,
  Star,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Recommendation {
  id: string;
  type: "content-plan" | "analysis" | "upgrade" | "tip" | "compare";
  title: string;
  description: string;
  action: string;
  actionUrl?: string;
  icon: React.ReactNode;
  gradient: string;
  bgGradient: string;
  badge?: string;
  isPro?: boolean;
}

interface DashboardRecommendationsProps {
  isPro: boolean;
  hasAnalyses: boolean;
  analysisCount: number;
  onNavigate?: (path: string) => void;
}

export function DashboardRecommendations({ 
  isPro, 
  hasAnalyses, 
  analysisCount,
  onNavigate 
}: DashboardRecommendationsProps) {
  const [, setLocation] = useLocation();
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Stripe Checkout Mutation - direkt zum Pro Plan
  const checkoutMutation = trpc.credits.createCheckout.useMutation({
    onSuccess: (data: { url?: string }) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      setIsUpgrading(false);
      toast.error("Fehler beim Starten des Checkouts. Bitte versuche es erneut.");
    }
  });

  const handleUpgrade = () => {
    setIsUpgrading(true);
    // Direkt Pro Plan monatlich starten - einfachster Weg
    checkoutMutation.mutate({ packageId: 'pro', isYearly: false });
  };

  const handleAction = (rec: Recommendation) => {
    if (rec.id === "upgrade") {
      // Direkt zum Stripe Checkout - kein Umweg!
      handleUpgrade();
      return;
    }
    
    if (rec.id === "content-plan") {
      // Direkt zum Content-Plan Tab navigieren
      if (onNavigate) {
        onNavigate("content-plan");
      } else {
        setLocation("/dashboard?tab=content-plan");
      }
    } else if (rec.actionUrl) {
      if (rec.actionUrl.startsWith("/dashboard")) {
        const tab = rec.actionUrl.split("tab=")[1];
        if (onNavigate && tab) {
          onNavigate(tab);
        } else {
          setLocation(rec.actionUrl);
        }
      } else {
        setLocation(rec.actionUrl);
      }
    }
  };

  const recommendations: Recommendation[] = [
    {
      id: "content-plan",
      type: "content-plan",
      title: "Content-Plan erstellen",
      description: "Dein persönlicher 30-Tage Reel-Plan in 2 Minuten erstellt.",
      action: "Plan erstellen",
      actionUrl: "/dashboard?tab=content-plan",
      icon: <Calendar className="w-6 h-6" />,
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-500/20 via-purple-500/10 to-transparent",
      badge: "NEU",
      isPro: true
    },
    {
      id: "analyze",
      type: "analysis",
      title: "Account analysieren",
      description: "Finde heraus, was bei Top-Creatorn funktioniert.",
      action: "Jetzt analysieren",
      actionUrl: "/",
      icon: <BarChart3 className="w-6 h-6" />,
      gradient: "from-cyan-500 to-blue-600",
      bgGradient: "from-cyan-500/20 via-blue-500/10 to-transparent"
    },
    {
      id: "compare",
      type: "compare",
      title: "Accounts vergleichen",
      description: "Vergleiche dich mit anderen und lerne von den Besten.",
      action: "Vergleichen",
      actionUrl: "/compare",
      icon: <Users className="w-6 h-6" />,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-500/20 via-teal-500/10 to-transparent"
    },
    ...(!isPro ? [{
      id: "upgrade",
      type: "upgrade" as const,
      title: "Upgrade auf Pro",
      description: "Unbegrenzte Analysen + KI Content-Plan für nur €49/Monat",
      action: "Jetzt freischalten",
      icon: <Crown className="w-6 h-6" />,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      badge: "BELIEBT"
    }] : [{
      id: "tip-hooks",
      type: "tip" as const,
      title: "Hook-Tipp des Tages",
      description: "Starte mit einer Frage, die deine Zielgruppe triggert.",
      action: "Mehr Tipps",
      actionUrl: "/guides",
      icon: <Lightbulb className="w-6 h-6" />,
      gradient: "from-pink-500 to-rose-600",
      bgGradient: "from-pink-500/20 via-rose-500/10 to-transparent"
    }])
  ];

  // Filtere basierend auf Status
  const visibleRecommendations = recommendations.slice(0, 4);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
            <Sparkles className="w-5 h-5 text-violet-500" />
          </div>
          Empfehlungen für dich
        </h2>
        {hasAnalyses && (
          <Badge variant="outline" className="text-muted-foreground border-border/50 bg-muted/30">
            <Star className="w-3 h-3 mr-1 text-amber-500" />
            {analysisCount} Analysen
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleRecommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="h-full"
          >
            <Card 
              className={`h-full border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group overflow-visible relative cursor-pointer ${rec.id === 'upgrade' ? 'ring-2 ring-amber-500/50 hover:ring-amber-500' : ''}`}
              onClick={() => handleAction(rec)}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${rec.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg`} />
              
              <CardContent className="p-5 flex flex-col h-full relative z-10">
                {rec.badge && (
                  <Badge className={`absolute -top-2 -right-2 bg-gradient-to-r ${rec.gradient} text-white border-0 text-xs shadow-lg`}>
                    {rec.badge}
                  </Badge>
                )}
                
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${rec.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  {rec.id === 'upgrade' && isUpgrading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    rec.icon
                  )}
                </div>
                
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  {rec.title}
                  {rec.isPro && !isPro && (
                    <Crown className="w-4 h-4 text-amber-500" />
                  )}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4 flex-grow leading-relaxed">
                  {rec.description}
                </p>
                
                <Button 
                  variant={rec.id === 'upgrade' ? 'default' : 'ghost'}
                  size="sm" 
                  className={`w-full justify-between transition-all duration-300 ${
                    rec.id === 'upgrade' 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg' 
                      : 'group-hover:bg-primary/10'
                  }`}
                  disabled={rec.id === 'upgrade' && isUpgrading}
                >
                  {rec.id === 'upgrade' && isUpgrading ? (
                    <>
                      <span>Wird geladen...</span>
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      {rec.action}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats - Simplified */}
      {hasAnalyses && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Play className="w-4 h-4 text-violet-500" />
              Analysen
            </div>
            <div className="text-2xl font-bold">{analysisCount}</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              Avg. Score
            </div>
            <div className="text-2xl font-bold">78<span className="text-sm text-muted-foreground">/100</span></div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="w-4 h-4 text-emerald-500" />
              Beste Zeit
            </div>
            <div className="text-2xl font-bold">18:00</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Zap className="w-4 h-4 text-amber-500" />
              Credits
            </div>
            <div className="text-2xl font-bold">{isPro ? "∞" : "3"}</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default DashboardRecommendations;

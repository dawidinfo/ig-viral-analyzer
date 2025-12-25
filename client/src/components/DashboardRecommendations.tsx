import React from "react";
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
  BarChart3
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface Recommendation {
  id: string;
  type: "content-plan" | "analysis" | "upgrade" | "tip";
  title: string;
  description: string;
  action: string;
  actionUrl?: string;
  icon: React.ReactNode;
  gradient: string;
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
  const recommendations: Recommendation[] = [
    {
      id: "content-plan",
      type: "content-plan",
      title: "Content-Plan erstellen",
      description: "Generiere einen personalisierten 10/20/30-Tage Reel-Plan basierend auf deiner Zielgruppe und Top-Performern.",
      action: "Plan erstellen",
      actionUrl: "/dashboard?tab=content-plan",
      icon: <Calendar className="w-6 h-6" />,
      gradient: "from-violet-500 to-purple-600",
      badge: "NEU",
      isPro: true
    },
    {
      id: "analyze",
      type: "analysis",
      title: "Account analysieren",
      description: "Analysiere einen Instagram-Account und entdecke die Geheimnisse viraler Reels.",
      action: "Jetzt analysieren",
      actionUrl: "/",
      icon: <BarChart3 className="w-6 h-6" />,
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      id: "compare",
      type: "analysis",
      title: "Accounts vergleichen",
      description: "Vergleiche zwei Accounts und finde heraus, was die Top-Performer anders machen.",
      action: "Vergleichen",
      actionUrl: "/compare",
      icon: <Users className="w-6 h-6" />,
      gradient: "from-emerald-500 to-teal-600"
    },
    ...(!isPro ? [{
      id: "upgrade",
      type: "upgrade" as const,
      title: "Upgrade auf Pro",
      description: "Schalte KI-Tiefenanalyse, Content-Plan Generator und unbegrenzte Analysen frei.",
      action: "Jetzt upgraden",
      actionUrl: "/pricing",
      icon: <Crown className="w-6 h-6" />,
      gradient: "from-amber-500 to-orange-600",
      badge: "-20% Jährlich"
    }] : []),
    {
      id: "tip-hooks",
      type: "tip",
      title: "Hook-Tipp des Tages",
      description: "Starte mit einer kontroversen Aussage oder Frage, die deine Zielgruppe triggert.",
      action: "Mehr Tipps",
      icon: <Lightbulb className="w-6 h-6" />,
      gradient: "from-pink-500 to-rose-600"
    }
  ];

  // Filtere basierend auf Status
  const visibleRecommendations = recommendations.slice(0, 4);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-500" />
          Empfehlungen für dich
        </h2>
        {hasAnalyses && (
          <Badge variant="outline" className="text-muted-foreground">
            {analysisCount} Analysen durchgeführt
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
          >
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-violet-500/50 transition-all duration-300 group overflow-visible">
              <CardContent className="p-5 flex flex-col h-full relative">
                {rec.badge && (
                  <Badge className={`absolute -top-2 -right-2 bg-gradient-to-r ${rec.gradient} text-white border-0 text-xs`}>
                    {rec.badge}
                  </Badge>
                )}
                
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${rec.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {rec.icon}
                </div>
                
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  {rec.title}
                  {rec.isPro && !isPro && (
                    <Crown className="w-4 h-4 text-amber-500" />
                  )}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4 flex-grow">
                  {rec.description}
                </p>
                
                {rec.actionUrl ? (
                  <Link href={rec.actionUrl}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-between group-hover:bg-violet-500/10 group-hover:text-violet-500"
                    >
                      {rec.action}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-between"
                    disabled
                  >
                    {rec.action}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      {hasAnalyses && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Play className="w-4 h-4" />
              Analysen
            </div>
            <div className="text-2xl font-bold">{analysisCount}</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              Avg. Score
            </div>
            <div className="text-2xl font-bold">78<span className="text-sm text-muted-foreground">/100</span></div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              Beste Zeit
            </div>
            <div className="text-2xl font-bold">18:00</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Zap className="w-4 h-4" />
              Credits
            </div>
            <div className="text-2xl font-bold">{isPro ? "∞" : "3"}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardRecommendations;

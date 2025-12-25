import React from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Sparkles, 
  Lock, 
  Crown,
  ArrowRight,
  Check,
  Zap,
  FileText,
  Target,
  Lightbulb
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface ContentPlanCTAProps {
  isPro: boolean;
  username?: string;
  analysisHighlights?: {
    bestPostingTime?: string;
    topHashtags?: string[];
    avgEngagement?: number;
    viralScore?: number;
  };
}

export function ContentPlanCTA({ isPro, username, analysisHighlights }: ContentPlanCTAProps) {
  // Demo Plan Items (geblurred für Free User)
  const demoItems = [
    { day: 1, topic: "Pain Point Opener", hook: "90% machen diesen Fehler..." },
    { day: 2, topic: "Behind the Scenes", hook: "Das zeigt dir niemand..." },
    { day: 3, topic: "Transformation Story", hook: "Vor 6 Monaten war ich..." },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-purple-500/5 overflow-hidden">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  Content-Plan erstellen
                  <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 text-xs">
                    NEU
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Basierend auf der Analyse von @{username || "account"}
                </p>
              </div>
            </div>
            {!isPro && (
              <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                <Crown className="w-3 h-3 mr-1" />
                Pro
              </Badge>
            )}
          </div>

          {/* Highlights aus der Analyse */}
          {analysisHighlights && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {analysisHighlights.bestPostingTime && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Beste Zeit</p>
                  <p className="font-semibold">{analysisHighlights.bestPostingTime}</p>
                </div>
              )}
              {analysisHighlights.viralScore && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Viral Score</p>
                  <p className="font-semibold">{analysisHighlights.viralScore}/100</p>
                </div>
              )}
              {analysisHighlights.avgEngagement && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Engagement</p>
                  <p className="font-semibold">{analysisHighlights.avgEngagement}%</p>
                </div>
              )}
              {analysisHighlights.topHashtags && analysisHighlights.topHashtags.length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Top Hashtag</p>
                  <p className="font-semibold text-sm">{analysisHighlights.topHashtags[0]}</p>
                </div>
              )}
            </div>
          )}

          {/* Geblurrte Vorschau */}
          <div className="relative mb-6">
            <div className={`space-y-3 ${!isPro ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
              {demoItems.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {item.day}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.topic}</p>
                    <p className="text-sm text-muted-foreground">"{item.hook}"</p>
                  </div>
                  <Badge variant="outline" className="text-xs">HAPSS</Badge>
                </div>
              ))}
            </div>

            {/* Overlay für Free User */}
            {!isPro && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background/90 via-background/50 to-transparent rounded-xl">
                <div className="text-center p-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-semibold mb-2">Content-Plan freischalten</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Erhalte einen personalisierten 10/20/30-Tage Plan
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>HAPSS & AIDA Framework</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Hook-Vorschläge für jeden Tag</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Script-Struktur mit Zeitangaben</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Hopkins, Ogilvy, Schwartz Tipps</span>
            </div>
          </div>

          {/* CTA */}
          {isPro ? (
            <Link href="/dashboard?tab=content-plan">
              <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 py-6">
                <Sparkles className="w-5 h-5 mr-2" />
                Content-Plan erstellen
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link href="/pricing">
              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 py-6">
                <Crown className="w-5 h-5 mr-2" />
                Upgrade auf Pro
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ContentPlanCTA;

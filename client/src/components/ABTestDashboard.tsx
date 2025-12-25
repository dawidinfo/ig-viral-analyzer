import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  MousePointerClick, 
  Eye, 
  TrendingUp, 
  Trophy,
  RefreshCw,
  BarChart3,
  Target,
  Sparkles,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface ABTestResult {
  emailType: string;
  subjectA: string;
  subjectB: string;
  stats: {
    variant: string;
    sent: number;
    opens: number;
    openRate: number;
    clicks: number;
    clickRate: number;
    conversions: number;
    conversionRate: number;
  }[];
  winner: string | null;
  confidence: number;
}

const EMAIL_TYPE_LABELS: Record<string, { label: string; emoji: string; description: string }> = {
  drip_day1_welcome: { 
    label: "Tag 1: Erste Analyse", 
    emoji: "🎯",
    description: "Ermutigt User zur ersten Analyse"
  },
  drip_day3_tips: { 
    label: "Tag 3: Viral-Tipps", 
    emoji: "🔥",
    description: "3 Geheimnisse viraler Reels"
  },
  drip_day7_contentplan: { 
    label: "Tag 7: Content-Plan", 
    emoji: "📅",
    description: "KI-Content-Plan Feature vorstellen"
  },
  drip_day14_upgrade: { 
    label: "Tag 14: Upgrade-Angebot", 
    emoji: "🎁",
    description: "20% Rabatt auf Pro-Plan"
  },
};

function ProgressBar({ 
  value, 
  maxValue, 
  color, 
  label 
}: { 
  value: number; 
  maxValue: number; 
  color: string; 
  label: string;
}) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function VariantCard({ 
  variant, 
  subject, 
  stats, 
  isWinner,
  otherStats
}: { 
  variant: "A" | "B";
  subject: string;
  stats: ABTestResult["stats"][0];
  isWinner: boolean;
  otherStats: ABTestResult["stats"][0];
}) {
  const maxOpenRate = Math.max(stats.openRate, otherStats.openRate, 1);
  const maxClickRate = Math.max(stats.clickRate, otherStats.clickRate, 1);
  
  return (
    <div className={`relative p-4 rounded-xl border ${
      isWinner 
        ? "border-emerald-500/50 bg-emerald-500/5" 
        : "border-border bg-card/50"
    }`}>
      {isWinner && (
        <div className="absolute -top-3 left-4">
          <Badge className="bg-emerald-500 text-white gap-1">
            <Trophy className="w-3 h-3" />
            Gewinner
          </Badge>
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-3 mt-1">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
          variant === "A" 
            ? "bg-violet-500/20 text-violet-400" 
            : "bg-cyan-500/20 text-cyan-400"
        }`}>
          {variant}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" title={subject}>{subject}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <p className="text-lg font-bold">{stats.sent}</p>
          <p className="text-xs text-muted-foreground">Gesendet</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <p className="text-lg font-bold">{stats.opens}</p>
          <p className="text-xs text-muted-foreground">Geöffnet</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <p className="text-lg font-bold">{stats.clicks}</p>
          <p className="text-xs text-muted-foreground">Geklickt</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <ProgressBar 
          value={stats.openRate} 
          maxValue={maxOpenRate * 1.2}
          color={variant === "A" ? "bg-violet-500" : "bg-cyan-500"}
          label="Öffnungsrate"
        />
        <ProgressBar 
          value={stats.clickRate} 
          maxValue={maxClickRate * 1.2}
          color={variant === "A" ? "bg-violet-400" : "bg-cyan-400"}
          label="Klickrate"
        />
      </div>
      
      {stats.conversions > 0 && (
        <div className="mt-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400">Conversions</span>
            <span className="font-bold text-emerald-400">{stats.conversions} ({stats.conversionRate}%)</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ABTestCard({ test }: { test: ABTestResult }) {
  const typeInfo = EMAIL_TYPE_LABELS[test.emailType] || { 
    label: test.emailType, 
    emoji: "📧",
    description: ""
  };
  
  const statsA = test.stats.find(s => s.variant === "A") || {
    variant: "A", sent: 0, opens: 0, openRate: 0, clicks: 0, clickRate: 0, conversions: 0, conversionRate: 0
  };
  const statsB = test.stats.find(s => s.variant === "B") || {
    variant: "B", sent: 0, opens: 0, openRate: 0, clicks: 0, clickRate: 0, conversions: 0, conversionRate: 0
  };
  
  const totalSent = statsA.sent + statsB.sent;
  const hasEnoughData = totalSent >= 20;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center text-2xl">
              {typeInfo.emoji}
            </div>
            <div>
              <CardTitle className="text-lg">{typeInfo.label}</CardTitle>
              <CardDescription>{typeInfo.description}</CardDescription>
            </div>
          </div>
          {test.winner && test.confidence > 0 && (
            <Badge variant="outline" className="gap-1">
              <Target className="w-3 h-3" />
              {test.confidence}% Konfidenz
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {!hasEnoughData && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-200">
              Noch nicht genug Daten für statistische Signifikanz ({totalSent}/20 E-Mails)
            </p>
          </div>
        )}
        
        <div className="grid md:grid-cols-2 gap-4">
          <VariantCard 
            variant="A"
            subject={test.subjectA}
            stats={statsA}
            isWinner={test.winner === "A"}
            otherStats={statsB}
          />
          <VariantCard 
            variant="B"
            subject={test.subjectB}
            stats={statsB}
            isWinner={test.winner === "B"}
            otherStats={statsA}
          />
        </div>
        
        {/* Comparison Summary */}
        <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{totalSent}</p>
              <p className="text-xs text-muted-foreground">Gesamt gesendet</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{statsA.opens + statsB.opens}</p>
              <p className="text-xs text-muted-foreground">Gesamt geöffnet</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{statsA.clicks + statsB.clicks}</p>
              <p className="text-xs text-muted-foreground">Gesamt geklickt</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{statsA.conversions + statsB.conversions}</p>
              <p className="text-xs text-muted-foreground">Conversions</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ABTestDashboard() {
  const { data: results, isLoading, refetch, isRefetching } = trpc.email.getAbTestResults.useQuery();
  
  const totalTests = results?.length || 0;
  const testsWithWinner = results?.filter(t => t.winner)?.length || 0;
  const totalSent = results?.reduce((sum, t) => {
    const statsA = t.stats.find(s => s.variant === "A");
    const statsB = t.stats.find(s => s.variant === "B");
    return sum + (statsA?.sent || 0) + (statsB?.sent || 0);
  }, 0) || 0;
  const totalOpens = results?.reduce((sum, t) => {
    const statsA = t.stats.find(s => s.variant === "A");
    const statsB = t.stats.find(s => s.variant === "B");
    return sum + (statsA?.opens || 0) + (statsB?.opens || 0);
  }, 0) || 0;
  
  const avgOpenRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : "0";
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-violet-500" />
            A/B-Test Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Vergleiche E-Mail-Betreffzeilen und optimiere deine Öffnungsraten
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTests}</p>
                <p className="text-xs text-muted-foreground">Aktive Tests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{testsWithWinner}</p>
                <p className="text-xs text-muted-foreground">Mit Gewinner</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSent}</p>
                <p className="text-xs text-muted-foreground">E-Mails gesendet</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgOpenRate}%</p>
                <p className="text-xs text-muted-foreground">Ø Öffnungsrate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Test Cards */}
      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="h-48 bg-muted rounded-xl" />
                  <div className="h-48 bg-muted rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : results && results.length > 0 ? (
        <div className="grid gap-6">
          {results.map((test, index) => (
            <motion.div
              key={test.emailType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ABTestCard test={test} />
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Noch keine A/B-Tests</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              A/B-Tests werden automatisch gestartet, wenn Drip-E-Mails an neue User gesendet werden.
              Jeder User wird zufällig Variante A oder B zugewiesen.
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Info Box */}
      <Card className="bg-muted/30 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <TrendingUp className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="font-medium mb-1">Wie funktioniert der A/B-Test?</p>
              <p className="text-sm text-muted-foreground">
                Jeder neue User wird zufällig einer Variante (A oder B) zugewiesen. 
                Alle Drip-E-Mails verwenden dann die zugewiesene Betreffzeile. 
                Nach mindestens 100 gesendeten E-Mails wird ein statistisch signifikanter Gewinner ermittelt.
                Tracking-Pixel erfassen automatisch Öffnungen, Klicks werden über Redirect-Links getrackt.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

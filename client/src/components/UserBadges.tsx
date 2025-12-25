import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Star,
  Zap,
  Target,
  Flame,
  Crown,
  Rocket,
  Award,
  Medal,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  Lock
} from "lucide-react";

interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  requirement: string;
  progress: number; // 0-100
  unlocked: boolean;
  unlockedAt?: Date;
}

interface UserBadgesProps {
  analysisCount: number;
  savedAnalysisCount: number;
  contentPlansGenerated: number;
  daysActive: number;
  isPro: boolean;
}

export function UserBadges({ 
  analysisCount, 
  savedAnalysisCount, 
  contentPlansGenerated, 
  daysActive,
  isPro 
}: UserBadgesProps) {
  
  const badges: UserBadge[] = [
    {
      id: "first-analysis",
      name: "Erste Schritte",
      description: "Führe deine erste Analyse durch",
      icon: <Star className="w-5 h-5" />,
      color: "text-amber-500",
      bgColor: "bg-amber-500/20",
      requirement: "1 Analyse",
      progress: Math.min(analysisCount / 1 * 100, 100),
      unlocked: analysisCount >= 1
    },
    {
      id: "explorer",
      name: "Explorer",
      description: "Analysiere 5 verschiedene Accounts",
      icon: <Zap className="w-5 h-5" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
      requirement: "5 Analysen",
      progress: Math.min(analysisCount / 5 * 100, 100),
      unlocked: analysisCount >= 5
    },
    {
      id: "analyst",
      name: "Analyst",
      description: "Führe 10 Analysen durch",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/20",
      requirement: "10 Analysen",
      progress: Math.min(analysisCount / 10 * 100, 100),
      unlocked: analysisCount >= 10
    },
    {
      id: "power-user",
      name: "Power User",
      description: "Erreiche 25 Analysen",
      icon: <Flame className="w-5 h-5" />,
      color: "text-orange-500",
      bgColor: "bg-orange-500/20",
      requirement: "25 Analysen",
      progress: Math.min(analysisCount / 25 * 100, 100),
      unlocked: analysisCount >= 25
    },
    {
      id: "viral-expert",
      name: "Viral Expert",
      description: "Führe 50 Analysen durch",
      icon: <Rocket className="w-5 h-5" />,
      color: "text-violet-500",
      bgColor: "bg-violet-500/20",
      requirement: "50 Analysen",
      progress: Math.min(analysisCount / 50 * 100, 100),
      unlocked: analysisCount >= 50
    },
    {
      id: "collector",
      name: "Sammler",
      description: "Speichere 5 Analysen",
      icon: <Award className="w-5 h-5" />,
      color: "text-pink-500",
      bgColor: "bg-pink-500/20",
      requirement: "5 gespeicherte Analysen",
      progress: Math.min(savedAnalysisCount / 5 * 100, 100),
      unlocked: savedAnalysisCount >= 5
    },
    {
      id: "planner",
      name: "Content Planner",
      description: "Erstelle deinen ersten Content-Plan",
      icon: <Calendar className="w-5 h-5" />,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/20",
      requirement: "1 Content-Plan",
      progress: Math.min(contentPlansGenerated / 1 * 100, 100),
      unlocked: contentPlansGenerated >= 1
    },
    {
      id: "strategist",
      name: "Stratege",
      description: "Erstelle 5 Content-Pläne",
      icon: <Target className="w-5 h-5" />,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/20",
      requirement: "5 Content-Pläne",
      progress: Math.min(contentPlansGenerated / 5 * 100, 100),
      unlocked: contentPlansGenerated >= 5
    },
    {
      id: "loyal",
      name: "Treuer Nutzer",
      description: "Nutze ReelSpy 7 Tage",
      icon: <Medal className="w-5 h-5" />,
      color: "text-rose-500",
      bgColor: "bg-rose-500/20",
      requirement: "7 Tage aktiv",
      progress: Math.min(daysActive / 7 * 100, 100),
      unlocked: daysActive >= 7
    },
    {
      id: "pro-member",
      name: "Pro Member",
      description: "Upgrade auf einen bezahlten Plan",
      icon: <Crown className="w-5 h-5" />,
      color: "text-amber-400",
      bgColor: "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
      requirement: "Pro Plan",
      progress: isPro ? 100 : 0,
      unlocked: isPro
    }
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalBadges = badges.length;

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Deine Achievements
            </CardTitle>
            <CardDescription>
              {unlockedCount} von {totalBadges} Badges freigeschaltet
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-amber-500 border-amber-500/30">
            <Sparkles className="w-3 h-3 mr-1" />
            {unlockedCount}/{totalBadges}
          </Badge>
        </div>
        <Progress value={(unlockedCount / totalBadges) * 100} className="h-2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`relative p-3 rounded-xl border text-center transition-all ${
                badge.unlocked 
                  ? `${badge.bgColor} border-transparent` 
                  : 'bg-muted/30 border-border/50 opacity-60'
              }`}
            >
              {/* Lock overlay for locked badges */}
              {!badge.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              
              {/* Badge icon */}
              <div className={`mx-auto mb-2 p-2 rounded-lg w-fit ${
                badge.unlocked ? badge.bgColor : 'bg-muted'
              }`}>
                <span className={badge.unlocked ? badge.color : 'text-muted-foreground'}>
                  {badge.icon}
                </span>
              </div>
              
              {/* Badge name */}
              <p className={`text-xs font-medium truncate ${
                badge.unlocked ? '' : 'text-muted-foreground'
              }`}>
                {badge.name}
              </p>
              
              {/* Progress for locked badges */}
              {!badge.unlocked && badge.progress > 0 && (
                <div className="mt-1">
                  <Progress value={badge.progress} className="h-1" />
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {Math.round(badge.progress)}%
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

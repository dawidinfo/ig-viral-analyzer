import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Star,
  TrendingUp,
  Users,
  BarChart3,
  Sparkles,
  ChevronRight,
  Flame,
  Target,
  Zap,
  Rocket,
  Calendar,
} from "lucide-react";

interface LeaderboardProps {
  currentUserId?: number;
}

const BADGE_ICONS: Record<string, React.ReactNode> = {
  first_analysis: <Star className="w-3 h-3" />,
  analysis_5: <Zap className="w-3 h-3" />,
  analysis_10: <TrendingUp className="w-3 h-3" />,
  analysis_25: <Flame className="w-3 h-3" />,
  analysis_50: <Rocket className="w-3 h-3" />,
  analysis_100: <Crown className="w-3 h-3" />,
  pro_upgrade: <Star className="w-3 h-3" />,
  referral_starter: <Users className="w-3 h-3" />,
  referral_pro: <Users className="w-3 h-3" />,
  referral_expert: <Trophy className="w-3 h-3" />,
  referral_master: <Trophy className="w-3 h-3" />,
  referral_legend: <Crown className="w-3 h-3" />,
};

const BADGE_COLORS: Record<string, string> = {
  first_analysis: "bg-amber-500/20 text-amber-500",
  analysis_5: "bg-blue-500/20 text-blue-500",
  analysis_10: "bg-emerald-500/20 text-emerald-500",
  analysis_25: "bg-orange-500/20 text-orange-500",
  analysis_50: "bg-pink-500/20 text-pink-500",
  analysis_100: "bg-red-500/20 text-red-500",
  pro_upgrade: "bg-violet-500/20 text-violet-500",
  referral_starter: "bg-green-500/20 text-green-500",
  referral_pro: "bg-blue-500/20 text-blue-500",
  referral_expert: "bg-purple-500/20 text-purple-500",
  referral_master: "bg-pink-500/20 text-pink-500",
  referral_legend: "bg-amber-500/20 text-amber-500",
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-amber-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Award className="w-5 h-5 text-amber-700" />;
    default:
      return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  }
};

const getRankBg = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/30";
    case 2:
      return "bg-gradient-to-r from-gray-400/20 to-gray-300/20 border-gray-400/30";
    case 3:
      return "bg-gradient-to-r from-amber-700/20 to-orange-600/20 border-amber-700/30";
    default:
      return "bg-card/50 border-border/50";
  }
};

export function Leaderboard({ currentUserId }: LeaderboardProps) {
  const [timeRange, setTimeRange] = useState<"all" | "month" | "week">("all");

  const { data: leaderboard, isLoading } = trpc.leaderboard.getLeaderboard.useQuery({
    limit: 50,
    timeRange,
  });

  const { data: stats } = trpc.leaderboard.getStats.useQuery();

  const { data: userRank } = trpc.leaderboard.getUserRank.useQuery(
    { userId: currentUserId! },
    { enabled: !!currentUserId }
  );

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl">Leaderboard</CardTitle>
              <CardDescription>Top-Analysten der Community</CardDescription>
            </div>
          </div>

          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
            <TabsList className="grid grid-cols-3 w-full sm:w-auto">
              <TabsTrigger value="all" className="text-xs sm:text-sm">Gesamt</TabsTrigger>
              <TabsTrigger value="month" className="text-xs sm:text-sm">Monat</TabsTrigger>
              <TabsTrigger value="week" className="text-xs sm:text-sm">Woche</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="p-3 rounded-lg bg-muted/30 text-center">
              <Users className="w-4 h-4 mx-auto mb-1 text-blue-500" />
              <p className="text-lg font-bold">{stats.totalParticipants}</p>
              <p className="text-xs text-muted-foreground">Teilnehmer</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 text-center">
              <BarChart3 className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
              <p className="text-lg font-bold">{stats.totalAnalyses.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Analysen</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 text-center">
              <Sparkles className="w-4 h-4 mx-auto mb-1 text-amber-500" />
              <p className="text-lg font-bold">{stats.totalBadgesEarned}</p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
          </div>
        )}

        {/* Current User Rank */}
        {userRank && currentUserId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-500/30 flex items-center justify-center">
                  <Target className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dein Rang</p>
                  <p className="text-xl font-bold">#{userRank.rank}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-lg font-bold text-violet-500">{userRank.score.toLocaleString()}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm text-muted-foreground">Top</p>
                <p className="text-lg font-bold text-emerald-500">{userRank.percentile}%</p>
              </div>
            </div>
          </motion.div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Lade Leaderboard...</p>
          </div>
        ) : !leaderboard || leaderboard.length === 0 ? (
          <div className="p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">Noch keine Einträge</p>
            <p className="text-sm text-muted-foreground mt-1">
              Führe Analysen durch, um auf dem Leaderboard zu erscheinen!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            <AnimatePresence mode="popLayout">
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.03 }}
                  className={`p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors ${
                    entry.userId === currentUserId ? "bg-violet-500/10" : ""
                  } ${getRankBg(entry.rank)}`}
                >
                  {/* Rank */}
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {entry.name || `User #${entry.userId}`}
                      </p>
                      {entry.userId === currentUserId && (
                        <Badge variant="outline" className="text-xs bg-violet-500/20 text-violet-500 border-violet-500/30">
                          Du
                        </Badge>
                      )}
                      {entry.plan !== "free" && (
                        <Badge className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                          {entry.plan.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        {entry.totalAnalyses} Analysen
                      </span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {entry.totalBadges} Badges
                      </span>
                      {entry.totalReferrals > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {entry.totalReferrals} Refs
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="hidden sm:flex items-center gap-1">
                    {entry.topBadges.slice(0, 3).map((badge) => (
                      <div
                        key={badge}
                        className={`p-1.5 rounded-lg ${BADGE_COLORS[badge] || "bg-muted"}`}
                        title={badge.replace(/_/g, " ")}
                      >
                        {BADGE_ICONS[badge] || <Star className="w-3 h-3" />}
                      </div>
                    ))}
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold">{entry.score.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Punkte</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Play,
  Heart,
  MessageCircle,
  Eye,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  BarChart3,
  Lightbulb,
  ChevronRight,
  Image as ImageIcon
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GrowthAnalysisProps {
  username: string;
  platform?: 'instagram' | 'tiktok' | 'youtube';
}

export function GrowthAnalysis({ username, platform = 'instagram' }: GrowthAnalysisProps) {
  const [days, setDays] = useState<number>(30);
  const [showAllInsights, setShowAllInsights] = useState(false);

  const { data: analysis, isLoading, error } = trpc.growthAnalysis.getAnalysis.useQuery(
    { username, platform, days },
    { enabled: !!username }
  );

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-white/10">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Analysiere Wachstumsdaten...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !analysis) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-white/10">
        <CardContent className="py-8 text-center">
          <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Noch nicht genug Daten für eine Wachstums-Analyse.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Führe mehrere Analysen über einige Tage durch, um Wachstumsmuster zu erkennen.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    if (Math.abs(num) >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString('de-DE');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatWeekday = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', { weekday: 'short' });
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-white/10 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Wachstums-Analyse
                <Badge variant="outline" className="bg-green-500/20 border-green-500/30 text-green-400 text-xs">
                  NEU
                </Badge>
              </CardTitle>
              <CardDescription>
                Top-Wachstumstage & erfolgreiche Posts
              </CardDescription>
            </div>
          </div>

          <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
            <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Tage</SelectItem>
              <SelectItem value="30">30 Tage</SelectItem>
              <SelectItem value="90">3 Monate</SelectItem>
              <SelectItem value="180">6 Monate</SelectItem>
              <SelectItem value="365">1 Jahr</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-xs text-muted-foreground mb-1">Gesamtwachstum</p>
            <p className={`text-xl font-bold ${analysis.totalGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {analysis.totalGrowth >= 0 ? '+' : ''}{formatNumber(analysis.totalGrowth)}
            </p>
            <p className="text-xs text-muted-foreground">
              {analysis.totalGrowthPercent >= 0 ? '+' : ''}{analysis.totalGrowthPercent}%
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-xs text-muted-foreground mb-1">Ø Täglich</p>
            <p className={`text-xl font-bold ${analysis.averageDailyGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {analysis.averageDailyGrowth >= 0 ? '+' : ''}{formatNumber(analysis.averageDailyGrowth)}
            </p>
            <p className="text-xs text-muted-foreground">pro Tag</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-xs text-muted-foreground mb-1">Beste Tag</p>
            <p className="text-xl font-bold text-green-400">
              +{formatNumber(analysis.topGrowthDays[0]?.growth || 0)}
            </p>
            <p className="text-xs text-muted-foreground">
              {analysis.topGrowthDays[0] ? formatDate(analysis.topGrowthDays[0].date) : '-'}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-xs text-muted-foreground mb-1">Zeitraum</p>
            <p className="text-xl font-bold text-white">{analysis.period.days}</p>
            <p className="text-xs text-muted-foreground">Tage</p>
          </div>
        </div>

        {/* Top Growth Days */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-green-400" />
            Top 5 Wachstumstage
          </h4>
          <div className="space-y-2">
            {analysis.topGrowthDays.map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-green-500/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {formatWeekday(day.date)}, {formatDate(day.date)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(day.followers)} Follower
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">
                      +{formatNumber(day.growth)}
                    </p>
                    <p className="text-xs text-green-400/70">
                      +{day.growthPercent}%
                    </p>
                  </div>
                </div>

                {/* Posts on this day */}
                {day.posts && day.posts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      Posts an diesem Tag:
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {day.posts.map((post, postIndex) => (
                        <div
                          key={post.id || postIndex}
                          className="flex-shrink-0 bg-white/5 rounded-lg p-2 border border-white/10 min-w-[140px]"
                        >
                          {post.thumbnail ? (
                            <img
                              src={post.thumbnail}
                              alt="Post thumbnail"
                              className="w-full h-20 object-cover rounded mb-2"
                            />
                          ) : (
                            <div className="w-full h-20 bg-white/10 rounded mb-2 flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {formatNumber(post.likes)}
                            </span>
                            {post.views && (
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {formatNumber(post.views)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Worst Growth Days (collapsible) */}
        {analysis.worstGrowthDays.some(d => d.growth < 0) && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-red-400" />
              Schwächste Tage
            </h4>
            <div className="space-y-2">
              {analysis.worstGrowthDays.filter(d => d.growth < 0).slice(0, 3).map((day, index) => (
                <div
                  key={day.date}
                  className="bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {formatWeekday(day.date)}, {formatDate(day.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-400">
                        {formatNumber(day.growth)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {analysis.insights && analysis.insights.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              Erkenntnisse
            </h4>
            <div className="space-y-2">
              <AnimatePresence>
                {analysis.insights.slice(0, showAllInsights ? undefined : 2).map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-3 rounded-lg border ${
                      insight.type === 'positive' 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : insight.type === 'negative'
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`font-medium text-sm ${
                          insight.type === 'positive' ? 'text-green-400' :
                          insight.type === 'negative' ? 'text-red-400' : 'text-blue-400'
                        }`}>
                          {insight.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {insight.description}
                        </p>
                      </div>
                      {insight.metric && (
                        <Badge variant="outline" className={`shrink-0 ${
                          insight.type === 'positive' ? 'border-green-500/30 text-green-400' :
                          insight.type === 'negative' ? 'border-red-500/30 text-red-400' : 'border-blue-500/30 text-blue-400'
                        }`}>
                          {insight.metric}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {analysis.insights.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground hover:text-white"
                  onClick={() => setShowAllInsights(!showAllInsights)}
                >
                  {showAllInsights ? 'Weniger anzeigen' : `${analysis.insights.length - 2} weitere Erkenntnisse`}
                  <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showAllInsights ? 'rotate-90' : ''}`} />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Best Performing Posts */}
        {analysis.bestPerformingPosts && analysis.bestPerformingPosts.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Top-Performance Posts
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {analysis.bestPerformingPosts.slice(0, 5).map((post, index) => (
                <div
                  key={post.id || index}
                  className="bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-purple-500/30 transition-colors"
                >
                  {post.thumbnail ? (
                    <img
                      src={post.thumbnail}
                      alt="Post"
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-white/10 flex items-center justify-center">
                      <Play className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Heart className="w-3 h-3" />
                        {formatNumber(post.likes)}
                      </span>
                      {post.views && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          {formatNumber(post.views)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

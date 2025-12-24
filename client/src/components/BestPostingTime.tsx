import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Lightbulb,
  Zap,
  TrendingUp
} from "lucide-react";

interface Reel {
  id: string;
  timestamp?: string | number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

interface BestPostingTimeProps {
  reels: Reel[];
  className?: string;
}

const DAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const DAYS_FULL = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export function BestPostingTime({ reels, className = "" }: BestPostingTimeProps) {
  // Analyze posting times
  const { heatmapData, bestSlot, bestDay, bestHour, stats } = useMemo(() => {
    // Initialize heatmap grid (7 days x 24 hours)
    const grid: { count: number; totalEngagement: number; avgEngagement: number }[][] = 
      Array.from({ length: 7 }, () => 
        Array.from({ length: 24 }, () => ({ count: 0, totalEngagement: 0, avgEngagement: 0 }))
      );

    let totalPosts = 0;

    reels.forEach(reel => {
      if (!reel.timestamp) return;
      
      const date = typeof reel.timestamp === 'number' 
        ? new Date(reel.timestamp * 1000)
        : new Date(reel.timestamp);
      
      if (isNaN(date.getTime())) return;

      const day = date.getDay();
      const hour = date.getHours();
      const engagement = reel.viewCount > 0 
        ? ((reel.likeCount + reel.commentCount) / reel.viewCount) * 100
        : 0;

      grid[day][hour].count += 1;
      grid[day][hour].totalEngagement += engagement;
      totalPosts += 1;
    });

    // Calculate averages
    grid.forEach(day => {
      day.forEach(slot => {
        if (slot.count > 0) {
          slot.avgEngagement = slot.totalEngagement / slot.count;
        }
      });
    });

    // Find best slot
    let best = { day: 0, hour: 0, engagement: 0, count: 0 };
    grid.forEach((day, dayIndex) => {
      day.forEach((slot, hourIndex) => {
        if (slot.count >= 2 && slot.avgEngagement > best.engagement) {
          best = { day: dayIndex, hour: hourIndex, engagement: slot.avgEngagement, count: slot.count };
        }
      });
    });

    // Find best day overall
    const dayStats = grid.map((day, index) => {
      const totalEng = day.reduce((sum, slot) => sum + slot.totalEngagement, 0);
      const totalCount = day.reduce((sum, slot) => sum + slot.count, 0);
      return { 
        day: index, 
        avgEngagement: totalCount > 0 ? totalEng / totalCount : 0,
        count: totalCount
      };
    });
    const bestDayData = dayStats.reduce((best, curr) => 
      curr.count >= 2 && curr.avgEngagement > best.avgEngagement ? curr : best
    , { day: 0, avgEngagement: 0, count: 0 });

    // Find best hour overall
    const hourStats = HOURS.map(hour => {
      const totalEng = grid.reduce((sum, day) => sum + day[hour].totalEngagement, 0);
      const totalCount = grid.reduce((sum, day) => sum + day[hour].count, 0);
      return {
        hour,
        avgEngagement: totalCount > 0 ? totalEng / totalCount : 0,
        count: totalCount
      };
    });
    const bestHourData = hourStats.reduce((best, curr) =>
      curr.count >= 2 && curr.avgEngagement > best.avgEngagement ? curr : best
    , { hour: 0, avgEngagement: 0, count: 0 });

    return {
      heatmapData: grid,
      bestSlot: best,
      bestDay: bestDayData,
      bestHour: bestHourData,
      stats: { totalPosts, dayStats, hourStats }
    };
  }, [reels]);

  // Find max engagement for color scaling
  const maxEngagement = useMemo(() => {
    let max = 0;
    heatmapData.forEach(day => {
      day.forEach(slot => {
        if (slot.avgEngagement > max) max = slot.avgEngagement;
      });
    });
    return max || 1;
  }, [heatmapData]);

  // Get color based on engagement
  const getColor = (engagement: number, count: number) => {
    if (count === 0) return "bg-muted/20";
    const intensity = engagement / maxEngagement;
    if (intensity > 0.8) return "bg-green-500";
    if (intensity > 0.6) return "bg-green-400";
    if (intensity > 0.4) return "bg-emerald-400";
    if (intensity > 0.2) return "bg-cyan-400";
    return "bg-cyan-300/50";
  };

  if (stats.totalPosts < 3) {
    return (
      <Card className={`glass-card ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-500" />
            Beste Posting-Zeit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nicht genügend Posts mit Zeitstempel für eine Analyse (mindestens 3 benötigt).
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-500" />
              Beste Posting-Zeit
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {stats.totalPosts} Posts analysiert
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Best Time Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {/* Best Slot */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-500 font-medium">Beste Zeit</span>
            </div>
            <p className="text-xl font-bold">
              {DAYS_FULL[bestSlot.day]} {bestSlot.hour}:00
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {bestSlot.engagement.toFixed(1)}% Engagement
            </p>
          </div>

          {/* Best Day */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-purple-500 font-medium">Bester Tag</span>
            </div>
            <p className="text-xl font-bold">{DAYS_FULL[bestDay.day]}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {bestDay.avgEngagement.toFixed(1)}% Ø Engagement
            </p>
          </div>

          {/* Best Hour */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-cyan-500" />
              <span className="text-xs text-cyan-500 font-medium">Beste Uhrzeit</span>
            </div>
            <p className="text-xl font-bold">{bestHour.hour}:00 Uhr</p>
            <p className="text-xs text-muted-foreground mt-1">
              {bestHour.avgEngagement.toFixed(1)}% Ø Engagement
            </p>
          </div>
        </div>

        {/* Heatmap */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="flex mb-1">
              <div className="w-10 shrink-0" />
              {[0, 3, 6, 9, 12, 15, 18, 21].map(hour => (
                <div key={hour} className="flex-1 text-center text-xs text-muted-foreground">
                  {hour}:00
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="flex items-center gap-1 mb-1">
                <div className="w-10 shrink-0 text-xs text-muted-foreground font-medium">
                  {day}
                </div>
                <div className="flex-1 flex gap-0.5">
                  {HOURS.map(hour => {
                    const slot = heatmapData[dayIndex][hour];
                    const isBest = dayIndex === bestSlot.day && hour === bestSlot.hour;
                    
                    return (
                      <div
                        key={hour}
                        className={`flex-1 h-6 rounded-sm transition-all cursor-pointer hover:scale-110 ${getColor(slot.avgEngagement, slot.count)} ${isBest ? "ring-2 ring-green-500 ring-offset-1 ring-offset-background" : ""}`}
                        title={`${DAYS_FULL[dayIndex]} ${hour}:00 - ${slot.count} Posts, ${slot.avgEngagement.toFixed(1)}% Engagement`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-3 text-xs text-muted-foreground">
              <span>Weniger</span>
              <div className="flex gap-0.5">
                <div className="w-4 h-4 rounded-sm bg-muted/20" />
                <div className="w-4 h-4 rounded-sm bg-cyan-300/50" />
                <div className="w-4 h-4 rounded-sm bg-cyan-400" />
                <div className="w-4 h-4 rounded-sm bg-emerald-400" />
                <div className="w-4 h-4 rounded-sm bg-green-400" />
                <div className="w-4 h-4 rounded-sm bg-green-500" />
              </div>
              <span>Mehr Engagement</span>
            </div>
          </div>
        </div>

        {/* Insight Box */}
        <div className="mt-4 p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">KI-Empfehlung:</strong> Poste am besten {DAYS_FULL[bestSlot.day]}s 
              gegen {bestSlot.hour}:00 Uhr für maximales Engagement. 
              {bestDay.day !== bestSlot.day && ` Generell performt ${DAYS_FULL[bestDay.day]} am besten.`}
              {" "}Vermeide Posts in den frühen Morgenstunden (2-6 Uhr).
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

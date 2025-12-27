import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Lightbulb,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface PostingTimeAnalysisProps {
  username: string;
}

const DAYS_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getTimeIcon(hour: number) {
  if (hour >= 5 && hour < 8) return <Sunrise className="w-4 h-4 text-orange-400" />;
  if (hour >= 8 && hour < 17) return <Sun className="w-4 h-4 text-yellow-400" />;
  if (hour >= 17 && hour < 20) return <Sunset className="w-4 h-4 text-orange-500" />;
  return <Moon className="w-4 h-4 text-blue-400" />;
}

function getHeatmapColor(score: number): string {
  if (score >= 80) return 'bg-green-500/90 hover:bg-green-500';
  if (score >= 60) return 'bg-green-400/70 hover:bg-green-400';
  if (score >= 40) return 'bg-yellow-500/60 hover:bg-yellow-500';
  if (score >= 20) return 'bg-orange-500/50 hover:bg-orange-500';
  return 'bg-red-500/30 hover:bg-red-500/50';
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-green-300';
  if (score >= 40) return 'text-yellow-400';
  if (score >= 20) return 'text-orange-400';
  return 'text-red-400';
}

export default function PostingTimeAnalysis({ username }: PostingTimeAnalysisProps) {
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; hour: number } | null>(null);

  const { data: analysisData, isLoading, error } = trpc.instagram.postingTimeAnalysis.useQuery(
    { username },
    { enabled: !!username }
  );

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Posting-Zeit-Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 animate-spin" />
              <span className="text-sm text-muted-foreground">Analysiere Posting-Zeiten...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analysisData) {
    return (
      <Card className="bg-gradient-to-br from-red-500/5 to-orange-500/5 border-red-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p>Fehler beim Laden der Posting-Zeit-Analyse</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { heatmapData, bestTimes, worstTimes, insights, peakHours, peakDays, isDemo } = analysisData;

  // Get selected slot data (click to select, not hover)
  const selectedData = selectedSlot 
    ? heatmapData[selectedSlot.day]?.[selectedSlot.hour] 
    : null;

  return (
    <div className="space-y-6">
      {/* Main Heatmap Card */}
      <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock className="w-6 h-6 text-purple-400" />
                Posting-Zeit-Analyse
                {isDemo && (
                  <Badge variant="outline" className="bg-amber-500/20 border-amber-500/30 text-amber-400 text-xs">
                    Demo
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Finde die optimalen Zeiten für maximales Engagement
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{analysisData.audienceTimezone}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Heatmap */}
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Hour labels */}
              <div className="flex mb-2">
                <div className="w-12" /> {/* Spacer for day labels */}
                {HOURS.filter(h => h % 3 === 0).map(hour => (
                  <div 
                    key={hour} 
                    className="flex-1 text-center text-xs text-muted-foreground"
                    style={{ minWidth: '40px' }}
                  >
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                ))}
              </div>
              
              {/* Heatmap grid */}
              {DAYS_SHORT.map((day, dayIndex) => (
                <div key={day} className="flex items-center mb-1">
                  <div className="w-12 text-sm font-medium text-muted-foreground pr-2">
                    {day}
                  </div>
                  <div className="flex flex-1 gap-0.5">
                    {HOURS.map(hour => {
                      const slot = heatmapData[dayIndex]?.[hour];
                      const score = slot?.engagementScore || 0;
                      const isSelected = selectedSlot?.day === dayIndex && selectedSlot?.hour === hour;
                      
                      return (
                        <motion.div
                          key={hour}
                          className={`
                            flex-1 h-8 rounded-sm cursor-pointer transition-all duration-200
                            ${getHeatmapColor(score)}
                            ${isSelected ? 'ring-2 ring-white scale-110 z-10' : ''}
                          `}
                          style={{ minWidth: '12px' }}
                          onClick={() => setSelectedSlot(isSelected ? null : { day: dayIndex, hour })}
                          whileHover={{ scale: 1.05 }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/10">
                <span className="text-xs text-muted-foreground">Niedrig</span>
                <div className="flex gap-1">
                  <div className="w-6 h-4 rounded bg-red-500/30" />
                  <div className="w-6 h-4 rounded bg-orange-500/50" />
                  <div className="w-6 h-4 rounded bg-yellow-500/60" />
                  <div className="w-6 h-4 rounded bg-green-400/70" />
                  <div className="w-6 h-4 rounded bg-green-500/90" />
                </div>
                <span className="text-xs text-muted-foreground">Hoch</span>
              </div>
            </div>
          </div>

          {/* Selected Slot Details - Click to show, stays visible */}
          {selectedData && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 rounded-xl p-4 border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getTimeIcon(selectedData.hour)}
                  <span className="font-semibold">
                    {DAYS_SHORT[selectedData.day]}, {selectedData.hour.toString().padStart(2, '0')}:00 - {(selectedData.hour + 1).toString().padStart(2, '0')}:00
                  </span>
                  <Badge className={`${getScoreColor(selectedData.engagementScore)} bg-transparent`}>
                    {selectedData.engagementScore}% Engagement
                  </Badge>
                </div>
                <button 
                  onClick={() => setSelectedSlot(null)}
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Ø Likes:</span>
                  <span className="ml-2 font-semibold">{selectedData.avgLikes.toLocaleString('de-DE')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ø Kommentare:</span>
                  <span className="ml-2 font-semibold">{selectedData.avgComments.toLocaleString('de-DE')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ø Views:</span>
                  <span className="ml-2 font-semibold">{selectedData.avgViews.toLocaleString('de-DE')}</span>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Best & Worst Times */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Best Times */}
        <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Beste Posting-Zeiten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bestTimes.map((time, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{time.day}</p>
                    <p className="text-sm text-muted-foreground">{time.timeRange}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">{time.engagementScore}%</p>
                  <p className="text-xs text-muted-foreground">{time.reason}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Worst Times */}
        <Card className="bg-gradient-to-br from-red-500/5 to-orange-500/5 border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="w-5 h-5 text-red-400" />
              Vermeide diese Zeiten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {worstTimes.map((time, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{time.day}</p>
                    <p className="text-sm text-muted-foreground">{time.timeRange}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-400">{time.engagementScore}%</p>
                  <p className="text-xs text-muted-foreground">{time.reason}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border-amber-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            Erkenntnisse & Empfehlungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
              >
                <div className="mt-0.5">
                  {idx === 0 && <Target className="w-5 h-5 text-green-400" />}
                  {idx === 1 && <Clock className="w-5 h-5 text-blue-400" />}
                  {idx === 2 && <Calendar className="w-5 h-5 text-purple-400" />}
                  {idx === 3 && <Zap className="w-5 h-5 text-yellow-400" />}
                  {idx === 4 && <TrendingUp className="w-5 h-5 text-cyan-400" />}
                </div>
                <p className="text-sm leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{peakHours[0]}:00</p>
            <p className="text-xs text-muted-foreground">Beste Uhrzeit</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{peakDays[0]?.slice(0, 2)}</p>
            <p className="text-xs text-muted-foreground">Bester Tag</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{bestTimes[0]?.engagementScore}%</p>
            <p className="text-xs text-muted-foreground">Max. Engagement</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">+40%</p>
            <p className="text-xs text-muted-foreground">Potenzial</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

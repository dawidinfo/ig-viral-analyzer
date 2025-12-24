import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Info, 
  Heart, 
  MessageSquare, 
  Eye, 
  Lightbulb,
  ArrowUpDown,
  Calendar
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from "recharts";

interface Reel {
  id: string;
  thumbnailUrl?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  timestamp?: string | number;
  shortcode?: string;
}

interface PostInteractionsChartProps {
  reels: Reel[];
  className?: string;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export function PostInteractionsChart({ reels, className = "" }: PostInteractionsChartProps) {
  const [viewMode, setViewMode] = useState<"interactions" | "views">("interactions");
  const [sortBy, setSortBy] = useState<"date" | "performance">("date");

  // Prepare chart data
  const chartData = useMemo(() => {
    let sorted = [...reels];
    
    if (sortBy === "date") {
      sorted.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return dateA - dateB;
      });
    } else {
      sorted.sort((a, b) => {
        const perfA = viewMode === "views" ? a.viewCount : (a.likeCount + a.commentCount);
        const perfB = viewMode === "views" ? b.viewCount : (b.likeCount + b.commentCount);
        return perfB - perfA;
      });
    }

    return sorted.slice(0, 12).map((reel, index) => ({
      id: reel.id,
      name: `#${index + 1}`,
      thumbnail: reel.thumbnailUrl,
      likes: reel.likeCount,
      comments: reel.commentCount,
      views: reel.viewCount,
      interactions: reel.likeCount + reel.commentCount,
      shortcode: reel.shortcode
    }));
  }, [reels, sortBy, viewMode]);

  // Calculate max value for scaling
  const maxValue = useMemo(() => {
    if (viewMode === "views") {
      return Math.max(...chartData.map(d => d.views), 1);
    }
    return Math.max(...chartData.map(d => d.interactions), 1);
  }, [chartData, viewMode]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            {data.thumbnail && (
              <img 
                src={data.thumbnail} 
                alt="" 
                className="w-10 h-10 rounded object-cover"
              />
            )}
            <span className="font-medium">{data.name}</span>
          </div>
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-2">
              <Heart className="w-3 h-3 text-rose-500" />
              {formatNumber(data.likes)} Likes
            </p>
            <p className="flex items-center gap-2">
              <MessageSquare className="w-3 h-3 text-blue-500" />
              {formatNumber(data.comments)} Kommentare
            </p>
            <p className="flex items-center gap-2">
              <Eye className="w-3 h-3 text-cyan-500" />
              {formatNumber(data.views)} Views
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Find best performing post
  const bestPost = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData.reduce((best, current) => 
      current.interactions > best.interactions ? current : best
    );
  }, [chartData]);

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">Post Interaktionen</CardTitle>
            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpDown className="w-3 h-3" />
              <span>Sortieren:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "performance")}
              className="text-xs bg-muted/50 border border-border rounded px-2 py-1"
            >
              <option value="date">Datum</option>
              <option value="performance">Performance</option>
            </select>
            <div className="flex gap-1 ml-2">
              <Button
                variant={viewMode === "interactions" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("interactions")}
                className={`text-xs h-7 ${viewMode === "interactions" ? "bg-primary" : ""}`}
              >
                Interaktionen
              </Button>
              <Button
                variant={viewMode === "views" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("views")}
                className={`text-xs h-7 ${viewMode === "views" ? "bg-primary" : ""}`}
              >
                Reel Views
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <>
            {/* Chart with Thumbnails */}
            <div className="relative">
              {/* Bars */}
              <div className="h-[200px] mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <YAxis 
                      tickFormatter={(v) => formatNumber(v)}
                      tick={{ fill: '#888', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {viewMode === "interactions" ? (
                      <>
                        <Bar dataKey="likes" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="comments" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} />
                      </>
                    ) : (
                      <Bar dataKey="views" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Thumbnails Row */}
              <div className="flex justify-around px-10">
                {chartData.map((item, index) => (
                  <a
                    key={item.id}
                    href={item.shortcode ? `https://www.instagram.com/reel/${item.shortcode}/` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group cursor-pointer"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-primary transition-all">
                      {item.thumbnail ? (
                        <img 
                          src={item.thumbnail} 
                          alt={`Post ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          {index + 1}
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-4 mt-4 text-xs">
              {viewMode === "interactions" ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-blue-500" />
                    <span className="text-muted-foreground">Likes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-pink-500" />
                    <span className="text-muted-foreground">Kommentare</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-cyan-500" />
                  <span className="text-muted-foreground">Views</span>
                </div>
              )}
            </div>

            {/* Insight Box */}
            <div className="mt-4 p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Beobachte und lass dich von den Elementen inspirieren, die deine Top-Posts gemeinsam haben! 
                  {bestPost && ` Dein bester Post hat ${formatNumber(bestPost.interactions)} Interaktionen.`}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Keine Post-Daten verfügbar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

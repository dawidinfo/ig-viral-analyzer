import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Hash, 
  TrendingUp, 
  Eye, 
  Heart,
  Lightbulb,
  Trophy,
  Flame,
  ArrowUp,
  ArrowDown
} from "lucide-react";

interface Reel {
  id: string;
  caption?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

interface HashtagStatisticsProps {
  reels: Reel[];
  className?: string;
}

interface HashtagData {
  hashtag: string;
  count: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgViews: number;
  avgLikes: number;
  avgEngagement: number;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export function HashtagStatistics({ reels, className = "" }: HashtagStatisticsProps) {
  const [sortBy, setSortBy] = useState<"count" | "avgViews" | "avgLikes" | "avgEngagement">("avgEngagement");
  const [showAll, setShowAll] = useState(false);

  // Extract and analyze hashtags
  const hashtagData = useMemo(() => {
    const hashtagMap = new Map<string, HashtagData>();

    reels.forEach(reel => {
      if (!reel.caption) return;
      
      const hashtags = reel.caption.match(/#\w+/g) || [];
      const uniqueHashtags = Array.from(new Set(hashtags.map(h => h.toLowerCase())));
      
      uniqueHashtags.forEach(hashtag => {
        const existing = hashtagMap.get(hashtag) || {
          hashtag,
          count: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          avgViews: 0,
          avgLikes: 0,
          avgEngagement: 0
        };

        existing.count += 1;
        existing.totalViews += reel.viewCount;
        existing.totalLikes += reel.likeCount;
        existing.totalComments += reel.commentCount;

        hashtagMap.set(hashtag, existing);
      });
    });

    // Calculate averages
    const result = Array.from(hashtagMap.values()).map(data => ({
      ...data,
      avgViews: Math.round(data.totalViews / data.count),
      avgLikes: Math.round(data.totalLikes / data.count),
      avgEngagement: data.totalViews > 0 
        ? ((data.totalLikes + data.totalComments) / data.totalViews) * 100 
        : 0
    }));

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "count": return b.count - a.count;
        case "avgViews": return b.avgViews - a.avgViews;
        case "avgLikes": return b.avgLikes - a.avgLikes;
        case "avgEngagement": return b.avgEngagement - a.avgEngagement;
        default: return 0;
      }
    });

    return result;
  }, [reels, sortBy]);

  // Calculate overall average for comparison
  const overallAvgEngagement = useMemo(() => {
    if (hashtagData.length === 0) return 0;
    const total = hashtagData.reduce((sum, h) => sum + h.avgEngagement, 0);
    return total / hashtagData.length;
  }, [hashtagData]);

  const displayedHashtags = showAll ? hashtagData : hashtagData.slice(0, 10);
  const topHashtag = hashtagData[0];

  if (hashtagData.length === 0) {
    return (
      <Card className={`glass-card ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Hash className="w-5 h-5 text-purple-500" />
            Hashtag Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Keine Hashtags in den analysierten Posts gefunden.
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
              <Hash className="w-5 h-5 text-purple-500" />
              Hashtag Performance
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {hashtagData.length} Hashtags
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sortieren:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs bg-muted/50 border border-border rounded px-2 py-1"
            >
              <option value="avgEngagement">Engagement</option>
              <option value="avgViews">Ø Views</option>
              <option value="avgLikes">Ø Likes</option>
              <option value="count">Häufigkeit</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Top Performer Highlight */}
        {topHashtag && (
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-amber-500 font-medium">Top Performer</p>
                <p className="text-lg font-bold">{topHashtag.hashtag}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-500">{topHashtag.avgEngagement.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Ø Engagement</p>
              </div>
            </div>
          </div>
        )}

        {/* Hashtag List */}
        <div className="space-y-2">
          {displayedHashtags.map((hashtag, index) => {
            const isAboveAverage = hashtag.avgEngagement > overallAvgEngagement;
            const performancePercent = overallAvgEngagement > 0 
              ? ((hashtag.avgEngagement - overallAvgEngagement) / overallAvgEngagement) * 100
              : 0;

            return (
              <div
                key={hashtag.hashtag}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {/* Rank */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? "bg-amber-500 text-white" :
                  index === 1 ? "bg-gray-400 text-white" :
                  index === 2 ? "bg-amber-700 text-white" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {index + 1}
                </div>

                {/* Hashtag */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{hashtag.hashtag}</span>
                    {index < 3 && <Flame className="w-4 h-4 text-orange-500" />}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{hashtag.count}x verwendet</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Ø {formatNumber(hashtag.avgViews)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      Ø {formatNumber(hashtag.avgLikes)}
                    </span>
                  </div>
                </div>

                {/* Performance */}
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <span className="font-bold">{hashtag.avgEngagement.toFixed(1)}%</span>
                    {isAboveAverage ? (
                      <ArrowUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className={`text-xs ${isAboveAverage ? "text-green-500" : "text-red-500"}`}>
                    {performancePercent >= 0 ? "+" : ""}{performancePercent.toFixed(0)}% vs Ø
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show More Button */}
        {hashtagData.length > 10 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-3 py-2 text-sm text-primary hover:underline"
          >
            {showAll ? "Weniger anzeigen" : `Alle ${hashtagData.length} Hashtags anzeigen`}
          </button>
        )}

        {/* Insight Box */}
        <div className="mt-4 p-4 rounded-xl border border-purple-500/30 bg-purple-500/5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">KI-Tipp:</strong> Nutze vermehrt {topHashtag?.hashtag || "deine Top-Hashtags"} - 
              dieser Hashtag bringt {topHashtag ? `${topHashtag.avgEngagement.toFixed(1)}%` : "das beste"} Engagement. 
              Vermeide Hashtags mit unterdurchschnittlicher Performance und teste neue Varianten.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

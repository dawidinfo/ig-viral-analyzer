import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MessageSquare, 
  Eye, 
  Play,
  Image as ImageIcon,
  Hash,
  AtSign,
  Calendar,
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Reel {
  id: string;
  thumbnailUrl?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  timestamp?: string | number;
  shortcode?: string;
  caption?: string;
}

interface DetailedPostAnalysisProps {
  reels: Reel[];
  className?: string;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const formatDate = (dateStr?: string | number): string => {
  if (!dateStr) return '-';
  const date = typeof dateStr === 'number' ? new Date(dateStr * 1000) : new Date(dateStr);
  return date.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Extract hashtags from caption
const extractHashtags = (caption?: string): string[] => {
  if (!caption) return [];
  const matches = caption.match(/#\w+/g) || [];
  return matches.slice(0, 5);
};

// Extract mentions from caption
const extractMentions = (caption?: string): string[] => {
  if (!caption) return [];
  const matches = caption.match(/@\w+/g) || [];
  return matches.slice(0, 5);
};

type SortKey = "date" | "likes" | "comments" | "views";
type TimeRange = "all" | "7d" | "30d" | "90d";

export function DetailedPostAnalysis({ reels, className = "" }: DetailedPostAnalysisProps) {
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const itemsPerPage = 10;

  // Filter by time range
  const filteredReels = useMemo(() => {
    if (timeRange === "all") return reels;
    
    const now = Date.now();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoff = now - (days * 24 * 60 * 60 * 1000);
    
    return reels.filter(reel => {
      if (!reel.timestamp) return true;
      const timestamp = typeof reel.timestamp === 'number' 
        ? reel.timestamp * 1000 
        : new Date(reel.timestamp).getTime();
      return timestamp >= cutoff;
    });
  }, [reels, timeRange]);

  // Sort and paginate data
  const sortedReels = useMemo(() => {
    const sorted = [...filteredReels].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case "likes":
          comparison = a.likeCount - b.likeCount;
          break;
        case "comments":
          comparison = a.commentCount - b.commentCount;
          break;
        case "views":
          comparison = a.viewCount - b.viewCount;
          break;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });
    return sorted;
  }, [filteredReels, sortBy, sortOrder]);

  const paginatedReels = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedReels.slice(start, start + itemsPerPage);
  }, [sortedReels, currentPage]);

  const totalPages = Math.ceil(filteredReels.length / itemsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
  };

  const SortButton = ({ sortKey, children }: { sortKey: SortKey; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(sortKey)}
      className={`flex items-center gap-1 text-xs font-medium hover:text-foreground transition-colors ${
        sortBy === sortKey ? 'text-primary' : 'text-muted-foreground'
      }`}
    >
      {children}
      {sortBy === sortKey && (
        <ArrowUpDown className={`w-3 h-3 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
      )}
    </button>
  );

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">Detaillierte Post-Analyse</CardTitle>
            {timeRange !== "all" && (
              <Badge variant="outline" className="text-xs">
                {filteredReels.length} Posts
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Time Range Filter */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Zeitraum:</span>
            </div>
            <div className="flex gap-1">
              {(["all", "7d", "30d", "90d"] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setTimeRange(range);
                    setCurrentPage(1);
                  }}
                  className={`text-xs h-6 px-2 rounded transition-colors ${
                    timeRange === range 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  {range === "all" ? "Alle" : range === "7d" ? "7T" : range === "30d" ? "30T" : "90T"}
                </button>
              ))}
            </div>
            <div className="w-px h-4 bg-border mx-1" />
            {/* Sort Filter */}
            <span className="text-xs text-muted-foreground">Sortieren:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortKey);
                setSortOrder("desc");
              }}
              className="text-xs bg-muted/50 border border-border rounded px-2 py-1"
            >
              <option value="date">Datum</option>
              <option value="likes">Likes</option>
              <option value="comments">Kommentare</option>
              <option value="views">Views</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/30 rounded-t-lg text-xs font-medium text-muted-foreground">
          <div className="col-span-2">
            <SortButton sortKey="date">
              <Calendar className="w-3 h-3" />
              Datum & Format
            </SortButton>
          </div>
          <div className="col-span-2">Posts</div>
          <div className="col-span-2">
            <SortButton sortKey="likes">
              <Heart className="w-3 h-3" />
              Interaktionen
            </SortButton>
          </div>
          <div className="col-span-3">
            <AtSign className="w-3 h-3 inline mr-1" />
            Mentions & Tags
          </div>
          <div className="col-span-3">
            <Hash className="w-3 h-3 inline mr-1" />
            Hashtags
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border">
          {paginatedReels.map((reel, index) => {
            const hashtags = extractHashtags(reel.caption);
            const mentions = extractMentions(reel.caption);
            const isReel = true; // Assuming all are reels for now
            
            return (
              <div 
                key={reel.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-4 hover:bg-muted/20 transition-colors"
              >
                {/* Date & Format */}
                <div className="col-span-2 flex flex-col gap-1">
                  <span className="text-sm">{formatDate(reel.timestamp)}</span>
                  <Badge 
                    variant="outline" 
                    className={`w-fit text-xs ${isReel ? 'border-purple-500/50 text-purple-400' : 'border-blue-500/50 text-blue-400'}`}
                  >
                    {isReel ? (
                      <><Play className="w-3 h-3 mr-1" /> Reel</>
                    ) : (
                      <><ImageIcon className="w-3 h-3 mr-1" /> Post</>
                    )}
                  </Badge>
                </div>

                {/* Thumbnail */}
                <div className="col-span-2">
                  <a
                    href={reel.shortcode ? `https://www.instagram.com/reel/${reel.shortcode}/` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative group"
                  >
                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-muted">
                      {reel.thumbnailUrl ? (
                        <img 
                          src={reel.thumbnailUrl} 
                          alt={`Post ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Play className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <ExternalLink className="w-4 h-4 text-white" />
                    </div>
                  </a>
                </div>

                {/* Interactions */}
                <div className="col-span-2 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span className="font-medium">{formatNumber(reel.likeCount)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>{formatNumber(reel.commentCount)}</span>
                  </div>
                  {reel.viewCount > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Eye className="w-4 h-4 text-cyan-500" />
                      <span className="text-xs">{formatNumber(reel.viewCount)}</span>
                    </div>
                  )}
                </div>

                {/* Mentions */}
                <div className="col-span-3">
                  {mentions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {mentions.map((mention, i) => (
                        <a
                          key={i}
                          href={`https://instagram.com/${mention.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline"
                        >
                          {mention}
                        </a>
                      ))}
                      {mentions.length >= 5 && (
                        <span className="text-xs text-muted-foreground">...mehr</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>

                {/* Hashtags */}
                <div className="col-span-3">
                  {hashtags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {hashtags.map((tag, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="text-xs bg-muted/30 border-border"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Zeige {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredReels.length)} von {filteredReels.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

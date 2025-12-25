import { Button } from "@/components/ui/button";
import { GlobalFooter } from "@/components/GlobalFooter";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  BookmarkCheck,
  Play,
  Search,
  Clock,
  Zap,
  Hash,
  Type,
  Target,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  ImageIcon,
  Download,
  FileText,
  Save,
  Loader2,
  Pin,
  PinOff,
  ChevronDown,
  ChevronUp,
  Flame,
  Lightbulb,
  Trophy,
  Brain,
  Rocket,
  PenTool,
  Video
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import ReelAnalysis from "@/components/ReelAnalysis";
import DeepAnalysis from "@/components/DeepAnalysis";
import { AnalysisCTAPopup } from "@/components/AnalysisCTAPopup";
import FollowerGrowthChart from "@/components/FollowerGrowthChart";
import PostingTimeAnalysis from "@/components/PostingTimeAnalysis";
import { DailyGrowthChart, generateDemoGrowthData } from "@/components/DailyGrowthChart";
import { PostInteractionsChart } from "@/components/PostInteractionsChart";
import { DetailedPostAnalysis } from "@/components/DetailedPostAnalysis";
import { HashtagStatistics } from "@/components/HashtagStatistics";
import { BestPostingTime } from "@/components/BestPostingTime";
import { CaptionGenerator } from "@/components/CaptionGenerator";
import { AccountMonitoring } from "@/components/AccountMonitoring";
import { ReelIdeasGenerator } from "@/components/ReelIdeasGenerator";
import { AnalysisPaywall } from "@/components/AnalysisPaywall";
import { ContentPlanCTA } from "@/components/ContentPlanCTA";
import { FeatureTooltip, tooltips, InfoTooltip } from "@/components/FeatureTooltip";
import { generateAnalysisPDF } from "@/lib/pdfExport";
import { useLocation, useSearch, useRoute } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// Circular Progress Component
const CircularProgress = ({ value, size = 120, strokeWidth = 8, color = "primary" }: { value: number; size?: number; strokeWidth?: number; color?: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  const colorClasses: Record<string, string> = {
    primary: "stroke-primary",
    viral: "stroke-accent",
    cyan: "stroke-secondary"
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${colorClasses[color]} transition-all duration-1000 ease-out`}
          style={{
            filter: color === "viral" ? "drop-shadow(0 0 10px oklch(0.72 0.19 142 / 0.5))" : 
                   color === "primary" ? "drop-shadow(0 0 10px oklch(0.65 0.25 285 / 0.5))" : undefined
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold font-mono">{value}</span>
      </div>
    </div>
  );
};

// Section Header with Pin functionality
interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  isPinned: boolean;
  onTogglePin: () => void;
  badge?: string;
  badgeColor?: string;
}

const SectionHeader = ({ title, icon, isPinned, onTogglePin, badge, badgeColor = "bg-primary/20 text-primary" }: SectionHeaderProps) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      {icon}
      <h2 className="text-xl font-bold">{title}</h2>
      {badge && (
        <Badge className={badgeColor}>{badge}</Badge>
      )}
    </div>
    <Button
      variant="ghost"
      size="sm"
      onClick={onTogglePin}
      className={`${isPinned ? 'text-primary' : 'text-muted-foreground'} hover:text-primary`}
    >
      {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
      <span className="ml-2 text-xs">{isPinned ? 'Angepinnt' : 'Anpinnen'}</span>
    </Button>
  </div>
);

export default function Analysis() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  
  // Support both /analysis?username=xyz and /analysis/xyz routes
  const [matchRoute, routeParams] = useRoute('/analysis/:username');
  const usernameFromPath = routeParams?.username || '';
  const usernameFromQuery = params.get('username') || '';
  const usernameParam = usernameFromPath || usernameFromQuery;
  
  const [username, setUsername] = useState(usernameParam);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Pinned sections state
  const [pinnedSections, setPinnedSections] = useState<Set<string>>(new Set(['ai', 'stats', 'viral']));
  const [showCTAPopup, setShowCTAPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const [reelSortBy, setReelSortBy] = useState<'views' | 'likes' | 'engagement'>('views');

  const togglePin = (section: string) => {
    setPinnedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Save analysis mutation
  const saveAnalysisMutation = trpc.dashboard.saveAnalysis.useMutation({
    onSuccess: () => {
      setIsSaved(true);
      setIsSaving(false);
    },
    onError: () => {
      setIsSaving(false);
    }
  });

  const { user } = useAuth();

  const handleSaveAnalysis = async () => {
    if (!analysisData || isSaved || isSaving || !user) return;
    
    const userId = user.id;
    
    setIsSaving(true);
    saveAnalysisMutation.mutate({
      userId,
      username: analysisData.profile.username,
      profilePicUrl: analysisData.profile.profilePicUrl || '',
      fullName: analysisData.profile.fullName || '',
      followerCount: analysisData.profile.followerCount,
      viralScore: analysisData.viralScore,
      engagementRate: analysisData.metrics.engagementRate.toFixed(2),
      analysisData: {
        metrics: analysisData.metrics,
        viralFactors: analysisData.viralFactors,
        profile: analysisData.profile
      }
    });
  };

  // Fetch Instagram analysis data
  const { data: analysisData, isLoading, error, refetch } = trpc.instagram.analyze.useQuery(
    { username: usernameParam },
    { 
      enabled: !!usernameParam,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Show CTA popup after analysis is loaded (with delay)
  useEffect(() => {
    if (analysisData && !isLoading && !hasShownPopup) {
      const timer = setTimeout(() => {
        setShowCTAPopup(true);
        setHasShownPopup(true);
      }, 3000); // Show after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [analysisData, isLoading, hasShownPopup]);

  const handleAnalyze = () => {
    if (username.trim()) {
      const cleanUsername = username.replace('@', '');
      setLocation(`/analysis?username=${encodeURIComponent(cleanUsername)}`);
    }
  };

  // Generate recommendations based on analysis data
  const recommendations = useMemo(() => {
    if (!analysisData) return [];
    
    const recs: { type: 'success' | 'warning' | 'error'; text: string }[] = [];
    
    if (analysisData.metrics.engagementRate > 3) {
      recs.push({ type: 'success', text: `Überdurchschnittliche Engagement-Rate von ${analysisData.metrics.engagementRate.toFixed(1)}%` });
    } else if (analysisData.metrics.engagementRate > 1) {
      recs.push({ type: 'warning', text: `Engagement-Rate von ${analysisData.metrics.engagementRate.toFixed(1)}% - Raum für Verbesserung` });
    } else {
      recs.push({ type: 'error', text: `Niedrige Engagement-Rate von ${analysisData.metrics.engagementRate.toFixed(1)}% - Strategie überdenken` });
    }

    if (analysisData.viralScore >= 70) {
      recs.push({ type: 'success', text: 'Hoher Viral Score - Content hat großes Potenzial' });
    } else if (analysisData.viralScore >= 50) {
      recs.push({ type: 'warning', text: 'Mittlerer Viral Score - Hook und Emotionen verbessern' });
    }

    if (analysisData.reels.length > 0) {
      recs.push({ type: 'success', text: `${analysisData.reels.length} Reels analysiert - Video-Content aktiv` });
    } else {
      recs.push({ type: 'warning', text: 'Keine Reels gefunden - Reels können Reichweite steigern' });
    }

    if (analysisData.viralFactors.caption >= 70) {
      recs.push({ type: 'success', text: 'Starke Caption-Qualität mit guten CTAs' });
    } else {
      recs.push({ type: 'warning', text: 'Captions optimieren - Mehr Hooks und CTAs einbauen' });
    }

    if (analysisData.viralFactors.hashtags >= 70) {
      recs.push({ type: 'success', text: 'Effektive Hashtag-Strategie' });
    } else {
      recs.push({ type: 'warning', text: 'Hashtag-Strategie überarbeiten für mehr Reichweite' });
    }

    return recs;
  }, [analysisData]);

  // Radar chart data
  const radarData = useMemo(() => {
    if (!analysisData) return [];
    return [
      { subject: 'Hook', A: analysisData.viralFactors.hook, fullMark: 100 },
      { subject: 'Emotionen', A: analysisData.viralFactors.emotion, fullMark: 100 },
      { subject: 'Teilbarkeit', A: analysisData.viralFactors.shareability, fullMark: 100 },
      { subject: 'Replay', A: analysisData.viralFactors.replay, fullMark: 100 },
      { subject: 'Caption', A: analysisData.viralFactors.caption, fullMark: 100 },
      { subject: 'Hashtags', A: analysisData.viralFactors.hashtags, fullMark: 100 },
    ];
  }, [analysisData]);

  // Weekly engagement data
  const weeklyData = useMemo(() => {
    if (!analysisData) return [];
    const baseEngagement = analysisData.metrics.engagementRate;
    return [
      { day: 'Mo', engagement: baseEngagement * 0.9, views: analysisData.metrics.avgViews * 0.8 },
      { day: 'Di', engagement: baseEngagement * 0.95, views: analysisData.metrics.avgViews * 0.9 },
      { day: 'Mi', engagement: baseEngagement * 1.0, views: analysisData.metrics.avgViews * 1.0 },
      { day: 'Do', engagement: baseEngagement * 1.05, views: analysisData.metrics.avgViews * 1.1 },
      { day: 'Fr', engagement: baseEngagement * 1.1, views: analysisData.metrics.avgViews * 1.2 },
      { day: 'Sa', engagement: baseEngagement * 1.2, views: analysisData.metrics.avgViews * 1.3 },
      { day: 'So', engagement: baseEngagement * 1.15, views: analysisData.metrics.avgViews * 1.25 },
    ];
  }, [analysisData]);

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="fixed inset-0 bg-gradient-radial pointer-events-none" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-14 sm:h-16 px-2 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/")}
              className="hover:bg-muted h-8 w-8 sm:h-10 sm:w-10"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="hidden sm:flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
              <img src="/logo.svg" alt="ReelSpy.ai" className="h-6 sm:h-8 w-auto" />
            </div>
          </div>
          
          {/* Search Bar with Gradient Border */}
          <div className="flex items-center gap-1 sm:gap-2 max-w-lg flex-1 mx-1 sm:mx-4">
            <div className="relative gradient-border rounded-lg sm:rounded-xl p-[1px] sm:p-[2px] flex-1">
              <div className="flex items-center gap-1 sm:gap-2 bg-background rounded-lg sm:rounded-xl">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="@username..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    className="pl-7 sm:pl-10 h-8 sm:h-10 text-sm bg-transparent border-0 focus-visible:ring-0 input-glow"
                  />
                </div>
                <Button onClick={handleAnalyze} className="btn-gradient text-white border-0 h-6 sm:h-8 px-2 sm:px-3 mr-1">
                  <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {analysisData && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveAnalysis}
                  disabled={isSaved || isSaving || !user}
                  className={`h-8 px-2 sm:px-3 text-xs sm:text-sm ${isSaved ? 'bg-green-500/20 border-green-500/30 text-green-400' : ''}`}
                >
                  {isSaving ? (
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  ) : isSaved ? (
                    <BookmarkCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <Bookmark className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  <span className="hidden sm:inline ml-2">{isSaved ? 'Gespeichert' : 'Speichern'}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateAnalysisPDF(analysisData)}
                  className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline ml-2">PDF</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container pt-24 pb-12 relative z-10">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary/30 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="mt-6 text-muted-foreground">Analysiere @{usernameParam}...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Analyse fehlgeschlagen</h2>
            <p className="text-muted-foreground mb-4">
              Der Account konnte nicht analysiert werden. Bitte überprüfe den Benutzernamen.
            </p>
            <Button onClick={() => refetch()} className="btn-gradient text-white border-0">
              <RefreshCw className="w-4 h-4 mr-2" />
              Erneut versuchen
            </Button>
          </div>
        )}

        {/* Analysis Results */}
        {analysisData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Profile Header */}
            <div className="glass-card rounded-2xl p-8">
              <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-8 profile-header">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary to-secondary p-1 profile-avatar">
                    <img 
                        src={analysisData.profile.profilePicUrl 
                          ? `/api/proxy/instagram-image?url=${encodeURIComponent(analysisData.profile.profilePicUrl)}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(analysisData.profile.username)}&size=200&background=8B5CF6&color=fff&bold=true`
                        } 
                        alt={analysisData.profile.username}
                        className="w-full h-full rounded-full object-cover bg-muted"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(analysisData.profile.username)}&size=200&background=8B5CF6&color=fff&bold=true`;
                        }}
                      />
                  </div>
                  {analysisData.profile.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="text-lg sm:text-2xl font-bold">@{analysisData.profile.username}</h1>
                    {analysisData.isDemo && (
                      <Badge variant="outline" className="bg-amber-500/20 border-amber-500/30 text-amber-400">
                        Demo-Daten
                      </Badge>
                    )}
                  </div>
                  {analysisData.profile.fullName && (
                    <p className="text-muted-foreground mb-4">{analysisData.profile.fullName}</p>
                  )}
                  
                  {/* Quick Stats */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-6 profile-stats">
                    <div className="text-center">
                      <p className="text-lg sm:text-2xl font-bold">{formatNumber(analysisData.profile.followerCount)}</p>
                      <p className="text-sm text-muted-foreground">Follower</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg sm:text-2xl font-bold">{formatNumber(analysisData.profile.followingCount)}</p>
                      <p className="text-sm text-muted-foreground">Following</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{(analysisData.profile as any).postCount || analysisData.posts.length}</p>
                      <p className="text-sm text-muted-foreground">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{analysisData.viralScore}</p>
                      <FeatureTooltip title={tooltips.viralScore.title} description={tooltips.viralScore.description}>
                        <p className="text-sm text-muted-foreground">Viral Score</p>
                      </FeatureTooltip>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-accent">{analysisData.metrics.engagementRate.toFixed(1)}%</p>
                      <FeatureTooltip title={tooltips.engagementRate.title} description={tooltips.engagementRate.description}>
                        <p className="text-sm text-muted-foreground">Engagement</p>
                      </FeatureTooltip>
                    </div>
                  </div>
                </div>

                {/* Viral Score Circle */}
                <div className="flex flex-col items-center">
                  <CircularProgress value={analysisData.viralScore} size={140} color="viral" />
                  <p className="mt-2 text-sm font-medium text-accent">Viral Score</p>
                </div>
              </div>
            </div>

            {/* ==================== SECTION 1: AI REEL-ANALYSE ==================== */}
            <section className="space-y-6">
              <SectionHeader
                title="🔥 HOT-Transkription & AI Reel-Analyse"
                icon={<Sparkles className="w-6 h-6 text-primary" />}
                isPinned={pinnedSections.has('ai')}
                onTogglePin={() => togglePin('ai')}
                badge="KI-gestützt"
                badgeColor="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-primary border border-primary/30"
              />
              <div className="glass-card rounded-2xl p-8 border-2 border-primary/20">
                <ReelAnalysis username={analysisData.profile.username} />
              </div>
            </section>

            {/* ==================== SECTION 2: TIEFENANALYSE ==================== */}
            <section className="space-y-6">
              <SectionHeader
                title="Tiefenanalyse & HAPSS Framework"
                icon={<Target className="w-6 h-6 text-cyan-400" />}
                isPinned={pinnedSections.has('deep')}
                onTogglePin={() => togglePin('deep')}
                badge="Hook, Attention, Problem, Story, Solution"
                badgeColor="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
              />
              <div className="glass-card rounded-2xl p-8">
                <DeepAnalysis username={analysisData.profile.username} />
              </div>
            </section>

            {/* ==================== SECTION 3: STATISTIKEN & METRIKEN ==================== */}
            <section className="space-y-6">
              <SectionHeader
                title="Statistiken & Metriken"
                icon={<BarChart3 className="w-6 h-6 text-green-400" />}
                isPinned={pinnedSections.has('stats')}
                onTogglePin={() => togglePin('stats')}
              />
              
              {/* Metric Cards Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card rounded-xl p-6 stat-card">
                  <div className="flex items-center justify-between mb-3">
                    <Heart className="w-6 h-6 text-pink-500" />
                    <span className="text-xs text-muted-foreground">Ø pro Post</span>
                  </div>
                  <p className="text-4xl font-bold">{formatNumber(analysisData.metrics.avgLikes)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Likes</p>
                </div>

                <div className="glass-card rounded-xl p-6 stat-card">
                  <div className="flex items-center justify-between mb-3">
                    <MessageSquare className="w-6 h-6 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Ø pro Post</span>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold">{formatNumber(analysisData.profile.mediaCount)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Kommentare</p>
                </div>

                <div className="glass-card rounded-xl p-6 stat-card">
                  <div className="flex items-center justify-between mb-3">
                    <Eye className="w-6 h-6 text-cyan-500" />
                    <span className="text-xs text-muted-foreground">Ø pro Video</span>
                  </div>
                  <p className="text-4xl font-bold">{formatNumber(analysisData.metrics.avgViews)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Views</p>
                </div>

                <div className="glass-card rounded-xl p-6 stat-card">
                  <div className="flex items-center justify-between mb-3">
                    <Share2 className="w-6 h-6 text-green-500" />
                    <span className="text-xs text-muted-foreground">Geschätzt</span>
                  </div>
                  <p className="text-4xl font-bold">{formatNumber(analysisData.metrics.avgShares)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Shares</p>
                </div>

                <div className="glass-card rounded-xl p-6 stat-card">
                  <div className="flex items-center justify-between mb-3">
                    <Bookmark className="w-6 h-6 text-amber-500" />
                    <span className="text-xs text-muted-foreground">Geschätzt</span>
                  </div>
                  <p className="text-4xl font-bold">{formatNumber(analysisData.metrics.avgSaves)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Saves</p>
                </div>

                <div className="glass-card rounded-xl p-6 stat-card">
                  <div className="flex items-center justify-between mb-3">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <span className="text-xs text-muted-foreground">Berechnet</span>
                  </div>
                  <p className="text-4xl font-bold text-primary">{analysisData.metrics.engagementRate.toFixed(2)}%</p>
                  <p className="text-sm text-muted-foreground mt-1">Engagement Rate</p>
                </div>

                <div className="glass-card rounded-xl p-6 stat-card">
                  <div className="flex items-center justify-between mb-3">
                    <Play className="w-6 h-6 text-red-500" />
                    <span className="text-xs text-muted-foreground">Video</span>
                  </div>
                  <p className="text-4xl font-bold">{analysisData.reels.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Reels analysiert</p>
                </div>

                <div className="glass-card rounded-xl p-6 stat-card">
                  <div className="flex items-center justify-between mb-3">
                    <ImageIcon className="w-6 h-6 text-purple-500" />
                    <span className="text-xs text-muted-foreground">Bilder</span>
                  </div>
                  <p className="text-4xl font-bold">{analysisData.posts.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Posts analysiert</p>
                </div>
              </div>

              {/* Follower Growth Chart */}
              <FollowerGrowthChart username={analysisData.profile.username} />

              {/* Daily Growth Chart (Balkendiagramm) */}
              {/* Daily Growth Chart - nutzt die gleichen Daten wie FollowerGrowthChart */}
              {/* Wird jetzt im FollowerGrowthChart integriert angezeigt */}

              {/* Engagement Chart */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Engagement-Verlauf (Woche)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
                      <defs>
                        <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.65 0.25 285)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="oklch(0.65 0.25 285)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="engagement" 
                        stroke="oklch(0.65 0.25 285)" 
                        fill="url(#engagementGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* ==================== SECTION 4: POSTING-ZEIT-ANALYSE ==================== */}
            <section className="space-y-6">
              <SectionHeader
                title="Posting-Zeit-Analyse"
                icon={<Clock className="w-6 h-6 text-purple-400" />}
                isPinned={pinnedSections.has('posting-time')}
                onTogglePin={() => togglePin('posting-time')}
              />
              
              <PostingTimeAnalysis username={analysisData.profile.username} />
            </section>

            {/* ==================== SECTION 5: VIRAL FAKTOREN ==================== */}
            <section className="space-y-6">
              <SectionHeader
                title="Viral Faktoren"
                icon={<Zap className="w-6 h-6 text-accent" />}
                isPinned={pinnedSections.has('viral')}
                onTogglePin={() => togglePin('viral')}
              />
              
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Radar Chart */}
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Viral-Faktoren Übersicht</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                        <Radar
                          name="Score"
                          dataKey="A"
                          stroke="oklch(0.72 0.19 142)"
                          fill="oklch(0.72 0.19 142)"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Factor Details */}
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Faktor-Details</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Hook-Qualität', value: analysisData.viralFactors.hook, icon: <Zap className="w-4 h-4" />, color: 'text-yellow-500' },
                      { name: 'Emotionale Wirkung', value: analysisData.viralFactors.emotion, icon: <Heart className="w-4 h-4" />, color: 'text-pink-500' },
                      { name: 'Teilbarkeit', value: analysisData.viralFactors.shareability, icon: <Share2 className="w-4 h-4" />, color: 'text-green-500' },
                      { name: 'Replay-Wert', value: analysisData.viralFactors.replay, icon: <RefreshCw className="w-4 h-4" />, color: 'text-blue-500' },
                      { name: 'Caption-Qualität', value: analysisData.viralFactors.caption, icon: <Type className="w-4 h-4" />, color: 'text-purple-500' },
                      { name: 'Hashtag-Strategie', value: analysisData.viralFactors.hashtags, icon: <Hash className="w-4 h-4" />, color: 'text-cyan-500' },
                    ].map((factor) => (
                      <div key={factor.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={factor.color}>{factor.icon}</span>
                            <span className="text-sm font-medium">{factor.name}</span>
                          </div>
                          <span className="text-sm font-bold">{factor.value}%</span>
                        </div>
                        <Progress value={factor.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ==================== SECTION 5: EMPFEHLUNGEN ==================== */}
            <section className="space-y-6">
              <SectionHeader
                title="KI-Empfehlungen"
                icon={<CheckCircle2 className="w-6 h-6 text-green-400" />}
                isPinned={pinnedSections.has('recommendations')}
                onTogglePin={() => togglePin('recommendations')}
              />
              
              <div className="glass-card rounded-xl p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {recommendations.map((rec, index) => (
                    <div 
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-lg ${
                        rec.type === 'success' ? 'bg-green-500/10 border border-green-500/20' :
                        rec.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/20' :
                        'bg-red-500/10 border border-red-500/20'
                      }`}
                    >
                      {rec.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      ) : rec.type === 'warning' ? (
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm">{rec.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ==================== SECTION 5.5: CONTENT-PLAN CTA ==================== */}
            <section className="space-y-6">
              <ContentPlanCTA 
                isPro={user?.plan === 'pro' || user?.plan === 'business'}
                username={analysisData.profile.username}
                analysisHighlights={{
                  bestPostingTime: "18:00",
                  viralScore: analysisData.viralScore,
                  avgEngagement: analysisData.metrics.engagementRate
                }}
              />
            </section>

            {/* ==================== SECTION 6: REELS ÜBERSICHT ==================== */}
            {analysisData.reels.length > 0 && (
              <section className="space-y-6">
                <SectionHeader
                  title="Reels Performance"
                  icon={<Play className="w-6 h-6 text-red-500" />}
                  isPinned={pinnedSections.has('reels')}
                  onTogglePin={() => togglePin('reels')}
                  badge={`${analysisData.reels.length} Reels`}
                />
                
                <div className="glass-card rounded-xl p-6">
                  {/* Sortier-Dropdown */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">Sortiert nach: <span className="text-foreground font-medium">{reelSortBy === 'views' ? 'Views' : reelSortBy === 'likes' ? 'Likes' : 'Engagement'}</span></p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setReelSortBy('views')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          reelSortBy === 'views' 
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                        }`}
                      >
                        <Eye className="w-3 h-3 inline mr-1" />Views
                      </button>
                      <button
                        onClick={() => setReelSortBy('likes')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          reelSortBy === 'likes' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                        }`}
                      >
                        <Heart className="w-3 h-3 inline mr-1" />Likes
                      </button>
                      <button
                        onClick={() => setReelSortBy('engagement')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          reelSortBy === 'engagement' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                        }`}
                      >
                        <TrendingUp className="w-3 h-3 inline mr-1" />Engagement
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {(() => {
                      // Berechne durchschnittliche Metriken für Viral-Badge
                      const avgViews = analysisData.reels.reduce((sum, r) => sum + r.viewCount, 0) / analysisData.reels.length;
                      const avgEngagement = analysisData.reels.reduce((sum, r) => sum + (r.viewCount > 0 ? (r.likeCount / r.viewCount) * 100 : 0), 0) / analysisData.reels.length;
                      
                      // Sortiere Reels
                      const sortedReels = [...analysisData.reels].sort((a, b) => {
                        if (reelSortBy === 'views') return b.viewCount - a.viewCount;
                        if (reelSortBy === 'likes') return b.likeCount - a.likeCount;
                        const engA = a.viewCount > 0 ? (a.likeCount / a.viewCount) * 100 : 0;
                        const engB = b.viewCount > 0 ? (b.likeCount / b.viewCount) * 100 : 0;
                        return engB - engA;
                      });
                      
                      return sortedReels.slice(0, 12).map((reel, index) => {
                        const engagement = reel.viewCount > 0 ? (reel.likeCount / reel.viewCount) * 100 : 0;
                        const isViral = reel.viewCount > avgViews * 1.5 || engagement > avgEngagement * 1.3;
                        const reelUrl = reel.shortcode ? `https://www.instagram.com/reel/${reel.shortcode}/` : null;
                        
                        return (
                          <div 
                            key={reel.id || index} 
                            className="relative group cursor-pointer"
                            onClick={() => reelUrl && window.open(reelUrl, '_blank')}
                            title={reelUrl ? 'Klicke um das Reel auf Instagram zu öffnen' : ''}
                          >
                        {/* Viral Badge */}
                        {isViral && (
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
                            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg text-xs animate-pulse">
                              🔥 Viral
                            </Badge>
                          </div>
                        )}
                        {reel.thumbnailUrl ? (
                          <img 
                            src={reel.thumbnailUrl} 
                            alt={`Reel ${index + 1}`}
                            className="w-full aspect-[9/16] object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full aspect-[9/16] bg-muted rounded-lg flex items-center justify-center">
                            <Play className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        
                        {/* Permanentes Performance Overlay - immer sichtbar */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent rounded-b-lg p-3 pt-8">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-white">
                              <span className="flex items-center gap-1.5 text-sm font-semibold">
                                <Eye className="w-4 h-4 text-cyan-400" />
                                {formatNumber(reel.viewCount)}
                              </span>
                              <span className="flex items-center gap-1.5 text-sm font-semibold">
                                <Heart className="w-4 h-4 text-red-400" />
                                {formatNumber(reel.likeCount)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-white/70 text-xs">
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {formatNumber(reel.commentCount)}
                              </span>
                              {reel.viewCount > 0 && (
                                <span className="text-emerald-400 font-medium">
                                  {((reel.likeCount / reel.viewCount) * 100).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Hover Overlay für mehr Details */}
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-3">
                          <Play className="w-10 h-10 text-white mb-3" />
                          <div className="text-center text-white space-y-2">
                            <p className="flex items-center justify-center gap-2 text-lg font-bold">
                              <Eye className="w-5 h-5 text-cyan-400" /> {formatNumber(reel.viewCount)}
                            </p>
                            <p className="flex items-center justify-center gap-2">
                              <Heart className="w-4 h-4 text-red-400" /> {formatNumber(reel.likeCount)}
                            </p>
                            <p className="flex items-center justify-center gap-2 text-sm text-white/70">
                              <MessageSquare className="w-4 h-4" /> {formatNumber(reel.commentCount)} Kommentare
                            </p>
                          </div>
                        </div>
                        
                        {/* Rank Badge */}
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-primary text-white text-xs font-bold shadow-lg">
                            #{index + 1}
                          </Badge>
                        </div>
                        
                        {/* Play Icon + Instagram Link */}
                        <div className="absolute top-2 right-2">
                          <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 transition-all">
                            <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Play className="w-4 h-4 text-white fill-white absolute group-hover:opacity-0 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
                  </div>
                </div>
              </section>
            )}

            {/* ==================== SECTION 7: POST INTERAKTIONEN CHART ==================== */}
            {analysisData.reels.length > 0 && (
              <section className="space-y-6">
                <SectionHeader
                  title="Post Interaktionen Übersicht"
                  icon={<BarChart3 className="w-6 h-6 text-blue-500" />}
                  isPinned={pinnedSections.has('interactions')}
                  onTogglePin={() => togglePin('interactions')}
                />
                <PostInteractionsChart reels={analysisData.reels} />
              </section>
            )}

            {/* ==================== SECTION 8: DETAILLIERTE POST-ANALYSE ==================== */}
            {analysisData.reels.length > 0 && (
              <section className="space-y-6">
                <SectionHeader
                  title="Detaillierte Post-Analyse"
                  icon={<FileText className="w-6 h-6 text-emerald-500" />}
                  isPinned={pinnedSections.has('detailed')}
                  onTogglePin={() => togglePin('detailed')}
                />
                <DetailedPostAnalysis reels={analysisData.reels} />
              </section>
            )}

            {/* ==================== SECTION 9: HASHTAG STATISTIK ==================== */}
            {analysisData.reels.length > 0 && (
              <section className="space-y-6">
                <SectionHeader
                  title="Hashtag Performance"
                  icon={<Hash className="w-6 h-6 text-purple-500" />}
                  isPinned={pinnedSections.has('hashtags')}
                  onTogglePin={() => togglePin('hashtags')}
                />
                <HashtagStatistics reels={analysisData.reels} />
              </section>
            )}

            {/* ==================== SECTION 10: BESTE POSTING-ZEIT ==================== */}
            {analysisData.reels.length > 0 && (
              <section className="space-y-6">
                <SectionHeader
                  title="Beste Posting-Zeit"
                  icon={<Clock className="w-6 h-6 text-cyan-500" />}
                  isPinned={pinnedSections.has('postingtime')}
                  onTogglePin={() => togglePin('postingtime')}
                />
                <BestPostingTime reels={analysisData.reels} />
              </section>
            )}

            {/* ==================== SECTION 11: KI-CAPTION-GENERATOR ==================== */}
            {analysisData.reels.length > 0 && (
              <section className="space-y-6">
                <SectionHeader
                  title="KI-Caption-Generator"
                  icon={<Sparkles className="w-6 h-6 text-purple-500" />}
                  isPinned={pinnedSections.has('captions')}
                  onTogglePin={() => togglePin('captions')}
                  badge="KI"
                />
                <CaptionGenerator 
                  reels={analysisData.reels} 
                  username={analysisData.profile.username}
                  isPremium={!!user}
                />
              </section>
            )}

            {/* ==================== SECTION 12: ACCOUNT-MONITORING ==================== */}
            <section className="space-y-6">
              <SectionHeader
                title="Account-Monitoring"
                icon={<Eye className="w-6 h-6 text-amber-500" />}
                isPinned={pinnedSections.has('monitoring')}
                onTogglePin={() => togglePin('monitoring')}
                badge="KI"
              />
              <AccountMonitoring 
                username={analysisData.profile.username}
                isPremium={!!user}
              />
            </section>

            {/* ==================== SECTION 13: KI-REEL-IDEEN-GENERATOR ==================== */}
            {analysisData.reels.length > 0 && (
              <section className="space-y-6">
                <SectionHeader
                  title="KI-Reel-Ideen-Generator"
                  icon={<Lightbulb className="w-6 h-6 text-purple-500" />}
                  isPinned={pinnedSections.has('ideas')}
                  onTogglePin={() => togglePin('ideas')}
                  badge="KI"
                />
                <ReelIdeasGenerator 
                  reels={analysisData.reels} 
                  username={analysisData.profile.username}
                  isPremium={!!user}
                />
              </section>
            )}

            {/* ==================== PAYWALL FÜR NICHT-PREMIUM NUTZER ==================== */}
            {!user && (
              <AnalysisPaywall 
                username={analysisData.profile.username}
                visibleSections={6}
                totalSections={13}
              />
            )}

            {/* ==================== SECTION 14: POSTS ÜBERSICHT ==================== */}
            {analysisData.posts.length > 0 && (
              <section className="space-y-6">
                <SectionHeader
                  title="Neueste Posts"
                  icon={<ImageIcon className="w-6 h-6 text-purple-500" />}
                  isPinned={pinnedSections.has('posts')}
                  onTogglePin={() => togglePin('posts')}
                  badge={`${analysisData.posts.length} Posts`}
                />
                
                <div className="glass-card rounded-xl p-6">
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {analysisData.posts.slice(0, 12).map((post, index) => (
                      <div key={post.id || index} className="relative group">
                        {post.thumbnailUrl ? (
                          <img 
                            src={post.thumbnailUrl} 
                            alt={`Post ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <div className="text-center text-white text-xs">
                            <p className="flex items-center gap-1"><Heart className="w-3 h-3" /> {formatNumber(post.likeCount)}</p>
                            <p className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {formatNumber(post.commentCount)}</p>
                          </div>
                        </div>
                        {post.isVideo && (
                          <div className="absolute top-2 right-2">
                            <Play className="w-4 h-4 text-white drop-shadow-lg" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Erkenntnisse & Handlungsempfehlungen */}
            {analysisData && (
              <section className="mt-12">
                <SectionHeader 
                  icon={<Lightbulb className="w-5 h-5" />} 
                  title="Erkenntnisse & Handlungsempfehlungen"
                  isPinned={pinnedSections.has('insights')}
                  onTogglePin={() => togglePin('insights')}
                  badge="HAPSS, Ogilvy & Hopkins"
                  badgeColor="bg-amber-500/20 text-amber-400 border border-amber-500/30"
                />
                <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-8">
                  
                  {/* Haupterkenntnisse */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      Haupterkenntnisse
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Viral Score Bewertung */}
                      <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${analysisData.viralScore >= 70 ? 'bg-green-500/20' : analysisData.viralScore >= 40 ? 'bg-amber-500/20' : 'bg-red-500/20'}`}>
                            <Trophy className={`w-5 h-5 ${analysisData.viralScore >= 70 ? 'text-green-400' : analysisData.viralScore >= 40 ? 'text-amber-400' : 'text-red-400'}`} />
                          </div>
                          <div>
                            <p className="font-medium">Viral-Potenzial: {analysisData.viralScore >= 70 ? 'Hoch' : analysisData.viralScore >= 40 ? 'Mittel' : 'Niedrig'}</p>
                            <p className="text-sm text-muted-foreground">
                              {analysisData.viralScore >= 70 
                                ? 'Dein Content hat starkes Viral-Potenzial. Fokussiere auf Konsistenz.'
                                : analysisData.viralScore >= 40
                                ? 'Gutes Fundament vorhanden. Optimiere Hook und Storytelling.'
                                : 'Grundlegende Verbesserungen bei Hook und Engagement nötig.'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Engagement Bewertung */}
                      <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${analysisData.metrics.engagementRate >= 5 ? 'bg-green-500/20' : analysisData.metrics.engagementRate >= 2 ? 'bg-amber-500/20' : 'bg-red-500/20'}`}>
                            <Heart className={`w-5 h-5 ${analysisData.metrics.engagementRate >= 5 ? 'text-green-400' : analysisData.metrics.engagementRate >= 2 ? 'text-amber-400' : 'text-red-400'}`} />
                          </div>
                          <div>
                            <p className="font-medium">Engagement: {analysisData.metrics.engagementRate >= 5 ? 'Überdurchschnittlich' : analysisData.metrics.engagementRate >= 2 ? 'Durchschnittlich' : 'Unter Durchschnitt'}</p>
                            <p className="text-sm text-muted-foreground">
                              {analysisData.metrics.engagementRate >= 5
                                ? 'Exzellente Community-Bindung. Nutze CTAs für mehr Conversions.'
                                : analysisData.metrics.engagementRate >= 2
                                ? 'Solide Basis. Mehr Fragen und CTAs in Captions einbauen.'
                                : 'Fokussiere auf emotionale Hooks und direkte Ansprache.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Priorisierte Handlungsempfehlungen */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-cyan-400" />
                      Priorisierte Handlungsempfehlungen
                    </h3>
                    <div className="space-y-4">
                      {/* Hook Optimierung */}
                      <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-xl p-4 border-l-4 border-primary">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-bold text-sm">1</span>
                          </div>
                          <div>
                            <p className="font-semibold text-primary">Hook-Optimierung (HAPSS-Framework)</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              <strong>H</strong>ook in den ersten 0.5-1.5 Sekunden: Nutze Pattern Interrupts, 
                              kontroverse Aussagen oder überraschende Fakten. 
                              <strong> A</strong>ttention durch visuelle Bewegung halten.
                            </p>
                            <div className="mt-2 p-2 bg-muted/30 rounded-lg text-xs">
                              <span className="text-primary font-medium">Beispiel-Hook:</span> "Das macht 99% falsch bei Instagram..." oder "Stopp! Bevor du scrollst..."
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SEO & Captions */}
                      <div className="bg-gradient-to-r from-cyan-500/10 to-transparent rounded-xl p-4 border-l-4 border-cyan-500">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-cyan-400 font-bold text-sm">2</span>
                          </div>
                          <div>
                            <p className="font-semibold text-cyan-400">SEO-Beschreibungen & Captions (Ogilvy-Methode)</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Schreibe Headlines die <strong>Pain Points</strong> ansprechen. 
                              Nutze die 4U-Formel: <strong>U</strong>rgent, <strong>U</strong>nique, <strong>U</strong>ltra-specific, <strong>U</strong>seful.
                            </p>
                            <div className="mt-2 p-2 bg-muted/30 rounded-lg text-xs">
                              <span className="text-cyan-400 font-medium">Pain Point Keywords:</span> "Frustriert von...", "Müde von...", "Endlich die Lösung für..."
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Storytelling */}
                      <div className="bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl p-4 border-l-4 border-amber-500">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-amber-400 font-bold text-sm">3</span>
                          </div>
                          <div>
                            <p className="font-semibold text-amber-400">Storytelling-Struktur (Hopkins-Prinzip)</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Nutze die <strong>PAS-Formel</strong>: Problem → Agitation → Solution. 
                              Zeige erst das Problem, verstärke den Schmerz, dann präsentiere die Lösung.
                            </p>
                            <div className="mt-2 p-2 bg-muted/30 rounded-lg text-xs">
                              <span className="text-amber-400 font-medium">Struktur:</span> "Ich hatte das gleiche Problem..." → "Es wurde immer schlimmer..." → "Dann entdeckte ich..."
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content-Strategie */}
                      <div className="bg-gradient-to-r from-green-500/10 to-transparent rounded-xl p-4 border-l-4 border-green-500">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-green-400 font-bold text-sm">4</span>
                          </div>
                          <div>
                            <p className="font-semibold text-green-400">Content-Mix & Posting-Strategie</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Idealer Mix: <strong>40% Educational</strong>, <strong>30% Entertainment</strong>, <strong>20% Inspirational</strong>, <strong>10% Promotional</strong>.
                              Poste zu den Zeiten mit höchstem Engagement deiner Zielgruppe.
                            </p>
                            <div className="mt-2 p-2 bg-muted/30 rounded-lg text-xs">
                              <span className="text-green-400 font-medium">Tipp:</span> Teste verschiedene Formate (Talking Head, B-Roll, Text-Overlay) und tracke die Performance.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Wins */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      Quick Wins - Sofort umsetzbar
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-sm">Erste 3 Wörter = Hook</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-sm">CTA am Ende jedes Reels</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-sm">3-5 relevante Hashtags</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-sm">Untertitel aktivieren</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-sm">Fragen in Captions stellen</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-sm">Trending Audio nutzen</span>
                      </div>
                    </div>
                  </div>

                  {/* Dein nächster Schritt */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-primary/20 via-cyan-500/10 to-amber-500/10 rounded-2xl border border-primary/30">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Dein nächster Schritt
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Nutze diese Erkenntnisse von <span className="text-primary font-medium">@{username}</span> als Inspiration für deinen eigenen Content. 
                      Analysiere deinen Account und vergleiche die Strategien.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          const noteContent = `📌 Erkenntnisse von @${username} (${new Date().toLocaleDateString('de-DE')})\n\n` +
                            `🏆 Viral-Score: ${analysisData.viralScore}/100\n` +
                            `❤️ Engagement: ${analysisData.metrics.engagementRate.toFixed(2)}%\n\n` +
                            `💡 Wichtigste Learnings:\n` +
                            `- Hook in den ersten 0.5-1.5 Sekunden (HAPSS)\n` +
                            `- Pain Points in Headlines ansprechen (Ogilvy)\n` +
                            `- PAS-Formel für Storytelling (Hopkins)\n\n` +
                            `⚡ Quick Wins:\n` +
                            `- Erste 3 Wörter = Hook\n` +
                            `- CTA am Ende jedes Reels\n` +
                            `- 3-5 relevante Hashtags`;
                          
                          // Speichere in localStorage für spätere Verwendung im Dashboard
                          const existingNotes = JSON.parse(localStorage.getItem('reelspy_notes') || '[]');
                          existingNotes.unshift({
                            id: Date.now(),
                            username: username,
                            content: noteContent,
                            createdAt: new Date().toISOString(),
                            viralScore: analysisData.viralScore
                          });
                          localStorage.setItem('reelspy_notes', JSON.stringify(existingNotes.slice(0, 50)));
                          
                          // Zeige Erfolgs-Toast
                          alert('✅ Erkenntnisse als Notiz gespeichert! Du findest sie im Dashboard unter "Notizen".');
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors"
                      >
                        <Bookmark className="w-4 h-4" />
                        Als Notiz speichern
                      </button>
                      <button
                        onClick={() => {
                          const myUsername = prompt('Gib deinen Instagram-Username ein (ohne @):');
                          if (myUsername) {
                            window.location.href = `/analysis?username=${myUsername.replace('@', '')}`;
                          }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
                      >
                        <Search className="w-4 h-4" />
                        Meinen Account mit KI analysieren
                      </button>
                      <button
                        onClick={() => {
                          window.location.href = `/dashboard?tab=notes`;
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Meine Notizen ansehen
                      </button>
                    </div>
                    
                    {/* Strategie-Tipps */}
                    <div className="mt-6 p-4 bg-background/50 rounded-xl border border-border/50">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-green-400" />
                        So nutzt du diese Erkenntnisse
                      </h4>
                      <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                        <li><strong>Analysiere deinen Account</strong> und vergleiche deine Metriken mit @{username}</li>
                        <li><strong>Identifiziere Lücken</strong> - Wo performt @{username} besser? Hooks? Engagement?</li>
                        <li><strong>Adaptiere die Strategien</strong> für deine Nische und Zielgruppe</li>
                        <li><strong>Teste und iteriere</strong> - Poste 5-10 Reels mit den neuen Techniken</li>
                        <li><strong>Tracke deinen Fortschritt</strong> - Analysiere erneut nach 2 Wochen</li>
                      </ol>
                    </div>
                  </div>

                </div>
              </section>
            )}

          </motion.div>
        )}
      </main>

      {/* Global Footer */}
      <GlobalFooter />

      {/* CTA Popup after Analysis */}
      <AnalysisCTAPopup
        isOpen={showCTAPopup}
        onClose={() => setShowCTAPopup(false)}
        viralScore={analysisData?.viralScore}
        username={analysisData?.profile.username}
      />
    </div>
  );
}

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
  Video,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import ReelAnalysis from "@/components/ReelAnalysis";
import DeepAnalysis from "@/components/DeepAnalysis";
import FollowerGrowthChart from "@/components/FollowerGrowthChart";
import DailyChannelMetrics from "@/components/DailyChannelMetrics";
import { GrowthAnalysis } from "@/components/GrowthAnalysis";
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
import { SectionNotes } from "@/components/SectionNotes";
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

// Format number with full digits and thousand separators (e.g., 71.874)
const formatNumber = (num: number): string => {
  return num.toLocaleString('de-DE');
};

// Format number with K/M suffix for compact display (e.g., 71,8K)
const formatNumberCompact = (num: number): string => {
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

// Block Navigation Tab
interface BlockTabProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  color: string;
}

const BlockTab = ({ id, label, icon, isActive, onClick, color }: BlockTabProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
      isActive 
        ? `${color} text-white shadow-lg scale-105` 
        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
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
  
  // Block navigation state
  const [activeBlock, setActiveBlock] = useState<'analyse' | 'erkenntnisse' | 'learnings'>('analyse');
  const blockRefs = {
    analyse: useRef<HTMLDivElement>(null),
    erkenntnisse: useRef<HTMLDivElement>(null),
    learnings: useRef<HTMLDivElement>(null)
  };
  
  // Pinned sections state
  const [pinnedSections, setPinnedSections] = useState<Set<string>>(new Set(['ai', 'stats', 'viral']));
  const [reelSortBy, setReelSortBy] = useState<'views' | 'likes' | 'engagement'>('views');
  const [forceRefresh, setForceRefresh] = useState(false);
  
  // Loading timeout states
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [showSlowLoadingMessage, setShowSlowLoadingMessage] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

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

  // Scroll to block
  const scrollToBlock = (block: 'analyse' | 'erkenntnisse' | 'learnings') => {
    setActiveBlock(block);
    blockRefs[block].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    { username: usernameParam, forceRefresh },
    { 
      enabled: !!usernameParam,
      retry: 1,
      staleTime: forceRefresh ? 0 : 5 * 60 * 1000,
    }
  );
  
  // Track loading time and show timeout messages
  useEffect(() => {
    if (isLoading && !loadingStartTime) {
      setLoadingStartTime(Date.now());
      setShowSlowLoadingMessage(false);
      setHasTimedOut(false);
    } else if (!isLoading) {
      setLoadingStartTime(null);
      setShowSlowLoadingMessage(false);
      setHasTimedOut(false);
    }
  }, [isLoading, loadingStartTime]);
  
  // Show slow loading message after 10 seconds, timeout after 45 seconds
  useEffect(() => {
    if (!loadingStartTime || !isLoading) return;
    
    const slowTimer = setTimeout(() => {
      setShowSlowLoadingMessage(true);
    }, 10000); // 10 seconds
    
    const timeoutTimer = setTimeout(() => {
      setHasTimedOut(true);
    }, 45000); // 45 seconds
    
    return () => {
      clearTimeout(slowTimer);
      clearTimeout(timeoutTimer);
    };
  }, [loadingStartTime, isLoading]);
  
  // Reset forceRefresh after data is loaded
  useEffect(() => {
    if (forceRefresh && analysisData && !isLoading) {
      setForceRefresh(false);
    }
  }, [forceRefresh, analysisData, isLoading]);

  // Check if analysis is already saved when user and analysisData are available
  const { data: dashboardData } = trpc.dashboard.getData.useQuery(
    { userId: user?.id || 0 },
    { 
      enabled: !!user?.id && !!analysisData,
      staleTime: 60 * 1000, // 1 minute
    }
  );

  // Update isSaved based on dashboard data
  useEffect(() => {
    if (dashboardData?.savedAnalyses && analysisData) {
      const isAlreadySaved = dashboardData.savedAnalyses.some(
        (saved: any) => saved.username.toLowerCase() === analysisData.profile.username.toLowerCase()
      );
      setIsSaved(isAlreadySaved);
    }
  }, [dashboardData, analysisData]);
  
  const handleRefresh = () => {
    setForceRefresh(true);
    refetch();
  };

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
    }

    return recs;
  }, [analysisData]);

  // Generate weekly engagement data
  const weeklyData = useMemo(() => {
    if (!analysisData) return [];
    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    return days.map(day => ({
      day,
      engagement: Math.round(analysisData.metrics.engagementRate * (0.7 + Math.random() * 0.6) * 100) / 100
    }));
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
                  variant={isSaved ? "outline" : "default"}
                  size="sm"
                  onClick={handleSaveAnalysis}
                  disabled={isSaved || isSaving || !user}
                  className={`h-8 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all ${isSaved 
                    ? 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isSaved ? (
                    <BookmarkCheck className="w-4 h-4" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                  <span className="ml-2">{isSaved ? 'Gespeichert' : 'Speichern'}</span>
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

      {/* Sticky Block Navigation - appears after profile header */}
      {analysisData && (
        <div className="fixed top-14 sm:top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/20">
          <div className="container py-3">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <BlockTab
                id="analyse"
                label="ANALYSE"
                icon={<BarChart3 className="w-4 h-4" />}
                isActive={activeBlock === 'analyse'}
                onClick={() => scrollToBlock('analyse')}
                color="bg-gradient-to-r from-blue-500 to-cyan-500"
              />
              <BlockTab
                id="erkenntnisse"
                label="ERKENNTNISSE"
                icon={<Lightbulb className="w-4 h-4" />}
                isActive={activeBlock === 'erkenntnisse'}
                onClick={() => scrollToBlock('erkenntnisse')}
                color="bg-gradient-to-r from-amber-500 to-orange-500"
              />
              <BlockTab
                id="learnings"
                label="LEARNINGS & IMPULSE"
                icon={<GraduationCap className="w-4 h-4" />}
                isActive={activeBlock === 'learnings'}
                onClick={() => scrollToBlock('learnings')}
                color="bg-gradient-to-r from-green-500 to-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container pt-32 sm:pt-36 pb-12 relative z-10">
        {/* Loading State */}
        {isLoading && !hasTimedOut && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary/30 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="mt-6 text-muted-foreground">Analysiere @{usernameParam}...</p>
            
            {/* Slow loading message */}
            {showSlowLoadingMessage && (
              <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 max-w-md text-center">
                <p className="text-yellow-400 text-sm">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Die Analyse dauert länger als erwartet. Bitte warte noch einen Moment...
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Timeout State */}
        {hasTimedOut && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Analyse-Timeout</h2>
            <p className="text-muted-foreground mb-4">
              Die Instagram API antwortet nicht rechtzeitig. Dies kann an hoher Auslastung liegen.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => {
                setHasTimedOut(false);
                setLoadingStartTime(null);
                refetch();
              }} className="btn-gradient text-white border-0">
                <RefreshCw className="w-4 h-4 mr-2" />
                Erneut versuchen
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/')}
              >
                Zurück zur Startseite
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !hasTimedOut && (
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
                  
                  {/* Refresh Button & Cache Indicator */}
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isLoading || forceRefresh}
                      className="text-xs"
                    >
                      <RefreshCw className={`w-3 h-3 mr-1 ${(isLoading || forceRefresh) ? 'animate-spin' : ''}`} />
                      Aktualisieren
                    </Button>
                    {analysisData.fromCache && (
                      <span className="text-xs text-muted-foreground">
                        Gecached • Klicke zum Aktualisieren
                      </span>
                    )}
                  </div>
                </div>

                {/* Viral Score Circle */}
                <div className="flex flex-col items-center">
                  <CircularProgress value={analysisData.viralScore} size={140} color="viral" />
                  <p className="mt-2 text-sm font-medium text-accent">Viral Score</p>
                </div>
              </div>
            </div>

            {/* ==================== BLOCK 1: ANALYSE ==================== */}
            <div ref={blockRefs.analyse} className="scroll-mt-36">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">ANALYSE</h2>
                  <p className="text-muted-foreground">Rohdaten, Metriken & Charts</p>
                </div>
              </div>

              <div className="space-y-8 pl-0 sm:pl-4 border-l-0 sm:border-l-2 border-blue-500/30">
                {/* AI Reel-Analyse */}
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

                {/* Tiefenanalyse */}
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

                {/* Statistiken & Metriken */}
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
                      <p className="text-lg sm:text-2xl font-bold">{formatNumber(analysisData.metrics.avgComments)}</p>
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
                        <TrendingUp className="w-6 h-6 text-primary" />
                        <span className="text-xs text-muted-foreground">Berechnet</span>
                      </div>
                      <p className="text-4xl font-bold text-primary">{analysisData.metrics.engagementRate.toFixed(2)}%</p>
                      <p className="text-sm text-muted-foreground mt-1">Engagement Rate</p>
                    </div>
                  </div>

                  {/* Daily Channel Metrics - Social Blade Style */}
                  <DailyChannelMetrics 
                    username={analysisData.profile.username}
                    currentFollowers={analysisData.profile.followerCount}
                    currentFollowing={analysisData.profile.followingCount}
                    currentPosts={analysisData.profile.mediaCount}
                  />

                  {/* Follower Growth Chart */}
                  <FollowerGrowthChart username={analysisData.profile.username} />

                  {/* Growth Analysis */}
                  <GrowthAnalysis username={analysisData.profile.username} platform="instagram" />
                </section>

                {/* Posting-Zeit-Analyse */}
                <section className="space-y-6">
                  <SectionHeader
                    title="Posting-Zeit-Analyse"
                    icon={<Clock className="w-6 h-6 text-purple-400" />}
                    isPinned={pinnedSections.has('posting')}
                    onTogglePin={() => togglePin('posting')}
                  />
                  <PostingTimeAnalysis username={analysisData.profile.username} />
                </section>

                {/* Reels Performance */}
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
                      {/* Sortier-Buttons */}
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
                          const avgViews = analysisData.reels.reduce((sum, r) => sum + r.viewCount, 0) / analysisData.reels.length;
                          const avgEngagement = analysisData.reels.reduce((sum, r) => sum + (r.viewCount > 0 ? (r.likeCount / r.viewCount) * 100 : 0), 0) / analysisData.reels.length;
                          
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
                              >
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
                                  </div>
                                </div>
                                
                                <div className="absolute top-2 left-2">
                                  <Badge className="bg-primary text-white text-xs font-bold shadow-lg">
                                    #{index + 1}
                                  </Badge>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </section>
                )}

                {/* Notizen für Block 1 */}
                <SectionNotes 
                  username={analysisData.profile.username} 
                  section="analyse" 
                  title="Meine Notizen zu den Daten"
                />
              </div>
            </div>

            {/* ==================== BLOCK 2: ERKENNTNISSE ==================== */}
            <div ref={blockRefs.erkenntnisse} className="scroll-mt-36">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">ERKENNTNISSE</h2>
                  <p className="text-muted-foreground">KI-Insights, Muster & Viral-Gründe</p>
                </div>
              </div>

              <div className="space-y-8 pl-0 sm:pl-4 border-l-0 sm:border-l-2 border-amber-500/30">
                {/* Haupterkenntnisse */}
                <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-8">
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
                </div>

                {/* Notizen für Block 2 */}
                <SectionNotes 
                  username={analysisData.profile.username} 
                  section="erkenntnisse" 
                  title="Meine Erkenntnisse & Ideen"
                />
              </div>
            </div>

            {/* ==================== BLOCK 3: LEARNINGS & IMPULSE ==================== */}
            <div ref={blockRefs.learnings} className="scroll-mt-36">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">LEARNINGS & IMPULSE</h2>
                  <p className="text-muted-foreground">Persönliche Notizen & Action Items</p>
                </div>
              </div>

              <div className="space-y-8 pl-0 sm:pl-4 border-l-0 sm:border-l-2 border-green-500/30">
                {/* Dein nächster Schritt */}
                <div className="glass-card rounded-2xl p-6 sm:p-8">
                  <div className="p-6 bg-gradient-to-r from-primary/20 via-cyan-500/10 to-amber-500/10 rounded-2xl border border-primary/30">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Dein nächster Schritt
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Nutze diese Erkenntnisse von <span className="text-primary font-medium">@{usernameParam}</span> als Inspiration für deinen eigenen Content. 
                      Analysiere deinen Account und vergleiche die Strategien.
                    </p>
                    
                    {/* Strategie-Tipps */}
                    <div className="p-4 bg-background/50 rounded-xl border border-border/50">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-green-400" />
                        So nutzt du diese Erkenntnisse
                      </h4>
                      <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                        <li><strong>Analysiere deinen Account</strong> und vergleiche deine Metriken mit @{usernameParam}</li>
                        <li><strong>Identifiziere Lücken</strong> - Wo performt @{usernameParam} besser? Hooks? Engagement?</li>
                        <li><strong>Adaptiere die Strategien</strong> für deine Nische und Zielgruppe</li>
                        <li><strong>Teste und iteriere</strong> - Poste 5-10 Reels mit den neuen Techniken</li>
                        <li><strong>Tracke deinen Fortschritt</strong> - Analysiere erneut nach 2 Wochen</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Content-Plan CTA */}
                <ContentPlanCTA 
                  isPro={user?.plan === 'pro' || user?.plan === 'business'}
                  username={analysisData.profile.username}
                  analysisHighlights={{
                    bestPostingTime: "18:00",
                    viralScore: analysisData.viralScore,
                    avgEngagement: analysisData.metrics.engagementRate
                  }}
                />

                {/* Notizen für Block 3 - Hauptnotizen */}
                <SectionNotes 
                  username={analysisData.profile.username} 
                  section="learnings" 
                  title="Meine Learnings & Action Items"
                />

                {/* Quick Actions */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-primary" />
                    Schnelle Aktionen
                  </h3>
                  <div className="flex flex-wrap gap-3">
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
                      Alle meine Notizen ansehen
                    </button>
                    <button
                      onClick={() => {
                        window.location.href = `/compare?account1=${usernameParam}`;
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Mit anderem Account vergleichen
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Paywall für nicht-Premium Nutzer */}
            {!user && (
              <AnalysisPaywall 
                username={analysisData.profile.username}
                visibleSections={6}
                totalSections={13}
              />
            )}

          </motion.div>
        )}
      </main>

      {/* Global Footer */}
      <GlobalFooter />

    </div>
  );
}

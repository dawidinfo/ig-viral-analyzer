import { Button } from "@/components/ui/button";
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
  Flame
} from "lucide-react";
import { useState, useMemo } from "react";
import ReelAnalysis from "@/components/ReelAnalysis";
import DeepAnalysis from "@/components/DeepAnalysis";
import { generateAnalysisPDF } from "@/lib/pdfExport";
import { useLocation, useSearch } from "wouter";
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
  const usernameParam = params.get('username') || '';
  
  const [username, setUsername] = useState(usernameParam);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Pinned sections state
  const [pinnedSections, setPinnedSections] = useState<Set<string>>(new Set(['ai', 'stats', 'viral']));

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
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/")}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
              <img src="/logo.svg" alt="ReelSpy.ai" className="h-8 w-auto" />
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex items-center gap-2 max-w-md flex-1 mx-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="@username analysieren..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                className="pl-10 bg-muted/50 border-border/50 input-glow"
              />
            </div>
            <Button onClick={handleAnalyze} className="btn-gradient text-white border-0">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {analysisData && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveAnalysis}
                  disabled={isSaved || isSaving || !user}
                  className={isSaved ? 'bg-green-500/20 border-green-500/30 text-green-400' : ''}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : isSaved ? (
                    <BookmarkCheck className="w-4 h-4 mr-2" />
                  ) : (
                    <Bookmark className="w-4 h-4 mr-2" />
                  )}
                  {isSaved ? 'Gespeichert' : 'Speichern'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateAnalysisPDF(analysisData)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
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
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary p-1">
                    {analysisData.profile.profilePicUrl ? (
                      <img 
                        src={analysisData.profile.profilePicUrl} 
                        alt={analysisData.profile.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
                        <Users className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
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
                    <h1 className="text-2xl font-bold">@{analysisData.profile.username}</h1>
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
                  <div className="flex flex-wrap justify-center md:justify-start gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatNumber(analysisData.profile.followerCount)}</p>
                      <p className="text-sm text-muted-foreground">Follower</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatNumber(analysisData.profile.followingCount)}</p>
                      <p className="text-sm text-muted-foreground">Following</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{(analysisData.profile as any).postCount || analysisData.posts.length}</p>
                      <p className="text-sm text-muted-foreground">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{analysisData.viralScore}</p>
                      <p className="text-sm text-muted-foreground">Viral Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-accent">{analysisData.metrics.engagementRate.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">Engagement</p>
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
                badge="Hook, Agitate, Problem, Solution, Story"
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
                  <p className="text-4xl font-bold">{formatNumber(analysisData.metrics.avgComments)}</p>
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

            {/* ==================== SECTION 4: VIRAL FAKTOREN ==================== */}
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
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {analysisData.reels.slice(0, 12).map((reel, index) => (
                      <div key={reel.id || index} className="relative group">
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
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-2">
                          <div className="text-center text-white text-xs space-y-1">
                            <p className="flex items-center justify-center gap-1"><Eye className="w-3 h-3" /> {formatNumber(reel.viewCount)}</p>
                            <p className="flex items-center justify-center gap-1"><Heart className="w-3 h-3" /> {formatNumber(reel.likeCount)}</p>
                            <p className="flex items-center justify-center gap-1"><MessageSquare className="w-3 h-3" /> {formatNumber(reel.commentCount)}</p>
                          </div>
                        </div>
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-black/60 text-white text-xs">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ==================== SECTION 7: POSTS ÜBERSICHT ==================== */}
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

          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50 relative z-10">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 ReelSpy.ai. Live-Daten von Instagram.</p>
        </div>
      </footer>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ImageIcon
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import ReelAnalysis from "@/components/ReelAnalysis";
import { useLocation, useSearch } from "wouter";
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

export default function Analysis() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const usernameParam = params.get('username') || '';
  
  const [username, setUsername] = useState(usernameParam);

  // Fetch Instagram analysis data
  const { data: analysisData, isLoading, error, refetch } = trpc.instagram.analyze.useQuery(
    { username: usernameParam },
    { 
      enabled: !!usernameParam,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
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
    
    // Engagement rate analysis
    if (analysisData.metrics.engagementRate > 3) {
      recs.push({ type: 'success', text: `Überdurchschnittliche Engagement-Rate von ${analysisData.metrics.engagementRate.toFixed(1)}%` });
    } else if (analysisData.metrics.engagementRate > 1) {
      recs.push({ type: 'warning', text: `Engagement-Rate von ${analysisData.metrics.engagementRate.toFixed(1)}% - Raum für Verbesserung` });
    } else {
      recs.push({ type: 'error', text: `Niedrige Engagement-Rate von ${analysisData.metrics.engagementRate.toFixed(1)}% - Strategie überdenken` });
    }

    // Viral score analysis
    if (analysisData.viralScore >= 70) {
      recs.push({ type: 'success', text: 'Hoher Viral Score - Content hat großes Potenzial' });
    } else if (analysisData.viralScore >= 50) {
      recs.push({ type: 'warning', text: 'Mittlerer Viral Score - Hook und Emotionen verbessern' });
    }

    // Reels analysis
    if (analysisData.reels.length > 0) {
      recs.push({ type: 'success', text: `${analysisData.reels.length} Reels analysiert - Video-Content aktiv` });
    } else {
      recs.push({ type: 'warning', text: 'Keine Reels gefunden - Reels können Reichweite steigern' });
    }

    // Caption analysis
    if (analysisData.viralFactors.caption >= 70) {
      recs.push({ type: 'success', text: 'Starke Caption-Qualität mit guten CTAs' });
    } else {
      recs.push({ type: 'warning', text: 'Captions optimieren - Mehr Hooks und CTAs einbauen' });
    }

    // Hashtag analysis
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

  // Weekly engagement data (simulated based on real metrics)
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

          <div className="hidden md:block" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 relative z-10">
        <div className="container">
          {/* Loading State */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Sparkles className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-muted-foreground mt-6">Analysiere @{usernameParam}...</p>
                <p className="text-sm text-muted-foreground/60 mt-2">Lade Live-Daten von Instagram</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error State */}
          {error && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-32"
            >
              <div className="w-24 h-24 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-12 h-12 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Fehler bei der Analyse</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {error.message || 'Der Account konnte nicht analysiert werden. Bitte überprüfe den Username.'}
              </p>
              <Button onClick={() => refetch()} className="btn-gradient text-white border-0">
                <RefreshCw className="w-4 h-4 mr-2" />
                Erneut versuchen
              </Button>
            </motion.div>
          )}

          {/* No Data State */}
          {!isLoading && !analysisData && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-32"
            >
              <div className="w-24 h-24 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Account analysieren</h2>
              <p className="text-muted-foreground mb-6">
                Gib einen Instagram-Username ein, um die Analyse zu starten.
              </p>
            </motion.div>
          )}

          {/* Analysis Results */}
          {!isLoading && analysisData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Profile Header */}
              <div className="glass-card rounded-2xl p-6 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Profile Picture */}
                  <div className="relative">
                    {analysisData.profile.profilePicUrl ? (
                      <img 
                        src={analysisData.profile.profilePicUrl} 
                        alt={analysisData.profile.username}
                        className="w-24 h-24 rounded-2xl object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Users className="w-10 h-10 text-white" />
                      </div>
                    )}
                    {analysisData.profile.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold">@{analysisData.profile.username}</h1>
                      {analysisData.profile.isBusinessAccount && (
                        <Badge variant="secondary">Business</Badge>
                      )}
                      {analysisData.isDemo ? (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/10">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Demo-Daten
                        </Badge>
                      ) : (
                        <Badge className="badge-neon">Live-Daten</Badge>
                      )}
                    </div>
                    <p className="text-lg text-muted-foreground mb-2">{analysisData.profile.fullName}</p>
                    <p className="text-sm text-muted-foreground max-w-xl">{analysisData.profile.biography}</p>
                    {analysisData.profile.externalUrl && (
                      <a 
                        href={analysisData.profile.externalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {analysisData.profile.externalUrl}
                      </a>
                    )}
                  </div>

                  {/* Viral Score */}
                  <div className="flex flex-col items-center">
                    <CircularProgress value={analysisData.viralScore} size={100} color="viral" />
                    <p className="text-sm text-muted-foreground mt-2">Viral Score</p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gradient">{formatNumber(analysisData.profile.followerCount)}</p>
                    <p className="text-sm text-muted-foreground">Follower</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatNumber(analysisData.profile.followingCount)}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatNumber(analysisData.profile.mediaCount)}</p>
                    <p className="text-sm text-muted-foreground">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{analysisData.metrics.engagementRate.toFixed(2)}%</p>
                    <p className="text-sm text-muted-foreground">Engagement</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="glass-card p-1 h-auto flex-wrap">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Übersicht
                  </TabsTrigger>
                  <TabsTrigger value="engagement" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Heart className="w-4 h-4 mr-2" />
                    Engagement
                  </TabsTrigger>
                  <TabsTrigger value="reels" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Play className="w-4 h-4 mr-2" />
                    Reels
                  </TabsTrigger>
                  <TabsTrigger value="viral" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Zap className="w-4 h-4 mr-2" />
                    Viral Faktoren
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Analyse
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Metric Cards */}
                    <div className="glass-card rounded-xl p-5 stat-card">
                      <div className="flex items-center justify-between mb-3">
                        <Heart className="w-5 h-5 text-pink-500" />
                        <span className="text-xs text-muted-foreground">Ø pro Post</span>
                      </div>
                      <p className="text-3xl font-bold">{formatNumber(analysisData.metrics.avgLikes)}</p>
                      <p className="text-sm text-muted-foreground">Likes</p>
                    </div>

                    <div className="glass-card rounded-xl p-5 stat-card">
                      <div className="flex items-center justify-between mb-3">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        <span className="text-xs text-muted-foreground">Ø pro Post</span>
                      </div>
                      <p className="text-3xl font-bold">{formatNumber(analysisData.metrics.avgComments)}</p>
                      <p className="text-sm text-muted-foreground">Kommentare</p>
                    </div>

                    <div className="glass-card rounded-xl p-5 stat-card">
                      <div className="flex items-center justify-between mb-3">
                        <Eye className="w-5 h-5 text-cyan-500" />
                        <span className="text-xs text-muted-foreground">Ø pro Video</span>
                      </div>
                      <p className="text-3xl font-bold">{formatNumber(analysisData.metrics.avgViews)}</p>
                      <p className="text-sm text-muted-foreground">Views</p>
                    </div>

                    <div className="glass-card rounded-xl p-5 stat-card">
                      <div className="flex items-center justify-between mb-3">
                        <Share2 className="w-5 h-5 text-green-500" />
                        <span className="text-xs text-muted-foreground">Geschätzt</span>
                      </div>
                      <p className="text-3xl font-bold">{formatNumber(analysisData.metrics.avgShares)}</p>
                      <p className="text-sm text-muted-foreground">Shares</p>
                    </div>

                    <div className="glass-card rounded-xl p-5 stat-card">
                      <div className="flex items-center justify-between mb-3">
                        <Bookmark className="w-5 h-5 text-yellow-500" />
                        <span className="text-xs text-muted-foreground">Geschätzt</span>
                      </div>
                      <p className="text-3xl font-bold">{formatNumber(analysisData.metrics.avgSaves)}</p>
                      <p className="text-sm text-muted-foreground">Saves</p>
                    </div>

                    <div className="glass-card rounded-xl p-5 stat-card">
                      <div className="flex items-center justify-between mb-3">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                        <span className="text-xs text-muted-foreground">Gesamt</span>
                      </div>
                      <p className="text-3xl font-bold text-gradient">{analysisData.metrics.engagementRate.toFixed(2)}%</p>
                      <p className="text-sm text-muted-foreground">Engagement Rate</p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Empfehlungen
                    </h3>
                    <div className="space-y-3">
                      {recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                          {rec.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />}
                          {rec.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />}
                          {rec.type === 'error' && <XCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                          <p className="text-sm">{rec.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Engagement Tab */}
                <TabsContent value="engagement" className="space-y-6">
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Engagement-Trend (Woche)</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyData}>
                          <defs>
                            <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="oklch(0.65 0.25 285)" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="oklch(0.65 0.25 285)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.1)" />
                          <XAxis dataKey="day" stroke="oklch(0.7 0 0)" />
                          <YAxis stroke="oklch(0.7 0 0)" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'oklch(0.15 0.02 285)', 
                              border: '1px solid oklch(1 0 0 / 0.1)',
                              borderRadius: '8px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="engagement" 
                            stroke="oklch(0.65 0.25 285)" 
                            fillOpacity={1} 
                            fill="url(#colorEngagement)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Engagement Breakdown */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="glass-card rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Engagement-Verteilung</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Likes</span>
                            <span>{formatNumber(analysisData.metrics.avgLikes)}</span>
                          </div>
                          <Progress value={80} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Kommentare</span>
                            <span>{formatNumber(analysisData.metrics.avgComments)}</span>
                          </div>
                          <Progress value={45} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Shares</span>
                            <span>{formatNumber(analysisData.metrics.avgShares)}</span>
                          </div>
                          <Progress value={25} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Saves</span>
                            <span>{formatNumber(analysisData.metrics.avgSaves)}</span>
                          </div>
                          <Progress value={30} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <div className="glass-card rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Engagement-Qualität</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm">Kommentar-zu-Like Ratio</span>
                          <span className="font-mono font-bold">
                            {analysisData.metrics.avgLikes > 0 
                              ? ((analysisData.metrics.avgComments / analysisData.metrics.avgLikes) * 100).toFixed(1) 
                              : 0}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm">Engagement pro Follower</span>
                          <span className="font-mono font-bold">
                            {((analysisData.metrics.avgLikes + analysisData.metrics.avgComments) / analysisData.profile.followerCount * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm">Durchschnittliche Interaktionen</span>
                          <span className="font-mono font-bold">
                            {formatNumber(analysisData.metrics.avgLikes + analysisData.metrics.avgComments)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Reels Tab */}
                <TabsContent value="reels" className="space-y-6">
                  {analysisData.reels.length > 0 ? (
                    <>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="glass-card rounded-xl p-5 stat-card">
                          <Play className="w-5 h-5 text-pink-500 mb-3" />
                          <p className="text-3xl font-bold">{analysisData.reels.length}</p>
                          <p className="text-sm text-muted-foreground">Reels analysiert</p>
                        </div>
                        <div className="glass-card rounded-xl p-5 stat-card">
                          <Eye className="w-5 h-5 text-cyan-500 mb-3" />
                          <p className="text-3xl font-bold">
                            {formatNumber(analysisData.reels.reduce((sum, r) => sum + r.playCount, 0) / analysisData.reels.length)}
                          </p>
                          <p className="text-sm text-muted-foreground">Ø Views</p>
                        </div>
                        <div className="glass-card rounded-xl p-5 stat-card">
                          <Heart className="w-5 h-5 text-pink-500 mb-3" />
                          <p className="text-3xl font-bold">
                            {formatNumber(analysisData.reels.reduce((sum, r) => sum + r.likeCount, 0) / analysisData.reels.length)}
                          </p>
                          <p className="text-sm text-muted-foreground">Ø Likes</p>
                        </div>
                        <div className="glass-card rounded-xl p-5 stat-card">
                          <MessageSquare className="w-5 h-5 text-blue-500 mb-3" />
                          <p className="text-3xl font-bold">
                            {formatNumber(analysisData.reels.reduce((sum, r) => sum + r.commentCount, 0) / analysisData.reels.length)}
                          </p>
                          <p className="text-sm text-muted-foreground">Ø Kommentare</p>
                        </div>
                      </div>

                      {/* Reels Grid */}
                      <div className="glass-card rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Neueste Reels</h3>
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
                                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <div className="text-center text-white text-xs">
                                  <p className="font-bold">{formatNumber(reel.playCount)} Views</p>
                                  <p>{formatNumber(reel.likeCount)} Likes</p>
                                </div>
                              </div>
                              <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs bg-black/50 px-2 py-1 rounded">
                                <Play className="w-3 h-3" />
                                {formatNumber(reel.playCount)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="glass-card rounded-xl p-12 text-center">
                      <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Keine Reels gefunden</h3>
                      <p className="text-muted-foreground">
                        Dieser Account hat keine öffentlichen Reels oder sie konnten nicht geladen werden.
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Viral Factors Tab */}
                <TabsContent value="viral" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Radar Chart */}
                    <div className="glass-card rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Viral-Faktoren Analyse</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="oklch(1 0 0 / 0.1)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'oklch(0.7 0 0)', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'oklch(0.5 0 0)' }} />
                            <Radar
                              name="Score"
                              dataKey="A"
                              stroke="oklch(0.72 0.19 142)"
                              fill="oklch(0.72 0.19 142)"
                              fillOpacity={0.3}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Factor Breakdown */}
                    <div className="glass-card rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Faktor-Details</h3>
                      <div className="space-y-4">
                        {radarData.map((factor, index) => (
                          <div key={index}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{factor.subject}</span>
                              <span className="font-mono font-bold">{factor.A}/100</span>
                            </div>
                            <Progress 
                              value={factor.A} 
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 p-4 rounded-lg bg-muted/30">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-accent" />
                          Gesamter Viral Score
                        </h4>
                        <div className="flex items-center gap-4">
                          <div className="text-4xl font-bold text-gradient">{analysisData.viralScore}</div>
                          <div className="text-sm text-muted-foreground">
                            {analysisData.viralScore >= 70 && "Hohes Viral-Potenzial"}
                            {analysisData.viralScore >= 50 && analysisData.viralScore < 70 && "Mittleres Viral-Potenzial"}
                            {analysisData.viralScore < 50 && "Verbesserungspotenzial"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* AI Analysis Tab */}
                <TabsContent value="ai" className="space-y-6">
                  <ReelAnalysis username={analysisData.profile.username} />
                </TabsContent>
              </Tabs>

              {/* Recent Posts */}
              {analysisData.posts.length > 0 && (
                <div className="glass-card rounded-xl p-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Neueste Posts</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {analysisData.posts.slice(0, 6).map((post, index) => (
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
              )}
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border/50 relative z-10">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 ReelSpy.ai. Live-Daten von Instagram.</p>
        </div>
      </footer>
    </div>
  );
}

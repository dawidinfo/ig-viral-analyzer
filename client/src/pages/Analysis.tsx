import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
  ExternalLink
} from "lucide-react";
import { useState, useEffect } from "react";
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

// Generate demo data based on username
const generateDemoData = (username: string) => {
  const seed = username.length * 7;
  const baseEngagement = 3 + (seed % 7);
  const baseFollowers = 10000 + (seed * 1234) % 500000;
  
  return {
    profile: {
      username: `@${username}`,
      fullName: username.charAt(0).toUpperCase() + username.slice(1).replace(/_/g, ' '),
      followers: baseFollowers,
      following: Math.floor(baseFollowers * 0.1),
      posts: 150 + (seed % 300),
      bio: "Content Creator | Lifestyle | Travel ✨",
      avgEngagement: baseEngagement.toFixed(1),
      viralScore: 60 + (seed % 35),
    },
    engagement: {
      rate: baseEngagement,
      likes: Math.floor(baseFollowers * baseEngagement / 100),
      comments: Math.floor(baseFollowers * baseEngagement / 500),
      shares: Math.floor(baseFollowers * baseEngagement / 1000),
      saves: Math.floor(baseFollowers * baseEngagement / 800),
    },
    reels: {
      totalViews: baseFollowers * 15,
      avgWatchTime: 12 + (seed % 20),
      completionRate: 35 + (seed % 40),
      replayRate: 8 + (seed % 15),
    },
    caption: {
      avgLength: 150 + (seed % 200),
      avgHashtags: 8 + (seed % 15),
      avgEmojis: 3 + (seed % 8),
      hookScore: 60 + (seed % 35),
      ctaPresence: 70 + (seed % 25),
    },
    weeklyData: [
      { day: 'Mo', engagement: baseEngagement - 1 + Math.random() * 2, views: baseFollowers * 0.8 },
      { day: 'Di', engagement: baseEngagement - 0.5 + Math.random() * 2, views: baseFollowers * 0.9 },
      { day: 'Mi', engagement: baseEngagement + Math.random() * 2, views: baseFollowers * 1.0 },
      { day: 'Do', engagement: baseEngagement + 0.5 + Math.random() * 2, views: baseFollowers * 1.1 },
      { day: 'Fr', engagement: baseEngagement + 1 + Math.random() * 2, views: baseFollowers * 1.3 },
      { day: 'Sa', engagement: baseEngagement + 1.5 + Math.random() * 2, views: baseFollowers * 1.5 },
      { day: 'So', engagement: baseEngagement + 1 + Math.random() * 2, views: baseFollowers * 1.4 },
    ],
    viralFactors: [
      { factor: 'Hook', score: 60 + (seed % 35), max: 100 },
      { factor: 'Emotionen', score: 55 + (seed % 40), max: 100 },
      { factor: 'Teilbarkeit', score: 65 + (seed % 30), max: 100 },
      { factor: 'Replay', score: 50 + (seed % 45), max: 100 },
      { factor: 'Caption', score: 70 + (seed % 25), max: 100 },
      { factor: 'Hashtags', score: 60 + (seed % 35), max: 100 },
    ],
    topHashtags: [
      { tag: '#lifestyle', reach: '2.5M', usage: 45 },
      { tag: '#motivation', reach: '1.8M', usage: 38 },
      { tag: '#travel', reach: '3.2M', usage: 32 },
      { tag: '#fitness', reach: '2.1M', usage: 28 },
      { tag: '#photography', reach: '1.5M', usage: 22 },
    ],
    recommendations: [
      { type: 'success', text: 'Gute Hashtag-Strategie mit relevanten Tags' },
      { type: 'success', text: 'Konsistente Posting-Frequenz' },
      { type: 'warning', text: 'Hook in den ersten 3 Sekunden verbessern' },
      { type: 'warning', text: 'Mehr CTAs in Captions einbauen' },
      { type: 'error', text: 'Engagement-Rate unter Branchendurchschnitt' },
    ],
  };
};

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
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ReturnType<typeof generateDemoData> | null>(null);

  useEffect(() => {
    if (usernameParam) {
      setIsLoading(true);
      setTimeout(() => {
        setData(generateDemoData(usernameParam));
        setIsLoading(false);
      }, 2000);
    }
  }, [usernameParam]);

  const handleAnalyze = () => {
    if (username.trim()) {
      const cleanUsername = username.replace('@', '');
      setLocation(`/analysis?username=${encodeURIComponent(cleanUsername)}`);
    }
  };

  const radarData = data?.viralFactors.map(f => ({
    subject: f.factor,
    A: f.score,
    fullMark: f.max,
  })) || [];

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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg hidden sm:block">IG Viral Analyzer</span>
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
                <p className="text-sm text-muted-foreground/60 mt-2">KI wertet Daten aus</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* No Data State */}
          {!isLoading && !data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-32"
            >
              <div className="w-24 h-24 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Kein Account ausgewählt</h2>
              <p className="text-muted-foreground mb-8">Gib einen Instagram-Username ein, um die Analyse zu starten</p>
              <div className="flex gap-2 justify-center max-w-md mx-auto">
                <Input
                  type="text"
                  placeholder="@username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  className="bg-muted/50 border-border/50"
                />
                <Button onClick={handleAnalyze} className="btn-gradient text-white border-0">
                  Analysieren
                </Button>
              </div>
            </motion.div>
          )}

          {/* Analysis Results */}
          {!isLoading && data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Profile Header */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold glow-purple">
                      {data.profile.username.charAt(1).toUpperCase()}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{data.profile.username}</h1>
                      <p className="text-muted-foreground">{data.profile.fullName}</p>
                      <p className="text-sm text-muted-foreground/60 mt-1">{data.profile.bio}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold font-mono">{formatNumber(data.profile.followers)}</p>
                      <p className="text-xs text-muted-foreground">Follower</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold font-mono">{data.profile.posts}</p>
                      <p className="text-xs text-muted-foreground">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold font-mono text-gradient-viral">{data.profile.avgEngagement}%</p>
                      <p className="text-xs text-muted-foreground">Engagement</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Viral Score Card */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                  <Badge className="badge-neon mb-4">VIRAL SCORE</Badge>
                  <CircularProgress value={data.profile.viralScore} size={140} color="viral" />
                  <p className="text-sm text-muted-foreground mt-4">
                    {data.profile.viralScore >= 80 ? 'Exzellent! Hohe Viralitäts-Chance' :
                     data.profile.viralScore >= 60 ? 'Gut! Optimierungspotenzial vorhanden' :
                     'Verbesserungen empfohlen'}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Likes', value: formatNumber(data.engagement.likes), icon: <Heart className="w-5 h-5" />, color: 'text-red-400' },
                    { label: 'Comments', value: formatNumber(data.engagement.comments), icon: <MessageSquare className="w-5 h-5" />, color: 'text-blue-400' },
                    { label: 'Shares', value: formatNumber(data.engagement.shares), icon: <Share2 className="w-5 h-5" />, color: 'text-green-400' },
                    { label: 'Saves', value: formatNumber(data.engagement.saves), icon: <Bookmark className="w-5 h-5" />, color: 'text-purple-400' },
                    { label: 'Views', value: formatNumber(data.reels.totalViews), icon: <Eye className="w-5 h-5" />, color: 'text-cyan-400' },
                    { label: 'Watch Time', value: `${data.reels.avgWatchTime}s`, icon: <Clock className="w-5 h-5" />, color: 'text-yellow-400' },
                    { label: 'Completion', value: `${data.reels.completionRate}%`, icon: <Play className="w-5 h-5" />, color: 'text-pink-400' },
                    { label: 'Replay', value: `${data.reels.replayRate}%`, icon: <RefreshCw className="w-5 h-5" />, color: 'text-orange-400' },
                  ].map((stat, index) => (
                    <div key={index} className="glass-card rounded-xl p-4 stat-card">
                      <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                      <p className="text-xl font-bold font-mono">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="glass-card p-1 h-auto flex-wrap">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    Übersicht
                  </TabsTrigger>
                  <TabsTrigger value="engagement" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    Engagement
                  </TabsTrigger>
                  <TabsTrigger value="reels" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    Reels
                  </TabsTrigger>
                  <TabsTrigger value="captions" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    Captions
                  </TabsTrigger>
                  <TabsTrigger value="viral" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    Viral Faktoren
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Engagement Trend */}
                    <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Engagement Trend
                          </h3>
                          <p className="text-sm text-muted-foreground">Letzte 7 Tage</p>
                        </div>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data.weeklyData}>
                            <defs>
                              <linearGradient id="engGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="oklch(0.65 0.25 285)" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="oklch(0.65 0.25 285)" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 260 / 0.3)" />
                            <XAxis dataKey="day" stroke="oklch(0.65 0.01 260)" fontSize={12} />
                            <YAxis stroke="oklch(0.65 0.01 260)" fontSize={12} tickFormatter={(v) => `${v.toFixed(1)}%`} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'oklch(0.14 0.015 260)', 
                                border: '1px solid oklch(0.25 0.02 260 / 0.5)',
                                borderRadius: '8px',
                                color: 'white'
                              }}
                              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Engagement']}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="engagement" 
                              stroke="oklch(0.65 0.25 285)" 
                              strokeWidth={2}
                              fill="url(#engGradient)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Viral Score Radar */}
                    <div className="glass-card rounded-2xl p-6">
                      <h3 className="font-semibold flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-accent" />
                        Viral Faktoren
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="oklch(0.25 0.02 260 / 0.5)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'oklch(0.65 0.01 260)' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: 'oklch(0.65 0.01 260)' }} />
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
                  </div>

                  {/* Recommendations */}
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-primary" />
                      Empfehlungen
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {data.recommendations.map((rec, index) => (
                        <div 
                          key={index}
                          className={`flex items-start gap-3 p-4 rounded-xl ${
                            rec.type === 'success' ? 'bg-green-500/10 border border-green-500/20' :
                            rec.type === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/20' : 
                            'bg-red-500/10 border border-red-500/20'
                          }`}
                        >
                          {rec.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />}
                          {rec.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />}
                          {rec.type === 'error' && <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
                          <span className="text-sm">{rec.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Engagement Tab */}
                <TabsContent value="engagement" className="space-y-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Likes', value: data.engagement.likes, icon: <Heart className="w-6 h-6" />, color: 'from-red-500/20 to-red-600/20', textColor: 'text-red-400' },
                      { label: 'Comments', value: data.engagement.comments, icon: <MessageSquare className="w-6 h-6" />, color: 'from-blue-500/20 to-blue-600/20', textColor: 'text-blue-400' },
                      { label: 'Shares', value: data.engagement.shares, icon: <Share2 className="w-6 h-6" />, color: 'from-green-500/20 to-green-600/20', textColor: 'text-green-400' },
                      { label: 'Saves', value: data.engagement.saves, icon: <Bookmark className="w-6 h-6" />, color: 'from-purple-500/20 to-purple-600/20', textColor: 'text-purple-400' },
                    ].map((metric, index) => (
                      <div key={index} className="glass-card rounded-2xl p-6 stat-card">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center ${metric.textColor} mb-4`}>
                          {metric.icon}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{metric.label} pro Post</p>
                        <p className="text-3xl font-bold font-mono">{formatNumber(metric.value)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="font-semibold mb-4">Engagement Rate Berechnung</h3>
                    <div className="bg-muted/30 rounded-xl p-4 font-mono text-sm mb-6">
                      <p className="text-muted-foreground mb-2">Formel:</p>
                      <p className="mb-4">(Likes + Comments + Shares + Saves) / Followers × 100</p>
                      <p className="text-muted-foreground mb-2">Berechnung:</p>
                      <p>({formatNumber(data.engagement.likes)} + {formatNumber(data.engagement.comments)} + {formatNumber(data.engagement.shares)} + {formatNumber(data.engagement.saves)}) / {formatNumber(data.profile.followers)} × 100</p>
                      <p className="mt-4 text-3xl font-bold text-gradient">= {data.engagement.rate.toFixed(2)}%</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">Benchmark Vergleich</p>
                      <div className="space-y-4">
                        {[
                          { label: 'Deine Rate', value: data.engagement.rate, color: 'bg-primary' },
                          { label: 'Durchschnitt', value: 3.0, color: 'bg-muted-foreground/50' },
                          { label: 'Top Performer', value: 8.0, color: 'bg-accent' },
                        ].map((item, index) => (
                          <div key={index}>
                            <div className="flex justify-between text-sm mb-2">
                              <span>{item.label}</span>
                              <span className="font-mono">{item.value.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                                style={{ width: `${Math.min(item.value * 10, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Reels Tab */}
                <TabsContent value="reels" className="space-y-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Views', value: formatNumber(data.reels.totalViews), icon: <Eye className="w-6 h-6" /> },
                      { label: 'Avg. Watch Time', value: `${data.reels.avgWatchTime}s`, icon: <Clock className="w-6 h-6" /> },
                      { label: 'Completion Rate', value: `${data.reels.completionRate}%`, icon: <Play className="w-6 h-6" /> },
                      { label: 'Replay Rate', value: `${data.reels.replayRate}%`, icon: <RefreshCw className="w-6 h-6" /> },
                    ].map((metric, index) => (
                      <div key={index} className="glass-card rounded-2xl p-6 stat-card">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary mb-4">
                          {metric.icon}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                        <p className="text-3xl font-bold font-mono">{metric.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="font-semibold flex items-center gap-2 mb-6">
                      <Play className="w-5 h-5 text-primary" />
                      Reels Performance Analyse
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm">Watch-Through Rate</span>
                            <span className="font-mono text-sm">{data.reels.completionRate}%</span>
                          </div>
                          <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                              style={{ width: `${data.reels.completionRate}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {data.reels.completionRate >= 50 ? '✓ Überdurchschnittlich' : '⚠ Verbesserungspotenzial'}
                          </p>
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm">Replay Rate</span>
                            <span className="font-mono text-sm">{data.reels.replayRate}%</span>
                          </div>
                          <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-accent to-secondary rounded-full"
                              style={{ width: `${data.reels.replayRate * 5}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {data.reels.replayRate >= 15 ? '✓ Hoher Replay-Wert' : 'Durchschnittlich'}
                          </p>
                        </div>
                      </div>
                      <div className="bg-muted/20 rounded-xl p-4">
                        <h4 className="font-semibold mb-3">Optimierungstipps</h4>
                        <ul className="text-sm text-muted-foreground space-y-2">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                            Hook in den ersten 0.5-3 Sekunden optimieren
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                            Untertitel hinzufügen für höhere Watch-Time
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                            Trending Audio verwenden
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                            Loop-fähige Endings erstellen
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Captions Tab */}
                <TabsContent value="captions" className="space-y-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Avg. Länge', value: `${data.caption.avgLength}`, unit: 'Zeichen', icon: <Type className="w-6 h-6" /> },
                      { label: 'Avg. Hashtags', value: data.caption.avgHashtags, unit: 'Tags', icon: <Hash className="w-6 h-6" /> },
                      { label: 'Hook Score', value: data.caption.hookScore, unit: '/100', icon: <Zap className="w-6 h-6" /> },
                      { label: 'CTA Präsenz', value: data.caption.ctaPresence, unit: '%', icon: <Target className="w-6 h-6" /> },
                    ].map((metric, index) => (
                      <div key={index} className="glass-card rounded-2xl p-6 stat-card">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary mb-4">
                          {metric.icon}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                        <p className="text-3xl font-bold font-mono">
                          {metric.value}
                          <span className="text-lg text-muted-foreground">{metric.unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="glass-card rounded-2xl p-6">
                      <h3 className="font-semibold flex items-center gap-2 mb-4">
                        <Hash className="w-5 h-5 text-primary" />
                        Top Hashtags
                      </h3>
                      <div className="space-y-3">
                        {data.topHashtags.map((tag, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                            <span className="font-mono text-primary">{tag.tag}</span>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Reichweite: {tag.reach}</span>
                              <span className="font-mono">{tag.usage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6">
                      <h3 className="font-semibold flex items-center gap-2 mb-4">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        Caption Qualität
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm">Hook Qualität</span>
                            <span className="font-mono text-sm">{data.caption.hookScore}%</span>
                          </div>
                          <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                              style={{ width: `${data.caption.hookScore}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm">CTA Effektivität</span>
                            <span className="font-mono text-sm">{data.caption.ctaPresence}%</span>
                          </div>
                          <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-accent to-secondary rounded-full"
                              style={{ width: `${data.caption.ctaPresence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 bg-muted/20 rounded-xl">
                        <h4 className="font-semibold text-sm mb-2">Caption Best Practices</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Starker Hook in der ersten Zeile</li>
                          <li>• 150-300 Zeichen optimal</li>
                          <li>• 5-10 relevante Hashtags</li>
                          <li>• Klarer CTA am Ende</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Viral Factors Tab */}
                <TabsContent value="viral" className="space-y-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="glass-card rounded-2xl p-6">
                      <h3 className="font-semibold flex items-center gap-2 mb-6">
                        <Zap className="w-5 h-5 text-accent" />
                        Viral Score Breakdown
                      </h3>
                      <div className="space-y-4">
                        {data.viralFactors.map((factor, index) => (
                          <div key={index}>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">{factor.factor}</span>
                              <span className={`font-mono text-sm ${
                                factor.score >= 80 ? 'text-green-400' :
                                factor.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {factor.score}/{factor.max}
                              </span>
                            </div>
                            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  factor.score >= 80 ? 'bg-green-500' :
                                  factor.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${factor.score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Gesamt Viral Score</span>
                          <span className="text-3xl font-bold text-gradient font-mono">
                            {data.profile.viralScore}/100
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6">
                      <h3 className="font-semibold mb-4">Radar Analyse</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="oklch(0.25 0.02 260 / 0.5)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'oklch(0.65 0.01 260)' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: 'oklch(0.65 0.01 260)' }} />
                            <Radar
                              name="Score"
                              dataKey="A"
                              stroke="oklch(0.65 0.25 285)"
                              fill="oklch(0.65 0.25 285)"
                              fillOpacity={0.4}
                              strokeWidth={2}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="font-semibold mb-6">Was macht Content viral?</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { title: 'Hook Qualität', weight: '25%', desc: 'Die ersten 3 Sekunden entscheiden' },
                        { title: 'Emotionale Trigger', weight: '20%', desc: 'Starke Emotionen = mehr Shares' },
                        { title: 'Share-Worthiness', weight: '20%', desc: 'Wert für andere erkennbar?' },
                        { title: 'Replay Value', weight: '15%', desc: 'Loops und wiederkehrende Elemente' },
                      ].map((item, index) => (
                        <div key={index} className="p-4 bg-muted/20 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">{item.title}</h4>
                            <Badge variant="outline" className="text-xs">{item.weight}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

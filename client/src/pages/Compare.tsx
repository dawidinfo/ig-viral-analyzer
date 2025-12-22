import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { 
  BarChart3, 
  Users, 
  Heart,
  MessageSquare,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowLeftRight,
  Crown,
  Zap
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend
} from "recharts";

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// Comparison indicator component
const CompareIndicator = ({ value1, value2, higherIsBetter = true }: { value1: number; value2: number; higherIsBetter?: boolean }) => {
  const diff = value1 - value2;
  const percentDiff = value2 !== 0 ? ((diff / value2) * 100).toFixed(1) : '0';
  
  if (Math.abs(diff) < 0.01) {
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  }
  
  const isAccount1Better = higherIsBetter ? diff > 0 : diff < 0;
  
  return (
    <div className={`flex items-center gap-1 text-xs ${isAccount1Better ? 'text-emerald-500' : 'text-rose-500'}`}>
      {isAccount1Better ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      <span>{Math.abs(Number(percentDiff))}%</span>
    </div>
  );
};

// Circular Progress Component
const CircularProgress = ({ value, size = 80, strokeWidth = 6, color = "primary" }: { value: number; size?: number; strokeWidth?: number; color?: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  const colorClasses: Record<string, string> = {
    primary: "stroke-primary",
    viral: "stroke-accent",
    cyan: "stroke-secondary",
    account1: "stroke-violet-500",
    account2: "stroke-cyan-500"
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
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold font-mono">{value}</span>
      </div>
    </div>
  );
};

// Metric comparison card
const MetricCompareCard = ({ 
  label, 
  value1, 
  value2, 
  icon: Icon, 
  format = "number",
  higherIsBetter = true 
}: { 
  label: string; 
  value1: number; 
  value2: number; 
  icon: any; 
  format?: "number" | "percent";
  higherIsBetter?: boolean;
}) => {
  const formatted1 = format === "percent" ? `${value1.toFixed(2)}%` : formatNumber(value1);
  const formatted2 = format === "percent" ? `${value2.toFixed(2)}%` : formatNumber(value2);
  const winner = higherIsBetter ? (value1 > value2 ? 1 : value2 > value1 ? 2 : 0) : (value1 < value2 ? 1 : value2 < value1 ? 2 : 0);

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 items-center">
        <div className={`text-center ${winner === 1 ? 'text-emerald-500' : ''}`}>
          <p className="text-xl font-bold">{formatted1}</p>
          {winner === 1 && <Crown className="w-4 h-4 mx-auto mt-1 text-amber-500" />}
        </div>
        <div className="flex justify-center">
          <CompareIndicator value1={value1} value2={value2} higherIsBetter={higherIsBetter} />
        </div>
        <div className={`text-center ${winner === 2 ? 'text-emerald-500' : ''}`}>
          <p className="text-xl font-bold">{formatted2}</p>
          {winner === 2 && <Crown className="w-4 h-4 mx-auto mt-1 text-amber-500" />}
        </div>
      </div>
    </div>
  );
};

export default function Compare() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  
  const account1Param = params.get('account1') || '';
  const account2Param = params.get('account2') || '';
  
  const [account1Input, setAccount1Input] = useState(account1Param);
  const [account2Input, setAccount2Input] = useState(account2Param);

  // Fetch data for both accounts
  const { data: data1, isLoading: loading1, error: error1 } = trpc.instagram.analyze.useQuery(
    { username: account1Param },
    { enabled: !!account1Param, retry: 1, staleTime: 5 * 60 * 1000 }
  );

  const { data: data2, isLoading: loading2, error: error2 } = trpc.instagram.analyze.useQuery(
    { username: account2Param },
    { enabled: !!account2Param, retry: 1, staleTime: 5 * 60 * 1000 }
  );

  const isLoading = loading1 || loading2;
  const hasData = data1 && data2;

  const handleCompare = () => {
    const clean1 = account1Input.replace('@', '').trim();
    const clean2 = account2Input.replace('@', '').trim();
    if (clean1 && clean2) {
      setLocation(`/compare?account1=${encodeURIComponent(clean1)}&account2=${encodeURIComponent(clean2)}`);
    }
  };

  // Radar chart data for comparison
  const radarData = useMemo(() => {
    if (!data1 || !data2) return [];
    return [
      { subject: 'Hook', A: data1.viralFactors.hook, B: data2.viralFactors.hook, fullMark: 100 },
      { subject: 'Emotionen', A: data1.viralFactors.emotion, B: data2.viralFactors.emotion, fullMark: 100 },
      { subject: 'Teilbarkeit', A: data1.viralFactors.shareability, B: data2.viralFactors.shareability, fullMark: 100 },
      { subject: 'Replay', A: data1.viralFactors.replay, B: data2.viralFactors.replay, fullMark: 100 },
      { subject: 'Caption', A: data1.viralFactors.caption, B: data2.viralFactors.caption, fullMark: 100 },
      { subject: 'Hashtags', A: data1.viralFactors.hashtags, B: data2.viralFactors.hashtags, fullMark: 100 },
    ];
  }, [data1, data2]);

  // Determine overall winner
  const overallWinner = useMemo(() => {
    if (!data1 || !data2) return null;
    
    let score1 = 0;
    let score2 = 0;
    
    // Compare key metrics
    if (data1.viralScore > data2.viralScore) score1++; else if (data2.viralScore > data1.viralScore) score2++;
    if (data1.metrics.engagementRate > data2.metrics.engagementRate) score1++; else if (data2.metrics.engagementRate > data1.metrics.engagementRate) score2++;
    if (data1.metrics.avgLikes > data2.metrics.avgLikes) score1++; else if (data2.metrics.avgLikes > data1.metrics.avgLikes) score2++;
    if (data1.metrics.avgComments > data2.metrics.avgComments) score1++; else if (data2.metrics.avgComments > data1.metrics.avgComments) score2++;
    if (data1.metrics.avgViews > data2.metrics.avgViews) score1++; else if (data2.metrics.avgViews > data1.metrics.avgViews) score2++;
    
    if (score1 > score2) return 1;
    if (score2 > score1) return 2;
    return 0;
  }, [data1, data2]);

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
          
          <Badge className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white border-0">
            <ArrowLeftRight className="w-3 h-3 mr-1" />
            Vergleichsmodus
          </Badge>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 relative z-10">
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Account <span className="text-gradient">Vergleich</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Vergleiche zwei Instagram-Accounts und entdecke Unterschiede in Engagement, Viral Score und Performance.
            </p>
          </motion.div>

          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
              <div className="md:col-span-3">
                <label className="text-sm text-muted-foreground mb-2 block">Account 1</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="@username"
                    value={account1Input}
                    onChange={(e) => setAccount1Input(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
                    className="pl-10 bg-violet-500/10 border-violet-500/30 focus:border-violet-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                  <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              
              <div className="md:col-span-3">
                <label className="text-sm text-muted-foreground mb-2 block">Account 2</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="@username"
                    value={account2Input}
                    onChange={(e) => setAccount2Input(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
                    className="pl-10 bg-cyan-500/10 border-cyan-500/30 focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <Button 
                onClick={handleCompare} 
                className="btn-gradient text-white border-0 px-8"
                disabled={!account1Input.trim() || !account2Input.trim()}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Vergleichen
              </Button>
            </div>
          </motion.div>

          {/* Loading State */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Sparkles className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-muted-foreground mt-6">Analysiere beide Accounts...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error State */}
          {(error1 || error2) && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-xl font-bold mb-2">Fehler beim Laden</h2>
              <p className="text-muted-foreground mb-4">
                {error1 && `Account 1: ${error1.message}`}
                {error1 && error2 && <br />}
                {error2 && `Account 2: ${error2.message}`}
              </p>
            </motion.div>
          )}

          {/* Comparison Results */}
          {!isLoading && hasData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Profile Headers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Account 1 */}
                <div className={`glass-card rounded-2xl p-6 border-2 ${overallWinner === 1 ? 'border-amber-500/50' : 'border-violet-500/30'}`}>
                  {overallWinner === 1 && (
                    <div className="flex justify-center mb-4">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                        <Crown className="w-3 h-3 mr-1" />
                        Gewinner
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    {data1.profile.profilePicUrl ? (
                      <img 
                        src={data1.profile.profilePicUrl} 
                        alt={data1.profile.username}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-violet-500/30"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-bold truncate">@{data1.profile.username}</h2>
                        {data1.profile.isVerified && (
                          <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{data1.profile.fullName}</p>
                      {data1.isDemo && (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/10 mt-1 text-xs">
                          Demo
                        </Badge>
                      )}
                    </div>
                    <CircularProgress value={data1.viralScore} size={70} strokeWidth={5} color="account1" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-violet-400">{formatNumber(data1.profile.followerCount)}</p>
                      <p className="text-xs text-muted-foreground">Follower</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{formatNumber(data1.profile.followingCount)}</p>
                      <p className="text-xs text-muted-foreground">Following</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{formatNumber(data1.profile.mediaCount)}</p>
                      <p className="text-xs text-muted-foreground">Posts</p>
                    </div>
                  </div>
                </div>

                {/* Account 2 */}
                <div className={`glass-card rounded-2xl p-6 border-2 ${overallWinner === 2 ? 'border-amber-500/50' : 'border-cyan-500/30'}`}>
                  {overallWinner === 2 && (
                    <div className="flex justify-center mb-4">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                        <Crown className="w-3 h-3 mr-1" />
                        Gewinner
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    {data2.profile.profilePicUrl ? (
                      <img 
                        src={data2.profile.profilePicUrl} 
                        alt={data2.profile.username}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-cyan-500/30"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-bold truncate">@{data2.profile.username}</h2>
                        {data2.profile.isVerified && (
                          <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{data2.profile.fullName}</p>
                      {data2.isDemo && (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/10 mt-1 text-xs">
                          Demo
                        </Badge>
                      )}
                    </div>
                    <CircularProgress value={data2.viralScore} size={70} strokeWidth={5} color="account2" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-cyan-400">{formatNumber(data2.profile.followerCount)}</p>
                      <p className="text-xs text-muted-foreground">Follower</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{formatNumber(data2.profile.followingCount)}</p>
                      <p className="text-xs text-muted-foreground">Following</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{formatNumber(data2.profile.mediaCount)}</p>
                      <p className="text-xs text-muted-foreground">Posts</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Comparison */}
              <div className="glass-card rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Metriken-Vergleich
                </h3>
                
                {/* Column Headers */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div className="text-sm font-medium text-violet-400">@{data1.profile.username}</div>
                  <div className="text-sm text-muted-foreground">Unterschied</div>
                  <div className="text-sm font-medium text-cyan-400">@{data2.profile.username}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MetricCompareCard 
                    label="Viral Score" 
                    value1={data1.viralScore} 
                    value2={data2.viralScore} 
                    icon={Sparkles}
                  />
                  <MetricCompareCard 
                    label="Engagement Rate" 
                    value1={data1.metrics.engagementRate} 
                    value2={data2.metrics.engagementRate} 
                    icon={TrendingUp}
                    format="percent"
                  />
                  <MetricCompareCard 
                    label="Ø Likes" 
                    value1={data1.metrics.avgLikes} 
                    value2={data2.metrics.avgLikes} 
                    icon={Heart}
                  />
                  <MetricCompareCard 
                    label="Ø Kommentare" 
                    value1={data1.metrics.avgComments} 
                    value2={data2.metrics.avgComments} 
                    icon={MessageSquare}
                  />
                  <MetricCompareCard 
                    label="Ø Views" 
                    value1={data1.metrics.avgViews} 
                    value2={data2.metrics.avgViews} 
                    icon={Eye}
                  />
                  <MetricCompareCard 
                    label="Follower" 
                    value1={data1.profile.followerCount} 
                    value2={data2.profile.followerCount} 
                    icon={Users}
                  />
                </div>
              </div>

              {/* Radar Chart Comparison */}
              <div className="glass-card rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Viral-Faktoren Vergleich
                </h3>
                
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="oklch(0.3 0.01 285)" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: 'oklch(0.7 0.01 285)', fontSize: 12 }}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={{ fill: 'oklch(0.5 0.01 285)', fontSize: 10 }}
                      />
                      <Radar
                        name={`@${data1.profile.username}`}
                        dataKey="A"
                        stroke="oklch(0.65 0.25 285)"
                        fill="oklch(0.65 0.25 285)"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Radar
                        name={`@${data2.profile.username}`}
                        dataKey="B"
                        stroke="oklch(0.72 0.19 195)"
                        fill="oklch(0.72 0.19 195)"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value) => <span className="text-foreground">{value}</span>}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Factor Details Comparison */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Faktor-Details</h3>
                
                <div className="space-y-4">
                  {[
                    { name: 'Hook', key: 'hook' as const },
                    { name: 'Emotionen', key: 'emotion' as const },
                    { name: 'Teilbarkeit', key: 'shareability' as const },
                    { name: 'Replay', key: 'replay' as const },
                    { name: 'Caption', key: 'caption' as const },
                    { name: 'Hashtags', key: 'hashtags' as const },
                  ].map(({ name, key }) => (
                    <div key={key} className="grid grid-cols-7 gap-4 items-center">
                      <div className="col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-violet-400">@{data1.profile.username.slice(0, 10)}</span>
                          <span className="text-sm font-mono">{data1.viralFactors[key]}</span>
                        </div>
                        <Progress value={data1.viralFactors[key]} className="h-2 bg-muted/30" />
                      </div>
                      
                      <div className="col-span-3 text-center">
                        <span className="text-sm font-medium">{name}</span>
                        <div className="flex justify-center mt-1">
                          <CompareIndicator 
                            value1={data1.viralFactors[key]} 
                            value2={data2.viralFactors[key]} 
                          />
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-mono">{data2.viralFactors[key]}</span>
                          <span className="text-sm text-cyan-400">@{data2.profile.username.slice(0, 10)}</span>
                        </div>
                        <Progress value={data2.viralFactors[key]} className="h-2 bg-muted/30" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && !hasData && !error1 && !error2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <ArrowLeftRight className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Accounts vergleichen</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Gib zwei Instagram-Usernames ein, um einen detaillierten Vergleich zu starten.
              </p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 relative z-10">
        <div className="container text-center text-sm text-muted-foreground">
          © 2024 IG Viral Analyzer. Live-Daten von Instagram.
        </div>
      </footer>
    </div>
  );
}

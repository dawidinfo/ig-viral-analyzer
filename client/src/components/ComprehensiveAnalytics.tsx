import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Hash,
  FileText,
  BarChart3,
  Users,
  Heart,
  MessageCircle,
  Play,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Sparkles,
  Search,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Area,
  AreaChart,
} from "recharts";

interface ComprehensiveAnalyticsProps {
  username: string;
  profileData: {
    followers: number;
    following: number;
    posts: number;
    engagementRate: number;
  };
}

// Generate realistic follower growth data
function generateFollowerGrowthData(
  currentFollowers: number,
  days: number,
  username: string
) {
  const data = [];
  const seed = username.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const dailyGrowthRate = 0.001 + (seed % 10) * 0.0002; // 0.1% - 0.3% daily growth
  const volatility = 0.3 + (seed % 5) * 0.1;

  let followers = currentFollowers;
  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Calculate followers for this day (working backwards)
    const randomFactor = 1 + (Math.sin(seed + i * 0.5) * volatility * 0.01);
    const dailyChange = Math.round(
      followers * dailyGrowthRate * randomFactor
    );

    data.push({
      date: date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
      }),
      fullDate: date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      followers: Math.round(followers),
      change: i === days ? 0 : dailyChange,
      changePercent:
        i === days ? 0 : ((dailyChange / followers) * 100).toFixed(3),
    });

    // Decrease followers as we go back in time
    followers = followers / (1 + dailyGrowthRate * randomFactor);
  }

  return data;
}

// Generate top posts data
function generateTopPosts(username: string, count: number = 10) {
  const seed = username.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const posts = [];

  const postTypes = ["reel", "image", "carousel"];
  const topics = [
    "Business-Tipps",
    "Motivation",
    "Behind the Scenes",
    "Tutorial",
    "Story Time",
    "Q&A",
    "Transformation",
    "Mindset",
    "Erfolgsgeschichte",
    "Fehler vermeiden",
  ];

  for (let i = 0; i < count; i++) {
    const type = postTypes[(seed + i) % postTypes.length];
    const baseViews = 50000 + ((seed * (i + 1)) % 500000);
    const engagementMultiplier = 0.02 + ((seed + i) % 10) * 0.005;

    posts.push({
      id: i + 1,
      type,
      topic: topics[(seed + i) % topics.length],
      views: type === "reel" ? baseViews : 0,
      likes: Math.round(baseViews * engagementMultiplier),
      comments: Math.round(baseViews * engagementMultiplier * 0.1),
      saves: Math.round(baseViews * engagementMultiplier * 0.15),
      shares: Math.round(baseViews * engagementMultiplier * 0.05),
      date: new Date(
        Date.now() - (i * 3 + (seed % 5)) * 24 * 60 * 60 * 1000
      ).toLocaleDateString("de-DE"),
      caption: `${topics[(seed + i) % topics.length]} - Post ${i + 1}`,
      hashtags: 5 + ((seed + i) % 10),
      followerGain: Math.round(baseViews * 0.001 * (1 + (i % 3) * 0.5)),
    });
  }

  return posts.sort((a, b) => b.views - a.views);
}

// Generate SEO analysis data
function generateSEOAnalysis(username: string) {
  const seed = username.split("").reduce((a, b) => a + b.charCodeAt(0), 0);

  const topKeywords = [
    { word: "Erfolg", count: 45, engagement: 4.2 },
    { word: "Business", count: 38, engagement: 3.8 },
    { word: "Mindset", count: 32, engagement: 4.5 },
    { word: "Wachstum", count: 28, engagement: 3.9 },
    { word: "Strategie", count: 25, engagement: 4.1 },
    { word: "Tipps", count: 42, engagement: 3.6 },
    { word: "Fehler", count: 18, engagement: 4.8 },
    { word: "Geheimnis", count: 15, engagement: 5.2 },
    { word: "Transformation", count: 12, engagement: 4.4 },
    { word: "Anleitung", count: 22, engagement: 3.7 },
  ];

  const topHashtags = [
    { tag: "#entrepreneur", count: 85, avgReach: 125000 },
    { tag: "#business", count: 72, avgReach: 98000 },
    { tag: "#success", count: 65, avgReach: 112000 },
    { tag: "#motivation", count: 58, avgReach: 145000 },
    { tag: "#mindset", count: 52, avgReach: 89000 },
    { tag: "#growth", count: 45, avgReach: 76000 },
    { tag: "#startup", count: 38, avgReach: 92000 },
    { tag: "#leadership", count: 32, avgReach: 68000 },
  ];

  const captionPatterns = [
    {
      pattern: "Frage am Anfang",
      usage: 78,
      avgEngagement: 4.8,
      example: "Wusstest du, dass...?",
    },
    {
      pattern: "Nummerierte Liste",
      usage: 65,
      avgEngagement: 4.2,
      example: "3 Tipps für...",
    },
    {
      pattern: "Story-Format",
      usage: 45,
      avgEngagement: 5.1,
      example: "Vor 2 Jahren war ich...",
    },
    {
      pattern: "Call-to-Action",
      usage: 92,
      avgEngagement: 3.9,
      example: "Speichere diesen Post!",
    },
    {
      pattern: "Emoji-Trenner",
      usage: 55,
      avgEngagement: 3.5,
      example: "👇 Lies weiter 👇",
    },
  ];

  const spokenVsWritten = {
    alignment: 72 + (seed % 20),
    topMatchingTopics: ["Business-Strategien", "Mindset-Tipps", "Erfolgsgeschichten"],
    recommendation:
      "Die gesprochenen Inhalte stimmen zu 72% mit den Caption-Themen überein. Höhere Übereinstimmung korreliert mit +23% mehr Engagement.",
  };

  return {
    topKeywords: topKeywords.slice(0, 8),
    topHashtags: topHashtags.slice(0, 6),
    captionPatterns,
    spokenVsWritten,
    avgCaptionLength: 180 + (seed % 100),
    avgHashtagCount: 8 + (seed % 7),
    emojiUsage: 45 + (seed % 30),
  };
}

// Generate weekly summary
function generateWeeklySummary(username: string, currentFollowers: number) {
  const seed = username.split("").reduce((a, b) => a + b.charCodeAt(0), 0);

  const thisWeek = {
    followers: Math.round(currentFollowers * 0.003 * (1 + (seed % 5) * 0.2)),
    following: -2 + (seed % 5),
    posts: 5 + (seed % 8),
    avgLikes: 8500 + (seed % 5000),
    avgComments: 450 + (seed % 300),
  };

  const lastWeek = {
    followers: Math.round(thisWeek.followers * (0.8 + (seed % 4) * 0.1)),
    following: -1 + (seed % 3),
    posts: 4 + (seed % 6),
    avgLikes: 7800 + (seed % 4000),
    avgComments: 380 + (seed % 250),
  };

  return {
    thisWeek,
    lastWeek,
    followerChange: thisWeek.followers - lastWeek.followers,
    postChange: thisWeek.posts - lastWeek.posts,
    engagementChange: (
      ((thisWeek.avgLikes - lastWeek.avgLikes) / lastWeek.avgLikes) *
      100
    ).toFixed(1),
  };
}

// Generate posting time analysis
function generatePostingTimeAnalysis(username: string) {
  const seed = username.split("").reduce((a, b) => a + b.charCodeAt(0), 0);

  const hourlyData = [];
  for (let hour = 0; hour < 24; hour++) {
    const baseEngagement = 2 + Math.sin((hour - 12) * 0.3) * 1.5;
    const engagement = Math.max(
      0.5,
      baseEngagement + ((seed + hour) % 10) * 0.1
    );
    hourlyData.push({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      engagement: Number(engagement.toFixed(2)),
      posts: Math.round(5 + ((seed + hour) % 15)),
    });
  }

  const bestTimes = hourlyData
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 3);

  const dayData = [
    { day: "Mo", engagement: 3.2 + (seed % 10) * 0.1, posts: 12 + (seed % 8) },
    { day: "Di", engagement: 3.5 + (seed % 10) * 0.1, posts: 14 + (seed % 8) },
    { day: "Mi", engagement: 3.8 + (seed % 10) * 0.1, posts: 15 + (seed % 8) },
    { day: "Do", engagement: 3.6 + (seed % 10) * 0.1, posts: 13 + (seed % 8) },
    { day: "Fr", engagement: 3.4 + (seed % 10) * 0.1, posts: 11 + (seed % 8) },
    { day: "Sa", engagement: 2.8 + (seed % 10) * 0.1, posts: 8 + (seed % 8) },
    { day: "So", engagement: 2.5 + (seed % 10) * 0.1, posts: 6 + (seed % 8) },
  ];

  return {
    hourlyData,
    bestTimes,
    dayData,
    bestDay: dayData.sort((a, b) => b.engagement - a.engagement)[0].day,
  };
}

export default function ComprehensiveAnalytics({
  username,
  profileData,
}: ComprehensiveAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<string>("30");

  const followerData = useMemo(
    () =>
      generateFollowerGrowthData(
        profileData.followers,
        parseInt(timeRange),
        username
      ),
    [profileData.followers, timeRange, username]
  );

  const topPosts = useMemo(() => generateTopPosts(username, 10), [username]);
  const seoAnalysis = useMemo(() => generateSEOAnalysis(username), [username]);
  const weeklySummary = useMemo(
    () => generateWeeklySummary(username, profileData.followers),
    [username, profileData.followers]
  );
  const postingTimes = useMemo(
    () => generatePostingTimeAnalysis(username),
    [username]
  );

  const totalGrowth = followerData.reduce((sum, d) => sum + d.change, 0);
  const avgDailyGrowth = Math.round(totalGrowth / parseInt(timeRange));

  return (
    <div className="space-y-6">
      {/* Weekly Summary */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-primary" />
            Wochenübersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="text-2xl font-bold text-green-400">
                +{weeklySummary.thisWeek.followers.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Neue Follower</div>
              <div
                className={`text-xs mt-1 flex items-center justify-center gap-1 ${
                  weeklySummary.followerChange >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {weeklySummary.followerChange >= 0 ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                {Math.abs(weeklySummary.followerChange).toLocaleString()} vs.
                letzte Woche
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="text-2xl font-bold">
                {weeklySummary.thisWeek.posts}
              </div>
              <div className="text-xs text-muted-foreground">Neue Posts</div>
              <div
                className={`text-xs mt-1 flex items-center justify-center gap-1 ${
                  weeklySummary.postChange >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {weeklySummary.postChange >= 0 ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                {Math.abs(weeklySummary.postChange)} vs. letzte Woche
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="text-2xl font-bold">
                {weeklySummary.thisWeek.avgLikes.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Ø Likes</div>
              <div
                className={`text-xs mt-1 flex items-center justify-center gap-1 ${
                  parseFloat(weeklySummary.engagementChange) >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {parseFloat(weeklySummary.engagementChange) >= 0 ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                {weeklySummary.engagementChange}%
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="text-2xl font-bold">
                {weeklySummary.thisWeek.avgComments.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Ø Kommentare</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="text-2xl font-bold text-primary">
                +{avgDailyGrowth.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Ø Follower/Tag
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Follower Growth Chart */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
              Follower-Wachstum
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "7 Tage", value: "7" },
                { label: "30 Tage", value: "30" },
                { label: "90 Tage", value: "90" },
                { label: "180 Tage", value: "180" },
                { label: "1 Jahr", value: "365" },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    timeRange === range.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={followerData}>
                <defs>
                  <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="date"
                  stroke="#666"
                  tick={{ fill: "#999", fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#666"
                  tick={{ fill: "#999", fontSize: 11 }}
                  tickFormatter={(value) =>
                    value >= 1000000
                      ? `${(value / 1000000).toFixed(1)}M`
                      : value >= 1000
                      ? `${(value / 1000).toFixed(0)}K`
                      : value
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [
                    value.toLocaleString(),
                    "Follower",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="followers"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="url(#followerGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Growth Summary */}
          <div className="mt-4 p-4 rounded-lg bg-white/5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Gesamtwachstum ({timeRange} Tage)
              </span>
              <span className="text-lg font-bold text-green-400">
                +{totalGrowth.toLocaleString()} Follower
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Posts */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5 text-primary" />
            Top 10 Beiträge nach Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPosts.map((post, index) => (
              <div
                key={post.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        post.type === "reel"
                          ? "border-purple-500 text-purple-400"
                          : post.type === "carousel"
                          ? "border-blue-500 text-blue-400"
                          : "border-green-500 text-green-400"
                      }`}
                    >
                      {post.type === "reel" ? (
                        <Play className="w-3 h-3 mr-1" />
                      ) : (
                        <FileText className="w-3 h-3 mr-1" />
                      )}
                      {post.type}
                    </Badge>
                    <span className="text-sm truncate">{post.topic}</span>
                    <span className="text-xs text-muted-foreground">
                      {post.date}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {post.type === "reel" && (
                    <div className="flex items-center gap-1 text-purple-400">
                      <Eye className="w-4 h-4" />
                      {post.views >= 1000
                        ? `${(post.views / 1000).toFixed(0)}K`
                        : post.views}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-red-400">
                    <Heart className="w-4 h-4" />
                    {post.likes >= 1000
                      ? `${(post.likes / 1000).toFixed(1)}K`
                      : post.likes}
                  </div>
                  <div className="flex items-center gap-1 text-blue-400">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments}
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <Users className="w-4 h-4" />
                    +{post.followerGain}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SEO Analysis */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="w-5 h-5 text-primary" />
            SEO & Caption Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="keywords" className="space-y-4">
            <TabsList className="bg-white/5">
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
              <TabsTrigger value="patterns">Muster</TabsTrigger>
              <TabsTrigger value="alignment">Text-Übereinstimmung</TabsTrigger>
            </TabsList>

            <TabsContent value="keywords" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">
                    Top Keywords nach Häufigkeit
                  </h4>
                  <div className="space-y-2">
                    {seoAnalysis.topKeywords.map((kw, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-sm w-24 truncate">{kw.word}</span>
                        <Progress
                          value={(kw.count / 50) * 100}
                          className="flex-1 h-2"
                        />
                        <span className="text-xs text-muted-foreground w-8">
                          {kw.count}x
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs border-green-500 text-green-400"
                        >
                          {kw.engagement}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <h4 className="text-sm font-medium mb-3">Caption-Statistiken</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Ø Caption-Länge
                      </span>
                      <span className="font-medium">
                        {seoAnalysis.avgCaptionLength} Zeichen
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Ø Hashtags pro Post
                      </span>
                      <span className="font-medium">
                        {seoAnalysis.avgHashtagCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Emoji-Nutzung
                      </span>
                      <span className="font-medium">
                        {seoAnalysis.emojiUsage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hashtags" className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {seoAnalysis.topHashtags.map((ht, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="w-4 h-4 text-primary" />
                      <span className="font-medium">{ht.tag}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{ht.count}x verwendet</span>
                      <span>Ø {(ht.avgReach / 1000).toFixed(0)}K Reichweite</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="patterns" className="space-y-4">
              <div className="space-y-3">
                {seoAnalysis.captionPatterns.map((pattern, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{pattern.pattern}</span>
                      <Badge
                        variant="outline"
                        className={`${
                          pattern.avgEngagement >= 4.5
                            ? "border-green-500 text-green-400"
                            : pattern.avgEngagement >= 4
                            ? "border-yellow-500 text-yellow-400"
                            : "border-gray-500 text-gray-400"
                        }`}
                      >
                        {pattern.avgEngagement}% Engagement
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress
                        value={pattern.usage}
                        className="flex-1 h-2"
                      />
                      <span className="text-xs text-muted-foreground">
                        {pattern.usage}% Nutzung
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Beispiel: "{pattern.example}"
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="alignment" className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/20 to-cyan-500/20 border border-primary/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {seoAnalysis.spokenVsWritten.alignment}%
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">
                      Übereinstimmung: Gesprochen ↔ Geschrieben
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Wie gut stimmen gesprochene Inhalte mit Captions überein
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">
                    Top übereinstimmende Themen:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {seoAnalysis.spokenVsWritten.topMatchingTopics.map(
                      (topic, i) => (
                        <Badge key={i} variant="secondary">
                          {topic}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
                <p className="text-sm mt-4 p-3 rounded bg-white/5">
                  <Sparkles className="w-4 h-4 inline mr-2 text-yellow-400" />
                  {seoAnalysis.spokenVsWritten.recommendation}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Posting Time Analysis */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-primary" />
            Beste Posting-Zeiten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Engagement nach Uhrzeit</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={postingTimes.hourlyData.filter((_, i) => i % 2 === 0)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                      dataKey="hour"
                      stroke="#666"
                      tick={{ fill: "#999", fontSize: 10 }}
                    />
                    <YAxis stroke="#666" tick={{ fill: "#999", fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="engagement" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Engagement nach Wochentag</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={postingTimes.dayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                      dataKey="day"
                      stroke="#666"
                      tick={{ fill: "#999", fontSize: 10 }}
                    />
                    <YAxis stroke="#666" tick={{ fill: "#999", fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="engagement" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-400" />
              <span className="font-medium">Empfohlene Posting-Zeiten</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {postingTimes.bestTimes.map((time, i) => (
                <Badge
                  key={i}
                  className="bg-green-500/20 text-green-400 border-green-500/50"
                >
                  {time.hour} ({time.engagement}% Engagement)
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Bester Wochentag: <span className="text-green-400 font-medium">{postingTimes.bestDay}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

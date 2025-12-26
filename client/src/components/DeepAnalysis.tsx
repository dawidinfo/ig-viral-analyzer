import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Scissors, ListOrdered, UserCheck, Zap, Repeat, Gem, Search, Heart,
  TrendingUp, Eye, MessageCircle, Share2, Bookmark, Play, Clock,
  CheckCircle, AlertCircle, Sparkles, Target, BarChart3, FileText, RefreshCw
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

interface DeepAnalysisProps {
  username: string;
}

// Icon mapping for viral reasons
const iconMap: Record<string, React.ReactNode> = {
  'Scissors': <Scissors className="w-5 h-5" />,
  'ListOrdered': <ListOrdered className="w-5 h-5" />,
  'UserCheck': <UserCheck className="w-5 h-5" />,
  'Zap': <Zap className="w-5 h-5" />,
  'Repeat': <Repeat className="w-5 h-5" />,
  'Gem': <Gem className="w-5 h-5" />,
  'Search': <Search className="w-5 h-5" />,
  'Heart': <Heart className="w-5 h-5" />,
};

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export default function DeepAnalysis({ username }: DeepAnalysisProps) {
  const [activeTab, setActiveTab] = useState("viral-reasons");
  const [hasTimedOut, setHasTimedOut] = useState(false);
  
  const { data: deepAnalysis, isLoading, error, refetch, isFetching } = trpc.instagram.deepAnalysis.useQuery(
    { username },
    { 
      enabled: !!username,
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
  
  const [isRefetching, setIsRefetching] = useState(false);
  
  const handleRefetch = async () => {
    setIsRefetching(true);
    setHasTimedOut(false);
    await refetch();
    setIsRefetching(false);
  };

  // Timeout for long-running requests
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setHasTimedOut(true);
      }, 10000); // 10 second timeout
      return () => clearTimeout(timeout);
    } else {
      setHasTimedOut(false);
    }
  }, [isLoading]);

  if (isLoading && !hasTimedOut) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Target className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Tiefenanalyse</h3>
            <p className="text-xs text-muted-foreground">Lade HAPSS Framework...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted/20 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show timeout message
  if (hasTimedOut && isLoading) {
    return (
      <Card className="bg-amber-500/10 border-amber-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-sm font-medium text-amber-200">Tiefenanalyse lädt...</p>
                <p className="text-xs text-amber-400/70">Dies kann einen Moment dauern</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleRefetch} disabled={isRefetching || isFetching} className="text-amber-400 border-amber-500/30">
              <RefreshCw className={`w-4 h-4 mr-1 ${(isRefetching || isFetching) ? 'animate-spin' : ''}`} /> {(isRefetching || isFetching) ? 'Lädt...' : 'Neu laden'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !deepAnalysis) {
    return (
      <Card className="bg-red-500/10 border-red-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-red-400">Tiefenanalyse konnte nicht geladen werden</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="text-red-400 border-red-500/30">
              <RefreshCw className="w-4 h-4 mr-1" /> Erneut versuchen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { hapss, contentPatterns, cutFrequency, seoAnalysis, viralReasons, topReels, topPosts, overallInsights, authenticityScore, contentConsistency } = deepAnalysis;

  return (
    <div className="space-y-8">
      {/* Overall Insights */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Wichtigste Erkenntnisse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {overallInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                <p className="text-gray-300">{insight}</p>
              </div>
            ))}
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">{hapss.overallScore}%</div>
              <div className="text-sm text-gray-400">HAPSS Score</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-cyan-400">{authenticityScore}%</div>
              <div className="text-sm text-gray-400">Authentizität</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{contentConsistency}%</div>
              <div className="text-sm text-gray-400">Konsistenz</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-orange-400">{cutFrequency.attentionScore}%</div>
              <div className="text-sm text-gray-400">Attention Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different analysis sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex flex-wrap bg-zinc-900/95 backdrop-blur-md p-2 rounded-xl gap-2 sticky top-0 z-50 border border-white/10 shadow-lg">
          <TabsTrigger value="viral-reasons" className="flex-1 min-w-[120px] data-[state=active]:bg-purple-500/20">
            <Zap className="w-4 h-4 mr-2" />
            Viral-Gründe
          </TabsTrigger>
          <TabsTrigger value="hapss" className="flex-1 min-w-[120px] data-[state=active]:bg-purple-500/20">
            <Target className="w-4 h-4 mr-2" />
            HAPSS
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex-1 min-w-[120px] data-[state=active]:bg-purple-500/20">
            <BarChart3 className="w-4 h-4 mr-2" />
            Muster
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex-1 min-w-[120px] data-[state=active]:bg-purple-500/20">
            <Search className="w-4 h-4 mr-2" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="top-content" className="flex-1 min-w-[120px] data-[state=active]:bg-purple-500/20">
            <TrendingUp className="w-4 h-4 mr-2" />
            Top Content
          </TabsTrigger>
        </TabsList>

        {/* Viral Reasons Tab */}
        <TabsContent value="viral-reasons" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {viralReasons.map((reason, i) => (
              <Card key={i} className="bg-white/5 border-white/10 hover:border-purple-500/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl">
                      {iconMap[reason.icon] || <Zap className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{reason.title}</h3>
                        <Badge variant="outline" className="bg-purple-500/20 border-purple-500/30">
                          Impact: {reason.impact}/10
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{reason.description}</p>
                      <div className="space-y-1">
                        {reason.evidence.map((ev, j) => (
                          <div key={j} className="flex items-center gap-2 text-xs text-gray-500">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            {ev}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cut Frequency Analysis */}
          <Card className="mt-6 bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-cyan-400" />
                Schnittfrequenz-Analyse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-4xl font-bold text-cyan-400">{cutFrequency.averageCutDuration}s</div>
                  <div className="text-sm text-gray-400 mt-1">Durchschnittliche Szenen-Länge</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-4xl font-bold text-purple-400">{cutFrequency.cutsPerMinute}</div>
                  <div className="text-sm text-gray-400 mt-1">Schnitte pro Minute</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-4xl font-bold text-green-400">{cutFrequency.attentionScore}%</div>
                  <div className="text-sm text-gray-400 mt-1">Attention Score</div>
                </div>
              </div>
              <p className="mt-4 text-gray-300">{cutFrequency.description}</p>
              <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <p className="text-sm text-cyan-300">💡 {cutFrequency.recommendation}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HAPSS Tab */}
        <TabsContent value="hapss" className="mt-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>HAPSS Framework Analyse</CardTitle>
              <CardDescription>
                Hook, Attention, Problem, Story, Solution - Die Formel von Dawid Przybylski
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* HAPSS Overall Score */}
              <div className="flex items-center justify-center mb-8">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                    <circle 
                      cx="80" cy="80" r="70" fill="none" 
                      stroke="url(#hapssGradient)" 
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${hapss.overallScore * 4.4} 440`}
                    />
                    <defs>
                      <linearGradient id="hapssGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white">{hapss.overallScore}%</span>
                    <span className="text-sm text-gray-400">HAPSS Score</span>
                  </div>
                </div>
              </div>

              {/* Individual HAPSS Components */}
              <div className="space-y-6">
                {/* Hook */}
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 font-bold">H</div>
                      <span className="font-semibold">Hook</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-400">{hapss.hook.score}%</span>
                  </div>
                  <Progress value={hapss.hook.score} className="h-2 mb-3" />
                  <p className="text-sm text-gray-400 mb-2">{hapss.hook.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {hapss.hook.examples.map((ex, i) => (
                      <Badge key={i} variant="outline" className="bg-purple-500/10 border-purple-500/20 text-xs">
                        {ex}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Attention */}
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400 font-bold">A</div>
                      <span className="font-semibold">Attention</span>
                    </div>
                    <span className="text-2xl font-bold text-cyan-400">{hapss.attention.score}%</span>
                  </div>
                  <Progress value={hapss.attention.score} className="h-2 mb-3" />
                  <p className="text-sm text-gray-400 mb-2">{hapss.attention.description}</p>
                  <div className="space-y-1">
                    {hapss.attention.techniques.map((tech: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle className="w-3 h-3 text-cyan-400" />
                        {tech}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Problem */}
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 font-bold">P</div>
                      <span className="font-semibold">Problem</span>
                    </div>
                    <span className="text-2xl font-bold text-orange-400">{hapss.problem.score}%</span>
                  </div>
                  <Progress value={hapss.problem.score} className="h-2 mb-3" />
                  <p className="text-sm text-gray-400 mb-2">{hapss.problem.description}</p>
                  <div className="space-y-1">
                    {hapss.problem.identifiedProblems.map((prob, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <AlertCircle className="w-3 h-3 text-orange-400" />
                        {prob}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Solution */}
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 font-bold">S</div>
                      <span className="font-semibold">Solution</span>
                    </div>
                    <span className="text-2xl font-bold text-green-400">{hapss.solution.score}%</span>
                  </div>
                  <Progress value={hapss.solution.score} className="h-2 mb-3" />
                  <p className="text-sm text-gray-400 mb-2">{hapss.solution.description}</p>
                  <div className="space-y-1">
                    {hapss.solution.solutionsOffered.map((sol, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        {sol}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Story */}
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-400 font-bold">S</div>
                      <span className="font-semibold">Story</span>
                    </div>
                    <span className="text-2xl font-bold text-pink-400">{hapss.story.score}%</span>
                  </div>
                  <Progress value={hapss.story.score} className="h-2 mb-3" />
                  <p className="text-sm text-gray-400 mb-2">{hapss.story.description}</p>
                  <div className="space-y-1">
                    {hapss.story.storytellingElements.map((el, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <FileText className="w-3 h-3 text-pink-400" />
                        {el}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentPatterns.map((pattern, i) => (
              <Card key={i} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{pattern.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={`${
                        pattern.impact === 'high' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                        pattern.impact === 'medium' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' :
                        'bg-gray-500/20 border-gray-500/30 text-gray-400'
                      }`}
                    >
                      {pattern.impact === 'high' ? 'Hoher Impact' : pattern.impact === 'medium' ? 'Mittlerer Impact' : 'Niedriger Impact'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{pattern.description}</p>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500">Häufigkeit</span>
                      <span className="text-purple-400 font-medium">{pattern.frequency}%</span>
                    </div>
                    <Progress value={pattern.frequency} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    {pattern.examples.map((ex, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                        {ex}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SEO Scores */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-cyan-400" />
                  SEO Bewertung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400">Beschreibungs-Qualität</span>
                    <span className="text-cyan-400 font-medium">{seoAnalysis.descriptionScore}%</span>
                  </div>
                  <Progress value={seoAnalysis.descriptionScore} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400">Hashtag-Strategie</span>
                    <span className="text-purple-400 font-medium">{seoAnalysis.hashtagScore}%</span>
                  </div>
                  <Progress value={seoAnalysis.hashtagScore} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400">Gesprochener Content ↔ Beschreibung</span>
                    <span className="text-green-400 font-medium">{seoAnalysis.spokenContentMatch}%</span>
                  </div>
                  <Progress value={seoAnalysis.spokenContentMatch} className="h-2" />
                </div>
                <div className="pt-4 border-t border-white/10">
                  <div className="text-sm text-gray-400 mb-2">Keyword-Dichte</div>
                  <div className="text-3xl font-bold text-white">{seoAnalysis.keywordDensity}%</div>
                </div>
              </CardContent>
            </Card>

            {/* Top Keywords */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Top Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {seoAnalysis.topKeywords.map((kw, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-medium text-white">{kw.word}</span>
                        <Badge variant="outline" className="text-xs">{kw.count}x</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Relevanz:</span>
                        <span className="text-cyan-400 font-medium">{kw.relevance}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Hashtags */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Top Hashtags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {seoAnalysis.topHashtags.map((ht, i) => (
                    <div key={i} className="p-3 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-lg border border-purple-500/20">
                      <div className="text-purple-400 font-medium">{ht.tag}</div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>{ht.count}x verwendet</span>
                        <span>•</span>
                        <span>Reichweite: {ht.reach}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SEO Recommendations */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>SEO Empfehlungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {seoAnalysis.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                      <Sparkles className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-300">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Content Tab */}
        <TabsContent value="top-content" className="mt-6">
          <div className="space-y-8">
            {/* Top Reels */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-purple-400" />
                Top 10 Reels
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {topReels.map((reel, i) => (
                  <Card key={i} className="bg-white/5 border-white/10 overflow-hidden hover:border-purple-500/30 transition-colors group">
                    <div className="relative aspect-[9/16]">
                      <img 
                        src={reel.thumbnailUrl} 
                        alt={`Reel ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-purple-500/80 text-white text-xs">
                          #{i + 1}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="bg-black/50 border-white/20 text-white text-xs">
                          {reel.viralScore}%
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="flex items-center justify-between text-xs text-white/80 mb-2">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {formatNumber(reel.views || 0)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {reel.duration}s
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/80">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {formatNumber(reel.likes)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {formatNumber(reel.comments)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {reel.viralReasons.slice(0, 2).map((reason, j) => (
                          <Badge key={j} variant="outline" className="text-[10px] bg-purple-500/10 border-purple-500/20">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Top Posts */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Top 10 Posts
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {topPosts.map((post, i) => (
                  <Card key={i} className="bg-white/5 border-white/10 overflow-hidden hover:border-cyan-500/30 transition-colors group">
                    <div className="relative aspect-square">
                      <img 
                        src={post.thumbnailUrl} 
                        alt={`Post ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-cyan-500/80 text-white text-xs">
                          #{i + 1}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="bg-black/50 border-white/20 text-white text-xs">
                          {post.viralScore}%
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="flex items-center gap-3 text-xs text-white/80">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {formatNumber(post.likes)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {formatNumber(post.comments)}
                          </div>
                          {post.saves && (
                            <div className="flex items-center gap-1">
                              <Bookmark className="w-3 h-3" />
                              {formatNumber(post.saves)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {post.viralReasons.slice(0, 2).map((reason, j) => (
                          <Badge key={j} variant="outline" className="text-[10px] bg-cyan-500/10 border-cyan-500/20">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

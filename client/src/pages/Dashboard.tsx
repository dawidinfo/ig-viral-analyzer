import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Bookmark,
  Crown,
  FileText,
  Heart,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  User,
  Users,
  Zap,
  ArrowLeftRight,
  ExternalLink,
  Calendar,
  Clock,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const planColors = {
  free: "bg-gray-500",
  starter: "bg-blue-500",
  pro: "bg-purple-500",
  business: "bg-gradient-to-r from-amber-500 to-orange-500",
};

const planNames = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  business: "Business",
};

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const getLoginUrl = () => "/api/auth/login";
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch dashboard data
  const { data: dashboardData, isLoading, refetch } = trpc.dashboard.getData.useQuery(
    { userId: user?.id ?? 0 },
    { enabled: !!user?.id }
  );

  // Mutations
  const deleteAnalysisMutation = trpc.dashboard.deleteAnalysis.useMutation({
    onSuccess: () => {
      toast.success("Analyse gelöscht");
      refetch();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  const toggleFavoriteMutation = trpc.dashboard.toggleFavorite.useMutation({
    onSuccess: (data: { isFavorite: boolean }) => {
      toast.success(data.isFavorite ? "Zu Favoriten hinzugefügt" : "Aus Favoriten entfernt");
      refetch();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  // Filter saved analyses
  const filteredAnalyses = useMemo(() => {
    if (!dashboardData?.savedAnalyses) return [];
    if (!searchQuery) return dashboardData.savedAnalyses;
    
    const query = searchQuery.toLowerCase();
    return dashboardData.savedAnalyses.filter(
      (a: { username: string; fullName: string | null }) =>
        a.username.toLowerCase().includes(query) ||
        (a.fullName && a.fullName.toLowerCase().includes(query))
    );
  }, [dashboardData?.savedAnalyses, searchQuery]);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background bg-grid flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-radial pointer-events-none" />
        <Card className="glass-card w-full max-w-md mx-4 relative z-10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src="/logo.svg" alt="ReelSpy.ai" className="h-12 w-auto" />
            </div>
            <CardTitle className="text-2xl">Anmeldung erforderlich</CardTitle>
            <CardDescription>
              Melde dich an, um auf dein Dashboard zuzugreifen und deine Analysen zu verwalten.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => window.location.href = getLoginUrl()}
              className="w-full btn-gradient text-white"
            >
              <User className="w-4 h-4 mr-2" />
              Jetzt anmelden
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              className="w-full"
            >
              Zurück zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background bg-grid flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-radial pointer-events-none" />
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Dashboard wird geladen...</p>
        </div>
      </div>
    );
  }

  const plan = dashboardData?.user?.plan || "free";
  const limits = dashboardData?.limits || { analyses: 3, aiAnalyses: 0, pdfExports: 0, comparisons: 1, savedAnalyses: 5 };
  const usage = dashboardData?.usage || { analyses: 0, aiAnalyses: 0, pdfExports: 0, comparisons: 0 };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const formatLimit = (limit: number) => {
    return limit === -1 ? "∞" : limit.toString();
  };

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="fixed inset-0 bg-gradient-radial pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
            <img src="/logo.svg" alt="ReelSpy.ai" className="h-8 w-auto" />
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/")}
            >
              <Search className="w-4 h-4 mr-2" />
              Neue Analyse
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">{user?.name || "User"}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 relative z-10">
        <div className="container">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Willkommen zurück, {user?.name?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-muted-foreground">
              Verwalte deine Analysen und behalte deine Nutzung im Blick.
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="glass-card p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Übersicht
              </TabsTrigger>
              <TabsTrigger value="analyses" className="data-[state=active]:bg-primary/20">
                <Bookmark className="w-4 h-4 mr-2" />
                Gespeicherte Analysen
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-primary/20">
                <Settings className="w-4 h-4 mr-2" />
                Einstellungen
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Plan & Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Plan Card */}
                <Card className="glass-card col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-500" />
                      Dein Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className={`${planColors[plan as keyof typeof planColors]} text-white px-3 py-1 text-sm`}>
                        {planNames[plan as keyof typeof planNames]}
                      </Badge>
                      {plan !== "business" && (
                        <Button
                          variant="link"
                          size="sm"
                          className="text-primary p-0 h-auto"
                          onClick={() => setLocation("/pricing")}
                        >
                          Upgrade
                        </Button>
                      )}
                    </div>
                    {dashboardData?.user?.subscriptionEndsAt && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Gültig bis: {new Date(dashboardData.user.subscriptionEndsAt).toLocaleDateString("de-DE")}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="glass-card col-span-1 md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Schnellübersicht
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <p className="text-2xl font-bold text-primary">{dashboardData?.savedAnalysesCount || 0}</p>
                        <p className="text-xs text-muted-foreground">Gespeicherte Analysen</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <p className="text-2xl font-bold text-cyan-400">{usage.analyses}</p>
                        <p className="text-xs text-muted-foreground">Analysen diesen Monat</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <p className="text-2xl font-bold text-purple-400">{usage.aiAnalyses}</p>
                        <p className="text-xs text-muted-foreground">KI-Analysen</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <p className="text-2xl font-bold text-green-400">{usage.comparisons}</p>
                        <p className="text-xs text-muted-foreground">Vergleiche</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Usage Limits */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Nutzungslimits (diesen Monat)
                  </CardTitle>
                  <CardDescription>
                    Dein aktueller Verbrauch im {planNames[plan as keyof typeof planNames]} Plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Analyses */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-cyan-400" />
                        Account-Analysen
                      </span>
                      <span className="text-muted-foreground">
                        {usage.analyses} / {formatLimit(limits.analyses)}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(usage.analyses, limits.analyses)} 
                      className="h-2"
                    />
                  </div>

                  {/* AI Analyses */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        KI-Reel-Analysen
                      </span>
                      <span className="text-muted-foreground">
                        {usage.aiAnalyses} / {formatLimit(limits.aiAnalyses)}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(usage.aiAnalyses, limits.aiAnalyses)} 
                      className="h-2"
                    />
                  </div>

                  {/* PDF Exports */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-400" />
                        PDF-Exporte
                      </span>
                      <span className="text-muted-foreground">
                        {usage.pdfExports} / {formatLimit(limits.pdfExports)}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(usage.pdfExports, limits.pdfExports)} 
                      className="h-2"
                    />
                  </div>

                  {/* Comparisons */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <ArrowLeftRight className="w-4 h-4 text-amber-400" />
                        Account-Vergleiche
                      </span>
                      <span className="text-muted-foreground">
                        {usage.comparisons} / {formatLimit(limits.comparisons)}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(usage.comparisons, limits.comparisons)} 
                      className="h-2"
                    />
                  </div>

                  {/* Saved Analyses */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-pink-400" />
                        Gespeicherte Analysen
                      </span>
                      <span className="text-muted-foreground">
                        {dashboardData?.savedAnalysesCount || 0} / {formatLimit(limits.savedAnalyses)}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(dashboardData?.savedAnalysesCount || 0, limits.savedAnalyses)} 
                      className="h-2"
                    />
                  </div>

                  {plan !== "business" && (
                    <div className="pt-4 border-t border-border/50">
                      <Button
                        onClick={() => setLocation("/pricing")}
                        className="w-full btn-gradient text-white"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Upgrade für mehr Limits
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Analyses */}
              {dashboardData?.savedAnalyses && dashboardData.savedAnalyses.length > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Letzte Analysen
                      </CardTitle>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setActiveTab("analyses")}
                        className="text-primary"
                      >
                        Alle anzeigen
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dashboardData.savedAnalyses.slice(0, 3).map((analysis: any) => (
                        <motion.div
                          key={analysis.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => setLocation(`/analysis?username=${analysis.username}`)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center overflow-hidden">
                              {analysis.profilePicUrl ? (
                                <img src={analysis.profilePicUrl} alt={analysis.username} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">@{analysis.username}</p>
                              <p className="text-xs text-muted-foreground truncate">{analysis.fullName || "Instagram Account"}</p>
                            </div>
                            {analysis.viralScore && (
                              <Badge variant="outline" className="shrink-0">
                                {analysis.viralScore}
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Saved Analyses Tab */}
            <TabsContent value="analyses" className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bookmark className="w-5 h-5 text-primary" />
                        Gespeicherte Analysen
                      </CardTitle>
                      <CardDescription>
                        {dashboardData?.savedAnalysesCount || 0} von {formatLimit(limits.savedAnalyses)} Analysen gespeichert
                      </CardDescription>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-muted/30"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredAnalyses.length === 0 ? (
                    <div className="text-center py-12">
                      <Bookmark className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery ? "Keine Analysen gefunden" : "Noch keine Analysen gespeichert"}
                      </p>
                      {!searchQuery && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setLocation("/")}
                        >
                          Erste Analyse starten
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {filteredAnalyses.map((analysis: any) => (
                          <motion.div
                            key={analysis.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                          >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center overflow-hidden shrink-0">
                              {analysis.profilePicUrl ? (
                                <img src={analysis.profilePicUrl} alt={analysis.username} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-6 h-6 text-primary" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">@{analysis.username}</p>
                                {analysis.isFavorite === 1 && (
                                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {analysis.fullName || "Instagram Account"}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                {analysis.followerCount && (
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {analysis.followerCount.toLocaleString()}
                                  </span>
                                )}
                                {analysis.engagementRate && (
                                  <span className="flex items-center gap-1">
                                    <Heart className="w-3 h-3" />
                                    {analysis.engagementRate}%
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(analysis.createdAt).toLocaleDateString("de-DE")}
                                </span>
                              </div>
                            </div>

                            {analysis.viralScore && (
                              <div className="hidden sm:flex flex-col items-center shrink-0">
                                <span className="text-xs text-muted-foreground">Viral Score</span>
                                <span className="text-xl font-bold text-primary">{analysis.viralScore}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavoriteMutation.mutate({
                                    userId: user?.id ?? 0,
                                    analysisId: analysis.id,
                                  });
                                }}
                              >
                                <Star className={`w-4 h-4 ${analysis.isFavorite === 1 ? "text-amber-500 fill-amber-500" : ""}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setLocation(`/analysis?username=${analysis.username}`)}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteAnalysisMutation.mutate({
                                    userId: user?.id ?? 0,
                                    analysisId: analysis.id,
                                  });
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Account-Informationen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Name</label>
                      <Input value={user?.name || ""} disabled className="bg-muted/30" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">E-Mail</label>
                      <Input value={user?.email || ""} disabled className="bg-muted/30" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Account-Informationen werden über deinen Login-Provider verwaltet.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    Abonnement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">Aktueller Plan</p>
                      <p className="text-sm text-muted-foreground">
                        {planNames[plan as keyof typeof planNames]} Plan
                      </p>
                    </div>
                    <Badge className={`${planColors[plan as keyof typeof planColors]} text-white`}>
                      {planNames[plan as keyof typeof planNames]}
                    </Badge>
                  </div>
                  
                  {plan !== "business" && (
                    <Button
                      onClick={() => setLocation("/pricing")}
                      className="w-full btn-gradient text-white"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Plan upgraden
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                    <LogOut className="w-5 h-5" />
                    Abmelden
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Melde dich von deinem Account ab. Deine gespeicherten Analysen bleiben erhalten.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Abmelden
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

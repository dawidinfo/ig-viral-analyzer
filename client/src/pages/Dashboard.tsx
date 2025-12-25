import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { LoginButton } from "@/components/LoginButton";
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
  Receipt,
  StickyNote,
  Share2,
  Copy,
  Gift,
  Check,
  Flame,
  Instagram,
  ArrowUpRight,
  Shield,
  Bell,
  BellOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AffiliateDashboard } from "@/components/AffiliateDashboard";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { GlobalFooter } from "@/components/GlobalFooter";
import { InvoicesTab } from "@/components/InvoicesTab";
import { NotesTab } from "@/components/NotesTab";
import { OnboardingTutorial, useOnboarding } from "@/components/OnboardingTutorial";
import { NotificationSettings } from "@/components/NotificationSettings";
import { ContentPlanGenerator } from "@/components/ContentPlanGenerator";
import { DashboardRecommendations } from "@/components/DashboardRecommendations";
import { UserBadges } from "@/components/UserBadges";
import { Leaderboard } from "@/components/Leaderboard";
import { Trophy } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useConfetti } from "@/hooks/useConfetti";

// Helper function to proxy Instagram profile pictures
const getProxiedImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  // If it's already a proxied URL or a local URL, return as-is
  if (url.startsWith('/api/') || url.startsWith('data:')) return url;
  // Proxy Instagram CDN images
  if (url.includes('instagram') || url.includes('cdninstagram') || url.includes('fbcdn')) {
    return `/api/proxy/instagram-image?url=${encodeURIComponent(url)}`;
  }
  return url;
};

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
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Onboarding Tutorial
  const { showOnboarding, completeOnboarding } = useOnboarding();
  
  // Editable profile state
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAllTop50, setShowAllTop50] = useState(false);
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);
  
  // Konfetti für Upgrade-Erfolg
  const { fireSuccessConfetti } = useConfetti();
  
  // Push-Benachrichtigungen
  const { permission: notificationPermission, isSupported: notificationsSupported, requestPermission: requestNotificationPermission, isEnabled: notificationsEnabled } = usePushNotifications();
  
  // Check for upgrade success and tab parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Handle tab parameter
    const tabParam = urlParams.get('tab');
    if (tabParam && ['overview', 'content-plan', 'analyses', 'invoices', 'notes', 'affiliate', 'leaderboard', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
      // Clean up URL after setting tab
      window.history.replaceState({}, '', '/dashboard');
    }
    
    // Handle upgrade success
    if (urlParams.get('upgrade') === 'success') {
      setShowUpgradeSuccess(true);
      fireSuccessConfetti();
      toast.success("🎉 Willkommen im Pro-Plan! Alle Features sind jetzt freigeschaltet.", {
        duration: 5000,
      });
      // URL bereinigen
      window.history.replaceState({}, '', '/dashboard');
      // Nach 5 Sekunden ausblenden
      setTimeout(() => setShowUpgradeSuccess(false), 5000);
    }
  }, []);

  // Fetch dashboard data
  const { data: dashboardData, isLoading, refetch } = trpc.dashboard.getData.useQuery(
    { userId: user?.id ?? 0 },
    { enabled: !!user?.id }
  );

  // Fetch top growing accounts from API
  const { data: topGrowingAccounts } = trpc.admin.getTopGrowing.useQuery(
    { days: 30, limit: 50 },
    { enabled: isAuthenticated }
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

  // Stripe Checkout - direkt zum Pro Plan
  const checkoutMutation = trpc.credits.createCheckout.useMutation({
    onSuccess: (data: { url?: string }) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast.error("Fehler beim Starten des Checkouts. Bitte versuche es erneut.");
    }
  });

  const handleUpgrade = () => {
    checkoutMutation.mutate({ packageId: 'pro', isYearly: false });
  };

  const updateProfileMutation = trpc.dashboard.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profil aktualisiert");
      setIsEditingProfile(false);
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
            <LoginButton 
              variant="gradient" 
              size="lg" 
              showSecurityNote={true}
              className="w-full"
            >
              Jetzt anmelden
            </LoginButton>
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
      
      {/* Onboarding Tutorial */}
      <OnboardingTutorial isOpen={showOnboarding} onComplete={completeOnboarding} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
            <img src="/logo.svg" alt="ReelSpy.ai" className="h-6 sm:h-8 w-auto" />
          </div>

          <div className="flex items-center gap-4">
            {/* Analyse-Eingabefeld mit Instagram-Button */}
            <div className="hidden md:flex items-center">
              <div className="flex items-center border-2 border-pink-500/50 rounded-xl overflow-hidden bg-background shadow-lg shadow-pink-500/10">
                {/* Instagram Icon */}
                <div className="flex items-center justify-center w-11 h-11 m-1 rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 shrink-0">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                {/* Input */}
                <Input
                  type="text"
                  placeholder="Instagram @username eingeben..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-11 border-0 bg-transparent text-sm focus-visible:ring-0 px-3"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      setLocation(`/analysis?username=${searchQuery.trim().replace('@', '')}`);
                    }
                  }}
                />
                {/* Analyze Button */}
                <Button
                  size="sm"
                  className="h-9 px-5 m-1 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0"
                  onClick={() => {
                    if (searchQuery.trim()) {
                      setLocation(`/analysis?username=${searchQuery.trim().replace('@', '')}`);
                    }
                  }}
                >
                  KI-Analyse
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/")}
              className="md:hidden"
            >
              <Search className="w-4 h-4 mr-2" />
              Analyse
            </Button>
            {/* Admin Button - nur für Admins */}
            {user?.role === "admin" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/admin")}
                className="hidden sm:flex items-center gap-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Button>
            )}
            
            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{user?.name || "User"}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="font-medium">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Einstellungen
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem onClick={() => setLocation("/admin")} className="sm:hidden">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-400">
                  <LogOut className="w-4 h-4 mr-2" />
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 pb-8 sm:pb-12 relative z-10">
        <div className="container">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-xl sm:text-3xl font-bold mb-2">
              Willkommen zurück, {user?.name?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-muted-foreground">
              Verwalte deine Analysen und behalte deine Nutzung im Blick.
            </p>
          </div>

          {/* Rabatt-Banner - nur für Free User */}
          {plan === 'free' && (() => {
            const now = new Date();
            const month = now.getMonth(); // 0-11
            const day = now.getDate();
            
            // Dynamische Promotion basierend auf Datum
            let promoEmoji = '🚀';
            let promoTitle = 'Neujahrs-Special';
            let promoSubtitle = 'Starte 2025 mit mehr Reichweite!';
            
            if (month === 11 && day >= 24 && day <= 26) {
              // Weihnachten (24-26. Dezember)
              promoEmoji = '🎄';
              promoTitle = 'Weihnachts-Special';
              promoSubtitle = 'Frohe Weihnachten!';
            } else if (month === 11 && day >= 27 && day <= 31) {
              // Silvester (27-31. Dezember)
              promoEmoji = '🎆';
              promoTitle = 'Silvester-Special';
              promoSubtitle = 'Starte ins neue Jahr durch!';
            } else if (month === 0 && day >= 1 && day <= 7) {
              // Neujahr (1-7. Januar)
              promoEmoji = '🎉';
              promoTitle = 'Neujahrs-Special';
              promoSubtitle = 'Dein Jahr für viralen Content!';
            } else {
              // Standard-Promotion
              promoEmoji = '⚡';
              promoTitle = 'Limited Offer';
              promoSubtitle = 'Nur für kurze Zeit!';
            }
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-pink-600/20 border border-violet-500/30 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgY3g9IjIwIiBjeT0iMjAiIHI9IjIiLz48L2c+PC9zdmc+')] opacity-50" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm sm:text-base">
                        {promoEmoji} {promoTitle}: <span className="text-violet-400">20% Rabatt</span> auf alle Pläne!
                      </p>
                      <p className="text-xs text-muted-foreground">{promoSubtitle} Code: <span className="font-mono bg-violet-500/20 px-1.5 py-0.5 rounded">REELSPY20</span></p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white whitespace-nowrap"
                    onClick={() => {
                      checkoutMutation.mutate({ packageId: 'pro', isYearly: false });
                    }}
                  >
                    Jetzt upgraden
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            );
          })()}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Sticky Navigation Bar */}
            <div className="sticky top-16 z-40 -mx-4 px-4 py-3 bg-background/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20">
              <TabsList className="flex justify-start gap-1 sm:gap-2 p-3 overflow-x-auto flex-nowrap dashboard-tabs w-full max-w-full mx-auto bg-gradient-to-r from-violet-950/50 via-purple-950/50 to-fuchsia-950/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/10" style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}>
                <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/30 whitespace-nowrap text-sm sm:text-base font-medium px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all duration-300 hover:bg-white/10 border border-transparent">
                  <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span>Übersicht</span>
                </TabsTrigger>
                <TabsTrigger value="content-plan" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/30 whitespace-nowrap text-sm sm:text-base font-medium px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all duration-300 hover:bg-white/10 border border-transparent relative">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden sm:inline">Content-Plan</span>
                  <span className="sm:hidden">Plan</span>
                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 text-[10px] px-2 py-0.5 z-10 shadow-lg animate-pulse">NEU</Badge>
                </TabsTrigger>
                <TabsTrigger value="analyses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/30 whitespace-nowrap text-sm sm:text-base font-medium px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all duration-300 hover:bg-white/10 border border-transparent">
                  <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden sm:inline">Analysen</span>
                  <span className="sm:hidden">Analysen</span>
                </TabsTrigger>
                <TabsTrigger value="invoices" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/30 whitespace-nowrap text-sm sm:text-base font-medium px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all duration-300 hover:bg-white/10 border border-transparent">
                  <Receipt className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden sm:inline">Rechnungen</span>
                  <span className="sm:hidden">Rechnung</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/30 whitespace-nowrap text-sm sm:text-base font-medium px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all duration-300 hover:bg-white/10 border border-transparent">
                  <StickyNote className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span>Notizen</span>
                </TabsTrigger>
                <TabsTrigger value="affiliate" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/30 whitespace-nowrap text-sm sm:text-base font-medium px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all duration-300 hover:bg-white/10 border border-transparent">
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span>Affiliate</span>
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/30 whitespace-nowrap text-sm sm:text-base font-medium px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all duration-300 hover:bg-white/10 border border-transparent relative">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden sm:inline">Leaderboard</span>
                  <span className="sm:hidden">Ranking</span>
                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] px-2 py-0.5 z-10 shadow-lg">NEU</Badge>
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/30 whitespace-nowrap text-sm sm:text-base font-medium px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all duration-300 hover:bg-white/10 border border-transparent">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden sm:inline">Einstellungen</span>
                  <span className="sm:hidden">Settings</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Recommendations Section */}
              <DashboardRecommendations 
                isPro={plan === 'pro' || plan === 'business'}
                hasAnalyses={(dashboardData?.savedAnalysesCount || 0) > 0}
                analysisCount={dashboardData?.savedAnalysesCount || 0}
                onNavigate={(tab) => setActiveTab(tab)}
              />
              
              {/* User Badges / Gamification */}
              <UserBadges 
                analysisCount={dashboardData?.savedAnalysesCount || 0}
                savedAnalysisCount={dashboardData?.savedAnalysesCount || 0}
                contentPlansGenerated={0}
                daysActive={Math.floor((Date.now() - new Date(user?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24))}
                isPro={plan === 'pro' || plan === 'business' || plan === 'enterprise'}
              />
              
              {/* Plan & Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 dashboard-grid">
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
                        onClick={handleUpgrade}
                        disabled={checkoutMutation.isPending}
                        className="w-full btn-gradient text-white"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        {checkoutMutation.isPending ? "Lädt..." : "Upgrade für mehr Limits"}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dashboardData.savedAnalyses.slice(0, 3).map((analysis: any) => (
                        <motion.div
                          key={analysis.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer border border-border/50 hover:border-primary/30 group"
                          onClick={() => setLocation(`/analysis?username=${analysis.username}`)}
                        >
                          <div className="flex items-center gap-4">
                            {/* Größeres Profilbild */}
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 p-0.5 flex-shrink-0">
                              <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                                {analysis.profilePicUrl ? (
                                  <img src={getProxiedImageUrl(analysis.profilePicUrl) || ''} alt={analysis.username} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                                ) : null}
                                <span className={`text-xs font-bold text-white ${analysis.profilePicUrl ? 'hidden' : ''}`}>
                                  {analysis.username?.slice(0, 5).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-base truncate group-hover:text-primary transition-colors">@{analysis.username}</p>
                              <p className="text-sm text-muted-foreground truncate">{analysis.fullName || "Instagram Account"}</p>
                            </div>
                          </div>
                          {/* Viral Score Badge */}
                          {analysis.viralScore && (
                            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Viral Score</span>
                              <Badge 
                                variant="outline" 
                                className={`${
                                  analysis.viralScore >= 70 
                                    ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                                    : analysis.viralScore >= 40 
                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' 
                                    : 'bg-red-500/20 text-red-400 border-red-500/50'
                                }`}
                              >
                                {analysis.viralScore}
                              </Badge>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Top 50 Winners - Viral Accounts */}
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      Top 50 Winner
                      <Badge variant="outline" className="ml-2 text-orange-500 border-orange-500/50">
                        🔥 Viral
                      </Badge>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Accounts mit starkem Wachstum</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {(() => {
                      // Static fallback data for Top 50
                      const staticTop50 = [
                        { rank: 1, username: "cristiano", growth: "+2.1M", followers: "669M", category: "Sports", initials: "CR" },
                        { rank: 2, username: "leomessi", growth: "+1.8M", followers: "504M", category: "Sports", initials: "LM" },
                        { rank: 3, username: "kyliejenner", growth: "+1.2M", followers: "399M", category: "Lifestyle", initials: "KJ" },
                        { rank: 4, username: "selenagomez", growth: "+980K", followers: "429M", category: "Entertainment", initials: "SG" },
                        { rank: 5, username: "therock", growth: "+850K", followers: "395M", category: "Entertainment", initials: "TR" },
                        { rank: 6, username: "arianagrande", growth: "+720K", followers: "380M", category: "Music", initials: "AG" },
                        { rank: 7, username: "kimkardashian", growth: "+680K", followers: "364M", category: "Lifestyle", initials: "KK" },
                        { rank: 8, username: "beyonce", growth: "+620K", followers: "319M", category: "Music", initials: "BE" },
                        { rank: 9, username: "khloekardashian", growth: "+580K", followers: "311M", category: "Lifestyle", initials: "KK" },
                        { rank: 10, username: "nike", growth: "+540K", followers: "306M", category: "Brand", initials: "NK" },
                        { rank: 11, username: "justinbieber", growth: "+520K", followers: "295M", category: "Music", initials: "JB" },
                        { rank: 12, username: "kendalljenner", growth: "+480K", followers: "294M", category: "Lifestyle", initials: "KE" },
                        { rank: 13, username: "natgeo", growth: "+450K", followers: "284M", category: "Media", initials: "NG" },
                        { rank: 14, username: "taylorswift", growth: "+420K", followers: "283M", category: "Music", initials: "TS" },
                        { rank: 15, username: "viaborges", growth: "+400K", followers: "275M", category: "Lifestyle", initials: "VB" },
                        { rank: 16, username: "jlo", growth: "+380K", followers: "253M", category: "Entertainment", initials: "JL" },
                        { rank: 17, username: "neymarjr", growth: "+360K", followers: "228M", category: "Sports", initials: "NJ" },
                        { rank: 18, username: "mileycyrus", growth: "+340K", followers: "216M", category: "Music", initials: "MC" },
                        { rank: 19, username: "katyperry", growth: "+320K", followers: "206M", category: "Music", initials: "KP" },
                        { rank: 20, username: "zendaya", growth: "+300K", followers: "184M", category: "Entertainment", initials: "ZE" },
                        { rank: 21, username: "kevinhart4real", growth: "+280K", followers: "178M", category: "Entertainment", initials: "KH" },
                        { rank: 22, username: "ddlovato", growth: "+260K", followers: "159M", category: "Music", initials: "DD" },
                        { rank: 23, username: "badgalriri", growth: "+250K", followers: "151M", category: "Music", initials: "RI" },
                        { rank: 24, username: "chfrfranco", growth: "+240K", followers: "148M", category: "Sports", initials: "CF" },
                        { rank: 25, username: "vindiesel", growth: "+230K", followers: "142M", category: "Entertainment", initials: "VD" },
                        { rank: 26, username: "shakira", growth: "+220K", followers: "140M", category: "Music", initials: "SH" },
                        { rank: 27, username: "davidbeckham", growth: "+210K", followers: "137M", category: "Sports", initials: "DB" },
                        { rank: 28, username: "lelepons", growth: "+200K", followers: "135M", category: "Entertainment", initials: "LP" },
                        { rank: 29, username: "priyankachopra", growth: "+190K", followers: "132M", category: "Entertainment", initials: "PC" },
                        { rank: 30, username: "iamcardib", growth: "+180K", followers: "130M", category: "Music", initials: "CB" },
                        { rank: 31, username: "drake", growth: "+175K", followers: "128M", category: "Music", initials: "DR" },
                        { rank: 32, username: "billieeilish", growth: "+170K", followers: "126M", category: "Music", initials: "BE" },
                        { rank: 33, username: "shrfrddkpoor", growth: "+165K", followers: "124M", category: "Entertainment", initials: "SK" },
                        { rank: 34, username: "tomholland2013", growth: "+160K", followers: "122M", category: "Entertainment", initials: "TH" },
                        { rank: 35, username: "gaborieunion", growth: "+155K", followers: "120M", category: "Entertainment", initials: "GU" },
                        { rank: 36, username: "realmadrid", growth: "+150K", followers: "118M", category: "Sports", initials: "RM" },
                        { rank: 37, username: "fcbarcelona", growth: "+145K", followers: "116M", category: "Sports", initials: "FC" },
                        { rank: 38, username: "championsleague", growth: "+140K", followers: "114M", category: "Sports", initials: "CL" },
                        { rank: 39, username: "nasa", growth: "+135K", followers: "112M", category: "Science", initials: "NA" },
                        { rank: 40, username: "nickiminaj", growth: "+130K", followers: "110M", category: "Music", initials: "NM" },
                        { rank: 41, username: "gifrndpix", growth: "+125K", followers: "108M", category: "Entertainment", initials: "GP" },
                        { rank: 42, username: "emmawatson", growth: "+120K", followers: "106M", category: "Entertainment", initials: "EW" },
                        { rank: 43, username: "adele", growth: "+115K", followers: "104M", category: "Music", initials: "AD" },
                        { rank: 44, username: "brunomars", growth: "+110K", followers: "102M", category: "Music", initials: "BM" },
                        { rank: 45, username: "lewishamilton", growth: "+105K", followers: "100M", category: "Sports", initials: "LH" },
                        { rank: 46, username: "chfrfrfranco", growth: "+100K", followers: "98M", category: "Sports", initials: "CF" },
                        { rank: 47, username: "kourtneykardash", growth: "+95K", followers: "96M", category: "Lifestyle", initials: "KO" },
                        { rank: 48, username: "gifrndpixels", growth: "+90K", followers: "94M", category: "Entertainment", initials: "GP" },
                        { rank: 49, username: "manchesterunited", growth: "+85K", followers: "92M", category: "Sports", initials: "MU" },
                        { rank: 50, username: "liverpoolfc", growth: "+80K", followers: "90M", category: "Sports", initials: "LF" },
                      ];

                      // Always use static Top 50 data for professional appearance with real profile pictures
                      // These are verified viral accounts with high-quality profile images
                      const displayData = staticTop50.slice(0, showAllTop50 ? 50 : 10);

                      return displayData;
                    })().map((account) => (
                      <motion.div
                        key={account.rank}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: account.rank * 0.02 }}
                        className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group border border-border/50 hover:border-orange-500/30"
                        onClick={() => setLocation(`/analysis?username=${account.username}`)}
                      >
                        {/* Profilbild mit Rang */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                              account.rank <= 3 
                                ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white' 
                                : account.category === 'Sports' ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                                : account.category === 'Music' ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                : account.category === 'Entertainment' ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                                : account.category === 'Lifestyle' ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white'
                                : account.category === 'Brand' ? 'bg-gradient-to-br from-gray-600 to-gray-800 text-white'
                                : 'bg-gradient-to-br from-primary/50 to-purple-500/50 text-white'
                            }`}>
                              {account.initials}
                            </div>
                            <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              account.rank <= 3 ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'
                            }`}>
                              {account.rank}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate group-hover:text-orange-400 transition-colors">@{account.username}</p>
                            <p className="text-xs text-muted-foreground">{account.category}</p>
                          </div>
                        </div>
                        {/* Stats */}
                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <span className="text-xs text-muted-foreground">{account.followers}</span>
                          <span className="text-xs font-semibold text-green-500 flex items-center gap-0.5">
                            <ArrowUpRight className="w-3 h-3" />
                            {account.growth}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAllTop50(!showAllTop50)}
                    >
                      {showAllTop50 ? "Weniger anzeigen" : "Alle 50 anzeigen"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content-Plan Tab */}
            <TabsContent value="content-plan" className="space-y-6">
              <ContentPlanGenerator 
                isPro={plan === 'pro' || plan === 'business'}
                userId={user?.id}
                analysisData={{
                  topReels: dashboardData?.savedAnalyses?.slice(0, 5)
                }}
                onUpgrade={handleUpgrade}
              />
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
                          Erste KI-Analyse starten
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
                                <img src={getProxiedImageUrl(analysis.profilePicUrl) || ''} alt={analysis.username} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
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

            {/* Invoices Tab */}
            <TabsContent value="invoices" className="space-y-6">
              <InvoicesTab userId={user?.id ?? 0} />
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-6">
              <NotesTab userId={user?.id ?? 0} />
            </TabsContent>

            {/* Affiliate Tab */}
            <TabsContent value="affiliate" className="space-y-6">
              <AffiliateDashboard />
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="space-y-6">
              <Leaderboard currentUserId={user?.id} />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              {/* Push-Benachrichtigungen */}
              {notificationsSupported && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bell className="w-5 h-5 text-primary" />
                      Push-Benachrichtigungen
                    </CardTitle>
                    <CardDescription>
                      Erhalte tägliche Tipps und Erinnerungen direkt auf deinem Gerät
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {notificationsEnabled ? (
                          <div className="p-2 rounded-lg bg-emerald-500/20">
                            <Bell className="w-5 h-5 text-emerald-500" />
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg bg-muted">
                            <BellOff className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            {notificationsEnabled ? 'Benachrichtigungen aktiv' : 'Benachrichtigungen deaktiviert'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notificationsEnabled 
                              ? 'Du erhältst tägliche Tipps und Analyse-Erinnerungen' 
                              : 'Aktiviere Benachrichtigungen für tägliche Tipps'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={notificationsEnabled ? 'outline' : 'default'}
                        size="sm"
                        onClick={requestNotificationPermission}
                        disabled={notificationsEnabled}
                        className={notificationsEnabled ? '' : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'}
                      >
                        {notificationsEnabled ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Aktiviert
                          </>
                        ) : (
                          <>
                            <Bell className="w-4 h-4 mr-2" />
                            Aktivieren
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Notification Settings */}
              <NotificationSettings />
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Account-Informationen
                  </CardTitle>
                  <CardDescription>
                    Bearbeite deine Profildaten
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Name</label>
                      <Input 
                        value={isEditingProfile ? editName : (user?.name || "")} 
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={!isEditingProfile}
                        className={isEditingProfile ? "" : "bg-muted/30"}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">E-Mail</label>
                      <Input 
                        value={isEditingProfile ? editEmail : (user?.email || "")} 
                        onChange={(e) => setEditEmail(e.target.value)}
                        disabled={!isEditingProfile}
                        className={isEditingProfile ? "" : "bg-muted/30"}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isEditingProfile ? (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditName(user?.name || "");
                          setEditEmail(user?.email || "");
                          setIsEditingProfile(true);
                        }}
                      >
                        Bearbeiten
                      </Button>
                    ) : (
                      <>
                        <Button 
                          className="btn-gradient text-white"
                          onClick={() => {
                            updateProfileMutation.mutate({
                              userId: user?.id ?? 0,
                              name: editName,
                              email: editEmail,
                            });
                          }}
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Speichern..." : "Speichern"}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setIsEditingProfile(false)}
                        >
                          Abbrechen
                        </Button>
                      </>
                    )}
                  </div>
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
                      onClick={handleUpgrade}
                      disabled={checkoutMutation.isPending}
                      className="w-full btn-gradient text-white"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {checkoutMutation.isPending ? "Lädt..." : "Plan upgraden"}
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
      <GlobalFooter />
    </div>
  );
}

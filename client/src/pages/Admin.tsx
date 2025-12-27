import { useState } from "react";
import { useLocation } from "wouter";
import { ABTestDashboard } from "@/components/ABTestDashboard";
import { SuspendedUsersPanel } from "@/components/SuspendedUsersPanel";
// import { CacheDashboard } from "@/components/CacheDashboard"; // Entfernt per User-Request
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Shield,
  Ban,
  Database,
  Search,
  RefreshCw,
  AlertTriangle,
  Crown,
  Eye,
  UserCog,
  BarChart3,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Youtube,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<"user" | "admin" | "support">("user");
  const [trackingResult, setTrackingResult] = useState<{ totalAccounts: number; successful: number; failed: number } | null>(null);
  const [trackingPlatformFilter, setTrackingPlatformFilter] = useState<string>("all");
  const [trackingDaysFilter, setTrackingDaysFilter] = useState<number>(30);
  
  // New user creation state
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserCredits, setNewUserCredits] = useState(10);
  const [newUserPlan, setNewUserPlan] = useState("free");
  
  // Credits management state
  const [creditsDialogOpen, setCreditsDialogOpen] = useState(false);
  const [creditsAmount, setCreditsAmount] = useState(0);
  const [creditsReason, setCreditsReason] = useState("");
  
  // User detail view state
  const [detailUserId, setDetailUserId] = useState<number | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Check if user is admin
  const { data: isAdmin, isLoading: checkingAdmin } = trpc.admin.isAdmin.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  // Get admin stats
  const { data: stats, refetch: refetchStats } = trpc.admin.getStats.useQuery(
    undefined,
    { enabled: isAdmin === true }
  );

  // Get users
  const { data: usersData, refetch: refetchUsers } = trpc.admin.getUsers.useQuery(
    {
      page: currentPage,
      limit: 20,
      search: searchQuery || undefined,
      filterPlan: filterPlan !== "all" ? filterPlan : undefined,
      filterBanned: filterStatus === "banned" ? true : filterStatus === "active" ? false : undefined,
    },
    { enabled: isAdmin === true }
  );

  // Get top users
  const { data: topUsers } = trpc.admin.getTopUsers.useQuery(
    { limit: 10 },
    { enabled: isAdmin === true }
  );

  // Get suspicious users
  const { data: suspiciousUsers, refetch: refetchSuspicious } = trpc.admin.scanSuspicious.useQuery(
    undefined,
    { enabled: isAdmin === true }
  );

  // Get tracking stats
  const { data: trackingStats, refetch: refetchTrackingStats } = trpc.admin.getTrackingStats.useQuery(
    undefined,
    { enabled: isAdmin === true }
  );

  // Get tracking accounts
  const { data: trackingAccounts } = trpc.admin.getTrackingAccounts.useQuery(
    undefined,
    { enabled: isAdmin === true }
  );

  // Get top growing accounts
  const { data: topGrowingAccounts } = trpc.admin.getTopGrowing.useQuery(
    {
      platform: trackingPlatformFilter !== "all" ? trackingPlatformFilter : undefined,
      days: trackingDaysFilter,
      limit: 10,
    },
    { enabled: isAdmin === true }
  );

  // Get declining accounts
  const { data: decliningAccounts } = trpc.admin.getDeclining.useQuery(
    { days: trackingDaysFilter, limit: 5 },
    { enabled: isAdmin === true }
  );

  // Get platform distribution
  const { data: platformDistribution } = trpc.admin.getPlatformDistribution.useQuery(
    undefined,
    { enabled: isAdmin === true }
  );

  // Mutations
  const banUserMutation = trpc.admin.banUser.useMutation({
    onSuccess: () => {
      toast.success("Benutzer wurde gesperrt");
      setBanDialogOpen(false);
      setBanReason("");
      refetchUsers();
    },
    onError: (error) => {
      toast.error("Fehler beim Sperren: " + error.message);
    },
  });

  const unbanUserMutation = trpc.admin.unbanUser.useMutation({
    onSuccess: () => {
      toast.success("Benutzer wurde entsperrt");
      refetchUsers();
    },
    onError: (error) => {
      toast.error("Fehler beim Entsperren: " + error.message);
    },
  });

  const setRoleMutation = trpc.admin.setUserRole.useMutation({
    onSuccess: () => {
      toast.success("Rolle wurde aktualisiert");
      setRoleDialogOpen(false);
      refetchUsers();
    },
    onError: (error) => {
      toast.error("Fehler beim Aktualisieren: " + error.message);
    },
  });

  const runTrackingMutation = trpc.admin.runTracking.useMutation({
    onSuccess: (data) => {
      toast.success(`Tracking abgeschlossen: ${data.successful}/${data.totalAccounts} erfolgreich`);
      setTrackingResult(data);
      refetchTrackingStats();
    },
    onError: (error) => {
      toast.error("Fehler beim Tracking: " + error.message);
    },
  });

  // Create user mutation
  const createUserMutation = trpc.admin.createUser.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`User erstellt und Einladung gesendet!`);
        setCreateUserDialogOpen(false);
        setNewUserEmail("");
        setNewUserName("");
        setNewUserCredits(10);
        setNewUserPlan("free");
        refetchUsers();
      } else {
        toast.error(data.error || "Fehler beim Erstellen");
      }
    },
    onError: (error) => {
      toast.error("Fehler: " + error.message);
    },
  });

  // Clear all caches mutation - ENTFERNT per User-Request
  // const [cacheStatus, setCacheStatus] = useState<string | null>(null);
  // const clearCachesMutation = trpc.admin.clearAllCaches.useMutation({...});

  // Add credits mutation
  const addCreditsMutation = trpc.admin.addCredits.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Credits aktualisiert! Neuer Stand: ${data.newBalance}`);
        setCreditsDialogOpen(false);
        setCreditsAmount(0);
        setCreditsReason("");
        setSelectedUser(null);
        refetchUsers();
      } else {
        toast.error(data.error || "Fehler beim Aktualisieren");
      }
    },
    onError: (error) => {
      toast.error("Fehler: " + error.message);
    },
  });

  // Loading state
  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <Shield className="h-6 w-6" />
              Zugriff verweigert
            </CardTitle>
            <CardDescription>
              Du hast keine Berechtigung, auf das Admin Dashboard zuzugreifen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">
              Zurück zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">ReelSpy.ai Verwaltung</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Cache-Button entfernt per User-Request */}
              <Button variant="outline" size="sm" onClick={() => {
                refetchStats();
                refetchUsers();
                refetchSuspicious();
                toast.success("Daten aktualisiert");
              }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Aktualisieren
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setLocation("/dashboard")}
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Users className="h-4 w-4 mr-2" />
                Mein Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
                Zurück zur App
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gesamt Benutzer</p>
                  <p className="text-3xl font-bold">{formatNumber(stats?.totalUsers || 0)}</p>
                  <p className="text-xs text-green-500">+{stats?.activeUsers || 0} aktiv (30d)</p>
                </div>
                <Users className="h-10 w-10 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monatlicher Umsatz</p>
                  <p className="text-3xl font-bold">{formatCurrency(stats?.monthlyRevenue || 0)}</p>
                  <p className="text-xs text-muted-foreground">Gesamt: {formatCurrency(stats?.totalRevenue || 0)}</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Analysen (Monat)</p>
                  <p className="text-3xl font-bold">{formatNumber(stats?.monthlyAnalyses || 0)}</p>
                  <p className="text-xs text-muted-foreground">Gesamt: {formatNumber(stats?.totalAnalyses || 0)}</p>
                </div>
                <Activity className="h-10 w-10 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-3xl font-bold">{stats?.conversionRate?.toFixed(1) || 0}%</p>
                  <p className="text-xs text-muted-foreground">Ø {formatCurrency(stats?.avgRevenuePerUser || 0)}/User</p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Metriken */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">MRR</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(stats?.mrr || 0)}</p>
                  <p className="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ARR</p>
                  <p className="text-2xl font-bold text-blue-400">{formatCurrency(stats?.arr || 0)}</p>
                  <p className="text-xs text-muted-foreground">Annual Recurring Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Churn Rate</p>
                  <p className="text-2xl font-bold text-red-400">{stats?.churnRate?.toFixed(1) || 0}%</p>
                  <p className="text-xs text-muted-foreground">Monatliche Abwanderung</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">LTV</p>
                  <p className="text-2xl font-bold text-purple-400">{formatCurrency(stats?.ltv || 0)}</p>
                  <p className="text-xs text-muted-foreground">Lifetime Value</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">LTV:CAC</p>
                  <p className="text-2xl font-bold text-amber-400">{((stats?.ltv || 0) / (stats?.cac || 5)).toFixed(1)}x</p>
                  <p className="text-xs text-muted-foreground">CAC: {formatCurrency(stats?.cac || 5)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Kosten & Feature Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-500" />
                API-Kosten (Instagram Statistics)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Requests diesen Monat</span>
                  <span className="font-bold">{formatNumber(stats?.apiCosts?.instagramStatistics?.used || 0)} / {formatNumber(stats?.apiCosts?.instagramStatistics?.limit || 10000)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(((stats?.apiCosts?.instagramStatistics?.used || 0) / (stats?.apiCosts?.instagramStatistics?.limit || 10000)) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Geschätzte Kosten</span>
                  <span className="font-bold text-green-400">${stats?.apiCosts?.instagramStatistics?.cost?.toFixed(2) || '0.00'} / $75.00</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Pro Plan: $75/Monat für 10.000 Requests (â $0.0075/Request)
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Feature-Nutzung (Monat)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.featureUsage && stats.featureUsage.length > 0 ? (
                  stats.featureUsage.slice(0, 6).map((feature: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{feature.feature.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{feature.uniqueUsers} User</span>
                        <Badge variant="secondary">{formatNumber(feature.usageCount)}x</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Keine Daten verfügbar</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preisberechnung für echte Follower-Daten */}
        <Card className="mb-8 bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-violet-500" />
              Preisberechnung für echte Follower-Daten
            </CardTitle>
            <CardDescription>
              Kalkulation basierend auf Instagram Statistics API Kosten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">API-Kosten</h4>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p>• Pro Plan: $75/Monat (10.000 Requests)</p>
                  <p>• Kosten pro Request: ~$0.0075</p>
                  <p>• Ultra Plan: $189/Monat (50.000 Requests)</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Aktuelle Preise</h4>
                <div className="text-xs space-y-1">
                  <p className="text-green-400">• Starter: €19/Monat (10 Analysen)</p>
                  <p className="text-blue-400">• Pro: €49/Monat (35 Analysen)</p>
                  <p className="text-purple-400">• Business: €99/Monat (100 Analysen)</p>
                  <p className="text-amber-400">• Enterprise: €299/Monat (Unbegrenzt)</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Break-Even Analyse</h4>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p>• API-Kosten/Monat: ~${stats?.apiCosts?.totalMonthlyCost?.toFixed(2) || '0.00'}</p>
                  <p>• MRR: {formatCurrency(stats?.mrr || 0)}</p>
                  <p className="text-green-400">• Marge: {formatCurrency((stats?.mrr || 0) - (stats?.apiCosts?.totalMonthlyCost || 0))}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Plan-Verteilung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {["free", "starter", "pro", "business", "enterprise"].map((plan) => {
                  const count = stats?.planDistribution?.find(p => p.plan === plan)?.count || 0;
                  const total = stats?.totalUsers || 1;
                  const percentage = ((count / total) * 100).toFixed(1);
                  
                  return (
                    <div key={plan} className="text-center">
                      <div className="h-24 bg-muted rounded-lg flex items-end justify-center p-2 mb-2">
                        <div 
                          className="w-full bg-primary rounded transition-all"
                          style={{ height: `${Math.max(5, (count / total) * 100)}%` }}
                        />
                      </div>
                      <p className="text-sm font-medium capitalize">{plan}</p>
                      <p className="text-xs text-muted-foreground">{count} ({percentage}%)</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Verdächtige Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suspiciousUsers && suspiciousUsers.length > 0 ? (
                  suspiciousUsers.slice(0, 5).map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-yellow-500/10 rounded">
                      <div>
                        <p className="text-sm font-medium">{user.name || user.email || "Unbekannt"}</p>
                        <p className="text-xs text-muted-foreground">{user.suspiciousReason}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => {
                          setSelectedUser(user);
                          setBanDialogOpen(true);
                        }}
                      >
                        <Ban className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Keine verdächtigen Accounts gefunden
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {stats?.bannedAccounts || 0} Accounts gesperrt
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Benutzer
            </TabsTrigger>
            <TabsTrigger value="top" className="gap-2">
              <Crown className="h-4 w-4" />
              Top Benutzer
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Umsatz
            </TabsTrigger>
            <TabsTrigger value="tracking" className="gap-2">
              <Activity className="h-4 w-4" />
              Tracking
            </TabsTrigger>
            <TabsTrigger value="abtest" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              A/B-Tests
            </TabsTrigger>
            <TabsTrigger value="suspended" className="gap-2">
              <Ban className="h-4 w-4" />
              Gesperrte User
            </TabsTrigger>
            {/* Cache-Tab entfernt per User-Request */}
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>Benutzer-Verwaltung</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setCreateUserDialogOpen(true)} className="bg-gradient-to-r from-purple-500 to-pink-500">
                      <Users className="h-4 w-4 mr-2" />
                      Neuen User erstellen
                    </Button>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-48"
                      />
                    </div>
                    <Select value={filterPlan} onValueChange={setFilterPlan}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Pläne</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle</SelectItem>
                        <SelectItem value="active">Aktiv</SelectItem>
                        <SelectItem value="banned">Gesperrt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Benutzer</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Analysen</TableHead>
                      <TableHead>Rolle</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registriert</TableHead>
                      <TableHead>Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData?.users?.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name || "Unbekannt"}</p>
                            <p className="text-xs text-muted-foreground">{user.email || user.openId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.plan === "free" ? "secondary" : "default"}>
                            {user.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.credits}</TableCell>
                        <TableCell>{user.totalAnalyses}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "destructive" : user.role === "support" ? "outline" : "secondary"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === "banned" ? "destructive" : user.status === "suspended" ? "outline" : "secondary"}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString("de-DE")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Credits verwalten"
                              onClick={() => {
                                setSelectedUser(user);
                                setCreditsAmount(0);
                                setCreditsReason("");
                                setCreditsDialogOpen(true);
                              }}
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Rolle ändern"
                              onClick={() => {
                                setSelectedUser(user);
                                setNewRole(user.role);
                                setRoleDialogOpen(true);
                              }}
                            >
                              <UserCog className="h-4 w-4" />
                            </Button>
                            {user.status === "banned" ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => unbanUserMutation.mutate({ userId: user.id })}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setBanDialogOpen(true);
                                }}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Seite {currentPage} von {usersData?.pages || 1} ({usersData?.total || 0} Benutzer)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage >= (usersData?.pages || 1)}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Users Tab */}
          <TabsContent value="top">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Top 10 Benutzer nach Aktivität
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Benutzer</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Analysen</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topUsers?.map((user: any, index: number) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <span className={`font-bold ${index < 3 ? "text-yellow-500" : ""}`}>
                            {index + 1}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name || "Unbekannt"}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge>{user.plan}</Badge>
                        </TableCell>
                        <TableCell className="font-bold">{user.totalAnalyses}</TableCell>
                        <TableCell>{user.credits}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === "banned" ? "destructive" : "secondary"}>
                            {user.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Umsatz-Übersicht</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <span>Gesamt-Umsatz</span>
                    <span className="text-2xl font-bold text-green-500">
                      {formatCurrency(stats?.totalRevenue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <span>Monatlicher Umsatz</span>
                    <span className="text-2xl font-bold">
                      {formatCurrency(stats?.monthlyRevenue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <span>Durchschnitt pro Benutzer</span>
                    <span className="text-2xl font-bold">
                      {formatCurrency(stats?.avgRevenuePerUser || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Umsatz-Prognosen */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Umsatz-Prognosen
                  </CardTitle>
                  <CardDescription>Benötigte zahlende Kunden pro Umsatzziel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    // Durchschnittlicher Umsatz pro zahlendem Kunden (basierend auf Paket-Mix)
                    const avgRevenuePerCustomer = 35; // Gewichteter Durchschnitt: 60% Starter (€19), 30% Pro (€49), 10% Business (€99)
                    const currentMonthlyRevenue = stats?.monthlyRevenue || 0;
                    const currentPayingCustomers = Math.ceil(currentMonthlyRevenue / avgRevenuePerCustomer);
                    
                    const targets = [
                      { goal: 10000, label: "€10k/Monat" },
                      { goal: 30000, label: "€30k/Monat" },
                      { goal: 50000, label: "€50k/Monat" },
                      { goal: 100000, label: "€100k/Monat" },
                    ];
                    
                    return (
                      <>
                        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 mb-4">
                          <p className="text-sm text-muted-foreground">Aktueller Stand</p>
                          <p className="text-xl font-bold">{currentPayingCustomers} zahlende Kunden</p>
                          <p className="text-xs text-muted-foreground">bei Ø €{avgRevenuePerCustomer}/Kunde</p>
                        </div>
                        <div className="space-y-3">
                          {targets.map((target) => {
                            const neededCustomers = Math.ceil(target.goal / avgRevenuePerCustomer);
                            const missingCustomers = Math.max(0, neededCustomers - currentPayingCustomers);
                            const progress = Math.min(100, (currentMonthlyRevenue / target.goal) * 100);
                            
                            return (
                              <div key={target.goal} className="p-3 bg-muted rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium">{target.label}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {neededCustomers} Kunden benötigt
                                  </span>
                                </div>
                                <div className="w-full bg-muted-foreground/20 rounded-full h-2 mb-2">
                                  <div 
                                    className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{progress.toFixed(1)}% erreicht</span>
                                  <span className="text-amber-500">+{missingCustomers} fehlen</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Zweite Reihe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Margen-Kalkulation</CardTitle>
                  <CardDescription>Basierend auf Credit-Kosten von ~€0.15/Analyse</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {[
                      { plan: "Starter", price: 9, credits: 25, cost: 3.75 },
                      { plan: "Pro", price: 29, credits: 100, cost: 15 },
                      { plan: "Business", price: 79, credits: 350, cost: 52.5 },
                      { plan: "Enterprise", price: 199, credits: 1000, cost: 150 },
                    ].map((tier) => {
                      const margin = ((tier.price - tier.cost) / tier.price * 100).toFixed(0);
                      const profit = tier.price - tier.cost;
                      return (
                        <div key={tier.plan} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{tier.plan}</p>
                            <p className="text-xs text-muted-foreground">{tier.credits} Credits</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-500">+{formatCurrency(profit)}</p>
                            <p className="text-xs text-muted-foreground">{margin}% Marge</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            {/* Status Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Tracking Status
                  </CardTitle>
                  <CardDescription>
                    Automatisches tägliches Tracking aller gespeicherten Accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm">Gesamt Snapshots</span>
                    <span className="text-xl font-bold">{trackingStats?.totalSnapshots || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm">Getrackte Accounts</span>
                    <span className="text-xl font-bold">{trackingStats?.uniqueAccounts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm">Snapshots heute</span>
                    <span className="text-xl font-bold text-green-500">{trackingStats?.snapshotsToday || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm">Letzter Lauf</span>
                    <span className="text-sm">
                      {trackingStats?.lastTrackingRun 
                        ? new Date(trackingStats.lastTrackingRun).toLocaleString('de-DE')
                        : 'Noch nie'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Manuelles Tracking</CardTitle>
                  <CardDescription>Tracking jetzt für alle Accounts starten</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Das automatische Tracking läuft täglich um 03:00 Uhr.
                  </p>
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={() => runTrackingMutation.mutate()}
                      disabled={runTrackingMutation.isPending}
                      className="gap-2"
                    >
                      {runTrackingMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Activity className="h-4 w-4" />
                      )}
                      {runTrackingMutation.isPending ? 'Läuft...' : 'Tracking starten'}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {trackingAccounts?.length || 0} Accounts
                    </span>
                  </div>
                  {trackingResult && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="font-medium text-green-500 text-sm">Tracking abgeschlossen</p>
                      <p className="text-xs text-muted-foreground">
                        {trackingResult.successful}/{trackingResult.totalAccounts} erfolgreich
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Growing Accounts */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Top Wachstums-Accounts
                    </CardTitle>
                    <CardDescription>Accounts mit dem stärksten Follower-Wachstum</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={trackingPlatformFilter} onValueChange={setTrackingPlatformFilter}>
                      <SelectTrigger className="w-[140px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Plattform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={trackingDaysFilter.toString()} onValueChange={(v) => setTrackingDaysFilter(Number(v))}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Zeitraum" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 Tage</SelectItem>
                        <SelectItem value="14">14 Tage</SelectItem>
                        <SelectItem value="30">30 Tage</SelectItem>
                        <SelectItem value="90">90 Tage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {topGrowingAccounts && topGrowingAccounts.length > 0 ? (
                  <div className="space-y-3">
                    {topGrowingAccounts.map((account, index) => (
                      <div key={`${account.platform}-${account.username}`} className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                            <div className="flex items-center gap-2">
                              {account.platform === 'instagram' && <Instagram className="h-4 w-4 text-pink-500" />}
                              {account.platform === 'tiktok' && <span className="text-sm">🎵</span>}
                              {account.platform === 'youtube' && <Youtube className="h-4 w-4 text-red-500" />}
                              <span className="font-medium">@{account.username}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {account.platform}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {formatNumber(account.startFollowers)} → {formatNumber(account.currentFollowers)}
                              </span>
                              <span className="font-bold text-green-500">
                                +{account.growthPercent.toFixed(1)}%
                              </span>
                            </div>
                            <span className="text-xs text-green-500">
                              +{formatNumber(account.growth)} Follower
                            </span>
                          </div>
                        </div>
                        {/* Sparkline */}
                        {account.sparklineData && account.sparklineData.length > 1 && (
                          <div className="mt-3 h-12 flex items-end gap-[2px]">
                            {account.sparklineData.map((value, i) => {
                              const min = Math.min(...account.sparklineData);
                              const max = Math.max(...account.sparklineData);
                              const range = max - min || 1;
                              const height = ((value - min) / range) * 100;
                              return (
                                <div
                                  key={i}
                                  className="flex-1 bg-green-500/60 rounded-t transition-all hover:bg-green-500"
                                  style={{ height: `${Math.max(height, 5)}%` }}
                                  title={`${formatNumber(value)} Follower`}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Noch keine Wachstumsdaten verfügbar</p>
                    <p className="text-sm">Starte das Tracking, um Daten zu sammeln</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bottom Row: Declining + Platform Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Declining Accounts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    Accounts mit Rückgang
                  </CardTitle>
                  <CardDescription>Accounts mit negativem Wachstum</CardDescription>
                </CardHeader>
                <CardContent>
                  {decliningAccounts && decliningAccounts.length > 0 ? (
                    <div className="space-y-2">
                      {decliningAccounts.map((account) => (
                        <div key={`${account.platform}-${account.username}`} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            {account.platform === 'instagram' && <Instagram className="h-4 w-4 text-pink-500" />}
                            {account.platform === 'tiktok' && <span className="text-sm">🎵</span>}
                            {account.platform === 'youtube' && <Youtube className="h-4 w-4 text-red-500" />}
                            <span className="text-sm">@{account.username}</span>
                          </div>
                          <span className="font-medium text-red-500">-{account.declinePercent.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Keine Accounts mit Rückgang
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Platform Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Plattform-Verteilung
                  </CardTitle>
                  <CardDescription>Verteilung der getrackten Accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  {platformDistribution && platformDistribution.length > 0 ? (
                    <div className="space-y-3">
                      {platformDistribution.map((item) => (
                        <div key={item.platform} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {item.platform === 'instagram' && <Instagram className="h-4 w-4 text-pink-500" />}
                              {item.platform === 'tiktok' && <span>🎵</span>}
                              {item.platform === 'youtube' && <Youtube className="h-4 w-4 text-red-500" />}
                              <span className="capitalize">{item.platform}</span>
                            </div>
                            <span className="text-muted-foreground">
                              {item.count} ({item.percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                item.platform === 'instagram' ? 'bg-gradient-to-r from-pink-500 to-orange-500' :
                                item.platform === 'tiktok' ? 'bg-gradient-to-r from-cyan-500 to-black' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Keine Plattform-Daten verfügbar
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* A/B-Test Tab */}
          <TabsContent value="abtest">
            <ABTestDashboard />
          </TabsContent>

          {/* Suspended Users Tab */}
          <TabsContent value="suspended">
            <SuspendedUsersPanel adminId={user?.id || 0} />
          </TabsContent>

          {/* Cache Dashboard Tab entfernt per User-Request */}
        </Tabs>
      </main>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Benutzer sperren</DialogTitle>
            <DialogDescription>
              Möchtest du {selectedUser?.name || selectedUser?.email || "diesen Benutzer"} wirklich sperren?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Grund für die Sperrung..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedUser && banReason) {
                  banUserMutation.mutate({ userId: selectedUser.id, reason: banReason });
                }
              }}
              disabled={!banReason}
            >
              Sperren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen User erstellen</DialogTitle>
            <DialogDescription>
              Erstelle einen neuen User und sende eine Einladungs-E-Mail
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">E-Mail *</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                placeholder="Max Mustermann"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan</label>
                <Select value={newUserPlan} onValueChange={setNewUserPlan}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Credits</label>
                <Input
                  type="number"
                  value={newUserCredits}
                  onChange={(e) => setNewUserCredits(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateUserDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                if (newUserEmail && newUserName) {
                  createUserMutation.mutate({
                    email: newUserEmail,
                    name: newUserName,
                    initialCredits: newUserCredits,
                    plan: newUserPlan,
                  });
                } else {
                  toast.error("E-Mail und Name sind erforderlich");
                }
              }}
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? "Erstelle..." : "User erstellen & Einladung senden"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credits Dialog */}
      <Dialog open={creditsDialogOpen} onOpenChange={setCreditsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credits verwalten</DialogTitle>
            <DialogDescription>
              Credits für {selectedUser?.name || selectedUser?.email || "diesen User"} anpassen
              <br />
              <span className="text-muted-foreground">Aktuell: {selectedUser?.credits || 0} Credits</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Anzahl Credits (positiv = hinzufügen, negativ = abziehen)</label>
              <Input
                type="number"
                placeholder="z.B. 50 oder -10"
                value={creditsAmount}
                onChange={(e) => setCreditsAmount(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Grund *</label>
              <Input
                placeholder="z.B. Bonus für Feedback, Korrektur, etc."
                value={creditsReason}
                onChange={(e) => setCreditsReason(e.target.value)}
              />
            </div>
            {creditsAmount !== 0 && (
              <div className={`p-3 rounded-lg ${creditsAmount > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                Neuer Stand: {(selectedUser?.credits || 0) + creditsAmount} Credits
                ({creditsAmount > 0 ? '+' : ''}{creditsAmount})
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                if (selectedUser && creditsReason) {
                  addCreditsMutation.mutate({
                    userId: selectedUser.id,
                    amount: creditsAmount,
                    reason: creditsReason,
                    adminId: user?.id || 0,
                  });
                } else {
                  toast.error("Bitte Grund angeben");
                }
              }}
              disabled={addCreditsMutation.isPending || !creditsReason}
            >
              {addCreditsMutation.isPending ? "Speichere..." : "Credits aktualisieren"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rolle ändern</DialogTitle>
            <DialogDescription>
              Ändere die Rolle von {selectedUser?.name || selectedUser?.email || "diesem Benutzer"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={(v) => setNewRole(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Benutzer</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={() => {
                if (selectedUser) {
                  setRoleMutation.mutate({ userId: selectedUser.id, role: newRole });
                }
              }}
            >
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

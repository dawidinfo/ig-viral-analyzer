import { useState } from "react";
import { useLocation } from "wouter";
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
  Activity,
  Shield,
  Ban,
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
              <Button variant="outline" size="sm" onClick={() => {
                refetchStats();
                refetchUsers();
                refetchSuspicious();
                toast.success("Daten aktualisiert");
              }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Aktualisieren
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
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>Benutzer-Verwaltung</CardTitle>
                  <div className="flex flex-wrap gap-2">
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
          <TabsContent value="tracking">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Follower-Tracking Status
                  </CardTitle>
                  <CardDescription>
                    Automatisches tägliches Tracking aller gespeicherten Accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <span>Gesamt Snapshots</span>
                    <span className="text-2xl font-bold">
                      {trackingStats?.totalSnapshots || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <span>Getrackte Accounts</span>
                    <span className="text-2xl font-bold">
                      {trackingStats?.uniqueAccounts || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <span>Snapshots heute</span>
                    <span className="text-2xl font-bold text-green-500">
                      {trackingStats?.snapshotsToday || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <span>Letzter Tracking-Lauf</span>
                    <span className="text-sm">
                      {trackingStats?.lastTrackingRun 
                        ? new Date(trackingStats.lastTrackingRun).toLocaleString('de-DE')
                        : 'Noch nie'
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Manuelles Tracking</CardTitle>
                  <CardDescription>
                    Starte das Tracking manuell für alle gespeicherten Accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                      Das automatische Tracking läuft täglich um 03:00 Uhr nachts.
                      Du kannst es hier auch manuell starten.
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
                        {trackingAccounts?.length || 0} Accounts werden getrackt
                      </span>
                    </div>
                  </div>
                  {trackingResult && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="font-medium text-green-500 mb-2">Tracking abgeschlossen</p>
                      <p className="text-sm">
                        {trackingResult.successful} von {trackingResult.totalAccounts} Accounts erfolgreich getrackt
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
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

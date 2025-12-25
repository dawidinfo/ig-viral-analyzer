import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Zap,
  PiggyBank,
  BarChart3,
  Bell
} from "lucide-react";
import { toast } from "sonner";

export function CacheDashboard() {
  const [days, setDays] = useState(30);
  
  // Fetch cache statistics
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.admin.getCacheStats.useQuery(
    { days },
    { refetchInterval: 60000 } // Refresh every minute
  );

  // Fetch cache history for charts
  const { data: history, isLoading: historyLoading } = trpc.admin.getCacheHistory.useQuery(
    { days },
    { refetchInterval: 60000 }
  );

  // Check cache health mutation
  const checkHealthMutation = trpc.admin.checkCacheHealth.useMutation({
    onSuccess: (result) => {
      if (result.healthy) {
        toast.success(result.message);
      } else {
        toast.warning(result.message);
      }
    },
    onError: (error) => {
      toast.error("Fehler beim Health-Check: " + error.message);
    },
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getHitRateColor = (rate: number) => {
    if (rate >= 70) return "text-green-500";
    if (rate >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getHitRateBadge = (rate: number) => {
    if (rate >= 70) return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Excellent</Badge>;
    if (rate >= 50) return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Gut</Badge>;
    return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Niedrig</Badge>;
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Cache Dashboard
          </h2>
          <p className="text-muted-foreground">API-Kosten Optimierung & Monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-background border border-border rounded-md px-3 py-2 text-sm"
          >
            <option value={7}>Letzte 7 Tage</option>
            <option value={14}>Letzte 14 Tage</option>
            <option value={30}>Letzte 30 Tage</option>
            <option value={90}>Letzte 90 Tage</option>
          </select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchStats()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => checkHealthMutation.mutate({ minHitRate: 50 })}
            disabled={checkHealthMutation.isPending}
          >
            <Bell className="h-4 w-4 mr-2" />
            Health Check
          </Button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cache Hit Rate */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Cache Hit Rate</span>
              </div>
              {getHitRateBadge(stats?.hitRate || 0)}
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-bold ${getHitRateColor(stats?.hitRate || 0)}`}>
                {(stats?.hitRate || 0).toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={stats?.hitRate || 0} 
              className="mt-3 h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {formatNumber(stats?.cacheHits || 0)} Hits / {formatNumber(stats?.totalRequests || 0)} Anfragen
            </p>
          </CardContent>
        </Card>

        {/* Cost Saved */}
        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Gespart</span>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-green-500">
                {formatCurrency(stats?.totalCostSaved || 0)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Durch Cache-Hits eingespart
            </p>
          </CardContent>
        </Card>

        {/* Actual Cost */}
        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-muted-foreground">API-Kosten</span>
              </div>
              <Activity className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-orange-500">
                {formatCurrency(stats?.totalActualCost || 0)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tatsächliche API-Aufrufe
            </p>
          </CardContent>
        </Card>

        {/* Total Requests */}
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Anfragen</span>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-blue-500">
                {formatNumber(stats?.totalRequests || 0)}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <span className="text-green-500">
                <CheckCircle className="h-3 w-3 inline mr-1" />
                {formatNumber(stats?.cacheHits || 0)} Hits
              </span>
              <span className="text-red-500">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                {formatNumber(stats?.cacheMisses || 0)} Misses
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Platform Breakdown
          </CardTitle>
          <CardDescription>Cache-Statistiken nach Plattform</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.byPlatform && Object.keys(stats.byPlatform).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(stats.byPlatform).map(([platform, data]: [string, any]) => (
                <div 
                  key={platform}
                  className="p-4 rounded-lg border border-border bg-card/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium capitalize">{platform}</span>
                    <Badge variant="outline">
                      {data.requests > 0 
                        ? ((data.hits / data.requests) * 100).toFixed(0) 
                        : 0}% Hit Rate
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Anfragen:</span>
                      <span>{formatNumber(data.requests)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cache Hits:</span>
                      <span className="text-green-500">{formatNumber(data.hits)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cache Misses:</span>
                      <span className="text-red-500">{formatNumber(data.misses)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gespart:</span>
                      <span className="text-green-500">{formatCurrency(data.costSaved)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Cache-Daten verfügbar</p>
              <p className="text-sm">Daten werden automatisch gesammelt, sobald Analysen durchgeführt werden.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History Chart */}
      {history && history.dates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Cache Performance Verlauf
            </CardTitle>
            <CardDescription>Hit Rate und Kosten über Zeit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-1">
              {history.dates.map((date, index) => {
                const hitRate = history.hitRates[index];
                const maxHeight = 200;
                const barHeight = (hitRate / 100) * maxHeight;
                
                return (
                  <div 
                    key={date}
                    className="flex-1 flex flex-col items-center group"
                    title={`${date}: ${hitRate}% Hit Rate`}
                  >
                    <div 
                      className={`w-full rounded-t transition-all ${
                        hitRate >= 70 ? 'bg-green-500' : 
                        hitRate >= 50 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      } opacity-70 group-hover:opacity-100`}
                      style={{ height: `${barHeight}px` }}
                    />
                    {index % Math.ceil(history.dates.length / 7) === 0 && (
                      <span className="text-xs text-muted-foreground mt-2 -rotate-45 origin-left">
                        {new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span>≥70% (Excellent)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-500" />
                <span>50-70% (Gut)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span>&lt;50% (Niedrig)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Savings Summary */}
      <Card className="border-green-500/30 bg-gradient-to-r from-green-500/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-green-500" />
                Kostenersparnis Zusammenfassung
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Durch intelligentes Caching eingespart
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-500">
                {formatCurrency(stats?.totalCostSaved || 0)}
              </p>
              <p className="text-sm text-muted-foreground">
                bei {formatNumber(stats?.cacheHits || 0)} Cache-Hits
              </p>
            </div>
          </div>
          
          {stats && stats.totalRequests > 0 && (
            <div className="mt-4 p-4 bg-background/50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{(stats.hitRate).toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Cache Effizienz</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats.totalActualCost > 0 
                      ? ((stats.totalCostSaved / (stats.totalCostSaved + stats.totalActualCost)) * 100).toFixed(0)
                      : 100}%
                  </p>
                  <p className="text-xs text-muted-foreground">Kosten reduziert</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.totalActualCost + stats.totalCostSaved)}
                  </p>
                  <p className="text-xs text-muted-foreground">Ohne Cache</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

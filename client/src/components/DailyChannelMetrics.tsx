import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DailyChannelMetricsProps {
  username: string;
  currentFollowers?: number;
  currentFollowing?: number;
  currentPosts?: number;
}

type TimeRange = '14d' | '30d' | '90d';

// Format number with thousand separators
function formatNumber(num: number): string {
  return num.toLocaleString('de-DE');
}

// Format change with color class
function getChangeColor(change: number): string {
  if (change > 0) return 'text-emerald-500';
  if (change < 0) return 'text-red-500';
  return 'text-zinc-500';
}

// Format change display
function formatChange(change: number): string {
  if (change > 0) return `+${formatNumber(change)}`;
  if (change < 0) return formatNumber(change);
  return '—';
}

export default function DailyChannelMetrics({ 
  username, 
  currentFollowers = 0,
  currentFollowing = 0,
  currentPosts = 0 
}: DailyChannelMetricsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('14d');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 14;

  // Map timeRange to API format
  const apiTimeRange = timeRange === '14d' ? '1m' : timeRange === '30d' ? '1m' : '3m';

  const { data: historyData, isLoading, error, refetch, isFetching } = trpc.instagram.followerHistory.useQuery(
    { username, timeRange: apiTimeRange },
    { enabled: !!username }
  );

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!historyData?.dataPoints || historyData.dataPoints.length < 2) {
      return {
        tableData: [],
        dailyAverage: 0,
        weeklyAverage: 0,
        last14Days: 0,
        last30Days: 0,
        totalPages: 0
      };
    }

    const points = historyData.dataPoints;
    const daysToShow = timeRange === '14d' ? 14 : timeRange === '30d' ? 30 : 90;
    const relevantPoints = points.slice(-daysToShow);
    
    // Calculate daily changes
    const dailyChanges = relevantPoints.map((point, idx) => {
      const prevPoint = idx > 0 ? relevantPoints[idx - 1] : null;
      const change = prevPoint ? point.followers - prevPoint.followers : 0;
      return {
        ...point,
        change,
        following: currentFollowing, // Would need API data for historical
        posts: currentPosts // Would need API data for historical
      };
    });

    // Calculate averages
    const changes = dailyChanges.filter(d => d.change !== 0).map(d => d.change);
    const dailyAverage = changes.length > 0 
      ? Math.round(changes.reduce((a, b) => a + b, 0) / changes.length)
      : 0;
    
    const weeklyAverage = dailyAverage * 7;
    
    // Last 14 and 30 days totals
    const last14 = points.slice(-15);
    const last14Days = last14.length >= 2 
      ? last14[last14.length - 1].followers - last14[0].followers 
      : 0;
    
    const last30 = points.slice(-31);
    const last30Days = last30.length >= 2 
      ? last30[last30.length - 1].followers - last30[0].followers 
      : 0;

    // Reverse for display (newest first)
    const reversed = [...dailyChanges].reverse();
    const start = currentPage * itemsPerPage;
    const tableData = reversed.slice(start, start + itemsPerPage);
    const totalPages = Math.ceil(reversed.length / itemsPerPage);

    return {
      tableData,
      dailyAverage,
      weeklyAverage,
      last14Days,
      last30Days,
      totalPages
    };
  }, [historyData, timeRange, currentPage, currentFollowing, currentPosts]);

  // Get day name
  const getDayName = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { weekday: 'short' });
  };

  // Format date
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="w-6 h-6 animate-spin text-zinc-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !historyData) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-6">
          <p className="text-zinc-500 text-center">Keine Daten verfügbar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards - Clean, minimal design */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-bold ${getChangeColor(metrics.last14Days)}`}>
              {formatChange(metrics.last14Days)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Follower der letzten 14 Tage</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-bold ${getChangeColor(metrics.last30Days)}`}>
              {formatChange(metrics.last30Days)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Follower der letzten 30 Tage</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Channel Metrics Table */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-zinc-200">
              Daily Channel Metrics
            </CardTitle>
            <Select value={timeRange} onValueChange={(v) => { setTimeRange(v as TimeRange); setCurrentPage(0); }}>
              <SelectTrigger className="w-32 h-8 text-xs bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="14d">Letzte 14 Tage</SelectItem>
                <SelectItem value="30d">Letzte 30 Tage</SelectItem>
                <SelectItem value="90d">Letzte 90 Tage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 px-3 text-xs font-medium text-zinc-500 w-12"></th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-zinc-500">Datum</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-zinc-500">+/-</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-zinc-500">Follower</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-zinc-500">Following</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-zinc-500">Posts</th>
                </tr>
              </thead>
              <tbody>
                {metrics.tableData.map((row, idx) => (
                  <tr 
                    key={row.date} 
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-zinc-500 font-medium">
                      {getDayName(row.date)}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-300">
                      {formatDate(row.date)}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono font-semibold ${getChangeColor(row.change)}`}>
                      {formatChange(row.change)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-zinc-300">
                      {formatNumber(row.followers)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-zinc-500">
                      {formatNumber(row.following)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-zinc-500">
                      {formatNumber(row.posts)}
                    </td>
                  </tr>
                ))}
                
                {/* Summary Rows */}
                <tr className="border-t-2 border-zinc-700 bg-zinc-800/30">
                  <td colSpan={2} className="py-2.5 px-3 font-semibold text-zinc-300">
                    Daily Average
                  </td>
                  <td className={`py-2.5 px-3 text-right font-mono font-semibold ${getChangeColor(metrics.dailyAverage)}`}>
                    {formatChange(metrics.dailyAverage)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
                <tr className="bg-zinc-800/30">
                  <td colSpan={2} className="py-2.5 px-3 font-semibold text-zinc-300">
                    Weekly Average
                  </td>
                  <td className={`py-2.5 px-3 text-right font-mono font-semibold ${getChangeColor(metrics.weeklyAverage)}`}>
                    {formatChange(metrics.weeklyAverage)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
                <tr className="bg-zinc-800/30">
                  <td colSpan={2} className="py-2.5 px-3 font-semibold text-zinc-300">
                    Last 30 Days
                  </td>
                  <td className={`py-2.5 px-3 text-right font-mono font-semibold ${getChangeColor(metrics.last30Days)}`}>
                    {formatChange(metrics.last30Days)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
                <tr className="bg-zinc-800/30">
                  <td colSpan={2} className="py-2.5 px-3 font-semibold text-zinc-300">
                    Last 14 Days
                  </td>
                  <td className={`py-2.5 px-3 text-right font-mono font-semibold ${getChangeColor(metrics.last14Days)}`}>
                    {formatChange(metrics.last14Days)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {metrics.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800">
              <p className="text-xs text-zinc-500">
                Seite {currentPage + 1} von {metrics.totalPages}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(metrics.totalPages - 1, p + 1))}
                  disabled={currentPage >= metrics.totalPages - 1}
                  className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trend Summary */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {metrics.dailyAverage > 0 ? (
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
              ) : metrics.dailyAverage < 0 ? (
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-zinc-500/10 flex items-center justify-center">
                  <Minus className="w-5 h-5 text-zinc-500" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  {metrics.dailyAverage > 0 ? 'Wachsender Account' : 
                   metrics.dailyAverage < 0 ? 'Schrumpfender Account' : 'Stabiler Account'}
                </p>
                <p className="text-xs text-zinc-500">
                  Durchschnittlich {formatChange(metrics.dailyAverage)} Follower pro Tag
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-zinc-400 hover:text-zinc-200"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Users,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  Info,
  CheckCircle2,
  Database
} from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Scatter,
  ComposedChart,
  ReferenceArea
} from "recharts";

interface FollowerGrowthChartProps {
  username: string;
}

type TimeRange = '7d' | '1m' | '3m' | '6m' | '1y' | 'max' | 'custom';

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '7 Tage' },
  { value: '1m', label: '1 Monat' },
  { value: '3m', label: '3 Monate' },
  { value: '6m', label: '6 Monate' },
  { value: '1y', label: '1 Jahr' },
  { value: 'max', label: 'Max' },
];

// Format number with full digits and thousand separators (e.g., 71.874)
function formatNumberFull(num: number): string {
  return num.toLocaleString('de-DE');
}

// Format number with K/M suffix for compact display (e.g., 71,9K)
function formatNumberCompact(num: number): string {
  if (Math.abs(num) >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (Math.abs(num) >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString('de-DE');
}

function formatDate(dateStr: string, timeRange: TimeRange): string {
  const date = new Date(dateStr);
  if (timeRange === '7d') {
    return date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric' });
  }
  if (timeRange === '1m') {
    return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  }
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-xl">
        <p className="font-semibold text-sm mb-2">
          {new Date(data.date).toLocaleDateString('de-DE', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}
        </p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground text-sm">Follower:</span>
            <span className="font-bold">{formatNumberFull(data.followers)}</span>
          </div>
          {data.change !== 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground text-sm">Änderung:</span>
              <span className={`font-bold flex items-center gap-1 ${
                data.change > 0 ? 'text-green-400' : data.change < 0 ? 'text-red-400' : ''
              }`}>
                {data.change > 0 ? <ArrowUp className="w-3 h-3" /> : data.change < 0 ? <ArrowDown className="w-3 h-3" /> : null}
                {data.change > 0 ? '+' : ''}{formatNumberFull(data.change)}
                <span className="text-xs opacity-70">
                  ({data.changePercent > 0 ? '+' : ''}{data.changePercent.toFixed(2)}%)
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function FollowerGrowthChart({ username }: FollowerGrowthChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('3m');
  const [currentPage, setCurrentPage] = useState(0);
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [useCompactNumbers, setUseCompactNumbers] = useState(false);
  const itemsPerPage = 10;
  
  // Dynamic format function based on toggle
  const formatNumber = useCompactNumbers ? formatNumberCompact : formatNumberFull;

  // Format custom dates for API
  const customStartDate = customDateRange.from ? format(customDateRange.from, 'yyyy-MM-dd') : undefined;
  const customEndDate = customDateRange.to ? format(customDateRange.to, 'yyyy-MM-dd') : undefined;

  const { data: historyData, isLoading, error, refetch, isFetching } = trpc.instagram.followerHistory.useQuery(
    { 
      username, 
      timeRange,
      customStartDate: timeRange === 'custom' ? customStartDate : undefined,
      customEndDate: timeRange === 'custom' ? customEndDate : undefined
    },
    { 
      enabled: !!username && (timeRange !== 'custom' || (!!customStartDate && !!customEndDate)),
      retry: 2,
      retryDelay: 2000,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Benchmark data for similar accounts
  const { data: benchmarkData } = trpc.instagram.benchmark.useQuery(
    {
      username,
      currentFollowers: historyData?.currentFollowers || 0,
      platform: 'instagram'
    },
    { enabled: !!username && !!historyData?.currentFollowers }
  );

  // Prepare chart data
  // Calculate trend line using linear regression
  const trendData = useMemo(() => {
    if (!historyData?.dataPoints || historyData.dataPoints.length < 2) return { slope: 0, intercept: 0, average: 0, stdDev: 0 };
    
    const points = historyData.dataPoints;
    const n = points.length;
    
    // Calculate average
    const avgFollowers = points.reduce((sum, p) => sum + p.followers, 0) / n;
    
    // Calculate standard deviation for anomaly detection
    const squaredDiffs = points.map(p => Math.pow(p.followers - avgFollowers, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, d) => sum + d, 0) / n;
    const stdDev = Math.sqrt(avgSquaredDiff);
    
    // Linear regression for trend line
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    points.forEach((p, i) => {
      sumX += i;
      sumY += p.followers;
      sumXY += i * p.followers;
      sumX2 += i * i;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept, average: avgFollowers, stdDev };
  }, [historyData]);

  const chartData = useMemo(() => {
    if (!historyData?.dataPoints) return [];
    
    // Sample data points for better visualization
    const points = historyData.dataPoints;
    const { slope, intercept, average, stdDev } = trendData;
    
    // Anomaly thresholds (2 standard deviations = ~95% confidence)
    const upperThreshold = average + (stdDev * 2);
    const lowerThreshold = average - (stdDev * 2);
    
    // Calculate daily changes for anomaly detection
    const dailyChanges = points.map((p, i) => {
      if (i === 0) return 0;
      return p.followers - points[i - 1].followers;
    });
    
    // Calculate average and stdDev of daily changes
    const avgChange = dailyChanges.slice(1).reduce((sum, c) => sum + c, 0) / Math.max(1, dailyChanges.length - 1);
    const changeSquaredDiffs = dailyChanges.slice(1).map(c => Math.pow(c - avgChange, 2));
    const changeStdDev = Math.sqrt(changeSquaredDiffs.reduce((sum, d) => sum + d, 0) / Math.max(1, changeSquaredDiffs.length));
    
    // Add trend line, average, and anomaly detection to each point
    const enrichedPoints = points.map((p, i) => {
      const dailyChange = i > 0 ? p.followers - points[i - 1].followers : 0;
      const isSpike = dailyChange > avgChange + (changeStdDev * 2); // Unusual growth
      const isDip = dailyChange < avgChange - (changeStdDev * 2); // Unusual drop
      const isAnomaly = isSpike || isDip;
      
      return {
        ...p,
        trend: Math.round(slope * i + intercept),
        average: Math.round(average),
        isGrowth: i > 0 ? p.followers >= points[i - 1].followers : true,
        dailyChange,
        isAnomaly,
        isSpike,
        isDip,
        anomalyValue: isAnomaly ? p.followers : null,
        upperBand: Math.round(upperThreshold),
        lowerBand: Math.round(lowerThreshold)
      };
    });
    
    if (enrichedPoints.length <= 30) return enrichedPoints;
    
    // Sample every nth point for longer ranges, but always include anomalies
    const step = Math.ceil(enrichedPoints.length / 30);
    return enrichedPoints.filter((p, i) => i % step === 0 || i === enrichedPoints.length - 1 || p.isAnomaly);
  }, [historyData, trendData]);

  // Paginated table data
  const tableData = useMemo(() => {
    if (!historyData?.dataPoints) return [];
    const reversed = [...historyData.dataPoints].reverse();
    const start = currentPage * itemsPerPage;
    return reversed.slice(start, start + itemsPerPage);
  }, [historyData, currentPage]);

  const totalPages = Math.ceil((historyData?.dataPoints.length || 0) / itemsPerPage);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="relative">
              <Users className="w-5 h-5 text-blue-400" />
              <div className="absolute inset-0 w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
            Follower-Wachstum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 w-12 h-12 border-4 border-blue-500/20 rounded-full" />
                <div className="absolute inset-0 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">KI holt frische Daten für dich...</p>
                <p className="text-xs text-muted-foreground">Lade Follower-Verlauf</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !historyData) {
    return (
      <Card className="bg-gradient-to-br from-red-500/5 to-orange-500/5 border-red-500/20">
        <CardContent className="p-6">
          <p className="text-red-400">Fehler beim Laden der Follower-Daten</p>
        </CardContent>
      </Card>
    );
  }

  const { summary, isDemo, realDataPoints } = historyData;
  const trendIcon = summary.trend === 'rising' ? TrendingUp : summary.trend === 'declining' ? TrendingDown : Minus;
  const trendColor = summary.trend === 'rising' ? 'text-green-400' : summary.trend === 'declining' ? 'text-red-400' : 'text-yellow-400';
  const trendBg = summary.trend === 'rising' ? 'bg-green-500/20 border-green-500/30' : summary.trend === 'declining' ? 'bg-red-500/20 border-red-500/30' : 'bg-yellow-500/20 border-yellow-500/30';
  
  // Check if we have enough data for meaningful display
  const hasEnoughData = realDataPoints >= 2;
  const isTrackingStarted = realDataPoints === 1;

  return (
    <div className="space-y-6">
      {/* Main Chart Card */}
      <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="w-6 h-6 text-blue-400" />
                Follower-Wachstum
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-green-500/20 border-green-500/30 text-green-400 text-xs cursor-help flex items-center gap-1 animate-verified-pulse">
                      <CheckCircle2 className="w-3 h-3" />
                      Verifiziert
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[280px] p-3">
                    <div className="flex items-start gap-2">
                      <Database className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-green-400 mb-1">Verifizierte Echtzeit-Daten</p>
                        <p className="text-xs text-muted-foreground">Diese Daten stammen direkt von der offiziellen Instagram Statistics API und werden täglich aktualisiert.</p>
                      </div>
                    </div>
                  </TooltipContent>
                </UITooltip>
              </CardTitle>
              <CardDescription>
                Historische Entwicklung der Follower-Zahlen
              </CardDescription>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex flex-wrap items-center gap-2">
              {TIME_RANGE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={timeRange === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setTimeRange(option.value);
                    setCurrentPage(0);
                  }}
                  className={timeRange === option.value 
                    ? "bg-blue-500 hover:bg-blue-600" 
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                  }
                >
                  {option.label}
                </Button>
              ))}
              
              {/* Custom Date Range Picker */}
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={timeRange === 'custom' ? "default" : "outline"}
                    size="sm"
                    className={`gap-2 ${timeRange === 'custom' 
                      ? "bg-purple-500 hover:bg-purple-600" 
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <CalendarRange className="w-4 h-4" />
                    {timeRange === 'custom' && customDateRange.from && customDateRange.to ? (
                      <span className="text-xs">
                        {format(customDateRange.from, 'dd.MM.yy', { locale: de })} - {format(customDateRange.to, 'dd.MM.yy', { locale: de })}
                      </span>
                    ) : (
                      "Zeitraum"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background/95 backdrop-blur-sm border-border" align="end">
                  <div className="p-4 space-y-4">
                    <div className="text-sm font-medium text-center">Zeitraum auswählen</div>
                    <CalendarComponent
                      mode="range"
                      selected={{ from: customDateRange.from, to: customDateRange.to }}
                      onSelect={(range) => {
                        setCustomDateRange({ from: range?.from, to: range?.to });
                        if (range?.from && range?.to) {
                          setTimeRange('custom');
                          setCurrentPage(0);
                          // Close popover after selection
                          setTimeout(() => setIsDatePickerOpen(false), 300);
                        }
                      }}
                      numberOfMonths={2}
                      disabled={(date) => date > new Date() || date < new Date('2020-01-01')}
                      locale={de}
                      className="rounded-md"
                    />
                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCustomDateRange({ from: undefined, to: undefined });
                          setTimeRange('1m');
                          setIsDatePickerOpen(false);
                        }}
                      >
                        Zurücksetzen
                      </Button>
                      {customDateRange.from && customDateRange.to && (
                        <div className="text-xs text-muted-foreground">
                          {Math.ceil((customDateRange.to.getTime() - customDateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1} Tage
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Number Format Toggle */}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Format:</span>
                <div className="flex rounded-lg overflow-hidden border border-white/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUseCompactNumbers(false)}
                    className={`rounded-none px-3 py-1 h-8 text-xs ${!useCompactNumbers 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    71.874
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUseCompactNumbers(true)}
                    className={`rounded-none px-3 py-1 h-8 text-xs ${useCompactNumbers 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    71,9K
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Summary Stats */}
          <TooltipProvider delayDuration={200}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <UITooltip>
                <TooltipTrigger asChild>
                  <div className="bg-white/5 rounded-xl p-4 text-center cursor-help hover:bg-white/10 transition-colors group relative">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Info className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Aktuell</p>
                    <p className="text-2xl font-bold">{formatNumber(historyData.currentFollowers)}</p>
                    {/* Tagesveränderung */}
                    {historyData.dataPoints.length >= 2 && (() => {
                      const lastPoint = historyData.dataPoints[historyData.dataPoints.length - 1];
                      const prevPoint = historyData.dataPoints[historyData.dataPoints.length - 2];
                      const dayChange = lastPoint.followers - prevPoint.followers;
                      const dayChangePercent = prevPoint.followers > 0 ? ((dayChange / prevPoint.followers) * 100).toFixed(2) : 0;
                      return (
                        <div className={`text-xs mt-1 flex items-center justify-center gap-1 ${dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {dayChange >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          <span>{dayChange >= 0 ? '+' : ''}{formatNumber(dayChange)} ({dayChangePercent}%)</span>
                        </div>
                      );
                    })()}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[250px] p-3">
                  <div className="flex items-start gap-2">
                    <Database className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-green-400 mb-1">Echte Daten</p>
                      <p className="text-xs text-muted-foreground">Aktuelle Follower-Zahl direkt von Instagram. Wird bei jeder Analyse aktualisiert. Die Veränderung zeigt den Unterschied zum Vortag.</p>
                    </div>
                  </div>
                </TooltipContent>
              </UITooltip>

              <UITooltip>
                <TooltipTrigger asChild>
                  <div className="bg-white/5 rounded-xl p-4 text-center cursor-help hover:bg-white/10 transition-colors group relative">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Info className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Wachstum</p>
                    <p className={`text-2xl font-bold ${summary.totalGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {summary.totalGrowth >= 0 ? '+' : ''}{formatNumber(summary.totalGrowth)}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[250px] p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-green-400 mb-1">Echte historische Daten</p>
                      <p className="text-xs text-muted-foreground">Gesamtwachstum im ausgewählten Zeitraum. Berechnet aus echten Instagram-Statistiken.</p>
                    </div>
                  </div>
                </TooltipContent>
              </UITooltip>

              <UITooltip>
                <TooltipTrigger asChild>
                  <div className="bg-white/5 rounded-xl p-4 text-center cursor-help hover:bg-white/10 transition-colors group relative">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Info className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Prozent</p>
                    <p className={`text-2xl font-bold ${summary.totalGrowthPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {summary.totalGrowthPercent >= 0 ? '+' : ''}{summary.totalGrowthPercent}%
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[250px] p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-green-400 mb-1">Echte Wachstumsrate</p>
                      <p className="text-xs text-muted-foreground">Prozentuales Wachstum basierend auf echten historischen Follower-Daten von Instagram.</p>
                    </div>
                  </div>
                </TooltipContent>
              </UITooltip>

              <UITooltip>
                <TooltipTrigger asChild>
                  <div className="bg-white/5 rounded-xl p-4 text-center cursor-help hover:bg-white/10 transition-colors group relative">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Info className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Ø Täglich</p>
                    <p className={`text-2xl font-bold ${summary.avgDailyGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {summary.avgDailyGrowth >= 0 ? '+' : ''}{formatNumber(summary.avgDailyGrowth)}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[250px] p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-green-400 mb-1">Echte Tagesdaten</p>
                      <p className="text-xs text-muted-foreground">Durchschnittliches tägliches Wachstum berechnet aus echten Instagram-Statistiken.</p>
                    </div>
                  </div>
                </TooltipContent>
              </UITooltip>

              <UITooltip>
                <TooltipTrigger asChild>
                  <div className={`rounded-xl p-4 text-center border ${trendBg} cursor-help hover:opacity-90 transition-opacity group relative`}>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Info className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Trend</p>
                    <div className={`flex items-center justify-center gap-2 ${trendColor}`}>
                      {summary.trend === 'rising' && <TrendingUp className="w-5 h-5" />}
                      {summary.trend === 'declining' && <TrendingDown className="w-5 h-5" />}
                      {summary.trend === 'stable' && <Minus className="w-5 h-5" />}
                      <span className="font-bold capitalize">
                        {summary.trend === 'rising' ? 'Steigend' : summary.trend === 'declining' ? 'Fallend' : 'Stabil'}
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[250px] p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-green-400 mb-1">Echte Trendanalyse</p>
                      <p className="text-xs text-muted-foreground">Trend basierend auf echten historischen Daten. Zeigt die Entwicklungsrichtung des Accounts.</p>
                    </div>
                  </div>
                </TooltipContent>
              </UITooltip>
            </div>
          </TooltipProvider>

          {/* Wochen- und Monatsvergleich */}
          {historyData.dataPoints.length >= 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Tagesvergleich */}
              {(() => {
                const lastPoint = historyData.dataPoints[historyData.dataPoints.length - 1];
                const prevPoint = historyData.dataPoints[historyData.dataPoints.length - 2];
                const dayChange = lastPoint.followers - prevPoint.followers;
                const dayChangePercent = prevPoint.followers > 0 ? ((dayChange / prevPoint.followers) * 100).toFixed(2) : '0';
                return (
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">24h Vergleich</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {dayChange >= 0 ? (
                        <ArrowUp className="w-5 h-5 text-green-400" />
                      ) : (
                        <ArrowDown className="w-5 h-5 text-red-400" />
                      )}
                      <span className={`text-xl font-bold ${dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {dayChange >= 0 ? '+' : ''}{formatNumber(dayChange)}
                      </span>
                      <span className={`text-sm ${dayChange >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                        ({dayChangePercent}%)
                      </span>
                    </div>
                    {benchmarkData && (
                      <div className="mt-2 pt-2 border-t border-blue-500/20">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Ø {benchmarkData.categoryName}:</span>
                          <span className={benchmarkData.avgDailyGrowth >= 0 ? 'text-blue-400' : 'text-blue-400'}>
                            {benchmarkData.avgDailyGrowth >= 0 ? '+' : ''}{formatNumber(benchmarkData.avgDailyGrowth)}
                          </span>
                        </div>
                        <div className="text-xs mt-1">
                          {dayChange > benchmarkData.avgDailyGrowth ? (
                            <span className="text-green-400">↑ Besser als Durchschnitt</span>
                          ) : dayChange < benchmarkData.avgDailyGrowth ? (
                            <span className="text-amber-400">↓ Unter Durchschnitt</span>
                          ) : (
                            <span className="text-blue-400">= Im Durchschnitt</span>
                          )}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">vs. gestern</p>
                  </div>
                );
              })()}

              {/* Wochenvergleich */}
              {(() => {
                const lastPoint = historyData.dataPoints[historyData.dataPoints.length - 1];
                // Finde Datenpunkt von vor ~7 Tagen
                const weekAgoIndex = Math.max(0, historyData.dataPoints.length - 8);
                const weekAgoPoint = historyData.dataPoints[weekAgoIndex];
                const weekChange = lastPoint.followers - weekAgoPoint.followers;
                const weekChangePercent = weekAgoPoint.followers > 0 ? ((weekChange / weekAgoPoint.followers) * 100).toFixed(2) : '0';
                const hasWeekData = historyData.dataPoints.length >= 7;
                return (
                  <div className={`bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 ${!hasWeekData ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarRange className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-400">7 Tage Vergleich</span>
                    </div>
                    {hasWeekData ? (
                      <>
                        <div className="flex items-center gap-2">
                          {weekChange >= 0 ? (
                            <ArrowUp className="w-5 h-5 text-green-400" />
                          ) : (
                            <ArrowDown className="w-5 h-5 text-red-400" />
                          )}
                          <span className={`text-xl font-bold ${weekChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {weekChange >= 0 ? '+' : ''}{formatNumber(weekChange)}
                          </span>
                          <span className={`text-sm ${weekChange >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                            ({weekChangePercent}%)
                          </span>
                        </div>
                        {benchmarkData && (
                          <div className="mt-2 pt-2 border-t border-purple-500/20">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Ø {benchmarkData.categoryName}:</span>
                              <span className="text-purple-400">
                                {benchmarkData.avgWeeklyGrowth >= 0 ? '+' : ''}{formatNumber(benchmarkData.avgWeeklyGrowth)}
                              </span>
                            </div>
                            <div className="text-xs mt-1">
                              {weekChange > benchmarkData.avgWeeklyGrowth ? (
                                <span className="text-green-400">↑ Besser als Durchschnitt</span>
                              ) : weekChange < benchmarkData.avgWeeklyGrowth ? (
                                <span className="text-amber-400">↓ Unter Durchschnitt</span>
                              ) : (
                                <span className="text-purple-400">= Im Durchschnitt</span>
                              )}
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">vs. letzte Woche</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">Noch nicht genug Daten</p>
                        <p className="text-xs text-muted-foreground mt-1">Verfügbar nach 7 Tagen</p>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* Monatsvergleich */}
              {(() => {
                const lastPoint = historyData.dataPoints[historyData.dataPoints.length - 1];
                // Finde Datenpunkt von vor ~30 Tagen
                const monthAgoIndex = Math.max(0, historyData.dataPoints.length - 31);
                const monthAgoPoint = historyData.dataPoints[monthAgoIndex];
                const monthChange = lastPoint.followers - monthAgoPoint.followers;
                const monthChangePercent = monthAgoPoint.followers > 0 ? ((monthChange / monthAgoPoint.followers) * 100).toFixed(2) : '0';
                const hasMonthData = historyData.dataPoints.length >= 30;
                return (
                  <div className={`bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 ${!hasMonthData ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium text-amber-400">30 Tage Vergleich</span>
                    </div>
                    {hasMonthData ? (
                      <>
                        <div className="flex items-center gap-2">
                          {monthChange >= 0 ? (
                            <ArrowUp className="w-5 h-5 text-green-400" />
                          ) : (
                            <ArrowDown className="w-5 h-5 text-red-400" />
                          )}
                          <span className={`text-xl font-bold ${monthChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {monthChange >= 0 ? '+' : ''}{formatNumber(monthChange)}
                          </span>
                          <span className={`text-sm ${monthChange >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                            ({monthChangePercent}%)
                          </span>
                        </div>
                        {benchmarkData && (
                          <div className="mt-2 pt-2 border-t border-amber-500/20">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Ø {benchmarkData.categoryName}:</span>
                              <span className="text-amber-400">
                                {benchmarkData.avgMonthlyGrowth >= 0 ? '+' : ''}{formatNumber(benchmarkData.avgMonthlyGrowth)}
                              </span>
                            </div>
                            <div className="text-xs mt-1">
                              {monthChange > benchmarkData.avgMonthlyGrowth ? (
                                <span className="text-green-400">↑ Besser als Durchschnitt</span>
                              ) : monthChange < benchmarkData.avgMonthlyGrowth ? (
                                <span className="text-amber-400">↓ Unter Durchschnitt</span>
                              ) : (
                                <span className="text-amber-400">= Im Durchschnitt</span>
                              )}
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">vs. letzter Monat</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">Noch nicht genug Daten</p>
                        <p className="text-xs text-muted-foreground mt-1">Verfügbar nach 30 Tagen</p>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* No Data Warning */}
          {isTrackingStarted && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-400 mb-1">Datensammlung gestartet</p>
                  <p className="text-sm text-muted-foreground">
                    Für diesen Account werden ab heute Follower-Daten gesammelt. 
                    Nach einigen Tagen werden hier echte historische Daten angezeigt.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="h-[350px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={trendData.slope >= 0 ? "#22c55e" : "#ef4444"} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={trendData.slope >= 0 ? "#22c55e" : "#ef4444"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => formatDate(val, timeRange)}
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis 
                  tickFormatter={(val) => formatNumber(val)}
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                {/* Durchschnittslinie */}
                <ReferenceLine 
                  y={trendData.average} 
                  stroke="#f59e0b" 
                  strokeDasharray="5 5" 
                  strokeWidth={1.5}
                  label={{ 
                    value: `Ø ${formatNumber(trendData.average)}`, 
                    fill: '#f59e0b', 
                    fontSize: 11,
                    position: 'right'
                  }}
                />
                {/* Trendlinie */}
                <Line
                  type="linear"
                  dataKey="trend"
                  stroke={trendData.slope >= 0 ? "#22c55e" : "#ef4444"}
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={false}
                  name="Trend"
                />
                {/* Hauptlinie */}
                <Area
                  type="monotone"
                  dataKey="followers"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#followerGradient)"
                  name="Follower"
                />
                {/* Anomalie-Punkte */}
                <Line
                  type="monotone"
                  dataKey="anomalyValue"
                  stroke="transparent"
                  dot={(props: any) => {
                    const { cx, cy, payload, index } = props;
                    if (!payload?.isAnomaly || cx === undefined || cy === undefined) return <g key={`empty-${index}`} />;
                    const color = payload.isSpike ? '#22c55e' : '#ef4444';
                    return (
                      <g key={`anomaly-${payload.date}-${index}`}>
                        {/* Pulsierender Kreis */}
                        <circle cx={cx} cy={cy} r={8} fill={color} fillOpacity={0.3}>
                          <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="fill-opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                        </circle>
                        {/* Innerer Kreis */}
                        <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />
                        {/* Icon */}
                        {payload.isSpike ? (
                          <text x={cx} y={cy + 3} textAnchor="middle" fill="white" fontSize={8} fontWeight="bold">↑</text>
                        ) : (
                          <text x={cx} y={cy + 3} textAnchor="middle" fill="white" fontSize={8} fontWeight="bold">↓</text>
                        )}
                      </g>
                    );
                  }}
                  activeDot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          {/* Trend-Legende */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-500 rounded"></div>
              <span className="text-muted-foreground">Follower</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-0.5 ${trendData.slope >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded`} style={{ borderStyle: 'dashed' }}></div>
              <span className="text-muted-foreground">Trendlinie ({trendData.slope >= 0 ? '↑ Aufwärts' : '↓ Abwärts'})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-amber-500 rounded" style={{ borderStyle: 'dashed' }}></div>
              <span className="text-muted-foreground">Durchschnitt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
              <span className="text-muted-foreground">Spike (↑)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white"></div>
              <span className="text-muted-foreground">Einbruch (↓)</span>
            </div>
          </div>
          
          {/* Anomalie-Hinweise */}
          {chartData.some(p => p.isAnomaly) && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-400">Anomalien erkannt</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {chartData.filter(p => p.isSpike).length > 0 && (
                      <span className="text-green-400">{chartData.filter(p => p.isSpike).length} ungewöhnliche Spikes</span>
                    )}
                    {chartData.filter(p => p.isSpike).length > 0 && chartData.filter(p => p.isDip).length > 0 && ' • '}
                    {chartData.filter(p => p.isDip).length > 0 && (
                      <span className="text-red-400">{chartData.filter(p => p.isDip).length} ungewöhnliche Einbrüche</span>
                    )}
                    {' '}— Diese Punkte weichen stark vom Durchschnitt ab (2+ Standardabweichungen).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Best/Worst Days */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-green-400">Bester Tag</span>
              </div>
              <p className="text-lg font-bold">+{formatNumber(summary.bestDay.growth)} Follower</p>
              <p className="text-xs text-muted-foreground">
                {new Date(summary.bestDay.date).toLocaleDateString('de-DE', { 
                  weekday: 'long', day: 'numeric', month: 'long' 
                })}
              </p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-sm font-semibold text-red-400">Schwächster Tag</span>
              </div>
              <p className="text-lg font-bold">{formatNumber(summary.worstDay.growth)} Follower</p>
              <p className="text-xs text-muted-foreground">
                {new Date(summary.worstDay.date).toLocaleDateString('de-DE', { 
                  weekday: 'long', day: 'numeric', month: 'long' 
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Growth Table */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Tägliches Wachstum
          </CardTitle>
          <CardDescription>
            Detaillierte Übersicht der täglichen Follower-Änderungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Datum</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Follower</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Änderung</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">%</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((point, idx) => (
                  <tr key={`${point.date}-${idx}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-sm">
                      {new Date(point.date).toLocaleDateString('de-DE', { 
                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-mono">
                      {formatNumber(point.followers)}
                    </td>
                    <td className={`py-3 px-4 text-sm text-right font-mono font-semibold ${
                      point.change > 0 ? 'text-green-400' : point.change < 0 ? 'text-red-400' : 'text-muted-foreground'
                    }`}>
                      {point.change > 0 ? '+' : ''}{formatNumber(point.change)}
                    </td>
                    <td className={`py-3 px-4 text-sm text-right font-mono ${
                      point.changePercent > 0 ? 'text-green-400' : point.changePercent < 0 ? 'text-red-400' : 'text-muted-foreground'
                    }`}>
                      {point.changePercent > 0 ? '+' : ''}{point.changePercent.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <p className="text-sm text-muted-foreground">
                Seite {currentPage + 1} von {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="bg-white/5 border-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="bg-white/5 border-white/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
  ReferenceLine
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
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');
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

  const { data: historyData, isLoading, error } = trpc.instagram.followerHistory.useQuery(
    { 
      username, 
      timeRange,
      customStartDate: timeRange === 'custom' ? customStartDate : undefined,
      customEndDate: timeRange === 'custom' ? customEndDate : undefined
    },
    { enabled: !!username && (timeRange !== 'custom' || (!!customStartDate && !!customEndDate)) }
  );

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!historyData?.dataPoints) return [];
    
    // Sample data points for better visualization
    const points = historyData.dataPoints;
    if (points.length <= 30) return points;
    
    // Sample every nth point for longer ranges
    const step = Math.ceil(points.length / 30);
    return points.filter((_, i) => i % step === 0 || i === points.length - 1);
  }, [historyData]);

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
            <Users className="w-5 h-5 text-blue-400" />
            Follower-Wachstum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 animate-spin" />
              <span className="text-sm text-muted-foreground">Lade Verlaufsdaten...</span>
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
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[250px] p-3">
                  <div className="flex items-start gap-2">
                    <Database className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-green-400 mb-1">Echte Daten</p>
                      <p className="text-xs text-muted-foreground">Aktuelle Follower-Zahl direkt von Instagram. Wird bei jeder Analyse aktualisiert.</p>
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
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                <Area
                  type="monotone"
                  dataKey="followers"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#followerGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

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
                  <tr key={point.date} className="border-b border-white/5 hover:bg-white/5 transition-colors">
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

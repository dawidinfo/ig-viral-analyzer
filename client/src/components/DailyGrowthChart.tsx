import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar, AlertTriangle } from "lucide-react";

interface DailyGrowthData {
  date: string;
  change: number;
  followers: number;
}

interface DailyGrowthChartProps {
  data: DailyGrowthData[];
  username: string;
}

type TimeRange = "7d" | "30d" | "90d";

export function DailyGrowthChart({ data, username }: DailyGrowthChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  // Filter data based on time range
  const filteredData = data.slice(0, timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90);
  
  // Calculate stats
  const totalChange = filteredData.reduce((sum, d) => sum + d.change, 0);
  const avgChange = Math.round(totalChange / filteredData.length);
  const maxGain = Math.max(...filteredData.map(d => d.change));
  const maxLoss = Math.min(...filteredData.map(d => d.change));
  
  // Find max absolute value for scaling
  const maxAbsValue = Math.max(Math.abs(maxGain), Math.abs(maxLoss), 1);

  // Detect follow/unfollow pattern (large fluctuations)
  const hasLargeFluctuations = filteredData.some(d => Math.abs(d.change) > avgChange * 3);

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Tägliches Follower-Wachstum
            </CardTitle>
            <CardDescription>
              @{username} - Letzte {timeRange === "7d" ? "7 Tage" : timeRange === "30d" ? "30 Tage" : "90 Tage"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {(["7d", "30d", "90d"] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? "bg-primary" : ""}
              >
                {range === "7d" ? "7 Tage" : range === "30d" ? "30 Tage" : "90 Tage"}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className={`text-xl font-bold ${totalChange >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalChange >= 0 ? "+" : ""}{totalChange.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Gesamt</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className={`text-xl font-bold ${avgChange >= 0 ? "text-green-500" : "text-red-500"}`}>
              {avgChange >= 0 ? "+" : ""}{avgChange.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Ø pro Tag</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-xl font-bold text-green-500">+{maxGain.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Bester Tag</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-xl font-bold text-red-500">{maxLoss.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Schlechtester Tag</p>
          </div>
        </div>

        {/* Follow/Unfollow Warning */}
        {hasLargeFluctuations && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-500 text-sm">Follow/Unfollow Muster erkannt</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Große Schwankungen im Follower-Wachstum können auf die Follow/Unfollow-Taktik hinweisen. 
                  Diese Methode kann kurzfristig Follower bringen, schadet aber langfristig dem Account-Standing.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bar Chart */}
        <div className="relative">
          {/* Y-Axis Labels */}
          <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-muted-foreground">
            <span>+{maxAbsValue.toLocaleString()}</span>
            <span>0</span>
            <span>-{maxAbsValue.toLocaleString()}</span>
          </div>
          
          {/* Chart Area */}
          <div className="ml-14 overflow-x-auto">
            <div className="flex items-end gap-1 min-w-max h-48">
              {filteredData.map((day, index) => {
                const height = Math.abs(day.change) / maxAbsValue * 100;
                const isPositive = day.change >= 0;
                
                return (
                  <motion.div
                    key={day.date}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="relative flex flex-col items-center group"
                    style={{ originY: isPositive ? 1 : 0 }}
                  >
                    {/* Bar */}
                    <div 
                      className="relative flex items-center justify-center"
                      style={{ height: "96px" }}
                    >
                      {isPositive ? (
                        <div 
                          className="w-3 sm:w-4 rounded-t bg-gradient-to-t from-green-600 to-green-400 absolute bottom-0"
                          style={{ height: `${height}%` }}
                        />
                      ) : (
                        <div 
                          className="w-3 sm:w-4 rounded-b bg-gradient-to-b from-red-600 to-red-400 absolute top-0"
                          style={{ height: `${height}%` }}
                        />
                      )}
                    </div>
                    
                    {/* Zero Line */}
                    <div className="w-full h-px bg-border" />
                    
                    {/* Negative Space */}
                    <div style={{ height: "96px" }} />
                    
                    {/* Date Label (show every nth) */}
                    {(index % (timeRange === "7d" ? 1 : timeRange === "30d" ? 5 : 15) === 0) && (
                      <span className="text-[10px] text-muted-foreground mt-1 rotate-45 origin-left whitespace-nowrap">
                        {new Date(day.date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
                      </span>
                    )}
                    
                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                      <div className="bg-popover border border-border rounded-lg p-2 shadow-lg text-xs whitespace-nowrap">
                        <p className="font-medium">{new Date(day.date).toLocaleDateString("de-DE")}</p>
                        <p className={isPositive ? "text-green-500" : "text-red-500"}>
                          {isPositive ? "+" : ""}{day.change.toLocaleString()} Follower
                        </p>
                        <p className="text-muted-foreground">Gesamt: {day.followers.toLocaleString()}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-t from-green-600 to-green-400" />
            <span>Follower gewonnen</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-b from-red-600 to-red-400" />
            <span>Follower verloren</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Generate demo data for testing
export function generateDemoGrowthData(days: number = 90): DailyGrowthData[] {
  const data: DailyGrowthData[] = [];
  let followers = 50000;
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Random change with some patterns
    let change = Math.floor(Math.random() * 200) - 50; // -50 to +150
    
    // Add some viral spikes
    if (Math.random() < 0.05) {
      change = Math.floor(Math.random() * 1000) + 500; // Viral day
    }
    
    // Add some bad days
    if (Math.random() < 0.1) {
      change = -Math.floor(Math.random() * 300) - 50; // Bad day
    }
    
    followers += change;
    
    data.push({
      date: date.toISOString().split("T")[0],
      change,
      followers,
    });
  }
  
  return data;
}

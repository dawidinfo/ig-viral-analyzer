import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  BellRing,
  Eye,
  Mail,
  TrendingDown,
  TrendingUp,
  Calendar,
  Shield,
  Sparkles,
  Check,
  Crown,
  Lock
} from "lucide-react";
import { toast } from "sonner";

interface AccountMonitoringProps {
  username: string;
  isTracking?: boolean;
  isPremium?: boolean;
  onTrackingChange?: (tracking: boolean) => void;
  className?: string;
}

export function AccountMonitoring({ 
  username, 
  isTracking = false, 
  isPremium = false,
  onTrackingChange,
  className = "" 
}: AccountMonitoringProps) {
  const [tracking, setTracking] = useState(isTracking);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [engagementAlerts, setEngagementAlerts] = useState(true);
  const [viralAlerts, setViralAlerts] = useState(true);
  const [competitorAlerts, setCompetitorAlerts] = useState(false);

  const handleTrackingToggle = () => {
    if (!isPremium && !tracking) {
      toast.error("Account-Monitoring ist ein Premium-Feature", {
        description: "Upgrade auf Pro um Accounts zu tracken",
        action: {
          label: "Upgrade",
          onClick: () => window.location.href = "/pricing"
        }
      });
      return;
    }
    
    const newValue = !tracking;
    setTracking(newValue);
    onTrackingChange?.(newValue);
    
    if (newValue) {
      toast.success(`@${username} wird jetzt getrackt!`, {
        description: "Du erhältst wöchentliche Reports und Alerts"
      });
    } else {
      toast.info(`Tracking für @${username} deaktiviert`);
    }
  };

  if (!isPremium) {
    return (
      <Card className={`glass-card border-amber-500/30 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-500" />
            Account-Monitoring
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">PRO</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
              Tracke @{username} und erhalte wöchentliche KI-Reports, Engagement-Alerts und Viral-Benachrichtigungen.
            </p>
            <ul className="text-left text-sm space-y-2 mb-6 max-w-xs mx-auto">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-amber-500" />
                Wöchentlicher KI-Performance Report
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <TrendingDown className="w-4 h-4 text-red-500" />
                Engagement-Drop Alerts
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Viral-Reel Benachrichtigungen
              </li>
            </ul>
            <Button 
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              onClick={() => window.location.href = "/pricing"}
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade auf Pro
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-card ${tracking ? 'border-green-500/30' : ''} ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-500" />
            Account-Monitoring
            {tracking && (
              <Badge className="bg-green-500/20 text-green-400 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                Aktiv
              </Badge>
            )}
          </CardTitle>
          <Button
            variant={tracking ? "outline" : "default"}
            size="sm"
            onClick={handleTrackingToggle}
            className={tracking 
              ? "border-green-500/50 text-green-400 hover:bg-green-500/10" 
              : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            }
          >
            {tracking ? (
              <>
                <Check className="w-4 h-4 mr-1.5" />
                Tracking aktiv
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-1.5" />
                KI-Tracking starten
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {tracking 
            ? `Du trackst @${username}. Konfiguriere deine Benachrichtigungen:`
            : `Aktiviere Tracking für @${username} um automatische Reports und Alerts zu erhalten.`
          }
        </p>

        {tracking && (
          <div className="space-y-3 pt-2">
            {/* Weekly Report */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Wöchentlicher KI-Report</p>
                  <p className="text-xs text-muted-foreground">Jeden Montag per E-Mail</p>
                </div>
              </div>
              <Switch 
                checked={weeklyReport} 
                onCheckedChange={setWeeklyReport}
              />
            </div>

            {/* Engagement Alerts */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Engagement-Drop Alerts</p>
                  <p className="text-xs text-muted-foreground">Bei &gt;20% Rückgang</p>
                </div>
              </div>
              <Switch 
                checked={engagementAlerts} 
                onCheckedChange={setEngagementAlerts}
              />
            </div>

            {/* Viral Alerts */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Viral-Reel Alerts</p>
                  <p className="text-xs text-muted-foreground">Bei überdurchschnittlicher Performance</p>
                </div>
              </div>
              <Switch 
                checked={viralAlerts} 
                onCheckedChange={setViralAlerts}
              />
            </div>

            {/* Competitor Alerts */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Konkurrenz-Alerts</p>
                  <p className="text-xs text-muted-foreground">Wenn Konkurrenten viral gehen</p>
                </div>
              </div>
              <Switch 
                checked={competitorAlerts} 
                onCheckedChange={setCompetitorAlerts}
              />
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
              <BellRing className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">KI-Tipp:</strong> Nutzer mit aktivem Monitoring 
              reagieren 3x schneller auf Engagement-Drops und erholen sich im Schnitt 40% schneller.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, 
  Crown, 
  Sparkles,
  TrendingUp,
  BarChart3,
  Lightbulb,
  Mail,
  Eye,
  Zap,
  Check
} from "lucide-react";

interface AnalysisPaywallProps {
  username: string;
  visibleSections: number;
  totalSections: number;
  className?: string;
}

const PREMIUM_FEATURES = [
  { icon: <Sparkles className="w-4 h-4" />, text: "KI-Caption-Generator" },
  { icon: <Lightbulb className="w-4 h-4" />, text: "10 KI-Reel-Ideen" },
  { icon: <Eye className="w-4 h-4" />, text: "Account-Monitoring" },
  { icon: <Mail className="w-4 h-4" />, text: "Wöchentliche Reports" },
  { icon: <BarChart3 className="w-4 h-4" />, text: "Hashtag-Statistiken" },
  { icon: <TrendingUp className="w-4 h-4" />, text: "Beste Posting-Zeiten" },
];

export function AnalysisPaywall({ 
  username, 
  visibleSections, 
  totalSections,
  className = "" 
}: AnalysisPaywallProps) {
  const hiddenSections = totalSections - visibleSections;
  const percentVisible = Math.round((visibleSections / totalSections) * 100);

  return (
    <div className={`relative ${className}`}>
      {/* Gradient Overlay */}
      <div className="absolute inset-x-0 -top-32 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
      
      {/* Paywall Card */}
      <Card className="glass-card border-purple-500/50 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-cyan-500/10 animate-pulse" />
        
        <CardContent className="relative p-8 text-center">
          {/* Lock Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
            <Lock className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold mb-2">
            Vollständige KI-Analyse freischalten
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Du siehst {percentVisible}% der Analyse für @{username}. 
            Schalte {hiddenSections} weitere Premium-Sektionen frei.
          </p>

          {/* Progress Bar */}
          <div className="w-full max-w-xs mx-auto mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Sichtbar</span>
              <span>{visibleSections}/{totalSections} Sektionen</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                style={{ width: `${percentVisible}%` }}
              />
            </div>
          </div>

          {/* Premium Features Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 max-w-lg mx-auto">
            {PREMIUM_FEATURES.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                  {feature.icon}
                </div>
                <span className="text-xs font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30"
              onClick={() => window.location.href = "/pricing"}
            >
              <Crown className="w-5 h-5 mr-2" />
              Jetzt Premium werden
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => window.location.href = "/pricing"}
            >
              Preise ansehen
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-500" />
              Sofortiger Zugang
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-500" />
              Jederzeit kündbar
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-500" />
              14 Tage Geld-zurück
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teaser of Hidden Content */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-50 pointer-events-none">
        <Card className="glass-card p-4 blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="font-medium">KI-Caption-Generator</span>
            <Badge className="bg-purple-500/20 text-purple-400 text-xs">PRO</Badge>
          </div>
          <div className="h-24 bg-muted/30 rounded-lg" />
        </Card>
        <Card className="glass-card p-4 blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-purple-500" />
            <span className="font-medium">KI-Reel-Ideen</span>
            <Badge className="bg-purple-500/20 text-purple-400 text-xs">PRO</Badge>
          </div>
          <div className="h-24 bg-muted/30 rounded-lg" />
        </Card>
      </div>
    </div>
  );
}

/**
 * Inline Paywall for individual sections
 */
interface SectionPaywallProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function SectionPaywall({ title, description, icon }: SectionPaywallProps) {
  return (
    <Card className="glass-card border-purple-500/30">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button 
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          onClick={() => window.location.href = "/pricing"}
        >
          <Zap className="w-4 h-4 mr-1" />
          KI freischalten
        </Button>
      </CardContent>
    </Card>
  );
}

import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Info } from "lucide-react";

interface FeatureTooltipProps {
  children: ReactNode;
  title: string;
  description: string;
  learnMoreUrl?: string;
}

export function FeatureTooltip({ 
  children, 
  title, 
  description,
  learnMoreUrl 
}: FeatureTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-help">
            {children}
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs p-4 bg-popover border border-border shadow-xl"
        >
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              {title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
            {learnMoreUrl && (
              <a 
                href={learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Mehr erfahren →
              </a>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Pre-defined tooltips for common features
export const tooltips = {
  viralScore: {
    title: "Viral Score",
    description: "Der Viral Score (0-100) bewertet das Viral-Potenzial basierend auf 47 Faktoren: Engagement-Rate, Hook-Qualität, Posting-Zeiten, Hashtag-Strategie und mehr. Scores über 70 zeigen hohes Viral-Potenzial.",
  },
  hapss: {
    title: "HAPSS Framework",
    description: "HAPSS steht für Hook, Attention, Problem, Story, Solution. Diese bewährte Formel analysiert, wie gut dein Content strukturiert ist, um Zuschauer zu fesseln und zum Handeln zu bewegen.",
  },
  engagementRate: {
    title: "Engagement Rate",
    description: "Die Engagement Rate zeigt, wie aktiv deine Follower mit deinem Content interagieren. Berechnung: (Likes + Kommentare + Shares) / Follower × 100. Über 3% gilt als sehr gut.",
  },
  hookScore: {
    title: "Hook Score",
    description: "Der Hook Score bewertet die ersten 3 Sekunden deines Reels. Ein starker Hook hält 80%+ der Zuschauer. Wir analysieren Text, Bewegung und Aufmerksamkeitselemente.",
  },
  postingTime: {
    title: "Beste Posting-Zeit",
    description: "Basierend auf deinen erfolgreichsten Posts zeigen wir dir, wann deine Zielgruppe am aktivsten ist. Die Heatmap visualisiert die optimalen Zeiten pro Wochentag.",
  },
  followerGrowth: {
    title: "Follower-Wachstum",
    description: "Historische Daten zeigen dein Wachstum über Zeit. Positive Trends (grün) zeigen gesundes Wachstum, negative Trends (rot) können auf Content-Probleme hinweisen.",
  },
  followUnfollow: {
    title: "Follow/Unfollow Erkennung",
    description: "Große Schwankungen im Following-Count können auf die Follow/Unfollow-Taktik hinweisen. Diese Methode kann kurzfristig Follower bringen, schadet aber langfristig dem Account.",
  },
  aiAnalysis: {
    title: "KI-Tiefenanalyse",
    description: "Unsere KI transkribiert deine Reels und analysiert sie mit bewährten Copywriting-Formeln (Hopkins, Ogilvy, Schwartz). Du erhältst konkrete Verbesserungsvorschläge.",
  },
};

// Simple info icon tooltip
export function InfoTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Info className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-help inline-block ml-1" />
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs p-3 bg-popover border border-border"
        >
          <p className="text-xs text-muted-foreground">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

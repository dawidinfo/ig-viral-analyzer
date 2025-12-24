import { Button } from "@/components/ui/button";
import React from "react";
import { GlobalFooter } from "@/components/GlobalFooter";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Sparkles, 
  Zap, 
  Crown,
  ArrowLeft,
  Star,
  TrendingUp,
  Play,
  Target,
  BarChart3,
  Clock,
  Building2,
  Rocket,
  Brain,
  FileText,
  Users,
  LineChart,
  Mic,
  Hash,
  Calendar,
  Award,
  Lightbulb,
  BookOpen,
  PenTool,
  Eye,
  MessageCircle,
  Layers,
  Gauge,
  Flame
} from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

interface PricingTier {
  name: string;
  price: number;
  yearlyPrice: number;
  analysesPerMonth: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
  enterprise?: boolean;
  cta: string;
  gradient: string;
  color: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: 0,
    yearlyPrice: 0,
    analysesPerMonth: "3 KI-Analysen",
    description: "Zum Ausprobieren",
    icon: <Zap className="w-6 h-6" />,
    gradient: "from-gray-500 to-gray-600",
    color: "gray",
    cta: "Kostenlos starten"
  },
  {
    name: "Starter",
    price: 19,
    yearlyPrice: 15,
    analysesPerMonth: "10 KI-Analysen",
    description: "Für Einsteiger",
    icon: <Sparkles className="w-6 h-6" />,
    gradient: "from-blue-500 to-cyan-500",
    color: "blue",
    cta: "Starter wählen"
  },
  {
    name: "Pro",
    price: 49,
    yearlyPrice: 39,
    analysesPerMonth: "35 KI-Analysen",
    description: "Für Creator",
    icon: <Crown className="w-6 h-6" />,
    popular: true,
    gradient: "from-violet-500 to-purple-500",
    color: "violet",
    cta: "Pro wählen"
  },
  {
    name: "Business",
    price: 99,
    yearlyPrice: 79,
    analysesPerMonth: "100 KI-Analysen",
    description: "Für Agenturen",
    icon: <Building2 className="w-6 h-6" />,
    gradient: "from-amber-500 to-orange-500",
    color: "amber",
    cta: "Business wählen"
  },
  {
    name: "Enterprise",
    price: 299,
    yearlyPrice: 249,
    analysesPerMonth: "Unbegrenzt",
    description: "Für große Agenturen",
    icon: <Rocket className="w-6 h-6" />,
    enterprise: true,
    gradient: "from-rose-500 to-pink-500",
    color: "rose",
    cta: "Kontakt aufnehmen"
  }
];

// Feature categories with detailed descriptions
const featureCategories = [
  {
    title: "KI-Analyse Grundlagen",
    icon: <Brain className="w-5 h-5" />,
    features: [
      {
        name: "Viral Score Berechnung",
        description: "KI berechnet deinen Viral-Score aus 47 Faktoren",
        tiers: { free: true, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Engagement-Rate Analyse",
        description: "Likes, Kommentare, Shares im Verhältnis zu Followern",
        tiers: { free: true, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Reichweiten-Prognose",
        description: "KI prognostiziert deine potenzielle Reichweite",
        tiers: { free: true, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "3.000+ KI-Parameter",
        description: "Umfassende Analyse mit über 3.000 Datenpunkten",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      }
    ]
  },
  {
    title: "HAPSS-Framework Analyse",
    icon: <Target className="w-5 h-5" />,
    features: [
      {
        name: "Hook-Analyse (erste 3 Sekunden)",
        description: "KI analysiert, wie stark dein Hook die Aufmerksamkeit fängt",
        tiers: { free: true, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Attention-Score",
        description: "Messung der Aufmerksamkeitsbindung im gesamten Video",
        tiers: { free: true, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Problem-Identifikation",
        description: "Erkennt, ob du ein klares Problem ansprichst",
        tiers: { free: true, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Solution-Bewertung",
        description: "Bewertet, wie überzeugend deine Lösung präsentiert wird",
        tiers: { free: true, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Story-Analyse",
        description: "Prüft die emotionale Wirkung deiner Geschichte",
        tiers: { free: true, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "HAPSS Gesamt-Score",
        description: "Kombinierter Score aller 5 HAPSS-Elemente",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      }
    ]
  },
  {
    title: "AIDA-Framework Analyse",
    icon: <Flame className="w-5 h-5" />,
    features: [
      {
        name: "Attention-Analyse",
        description: "Wie gut fängst du die Aufmerksamkeit?",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Interest-Bewertung",
        description: "Wie stark weckst du Interesse?",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Desire-Messung",
        description: "Wie gut erzeugst du Verlangen?",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Action-Optimierung",
        description: "Wie klar ist dein Call-to-Action?",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      }
    ]
  },
  {
    title: "Copywriting-Meister Analyse",
    icon: <PenTool className="w-5 h-5" />,
    features: [
      {
        name: "Claude Hopkins Score",
        description: "\"Scientific Advertising\" - Faktenbasierte Überzeugung",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      },
      {
        name: "David Ogilvy Score",
        description: "\"Confessions\" - Emotionale Headline-Kraft",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      },
      {
        name: "Eugene Schwartz Score",
        description: "\"Breakthrough Advertising\" - Bewusstseins-Stufen",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      },
      {
        name: "Copywriting Gesamt-Score",
        description: "Kombinierte Bewertung aller 3 Meister-Frameworks",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      },
      {
        name: "Verbesserungsvorschläge",
        description: "Konkrete Tipps basierend auf den Frameworks",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      }
    ]
  },
  {
    title: "Transkription & Content",
    icon: <Mic className="w-5 h-5" />,
    features: [
      {
        name: "HOT-Transkription",
        description: "Vollständige Transkription deiner Reels mit KI",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Hook-Wort-Analyse",
        description: "Welche Wörter in den ersten 3 Sekunden wirken",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Keyword-Extraktion",
        description: "Die wichtigsten Keywords aus deinem Content",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Sentiment-Analyse",
        description: "Emotionale Tonalität deines Contents",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      }
    ]
  },
  {
    title: "Follower & Wachstum",
    icon: <TrendingUp className="w-5 h-5" />,
    features: [
      {
        name: "7 Tage Wachstums-Chart",
        description: "Follower-Entwicklung der letzten Woche",
        tiers: { free: true, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "30 Tage Wachstums-Chart",
        description: "Follower-Entwicklung des letzten Monats",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "90 Tage Wachstums-Chart",
        description: "Follower-Entwicklung der letzten 3 Monate",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      },
      {
        name: "1 Jahr Follower-Historie",
        description: "Vollständige Jahresübersicht deines Wachstums",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      },
      {
        name: "Tägliche Wachstumstabelle",
        description: "Detaillierte Aufschlüsselung pro Tag mit +/- Anzeige",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Wachstums-Prognose",
        description: "KI prognostiziert dein zukünftiges Wachstum",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      }
    ]
  },
  {
    title: "Posting-Optimierung",
    icon: <Calendar className="w-5 h-5" />,
    features: [
      {
        name: "Beste Posting-Zeiten",
        description: "KI ermittelt deine optimalen Posting-Zeiten",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Wochentag-Analyse",
        description: "An welchen Tagen performt dein Content am besten",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Engagement-Heatmap",
        description: "Visuelle Darstellung der besten Zeiten (7x24 Grid)",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Personalisierte Empfehlungen",
        description: "Individuelle Posting-Strategie für dein Profil",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      }
    ]
  },
  {
    title: "Hashtag & SEO",
    icon: <Hash className="w-5 h-5" />,
    features: [
      {
        name: "Hashtag-Analyse",
        description: "Bewertung deiner verwendeten Hashtags",
        tiers: { free: true, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Top-Hashtag Empfehlungen",
        description: "KI schlägt die besten Hashtags für dich vor",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Caption SEO-Score",
        description: "Wie gut ist deine Caption für die Suche optimiert",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Keyword-Dichte Analyse",
        description: "Optimale Keyword-Verteilung in deinen Captions",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      }
    ]
  },
  {
    title: "Reels & Posts Analyse",
    icon: <Play className="w-5 h-5" />,
    features: [
      {
        name: "Top 10 Reels Übersicht",
        description: "Deine erfolgreichsten Reels mit allen Metriken",
        tiers: { free: true, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Top 10 Posts Übersicht",
        description: "Deine erfolgreichsten Posts mit allen Metriken",
        tiers: { free: true, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Schnitt-Frequenz Analyse",
        description: "Wie oft und wann du schneidest (2-3 Sek = optimal)",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Pattern-Erkennung",
        description: "KI erkennt Muster in deinen viralen Inhalten",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      },
      {
        name: "Viralitäts-Faktoren Radar",
        description: "Visuelle Darstellung aller 47 Viralitäts-Faktoren",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      }
    ]
  },
  {
    title: "Export & Berichte",
    icon: <FileText className="w-5 h-5" />,
    features: [
      {
        name: "PDF-Export",
        description: "Professioneller PDF-Report zum Herunterladen",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      },
      {
        name: "White-Label Reports",
        description: "Reports mit deinem eigenen Branding",
        tiers: { free: false, starter: false, pro: false, business: true, enterprise: true }
      },
      {
        name: "Bulk-Export",
        description: "Mehrere Analysen auf einmal exportieren",
        tiers: { free: false, starter: false, pro: false, business: true, enterprise: true }
      }
    ]
  },
  {
    title: "Vergleich & Benchmark",
    icon: <Users className="w-5 h-5" />,
    features: [
      {
        name: "Competitor-Vergleich",
        description: "Vergleiche dich mit anderen Accounts",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      },
      {
        name: "Branchen-Benchmark",
        description: "Wie stehst du im Vergleich zu deiner Branche",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      },
      {
        name: "Multi-Account Vergleich",
        description: "Bis zu 5 Accounts gleichzeitig vergleichen",
        tiers: { free: false, starter: false, pro: false, business: true, enterprise: true }
      }
    ]
  },
  {
    title: "Plattformen",
    icon: <Layers className="w-5 h-5" />,
    features: [
      {
        name: "Instagram Analyse",
        description: "Vollständige Instagram-Analyse inklusive",
        tiers: { free: true, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "TikTok Analyse",
        description: "TikTok-Modul als Add-on verfügbar (+€9/Monat)",
        tiers: { free: false, starter: false, pro: "addon", business: true, enterprise: true }
      },
      {
        name: "YouTube Analyse",
        description: "YouTube-Modul als Add-on verfügbar (+€9/Monat)",
        tiers: { free: false, starter: false, pro: "addon", business: true, enterprise: true }
      }
    ]
  },
  {
    title: "KI-Content-Generator",
    icon: <Sparkles className="w-5 h-5" />,
    features: [
      {
        name: "KI-Caption-Generator",
        description: "5 verschiedene Caption-Stile basierend auf Top-Performern",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      },
      {
        name: "KI-Reel-Ideen-Generator",
        description: "10 personalisierte Content-Ideen mit geschätzten Views",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      },
      {
        name: "KI-Hook-Vorschläge",
        description: "Optimierte Hooks basierend auf viralen Mustern",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      },
      {
        name: "KI-Hashtag-Generator",
        description: "Automatisch generierte Hashtag-Sets für maximale Reichweite",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      },
      {
        name: "Unbegrenzte KI-Generierungen",
        description: "Keine Limits bei der Content-Generierung",
        tiers: { free: false, starter: false, pro: false, business: true, enterprise: true }
      }
    ]
  },
  {
    title: "Account-Monitoring & Alerts",
    icon: <Eye className="w-5 h-5" />,
    features: [
      {
        name: "Account-Tracking",
        description: "Tracke beliebige Accounts und erhalte Updates",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      },
      {
        name: "Wöchentlicher KI-Report",
        description: "Automatischer Performance-Report jeden Montag per E-Mail",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      },
      {
        name: "Engagement-Drop Alerts",
        description: "Sofortige Benachrichtigung bei Engagement-Rückgängen",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      },
      {
        name: "Viral-Reel Alerts",
        description: "Benachrichtigung wenn ein Reel viral geht",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      },
      {
        name: "Konkurrenz-Monitoring",
        description: "Alerts wenn Konkurrenten viral gehen",
        tiers: { free: false, starter: false, pro: false, business: true, enterprise: true }
      },
      {
        name: "Unbegrenzte Tracked Accounts",
        description: "Tracke so viele Accounts wie du möchtest",
        tiers: { free: false, starter: false, pro: false, business: true, enterprise: true }
      }
    ]
  },
  {
    title: "Erweiterte Statistiken",
    icon: <LineChart className="w-5 h-5" />,
    features: [
      {
        name: "Hashtag-Statistiken",
        description: "Performance-Ranking deiner verwendeten Hashtags",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Beste Posting-Zeit Heatmap",
        description: "7x24 Grid zeigt optimale Posting-Zeiten",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Post-Interaktionen Chart",
        description: "Interaktionen pro Post mit Thumbnails visualisiert",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Detaillierte Post-Analyse Tabelle",
        description: "Alle Posts mit Datum, Mentions, Hashtags, Interaktionen",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Zeitraum-Filter (7/30/90 Tage)",
        description: "Filtere Analysen nach beliebigem Zeitraum",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Reel-Sortierung nach Performance",
        description: "Sortiere Reels nach Views, Likes oder Engagement",
        tiers: { free: true, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Viral-Badge Erkennung",
        description: "Automatische Markierung überdurchschnittlicher Reels",
        tiers: { free: true, starter: true, pro: true, business: true, enterprise: true }
      }
    ]
  },
  {
    title: "Vergleich & Analyse",
    icon: <Users className="w-5 h-5" />,
    features: [
      {
        name: "Split-Screen Vergleich",
        description: "Zwei Accounts nebeneinander vergleichen",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Best Performing Reel Highlight",
        description: "Größere Vorschau des besten Reels mit Details",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Quick-Swap Button",
        description: "Accounts mit einem Klick tauschen",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Reel-Performance Vergleich",
        description: "Side-by-side Reels-Vergleich mit Metriken",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Multi-Account Vergleich",
        description: "Bis zu 5 Accounts gleichzeitig vergleichen",
        tiers: { free: false, starter: false, pro: false, business: true, enterprise: true }
      }
    ]
  },
  {
    title: "Support & Service",
    icon: <Award className="w-5 h-5" />,
    features: [
      {
        name: "E-Mail Support",
        description: "Support per E-Mail",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Priority Support",
        description: "Bevorzugte Bearbeitung deiner Anfragen",
        tiers: { free: false, starter: false, pro: true, business: true, enterprise: true }
      },
      {
        name: "Dedizierter Account Manager",
        description: "Persönlicher Ansprechpartner für dich",
        tiers: { free: false, starter: false, pro: false, business: false, enterprise: true }
      },
      {
        name: "Onboarding & Training",
        description: "Persönliche Einführung in alle Features",
        tiers: { free: false, starter: false, pro: false, business: false, enterprise: true }
      }
    ]
  },
  {
    title: "Erweiterte Features",
    icon: <Rocket className="w-5 h-5" />,
    features: [
      {
        name: "Analysen speichern",
        description: "Speichere Analysen für späteren Zugriff",
        tiers: { free: false, starter: true, pro: true, business: true, enterprise: true }
      },
      {
        name: "Team-Accounts",
        description: "Mehrere Nutzer pro Account",
        tiers: { free: false, starter: false, pro: false, business: "5 User", enterprise: "Unbegrenzt" }
      },
      {
        name: "API-Zugang",
        description: "Programmatischer Zugriff auf alle Analysen",
        tiers: { free: false, starter: false, pro: false, business: false, enterprise: true }
      },
      {
        name: "Whitelabel-Lösung",
        description: "ReelSpy unter deiner eigenen Marke",
        tiers: { free: false, starter: false, pro: false, business: false, enterprise: true }
      },
      {
        name: "Custom Integrationen",
        description: "Individuelle Anbindungen an deine Systeme",
        tiers: { free: false, starter: false, pro: false, business: false, enterprise: true }
      }
    ]
  }
];

export default function Pricing() {
  const [, setLocation] = useLocation();
  const [isYearly, setIsYearly] = useState(false);
  const { user } = useAuth();

  // Stripe checkout mutation
  const checkoutMutation = trpc.credits.createCheckout.useMutation({
    onSuccess: (data) => {
      toast.success("Weiterleitung zum Checkout...");
      window.open(data.url, "_blank");
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Erstellen des Checkouts");
    },
  });

  const handlePurchase = (tierName: string) => {
    // Free tier - just go to dashboard
    if (tierName === "free") {
      setLocation("/dashboard");
      return;
    }

    // Enterprise - contact form
    if (tierName === "enterprise") {
      window.open("mailto:enterprise@reelspy.ai?subject=Enterprise%20Anfrage", "_blank");
      return;
    }

    // Check if user is logged in
    if (!user) {
      toast.info("Bitte melde dich zuerst an");
      window.location.href = getLoginUrl();
      return;
    }

    // Map tier names to package IDs
    const packageMap: Record<string, "starter" | "pro" | "business"> = {
      starter: "starter",
      pro: "pro",
      business: "business",
    };

    const packageId = packageMap[tierName];
    if (!packageId) {
      toast.error("Ungültiger Plan");
      return;
    }

    // Create checkout session
    checkoutMutation.mutate({ packageId });
  };

  const getTierValue = (tierValue: boolean | string) => {
    if (tierValue === true) {
      return <Check className="w-5 h-5 text-emerald-500" />;
    }
    if (tierValue === false) {
      return <span className="text-muted-foreground/50">—</span>;
    }
    if (tierValue === "addon") {
      return <span className="text-xs text-amber-500 font-medium">+€9</span>;
    }
    return <span className="text-xs text-emerald-500 font-medium">{tierValue}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="container flex items-center justify-between h-16">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">ReelSpy.ai</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <Badge className="badge-neon mb-4">EINFACHES PRICING</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Wähle deinen
              <br />
              <span className="text-gradient">Analyse-Plan</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Starte kostenlos mit 3 KI-Analysen. Upgrade jederzeit für mehr Power.
            </p>

            {/* Billing Toggle */}
            <div className="relative inline-flex flex-col items-center gap-3">
              {/* Rabatt-Banner */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0 shadow-lg animate-pulse">
                  🎉 Spare 20% bei jährlicher Zahlung
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 p-1.5 rounded-full bg-muted/80 backdrop-blur-sm border border-border/50 shadow-lg">
                <button
                  onClick={() => setIsYearly(false)}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    !isYearly 
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Monatlich
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                    isYearly 
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Jährlich
                  {!isYearly && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-xs font-bold">
                      -20%
                    </span>
                  )}
                </button>
              </div>
              
              {isYearly && (
                <p className="text-sm text-emerald-500 font-medium">
                  ✓ Jährliche Abrechnung aktiv - Du sparst bei jedem Plan!
                </p>
              )}
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-7xl mx-auto mb-20">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative ${tier.popular ? 'lg:-mt-4 lg:mb-4' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 shadow-lg">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      BELIEBTESTE WAHL
                    </Badge>
                  </div>
                )}
                
                <div className={`h-full rounded-2xl border ${
                  tier.popular 
                    ? 'border-violet-500/50 bg-gradient-to-b from-violet-500/10 to-transparent shadow-xl shadow-violet-500/10' 
                    : 'border-border bg-card'
                } p-6 flex flex-col`}>
                  {/* Header */}
                  <div className="mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center text-white mb-3`}>
                      {tier.icon}
                    </div>
                    <h3 className="text-xl font-bold">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        €{isYearly ? tier.yearlyPrice : tier.price}
                      </span>
                      {tier.price > 0 && (
                        <span className="text-muted-foreground">/Monat</span>
                      )}
                    </div>
                    {isYearly && tier.price > 0 && (
                      <p className="text-sm text-emerald-500">
                        Spare €{(tier.price - tier.yearlyPrice) * 12}/Jahr
                      </p>
                    )}
                  </div>

                  {/* Analyses */}
                  <div className="mb-6 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-violet-500" />
                      <span className="font-semibold">{tier.analysesPerMonth}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tier.name === "Free" ? "einmalig" : "pro Monat"}
                    </p>
                  </div>

                  {/* CTA */}
                  <Button 
                    className={`w-full mt-auto ${
                      tier.popular 
                        ? 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600' 
                        : ''
                    }`}
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => handlePurchase(tier.name.toLowerCase())}
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? "Wird geladen..." : tier.cta}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Feature Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Alle Features im Detail</h2>
              <p className="text-muted-foreground">
                Vergleiche alle {featureCategories.reduce((acc, cat) => acc + cat.features.length, 0)} Features der verschiedenen Pläne
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Header */}
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-medium text-muted-foreground w-1/3">Feature</th>
                    {pricingTiers.map((tier) => (
                      <th key={tier.name} className={`text-center py-4 px-2 font-medium ${tier.popular ? 'text-violet-500' : ''}`}>
                        {tier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {featureCategories.map((category, catIndex) => (
                    <React.Fragment key={`category-${catIndex}`}>
                      {/* Category Header */}
                      <tr className="bg-muted/30">
                        <td colSpan={6} className="py-4 px-4">
                          <div className="flex items-center gap-2 font-semibold">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-violet-500">
                              {category.icon}
                            </div>
                            {category.title}
                          </div>
                        </td>
                      </tr>
                      {/* Features */}
                      {category.features.map((feature, featIndex) => (
                        <tr key={`feat-${catIndex}-${featIndex}`} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium">{feature.name}</div>
                              <div className="text-sm text-muted-foreground">{feature.description}</div>
                            </div>
                          </td>
                          <td className="text-center py-4 px-2">{getTierValue(feature.tiers.free)}</td>
                          <td className="text-center py-4 px-2">{getTierValue(feature.tiers.starter)}</td>
                          <td className={`text-center py-4 px-2 ${pricingTiers[2].popular ? 'bg-violet-500/5' : ''}`}>
                            {getTierValue(feature.tiers.pro)}
                          </td>
                          <td className="text-center py-4 px-2">{getTierValue(feature.tiers.business)}</td>
                          <td className="text-center py-4 px-2">{getTierValue(feature.tiers.enterprise)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Platform Modules */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-4xl mx-auto mt-20"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Plattform-Module</h2>
              <p className="text-muted-foreground">
                Erweitere deine Analyse auf weitere Plattformen (ab Pro-Plan)
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">TikTok Modul</h3>
                    <p className="text-sm text-muted-foreground">+€9/Monat</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    TikTok Profil-Analyse
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Video KI-Tiefenanalyse
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Trend-Erkennung
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Sound-Analyse
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">YouTube Modul</h3>
                    <p className="text-sm text-muted-foreground">+€9/Monat</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    YouTube Kanal-Analyse
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Video KI-Tiefenanalyse
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Thumbnail-Analyse
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    SEO-Optimierung
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-emerald-500/50 bg-gradient-to-b from-emerald-500/10 to-transparent">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">All-in-One Bundle</h3>
                    <p className="text-sm text-emerald-500">+€15/Monat (spare €3)</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Instagram (inklusive)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    TikTok Modul
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    YouTube Modul
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Alle zukünftigen Plattformen
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="max-w-3xl mx-auto mt-20"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Häufige Fragen</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-border bg-card">
                <h3 className="font-semibold mb-2">Was ist eine KI-Analyse?</h3>
                <p className="text-sm text-muted-foreground">
                  Eine KI-Analyse umfasst die vollständige Auswertung eines Instagram-Profils mit allen Features deines Plans: 
                  Viral Score, HAPSS-Framework, Copywriting-Analyse, Wachstumsdaten und mehr. Eine Analyse = Ein Profil komplett analysiert.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card">
                <h3 className="font-semibold mb-2">Kann ich jederzeit upgraden oder downgraden?</h3>
                <p className="text-sm text-muted-foreground">
                  Ja, du kannst deinen Plan jederzeit ändern. Bei einem Upgrade werden die verbleibenden Tage anteilig verrechnet. 
                  Bei einem Downgrade gilt der neue Plan ab der nächsten Abrechnungsperiode.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card">
                <h3 className="font-semibold mb-2">Verfallen ungenutzte Analysen?</h3>
                <p className="text-sm text-muted-foreground">
                  Ja, nicht genutzte Analysen verfallen am Ende des Abrechnungszeitraums und werden nicht in den nächsten Monat übertragen.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card">
                <h3 className="font-semibold mb-2">Wie funktionieren die Plattform-Module?</h3>
                <p className="text-sm text-muted-foreground">
                  Die Module für TikTok und YouTube sind Add-ons, die du zu deinem bestehenden Plan hinzubuchen kannst (ab Pro). 
                  Im Business-Plan sind alle Plattformen bereits inklusive.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-20"
          >
            <h2 className="text-2xl font-bold mb-4">Bereit durchzustarten?</h2>
            <p className="text-muted-foreground mb-6">
              Starte jetzt kostenlos mit 3 KI-Analysen und entdecke, was viral geht.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
              onClick={() => setLocation('/')}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Kostenlos starten
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Global Footer */}
      <GlobalFooter />
    </div>
  );
}

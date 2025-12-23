import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  X, 
  Sparkles, 
  Zap, 
  Crown,
  ArrowLeft,
  Star,
  TrendingUp,
  Play,
  MessageSquare,
  Target,
  BarChart3,
  Users,
  Clock,
  Shield,
  Headphones,
  Code,
  Infinity,
  Building2,
  Rocket,
  Plus,
  Info
} from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PricingTier {
  name: string;
  price: number;
  yearlyPrice: number;
  credits: number | string;
  pricePerCredit: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
  enterprise?: boolean;
  features: {
    text: string;
    included: boolean;
    highlight?: boolean;
  }[];
  cta: string;
  gradient: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: 0,
    yearlyPrice: 0,
    credits: 10,
    pricePerCredit: "Geschenkt",
    description: "Zum Ausprobieren",
    icon: <Zap className="w-6 h-6" />,
    gradient: "from-gray-500 to-gray-600",
    features: [
      { text: "10 Credits einmalig", included: true },
      { text: "Instagram Basis-Analyse", included: true },
      { text: "Viral Score", included: true },
      { text: "HAPSS-Framework", included: true },
      { text: "7 Tage Wachstum", included: true },
      { text: "KI-Tiefenanalyse", included: false },
      { text: "PDF-Export", included: false },
      { text: "TikTok & YouTube", included: false },
      { text: "Competitor-Vergleich", included: false },
      { text: "API-Zugang", included: false },
    ],
    cta: "Kostenlos starten"
  },
  {
    name: "Starter",
    price: 19,
    yearlyPrice: 15,
    credits: 30,
    pricePerCredit: "€0.63",
    description: "Für Einsteiger",
    icon: <Sparkles className="w-6 h-6" />,
    gradient: "from-blue-500 to-cyan-500",
    features: [
      { text: "30 Credits / Monat", included: true, highlight: true },
      { text: "Instagram Vollanalyse", included: true },
      { text: "3.000+ KI-Parameter", included: true },
      { text: "HAPSS + Copywriting", included: true },
      { text: "30 Tage Wachstum", included: true },
      { text: "Posting-Zeit-Analyse", included: true },
      { text: "KI-Tiefenanalyse", included: true },
      { text: "PDF-Export", included: false },
      { text: "TikTok & YouTube", included: false },
      { text: "API-Zugang", included: false },
    ],
    cta: "Starter wählen"
  },
  {
    name: "Pro",
    price: 49,
    yearlyPrice: 39,
    credits: 100,
    pricePerCredit: "€0.49",
    description: "Für Creator - Beliebteste Wahl",
    icon: <Crown className="w-6 h-6" />,
    popular: true,
    gradient: "from-violet-500 to-purple-500",
    features: [
      { text: "100 Credits / Monat", included: true, highlight: true },
      { text: "Alles aus Starter", included: true },
      { text: "Hopkins, Ogilvy, Schwartz", included: true, highlight: true },
      { text: "1 Jahr Wachstum", included: true },
      { text: "PDF-Export", included: true, highlight: true },
      { text: "Competitor-Vergleich", included: true },
      { text: "TikTok Modul (+€9)", included: true },
      { text: "YouTube Modul (+€9)", included: true },
      { text: "Priority E-Mail Support", included: true },
      { text: "API-Zugang", included: false },
    ],
    cta: "Pro wählen"
  },
  {
    name: "Business",
    price: 99,
    yearlyPrice: 79,
    credits: 300,
    pricePerCredit: "€0.33",
    description: "Für Agenturen & Teams",
    icon: <Building2 className="w-6 h-6" />,
    gradient: "from-amber-500 to-orange-500",
    features: [
      { text: "300 Credits / Monat", included: true, highlight: true },
      { text: "Alles aus Pro", included: true },
      { text: "TikTok & YouTube inklusive", included: true, highlight: true },
      { text: "White-Label Reports", included: true, highlight: true },
      { text: "Team-Accounts (5 User)", included: true },
      { text: "Prioritäts-Support", included: true },
      { text: "Bulk-Analysen", included: true },
      { text: "Custom Branding", included: true },
      { text: "API-Zugang", included: false },
      { text: "Dedizierter Account Manager", included: false },
    ],
    cta: "Business wählen"
  },
  {
    name: "Enterprise",
    price: 299,
    yearlyPrice: 249,
    credits: "1.000+",
    pricePerCredit: "€0.25",
    description: "Für große Agenturen & Whitelabel",
    icon: <Rocket className="w-6 h-6" />,
    enterprise: true,
    gradient: "from-rose-500 to-pink-500",
    features: [
      { text: "1.000+ Credits / Monat", included: true, highlight: true },
      { text: "Alles aus Business", included: true },
      { text: "API-Zugang", included: true, highlight: true },
      { text: "Whitelabel-Lösung", included: true, highlight: true },
      { text: "Unbegrenzte Team-Accounts", included: true },
      { text: "Dedizierter Account Manager", included: true },
      { text: "Custom Integrationen", included: true },
      { text: "SLA Garantie (99.9%)", included: true },
      { text: "Onboarding & Training", included: true },
      { text: "Individuelle Preise möglich", included: true },
    ],
    cta: "Kontakt aufnehmen"
  }
];

const creditCosts = [
  { action: "Instagram Basis-Analyse", credits: 1, description: "Profil, Follower, Engagement" },
  { action: "Instagram KI-Tiefenanalyse", credits: 3, description: "HAPSS, Copywriting, Viral Score" },
  { action: "TikTok Basis-Analyse", credits: 1, description: "Profil, Views, Engagement" },
  { action: "TikTok KI-Tiefenanalyse", credits: 3, description: "Hook-Analyse, Trends" },
  { action: "YouTube Basis-Analyse", credits: 2, description: "Kanal, Abonnenten, Views" },
  { action: "YouTube KI-Tiefenanalyse", credits: 5, description: "Thumbnail, Titel, SEO" },
  { action: "PDF-Export", credits: 1, description: "Professioneller Report" },
  { action: "Competitor-Vergleich", credits: 2, description: "Bis zu 5 Accounts" },
];

const platformModules = [
  { 
    name: "TikTok Modul", 
    price: 9, 
    description: "TikTok-Analysen freischalten",
    features: ["TikTok Basis-Analyse", "TikTok KI-Tiefenanalyse", "Trend-Erkennung", "Sound-Analyse"]
  },
  { 
    name: "YouTube Modul", 
    price: 9, 
    description: "YouTube-Analysen freischalten",
    features: ["YouTube Basis-Analyse", "YouTube KI-Tiefenanalyse", "Thumbnail-Analyse", "SEO-Optimierung"]
  },
  { 
    name: "All-in-One Bundle", 
    price: 15, 
    originalPrice: 18,
    description: "Alle Plattformen zum Sparpreis",
    features: ["Instagram", "TikTok", "YouTube", "Spare €3/Monat"]
  },
];

export default function Pricing() {
  const [, setLocation] = useLocation();
  const [isYearly, setIsYearly] = useState(false);

  return (
    <TooltipProvider>
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
              <Badge className="badge-neon mb-4">CREDIT-BASIERTES PRICING</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Zahle nur für das,
                <br />
                <span className="text-gradient">was du wirklich nutzt</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Flexibles Credit-System mit über 300% Mehrwert. 
                Starte kostenlos mit 10 Credits und skaliere nach Bedarf.
              </p>

              {/* Billing Toggle */}
              <div className="inline-flex items-center gap-4 p-1 rounded-full bg-muted">
                <button
                  onClick={() => setIsYearly(false)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    !isYearly ? 'bg-background shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  Monatlich
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    isYearly ? 'bg-background shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  Jährlich
                  <Badge className="ml-2 bg-accent text-accent-foreground text-xs">-20%</Badge>
                </button>
              </div>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto mb-16">
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
                      <Badge className="bg-accent text-accent-foreground font-bold px-4 whitespace-nowrap">
                        BELIEBTESTE WAHL
                      </Badge>
                    </div>
                  )}
                  {tier.enterprise && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-rose-500 text-white font-bold px-4 whitespace-nowrap">
                        ENTERPRISE
                      </Badge>
                    </div>
                  )}
                  <div className={`h-full rounded-2xl p-1 ${
                    tier.popular 
                      ? 'gradient-border' 
                      : tier.enterprise 
                        ? 'bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30'
                        : 'glass-card'
                  }`}>
                    <div className={`h-full rounded-xl p-6 ${tier.popular || tier.enterprise ? 'bg-background' : ''}`}>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center text-white mb-4`}>
                        {tier.icon}
                      </div>
                      
                      <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                      
                      <div className="mb-2">
                        <span className="text-4xl font-black">
                          {tier.price === 0 ? 'Kostenlos' : `€${isYearly ? tier.yearlyPrice : tier.price}`}
                        </span>
                        {tier.price > 0 && (
                          <span className="text-muted-foreground">/mo</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-6">
                        <Badge variant="secondary" className="text-xs">
                          {typeof tier.credits === 'number' ? `${tier.credits} Credits` : tier.credits}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {tier.pricePerCredit}/Credit
                        </span>
                      </div>

                      <Button 
                        className={`w-full mb-6 ${
                          tier.popular 
                            ? 'btn-gradient text-white border-0' 
                            : tier.enterprise
                              ? 'bg-rose-500 hover:bg-rose-600 text-white'
                              : ''
                        }`}
                        variant={tier.popular || tier.enterprise ? 'default' : 'outline'}
                        onClick={() => {
                          if (tier.enterprise) {
                            window.location.href = 'mailto:enterprise@reelspy.ai?subject=Enterprise%20Anfrage';
                          } else {
                            // TODO: Stripe checkout
                            alert('Stripe Integration kommt bald!');
                          }
                        }}
                      >
                        {tier.cta}
                      </Button>

                      <ul className="space-y-2">
                        {tier.features.map((feature, i) => (
                          <li key={i} className={`flex items-start gap-2 text-sm ${
                            !feature.included ? 'text-muted-foreground' : ''
                          }`}>
                            {feature.included ? (
                              <Check className={`w-4 h-4 shrink-0 mt-0.5 ${
                                feature.highlight ? 'text-accent' : 'text-green-500'
                              }`} />
                            ) : (
                              <X className="w-4 h-4 shrink-0 mt-0.5" />
                            )}
                            <span className={feature.highlight ? 'font-medium' : ''}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Credit Costs Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-4xl mx-auto mb-16"
            >
              <h2 className="text-2xl font-bold text-center mb-8">
                Credit-Kosten pro Aktion
              </h2>
              <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Aktion</th>
                      <th className="text-center p-4 font-medium">Credits</th>
                      <th className="text-left p-4 font-medium hidden md:table-cell">Beschreibung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditCosts.map((item, i) => (
                      <tr key={i} className="border-t border-border/50">
                        <td className="p-4">{item.action}</td>
                        <td className="p-4 text-center">
                          <Badge variant="secondary">{item.credits}</Badge>
                        </td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">
                          {item.description}
                        </td>
                      </tr>
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
              className="max-w-4xl mx-auto mb-16"
            >
              <h2 className="text-2xl font-bold text-center mb-4">
                Plattform-Module
              </h2>
              <p className="text-center text-muted-foreground mb-8">
                Erweitere deine Analyse-Möglichkeiten mit zusätzlichen Plattformen
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                {platformModules.map((module, i) => (
                  <div key={i} className="glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">{module.name}</h3>
                      <div className="text-right">
                        {module.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through mr-2">
                            €{module.originalPrice}
                          </span>
                        )}
                        <span className="text-xl font-bold">€{module.price}</span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                    <ul className="space-y-2">
                      {module.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-accent shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Margin Calculator Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="max-w-2xl mx-auto text-center mb-16"
            >
              <div className="glass-card rounded-2xl p-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Shield className="w-6 h-6 text-accent" />
                  <h3 className="text-xl font-bold">14 Tage Geld-zurück-Garantie</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Nicht zufrieden? Kein Problem. Wir erstatten dir den vollen Betrag 
                  innerhalb von 14 Tagen - ohne Fragen.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    Keine versteckten Kosten
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    Jederzeit kündbar
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    Sichere Zahlung via Stripe
                  </div>
                </div>
              </div>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-center mb-8">
                Häufig gestellte Fragen
              </h2>
              <div className="space-y-4">
                {[
                  {
                    q: "Was passiert mit ungenutzten Credits?",
                    a: "Ungenutzte Credits verfallen am Ende des Abrechnungszeitraums. Wir empfehlen, einen Plan zu wählen, der zu deinem tatsächlichen Bedarf passt."
                  },
                  {
                    q: "Kann ich meinen Plan jederzeit ändern?",
                    a: "Ja! Du kannst jederzeit upgraden oder downgraden. Bei einem Upgrade werden die Credits sofort gutgeschrieben, bei einem Downgrade gilt der neue Plan ab dem nächsten Abrechnungszeitraum."
                  },
                  {
                    q: "Wie funktioniert das Credit-System?",
                    a: "Jede Aktion kostet eine bestimmte Anzahl an Credits. Eine Basis-Analyse kostet 1 Credit, eine KI-Tiefenanalyse 3 Credits. So zahlst du nur für das, was du wirklich nutzt."
                  },
                  {
                    q: "Gibt es Mengenrabatte?",
                    a: "Ja! Je höher dein Plan, desto günstiger wird der Preis pro Credit. Im Enterprise-Plan zahlst du nur €0.25 pro Credit statt €0.63 im Starter-Plan."
                  },
                  {
                    q: "Kann ich zusätzliche Credits kaufen?",
                    a: "Ja, du kannst jederzeit Credit-Pakete nachkaufen, ohne deinen Plan zu ändern. Kontaktiere uns für individuelle Angebote."
                  }
                ].map((faq, i) => (
                  <div key={i} className="glass-card rounded-xl p-6">
                    <h4 className="font-bold mb-2">{faq.q}</h4>
                    <p className="text-muted-foreground text-sm">{faq.a}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-16 bg-muted/20">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">
              Bereit, viral zu gehen?
            </h2>
            <p className="text-muted-foreground mb-8">
              Starte jetzt mit 10 kostenlosen Credits und entdecke, was deine Reels erfolgreich macht.
            </p>
            <Button 
              size="lg"
              className="btn-gradient text-white border-0"
              onClick={() => setLocation('/')}
            >
              Kostenlos starten
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}

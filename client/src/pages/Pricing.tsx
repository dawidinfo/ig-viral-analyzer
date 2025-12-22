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
  Infinity
} from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";

interface PricingTier {
  name: string;
  price: number;
  yearlyPrice: number;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
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
    name: "Starter",
    price: 9,
    yearlyPrice: 7,
    description: "Perfekt für Einsteiger und kleine Creator",
    icon: <Zap className="w-6 h-6" />,
    gradient: "from-blue-500 to-cyan-500",
    features: [
      { text: "10 Account-Analysen / Monat", included: true },
      { text: "Basis Viral Score", included: true },
      { text: "Engagement-Rate Berechnung", included: true },
      { text: "Hashtag-Analyse", included: true },
      { text: "Caption-Längen Analyse", included: true },
      { text: "AI Reel-Transkription", included: false },
      { text: "AIDA & HAPSS Analyse", included: false },
      { text: "Viral-Muster Erkennung", included: false },
      { text: "Account-Vergleich", included: false },
      { text: "PDF-Export", included: false },
      { text: "API-Zugang", included: false },
      { text: "Priority Support", included: false },
    ],
    cta: "Starter wählen"
  },
  {
    name: "Pro",
    price: 29,
    yearlyPrice: 24,
    description: "Für professionelle Creator und Agenturen",
    icon: <Sparkles className="w-6 h-6" />,
    popular: true,
    gradient: "from-violet-500 to-purple-500",
    features: [
      { text: "50 Account-Analysen / Monat", included: true },
      { text: "Erweiterter Viral Score", included: true },
      { text: "Engagement-Rate Berechnung", included: true },
      { text: "Hashtag-Analyse", included: true },
      { text: "Caption-Längen Analyse", included: true },
      { text: "AI Reel-Transkription", included: true, highlight: true },
      { text: "AIDA & HAPSS Analyse", included: true, highlight: true },
      { text: "Viral-Muster Erkennung", included: true, highlight: true },
      { text: "Account-Vergleich", included: true },
      { text: "PDF-Export", included: true },
      { text: "API-Zugang", included: false },
      { text: "Priority Support", included: false },
    ],
    cta: "Pro wählen"
  },
  {
    name: "Business",
    price: 49,
    yearlyPrice: 39,
    description: "Für Teams und Enterprise-Kunden",
    icon: <Crown className="w-6 h-6" />,
    gradient: "from-amber-500 to-orange-500",
    features: [
      { text: "Unbegrenzte Analysen", included: true, highlight: true },
      { text: "Premium Viral Score", included: true },
      { text: "Engagement-Rate Berechnung", included: true },
      { text: "Hashtag-Analyse", included: true },
      { text: "Caption-Längen Analyse", included: true },
      { text: "AI Reel-Transkription", included: true },
      { text: "AIDA & HAPSS Analyse", included: true },
      { text: "Viral-Muster Erkennung", included: true },
      { text: "Account-Vergleich", included: true },
      { text: "PDF-Export", included: true },
      { text: "API-Zugang", included: true, highlight: true },
      { text: "Priority Support", included: true, highlight: true },
    ],
    cta: "Business wählen"
  }
];

const featureDetails = [
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Account-Analysen",
    description: "Detaillierte Analyse von Instagram-Profilen mit allen wichtigen KPIs"
  },
  {
    icon: <Play className="w-5 h-5" />,
    title: "AI Reel-Transkription",
    description: "Automatische Transkription von Reels mit KI-gestützter Spracherkennung"
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "AIDA & HAPSS Analyse",
    description: "Professionelle Framework-Analyse für Content-Optimierung"
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Viral-Muster Erkennung",
    description: "KI erkennt erfolgreiche Muster und gibt Empfehlungen"
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Account-Vergleich",
    description: "Vergleiche zwei Accounts nebeneinander für Wettbewerbsanalyse"
  },
  {
    icon: <Code className="w-5 h-5" />,
    title: "API-Zugang",
    description: "Integriere ReelSpy.ai in deine eigenen Tools und Workflows"
  }
];

const faqs = [
  {
    question: "Kann ich jederzeit kündigen?",
    answer: "Ja, du kannst dein Abonnement jederzeit kündigen. Es gibt keine langfristigen Verträge oder versteckten Gebühren."
  },
  {
    question: "Welche Zahlungsmethoden werden akzeptiert?",
    answer: "Wir akzeptieren alle gängigen Kreditkarten (Visa, Mastercard, American Express) sowie PayPal und SEPA-Lastschrift."
  },
  {
    question: "Gibt es eine Geld-zurück-Garantie?",
    answer: "Ja, wir bieten eine 14-tägige Geld-zurück-Garantie. Wenn du nicht zufrieden bist, erstatten wir dir den vollen Betrag."
  },
  {
    question: "Was passiert, wenn ich mein Kontingent aufbrauche?",
    answer: "Du kannst jederzeit auf ein höheres Paket upgraden oder zusätzliche Analysen als Add-on kaufen."
  },
  {
    question: "Sind meine Daten sicher?",
    answer: "Absolut. Wir speichern keine Instagram-Zugangsdaten und alle Analysen werden verschlüsselt übertragen."
  }
];

export default function Pricing() {
  const [, setLocation] = useLocation();
  const [isYearly, setIsYearly] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/")}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
              <img src="/logo.svg" alt="ReelSpy.ai" className="h-8 w-auto" />
            </div>
          </div>
          
          <Button 
            onClick={() => setLocation("/")}
            className="btn-gradient text-white border-0"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Kostenlos testen
          </Button>
        </div>
      </nav>

      <main className="pt-24 pb-16 relative z-10">
        <div className="container">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Star className="w-3 h-3 mr-1" />
              Preise & Pakete
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Wähle dein{" "}
              <span className="text-gradient">perfektes Paket</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Starte kostenlos und upgrade, wenn du bereit bist. Alle Pakete beinhalten 
              unsere Basis-Analysefunktionen.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm ${!isYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Monatlich
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isYearly ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Jährlich
            </span>
            {isYearly && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Spare 20%
              </Badge>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative glass-card rounded-2xl p-6 ${
                  tier.popular ? 'border-2 border-primary ring-2 ring-primary/20' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Beliebteste Wahl
                    </Badge>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center mb-4`}>
                  {tier.icon}
                </div>

                <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">
                    €{isYearly ? tier.yearlyPrice : tier.price}
                  </span>
                  <span className="text-muted-foreground">/Monat</span>
                </div>

                <Button 
                  className={`w-full mb-6 ${
                    tier.popular 
                      ? 'btn-gradient text-white border-0' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  onClick={() => {
                    // Placeholder for payment integration
                    alert('Zahlungsintegration kommt bald! Kontaktiere uns für Early Access.');
                  }}
                >
                  {tier.cta}
                </Button>

                <div className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-start gap-3 ${
                        feature.highlight ? 'text-primary font-medium' : ''
                      }`}
                    >
                      {feature.included ? (
                        <Check className={`w-5 h-5 shrink-0 ${
                          feature.highlight ? 'text-primary' : 'text-green-500'
                        }`} />
                      ) : (
                        <X className="w-5 h-5 shrink-0 text-muted-foreground/50" />
                      )}
                      <span className={`text-sm ${
                        !feature.included ? 'text-muted-foreground/50' : ''
                      }`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Feature Details */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-2xl font-bold text-center mb-8">
              Was ist in jedem Feature enthalten?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featureDetails.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="glass-card rounded-xl p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: <Shield className="w-6 h-6" />, text: "SSL Verschlüsselt" },
                { icon: <Clock className="w-6 h-6" />, text: "14 Tage Geld-zurück" },
                { icon: <Headphones className="w-6 h-6" />, text: "24/7 Support" },
                { icon: <Infinity className="w-6 h-6" />, text: "Keine Vertragsbindung" },
              ].map((badge, index) => (
                <div key={index} className="flex flex-col items-center text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2 text-muted-foreground">
                    {badge.icon}
                  </div>
                  <span className="text-sm font-medium">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Häufig gestellte Fragen
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="glass-card rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between"
                  >
                    <span className="font-medium">{faq.question}</span>
                    <div className={`transform transition-transform ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {expandedFaq === index && (
                    <div className="px-5 pb-5">
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-20"
          >
            <h2 className="text-2xl font-bold mb-4">
              Noch unsicher? Teste ReelSpy.ai kostenlos!
            </h2>
            <p className="text-muted-foreground mb-6">
              Keine Kreditkarte erforderlich. Starte sofort mit 3 kostenlosen Analysen.
            </p>
            <Button 
              size="lg"
              onClick={() => setLocation("/")}
              className="btn-gradient text-white border-0"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Kostenlos starten
            </Button>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border/50 relative z-10">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 ReelSpy.ai. Alle Preise zzgl. MwSt.</p>
        </div>
      </footer>
    </div>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { LoginButtonCompact, MobileLoginButton } from "@/components/LoginButton";
import { GlobalFooter } from "@/components/GlobalFooter";
import { HeroDemo } from "@/components/HeroDemo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  TrendingUp, 
  BarChart3, 
  Zap, 
  Eye, 
  MessageSquare,
  Heart,
  Play,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  Users,
  Hash,
  Clock,
  ArrowLeftRight,
  Menu,
  X,
  Shield,
  Award,
  Flame,
  ChevronDown,
  ChevronUp,
  Quote,
  LineChart,
  Brain,
  Rocket,
  Lock,
  RefreshCw,
  FileText,
  Lightbulb,
  Trophy,
  Crown,
  Bookmark,
  Share2,
  ThumbsUp,
  TrendingDown,
  AlertCircle,
  Check,
  Minus
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { LogIn, LogOut, Globe, Building2, ArrowDown, ArrowUp, Info, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { AnimatedDemo } from '@/components/AnimatedDemo';

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "KI-Reel-Analyse",
    description: "3.000+ Parameter analysiert: HAPSS-Framework, Hook-Timing, Schnittfrequenz, Transkription und Copywriting-Formeln.",
    highlight: "3.000+ PARAMETER"
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Engagement Analyse",
    description: "Detaillierte Auswertung von Likes, Comments, Shares und Saves mit Branchen-Benchmarks und Trend-Erkennung."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Viral Score",
    description: "KI-gestützte Bewertung basierend auf 47 Viralitäts-Faktoren inkl. Hopkins, Ogilvy & Schwartz Formeln."
  },
  {
    icon: <LineChart className="w-6 h-6" />,
    title: "Follower-Wachstum",
    description: "Historische Daten und Trends mit anpassbaren Zeiträumen (7d bis 1 Jahr).",
    highlight: "NEU"
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Posting-Zeit-Analyse",
    description: "Finde die besten Zeiten zum Posten mit interaktiver Heatmap.",
    highlight: "NEU"
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Caption Analyse",
    description: "Hook-Qualität, CTA-Effektivität und optimale Länge für mehr Engagement."
  },
  {
    icon: <Hash className="w-6 h-6" />,
    title: "Hashtag Strategie",
    description: "Reichweiten-Analyse und Empfehlungen für die besten Hashtags."
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Optimierungstipps",
    description: "Personalisierte Empfehlungen basierend auf deiner Account-Analyse."
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "PDF-Export",
    description: "Exportiere deine komplette Analyse als professionellen PDF-Report."
  }
];

const stats = [
  { value: "3.000+", label: "KI-Parameter" },
  { value: "50K+", label: "Analysierte Accounts" },
  { value: "98%", label: "Genauigkeit" },
  { value: "4.9/5", label: "Bewertung" }
];

const niches = [
  "🌍 Travel", "💪 Fitness", "🍔 Food", "👗 Fashion", "💄 Beauty", 
  "🐶 Pets", "🎨 Art", "📷 Photography", "🎵 Music", "⚽ Sports",
  "🎮 Gaming", "💼 Business", "🏠 Home Decor", "🌱 Wellness"
];

const testimonials = [
  {
    name: "Fitness Creator",
    role: "Verifizierter Nutzer",
    followers: "125K Follower",
    image: "FC",
    text: "Seit ich ReelSpy nutze, hat sich mein Engagement verdreifacht. Die HAPSS-Analyse zeigt mir genau, wo meine Hooks schwächeln.",
    rating: 5,
    metric: "+312% Engagement",
    beforeAfter: { before: "8.2K", after: "125K", label: "Follower in 3 Monaten" }
  },
  {
    name: "Food Blogger",
    role: "Verifizierter Nutzer",
    followers: "89K Follower",
    image: "FB",
    text: "Die Posting-Zeit-Analyse war ein Game-Changer. Meine Reels erreichen jetzt 3x mehr Menschen zur richtigen Zeit.",
    rating: 5,
    metric: "+280% Reichweite",
    beforeAfter: { before: "2.1%", after: "8.7%", label: "Engagement Rate" }
  },
  {
    name: "Fashion Creator",
    role: "Verifizierter Nutzer",
    followers: "210K Follower",
    image: "FA",
    text: "Endlich verstehe ich, warum manche Reels viral gehen und andere nicht. Die KI-Analyse ist unglaublich präzise.",
    rating: 5,
    metric: "5 virale Reels",
    beforeAfter: { before: "45K", after: "210K", label: "Follower in 6 Monaten" }
  },
  {
    name: "Business Coach",
    role: "Verifizierter Nutzer",
    followers: "67K Follower",
    image: "BC",
    text: "Der Viral Score hat mir geholfen, meinen Content-Stil komplett zu optimieren. ROI innerhalb von 2 Wochen.",
    rating: 5,
    metric: "+45K Follower",
    beforeAfter: { before: "22K", after: "67K", label: "Follower in 2 Monaten" }
  }
];

const comparisonFeatures = [
  { name: "Account-Analyse", free: true, pro: true },
  { name: "Viral Score", free: true, pro: true },
  { name: "KI-Reel-Analyse", free: "1/Tag", pro: "Unbegrenzt" },
  { name: "HAPSS-Framework", free: true, pro: true },
  { name: "Follower-Wachstum Charts", free: "7 Tage", pro: "1 Jahr" },
  { name: "Posting-Zeit-Analyse", free: false, pro: true },
  { name: "Tiefenanalyse", free: false, pro: true },
  { name: "PDF-Export", free: false, pro: true },
  { name: "Competitor-Vergleich", free: false, pro: true },
  { name: "Prioritäts-Support", free: false, pro: true }
];

const faqs = [
  {
    question: "Wie funktioniert die KI-Analyse?",
    answer: "Unsere KI analysiert jeden Aspekt deiner Reels: Hook-Qualität, Storytelling, visuelle Elemente, Caption-Struktur und mehr. Basierend auf Millionen von analysierten Posts erkennen wir Muster, die zu viralem Content führen."
  },
  {
    question: "Ist mein Account sicher?",
    answer: "Absolut. Wir greifen nur auf öffentlich verfügbare Daten zu und speichern keine Login-Daten. Die Analyse erfolgt komplett über öffentliche Instagram-Daten."
  },
  {
    question: "Wie genau ist der Viral Score?",
    answer: "Unser Viral Score hat eine Genauigkeit von 98% basierend auf historischen Daten. Er berücksichtigt 12+ Faktoren wie Engagement-Rate, Hook-Qualität, Posting-Zeit und Content-Typ."
  },
  {
    question: "Kann ich jeden Account analysieren?",
    answer: "Ja, du kannst jeden öffentlichen Instagram-Account analysieren - deinen eigenen oder die deiner Konkurrenten. Private Accounts können nicht analysiert werden."
  },
  {
    question: "Wie oft werden die Daten aktualisiert?",
    answer: "Die Daten werden bei jeder Analyse in Echtzeit abgerufen. Du erhältst immer die aktuellsten Informationen zu Followern, Engagement und Performance."
  },
  {
    question: "Was ist das HAPSS-Framework?",
    answer: "HAPSS steht für Hook, Attention, Problem, Story, Solution - ein bewährtes Framework für viralen Content. Unsere KI analysiert, wie gut deine Reels diese Elemente umsetzen."
  }
];

const useCases = [
  {
    icon: <Users className="w-8 h-8" />,
    title: "Content Creator",
    description: "Verstehe, was bei deiner Zielgruppe funktioniert und optimiere deinen Content für maximale Reichweite.",
    benefits: ["Viral Score für jeden Post", "Hook-Optimierung", "Beste Posting-Zeiten"]
  },
  {
    icon: <Trophy className="w-8 h-8" />,
    title: "Influencer",
    description: "Steigere dein Engagement und zeige Brands deine echte Performance mit detaillierten Analytics.",
    benefits: ["Engagement-Benchmarks", "Wachstums-Tracking", "PDF-Reports für Brands"]
  },
  {
    icon: <Rocket className="w-8 h-8" />,
    title: "Agenturen",
    description: "Analysiere Kundenaccounts und Konkurrenten, um datenbasierte Strategien zu entwickeln.",
    benefits: ["Competitor-Analyse", "Batch-Analysen", "White-Label Reports"]
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: "Brands",
    description: "Finde die besten Influencer für deine Kampagnen und überprüfe deren echte Performance.",
    benefits: ["Influencer-Screening", "Fake-Follower Check", "ROI-Prognose"]
  }
];

export default function Home() {
  let { user, loading, error, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();

  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [featureFilter, setFeatureFilter] = useState<string>('all');

  // Scroll-to-Top Button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Stripe checkout mutation
  const checkoutMutation = trpc.credits.createCheckout.useMutation({
    onSuccess: (data) => {
      toast.success("Weiterleitung zum Checkout...");
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Erstellen des Checkouts");
    },
  });

  const handlePurchase = (tierName: string) => {
    // Free tier - just focus on input
    if (tierName === "free") {
      document.getElementById('hero-input')?.focus();
      return;
    }

    // Check if user is logged in
    if (!user) {
      toast.info("Bitte melde dich zuerst an");
      window.location.href = getLoginUrl();
      return;
    }

    // Map tier names to package IDs
    const packageMap: Record<string, "starter" | "pro" | "business" | "enterprise"> = {
      starter: "starter",
      pro: "pro",
      business: "business",
      enterprise: "enterprise",
    };

    const packageId = packageMap[tierName];
    if (!packageId) {
      toast.error("Ungültiger Plan");
      return;
    }

    // Create checkout session basierend auf billingCycle
    checkoutMutation.mutate({ packageId, isYearly: billingCycle === 'yearly' });
  };

  const handleAnalyze = () => {
    if (username.trim()) {
      const cleanUsername = username.replace('@', '').trim();
      setLocation(`/analysis?username=${encodeURIComponent(cleanUsername)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-radial pointer-events-none" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 border-b border-border/50 bg-background/80 backdrop-blur-xl" style={{ zIndex: 100 }}>
        <div className="container flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setLocation('/')}>
            <img src="/logo.svg" alt="ReelSpy.ai" className="h-8 lg:h-10 w-auto" />
          </div>
          
          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">{t.nav.features}</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">{t.nav.howItWorks}</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">{t.nav.success}</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">{t.nav.pricing}</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">{t.nav.faq}</a>
            <button onClick={() => setLocation('/compare')} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 whitespace-nowrap">
              <ArrowLeftRight className="w-3 h-3" />
              {t.nav.compare}
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <LanguageSelector />
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Button 
                  onClick={() => setLocation('/dashboard')}
                  variant="outline"
                  size="sm"
                  className="border-border/50 hover:bg-muted/50"
                >
                  {t.nav.dashboard}
                </Button>
                <Button 
                  onClick={() => document.getElementById('hero-input')?.focus()}
                  className="btn-gradient text-white border-0 shrink-0 text-sm lg:text-base"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 mr-1 lg:mr-2" />
                  {t.nav.analyze}
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <LoginButtonCompact />
                <Button 
                  onClick={() => document.getElementById('hero-input')?.focus()}
                  className="btn-gradient text-white border-0 shrink-0 text-sm lg:text-base"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 mr-1 lg:mr-2" />
                  {t.nav.analyze}
                </Button>
              </div>
            )}

            <button
              type="button"
              className="flex lg:hidden items-center justify-center w-10 h-10 rounded-md hover:bg-white/10"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label="Menü"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 lg:hidden"
            style={{ zIndex: 200 }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="fixed top-0 right-0 bottom-0 w-72 max-w-[80vw] bg-background lg:hidden shadow-2xl"
            style={{ zIndex: 201 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <img src="/logo.svg" alt="ReelSpy.ai" className="h-8 w-auto" />
              <button
                type="button"
                className="p-2 rounded-md hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col p-6 gap-2">
              <a href="#features" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <Zap className="w-5 h-5 text-primary" />
                Features
              </a>
              <a href="#how-it-works" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <Play className="w-5 h-5 text-primary" />
                Wie es funktioniert
              </a>
              <a href="#testimonials" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <Star className="w-5 h-5 text-primary" />
                Erfolge
              </a>
              <a href="#pricing" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <Crown className="w-5 h-5 text-primary" />
                Preise
              </a>
              <a href="#faq" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <AlertCircle className="w-5 h-5 text-primary" />
                FAQ
              </a>
              <button onClick={() => { setLocation('/compare'); closeMobileMenu(); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left">
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                KI-Vergleich
              </button>
              <div className="h-px bg-border/50 my-4" />
              {isAuthenticated ? (
                <>
                  <Button onClick={() => { setLocation('/dashboard'); closeMobileMenu(); }} variant="outline" className="w-full justify-center mb-2">
                    Dashboard
                  </Button>
                  <Button onClick={() => { document.getElementById('hero-input')?.focus(); closeMobileMenu(); }} className="btn-gradient text-white border-0 w-full justify-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    KI-Analyse starten
                  </Button>
                </>
              ) : (
                <>
                  <MobileLoginButton onClose={closeMobileMenu} />
                  <Button onClick={() => { document.getElementById('hero-input')?.focus(); closeMobileMenu(); }} className="btn-gradient text-white border-0 w-full justify-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    KI-Analyse starten
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Hero Section */}
      <section className="relative pt-4 sm:pt-20 md:pt-24 pb-8 sm:pb-16 overflow-hidden">
        <div className="container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-3 sm:mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium">{t.hero.badge}</span>
            </motion.div>

            {/* Headline - ABOVE THE FOLD */}
            <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] mb-3 sm:mb-4 hero-headline px-2 sm:px-0">
              {t.hero.title}
              <br />
              <span className="text-gradient">{t.hero.titleHighlight}</span>
            </h1>

            <p className="text-sm sm:text-lg md:text-xl text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto font-light tracking-[-0.01em] leading-relaxed hero-subtitle px-4 sm:px-0">
              {t.hero.subtitle}
            </p>

            {/* Search Input - Highlighted */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0 relative"
            >
              {/* Glow Effect hinter der Eingabe */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-cyan-500/30 blur-2xl rounded-3xl scale-110 animate-pulse" />
              <div className="relative gradient-border rounded-xl sm:rounded-2xl p-0.5 sm:p-1 shadow-2xl shadow-purple-500/20">
                <div className="flex items-center gap-2 bg-background rounded-lg sm:rounded-xl p-1.5 sm:p-2 hero-input-wrapper">
                  {/* Instagram Icon Button */}
                  <div className="flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 shrink-0 instagram-icon">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-current">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div className="flex-1 relative">
                    <Input
                      id="hero-input"
                      type="text"
                      placeholder={t.hero.placeholder}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                      className="h-10 sm:h-14 text-sm sm:text-lg bg-transparent border-0 focus-visible:ring-0 input-glow px-2 sm:px-3"
                    />
                  </div>
                  <Button 
                    onClick={handleAnalyze}
                    size="lg"
                    className="btn-gradient h-10 sm:h-12 px-4 sm:px-8 text-white border-0 text-sm sm:text-base shrink-0"
                  >
                    <span className="hidden sm:inline">{t.hero.cta}</span>
                    <span className="sm:hidden">Los</span>
                    <ArrowRight className="w-4 h-4 ml-1 sm:ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-row flex-wrap items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm text-muted-foreground px-2 sm:px-0 mx-auto"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent shrink-0" />
                <span>{t.hero.features.free}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent shrink-0" />
                <span>{t.hero.features.noSignup}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent shrink-0" />
                <span>{t.hero.features.instant}</span>
              </div>
            </motion.div>

            {/* Animated Demo Preview - Below the fold */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-8 sm:mt-12"
            >
              <HeroDemo />
            </motion.div>
          </motion.div>

          {/* Floating Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 max-w-3xl mx-auto px-4 sm:px-0 stats-grid"
          >
            {/* Animated Stats */}
            <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center stat-card">
              <p className="text-xl sm:text-3xl font-bold text-gradient mb-1 stat-value">
                <AnimatedCounter end={3000} suffix="+" duration={2.5} />
              </p>
              <p className="text-sm text-muted-foreground">KI-Parameter</p>
            </div>
            <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center stat-card">
              <p className="text-xl sm:text-3xl font-bold text-gradient mb-1 stat-value">
                <AnimatedCounter end={50} suffix="K+" duration={2} />
              </p>
              <p className="text-sm text-muted-foreground">Analysierte Accounts</p>
            </div>
            <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center stat-card">
              <p className="text-xl sm:text-3xl font-bold text-gradient mb-1 stat-value">
                <AnimatedCounter end={98} suffix="%" duration={1.5} />
              </p>
              <p className="text-sm text-muted-foreground">Genauigkeit</p>
            </div>
            <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center stat-card">
              <p className="text-xl sm:text-3xl font-bold text-gradient mb-1 stat-value">
                <AnimatedCounter end={49} prefix="4." suffix="/5" duration={1.5} decimals={0} />
              </p>
              <p className="text-sm text-muted-foreground">Bewertung</p>
            </div>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 border-y border-border/50 bg-muted/10">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['SM', 'MK', 'LT', 'TB', 'AK'].map((initials, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[10px] font-bold text-white border-2 border-background">
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">+2,500 {t.admin.activeUsers.toLowerCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <span className="text-sm font-semibold">4.9/5</span>
              <span className="text-sm text-muted-foreground">{t.trustBadges.rating}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">{t.trustBadges.privacy}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">{t.trustBadges.realtime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Niches Section */}
      <section id="niches" className="py-16">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground mb-6">
            {t.niches.badge}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {t.niches.items.map((niche, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="px-4 py-2 rounded-full bg-muted/50 border border-border/50 text-sm hover:bg-muted hover:border-primary/30 transition-all cursor-default"
              >
                {niche}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tips Preview Section */}
      <section className="py-24 bg-gradient-to-b from-background via-violet-950/10 to-background">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="badge-neon mb-4">{t.aiTipsPreview.badge}</Badge>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] mb-4">
              {t.aiTipsPreview.title}
              <br />
              <span className="text-gradient">{t.aiTipsPreview.titleHighlight}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.aiTipsPreview.subtitle}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {t.aiTipsPreview.tips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]"
              >
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{tip.icon}</span>
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">{tip.category}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold">
                    {tip.improvement}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {tip.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {tip.description}
                </p>

                {/* Example Box */}
                <div className="bg-muted/50 rounded-xl p-4 border border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-medium text-muted-foreground">{t.aiTipsPreview.exampleLabel}</span>
                  </div>
                  <p className="text-sm text-foreground/80 italic">
                    {tip.example}
                  </p>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button 
              onClick={() => document.getElementById('hero-input')?.focus()}
              size="lg"
              className="btn-gradient text-white border-0"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {t.aiTipsPreview.cta}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              {t.aiTipsPreview.ctaSubtext}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Detailed Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="badge-neon mb-4">{t.testimonialsDetailed.badge}</Badge>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] mb-4">
              {t.testimonialsDetailed.title}
              <br />
              <span className="text-gradient">{t.testimonialsDetailed.titleHighlight}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.testimonialsDetailed.subtitle}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-3">
              * Ergebnisse können variieren. Basierend auf Nutzerfeedback.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-16"
          >
            <div className="text-center p-6 rounded-2xl bg-card border border-border">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">{t.testimonialsDetailed.stats.avgGrowth}</div>
              <div className="text-sm text-muted-foreground">{t.testimonialsDetailed.stats.avgGrowthLabel}</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card border border-border">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">{t.testimonialsDetailed.stats.totalAnalyses}</div>
              <div className="text-sm text-muted-foreground">{t.testimonialsDetailed.stats.totalAnalysesLabel}</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card border border-border">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">{t.testimonialsDetailed.stats.successRate}</div>
              <div className="text-sm text-muted-foreground">{t.testimonialsDetailed.stats.successRateLabel}</div>
            </div>
          </motion.div>

          {/* Testimonial Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {t.testimonialsDetailed.items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {item.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.handle}</div>
                      <Badge variant="outline" className="mt-1 text-xs">{item.niche}</Badge>
                    </div>
                  </div>
                  <div className="text-sm italic text-foreground/80 leading-relaxed">
                    "{item.quote}"
                  </div>
                </div>

                {/* Before/After Stats */}
                <div className="p-6 bg-muted/30">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3 text-red-500" />
                        Vorher
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Follower</span>
                          <span>{item.before.followers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Engagement</span>
                          <span>{item.before.engagement}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg. Views</span>
                          <span>{item.before.avgViews}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        Nachher
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Follower</span>
                          <span className="text-emerald-500 font-medium">{item.after.followers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Engagement</span>
                          <span className="text-emerald-500 font-medium">{item.after.engagement}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg. Views</span>
                          <span className="text-emerald-500 font-medium">{item.after.avgViews}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Insight */}
                  <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-violet-500" />
                      <span className="text-xs font-medium text-violet-500">{item.keyInsight}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {item.timeframe}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span className="text-orange-500 font-medium">{item.viralReels} virale Reels</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button 
              size="lg" 
              onClick={() => {
                setLocation('/');
                setTimeout(() => {
                  const heroInput = document.getElementById('hero-input');
                  if (heroInput) {
                    heroInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    heroInput.focus();
                  }
                }, 100);
              }}
              className="btn-gradient text-white border-0"
            >
              <Rocket className="w-5 h-5 mr-2" />
              {t.testimonialsDetailed.cta}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              {t.testimonialsDetailed.ctaSubtext}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-24 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        
        <div className="container relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="badge-neon mb-4">{t.videoDemo.badge}</Badge>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] mb-4">
              {t.videoDemo.title}
              <br />
              <span className="text-gradient">{t.videoDemo.titleHighlight}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.videoDemo.subtitle}
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-2xl"
            >
              {/* Video Placeholder - Interactive Demo */}
              <div className="aspect-video bg-gradient-to-br from-violet-900/20 to-purple-900/20 relative">
                {/* Animated Demo UI */}
                <div className="absolute inset-0 p-8 flex items-center justify-center">
                  <div className="w-full max-w-2xl">
                    {/* Mock Analysis Interface */}
                    <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 border border-border">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <div className="text-lg font-semibold">@example_creator</div>
                          <div className="text-sm text-muted-foreground">KI-Analyse läuft...</div>
                        </div>
                      </div>
                      
                      {/* Animated Progress Bars */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Hook-Analyse</span>
                            <span className="text-emerald-500">94/100</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-violet-500 to-emerald-500"
                              initial={{ width: 0 }}
                              whileInView={{ width: '94%' }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.5, delay: 0.2 }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>HAPSS-Framework</span>
                            <span className="text-emerald-500">87/100</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-violet-500 to-emerald-500"
                              initial={{ width: 0 }}
                              whileInView={{ width: '87%' }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.5, delay: 0.4 }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Viral Score</span>
                            <span className="text-emerald-500">91/100</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-violet-500 to-emerald-500"
                              initial={{ width: 0 }}
                              whileInView={{ width: '91%' }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.5, delay: 0.6 }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* AI Tip */}
                      <motion.div 
                        className="mt-6 p-4 rounded-lg bg-violet-500/10 border border-violet-500/20"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.2 }}
                      >
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-violet-500 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-violet-500">KI-Tipp erkannt</div>
                            <div className="text-sm text-muted-foreground">Füge einen CTA in Sekunde 3 ein für +40% mehr Engagement</div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Watch Time Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border text-sm">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {t.videoDemo.watchTime}
                </div>
              </div>
            </motion.div>

            {/* Feature List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
            >
              {t.videoDemo.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-8"
            >
              <Button 
                size="lg" 
                onClick={() => {
                  setLocation('/');
                  setTimeout(() => {
                    const heroInput = document.getElementById('hero-input');
                    if (heroInput) {
                      heroInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      heroInput.focus();
                    }
                  }, 100);
                }}
                className="btn-gradient text-white border-0"
              >
                <Play className="w-5 h-5 mr-2" />
                {t.videoDemo.cta}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-24 bg-muted/10">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            <Badge className="badge-neon mb-4">{t.problemSolution.badge}</Badge>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] mb-4">
              {t.problemSolution.title}
              <br />
              <span className="text-gradient">{t.problemSolution.titleHighlight}</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Problem Side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold">{t.problemSolution.without}</h3>
              </div>
              {t.problemSolution.problems.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </motion.div>

            {/* Solution Side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-2xl font-bold">{t.problemSolution.with}</h3>
              </div>
              {t.problemSolution.solutions.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="badge-neon mb-4">{t.nav.features.toUpperCase()}</Badge>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] mb-4">
              {t.features.title.split(' ').slice(0, -2).join(' ')}
              <br />
              <span className="text-gradient">{t.features.title.split(' ').slice(-2).join(' ')}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.features.subtitle}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 overflow-visible">
            {t.featuresList.map((feature, index) => {
              const icons = [<Brain className="w-6 h-6" />, <BarChart3 className="w-6 h-6" />, <Zap className="w-6 h-6" />, <LineChart className="w-6 h-6" />, <Clock className="w-6 h-6" />, <MessageSquare className="w-6 h-6" />, <Hash className="w-6 h-6" />, <Target className="w-6 h-6" />, <FileText className="w-6 h-6" />];
              return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-6 pt-8 stat-card group relative overflow-visible"
              >
                {feature.highlight && (
                  <Badge className="absolute -top-3 left-4 bg-accent text-accent-foreground text-xs px-2 py-0.5 whitespace-nowrap z-10">
                    {feature.highlight}
                  </Badge>
                )}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary mb-4 group-hover:glow-purple transition-all">
                  {icons[index]}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            );})}
          </div>
        </div>
      </section>

      {/* Feature Showcase with Screenshots */}
      <section className="py-24 bg-gradient-to-b from-background via-violet-950/10 to-background overflow-hidden">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="badge-neon mb-4">LIVE DEMO</Badge>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] mb-4">
              Sieh dir an, was
              <br />
              <span className="text-gradient">ReelSpy.ai kann</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Echte Screenshots aus dem Dashboard - so sieht deine Analyse aus
            </p>
          </motion.div>

          {/* Screenshot 1: Analysis Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-primary/20 text-primary">KI-ANALYSE</Badge>
                <h3 className="text-3xl font-bold mb-4">Viral Score & HAPSS-Framework</h3>
                <p className="text-muted-foreground mb-6">
                  Unsere KI analysiert jeden Aspekt deines Reels: Hook-Qualität, Attention-Retention, 
                  Problem-Darstellung, Lösungs-Präsentation und Story-Engagement. Du bekommst einen 
                  detaillierten Score von 0-100 für jeden Bereich.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span>Viral Score aus 47 Faktoren berechnet</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span>HAPSS-Framework Einzelbewertungen</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span>KI-generierte Verbesserungsvorschläge</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl rounded-full" />
                <img 
                  src="/images/analysis-screenshot.png" 
                  alt="ReelSpy.ai Analyse Dashboard" 
                  className="relative rounded-2xl border border-border/50 shadow-2xl"
                />
              </div>
            </div>
          </motion.div>

          {/* Screenshot 2: Content Plan */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/20 blur-3xl rounded-full" />
                <img 
                  src="/images/content-plan-screenshot.png" 
                  alt="ReelSpy.ai Content Plan" 
                  className="relative rounded-2xl border border-border/50 shadow-2xl"
                />
                <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">PRO</Badge>
              </div>
              <div className="order-1 lg:order-2">
                <Badge className="mb-4 bg-accent/20 text-accent">CONTENT-PLAN</Badge>
                <h3 className="text-3xl font-bold mb-4">30-Tage KI-Content-Plan</h3>
                <p className="text-muted-foreground mb-6">
                  Basierend auf deiner Zielgruppe und den Erkenntnissen aus Top-Reels erstellt unsere KI 
                  einen personalisierten Content-Plan mit Hook-Vorschlägen, Script-Strukturen, 
                  Trending Audio Empfehlungen und optimalen Posting-Zeiten.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-accent" />
                    </div>
                    <span>HAPSS oder AIDA Framework automatisch gewählt</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-accent" />
                    </div>
                    <span>Hopkins, Ogilvy, Schwartz Copywriting-Tipps</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-accent" />
                    </div>
                    <span>PDF-Export für dein Team</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Screenshot 3: Growth Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-emerald-500/20 text-emerald-500">WACHSTUM</Badge>
                <h3 className="text-3xl font-bold mb-4">Wachstums-Tracking & Konkurrenzanalyse</h3>
                <p className="text-muted-foreground mb-6">
                  Verfolge dein Follower-Wachstum über 90 Tage, vergleiche dich mit Konkurrenten 
                  und finde die besten Posting-Zeiten für deine Zielgruppe. Erhalte Benachrichtigungen 
                  bei wichtigen Veränderungen.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span>90-Tage Wachstums-Historie</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span>Konkurrenz-Vergleich in Echtzeit</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span>Beste Posting-Zeiten Heatmap</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-3xl rounded-full" />
                <img 
                  src="/images/growth-tracking-screenshot.png" 
                  alt="ReelSpy.ai Wachstums-Tracking" 
                  className="relative rounded-2xl border border-border/50 shadow-2xl"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-muted/20">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="badge-neon mb-4">{t.howItWorks.badge}</Badge>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] mb-4">
              {t.howItWorks.title}
              <br />
              <span className="text-gradient">{t.howItWorks.titleHighlight}</span>
            </h2>
          </motion.div>

          {/* Interactive Animated Demo */}
          <AnimatedDemo />
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="badge-neon mb-4">{t.useCases.badge}</Badge>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] mb-4">
              {t.useCases.title}
              <br />
              <span className="text-gradient">{t.useCases.titleHighlight}</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.useCases.items.map((useCase, index) => {
              const icons = [<Users className="w-8 h-8" />, <Trophy className="w-8 h-8" />, <Rocket className="w-8 h-8" />, <Target className="w-8 h-8" />];
              return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-6 stat-card"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary mb-4">
                  {icons[index]}
                </div>
                <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{useCase.description}</p>
                <ul className="space-y-2">
                  {useCase.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );})}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-muted/20">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="badge-neon mb-4">{t.testimonials.badge}</Badge>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] mb-4">
              {t.testimonials.title}
              <br />
              <span className="text-gradient">{t.testimonials.titleHighlight}</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 overflow-visible">
            {t.testimonials.items.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-6 pt-8 stat-card relative overflow-visible"
              >
                {/* Metric Badge */}
                <div className="absolute -top-3 right-4 z-10">
                  <Badge className="bg-accent text-accent-foreground font-bold whitespace-nowrap">
                    {testimonial.metric}
                  </Badge>
                </div>

                {/* Quote */}
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-sm text-muted-foreground mb-6 italic">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-primary">{testimonial.followers}</p>
                  </div>
                </div>

                {/* Before/After Growth */}
                {testimonials[index]?.beforeAfter && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <div className="text-center">
                        <span className="text-muted-foreground">Vorher</span>
                        <p className="text-lg font-bold text-red-400">{testimonials[index].beforeAfter.before}</p>
                      </div>
                      <div className="flex items-center gap-1 text-accent">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                      <div className="text-center">
                        <span className="text-muted-foreground">Nachher</span>
                        <p className="text-lg font-bold text-green-400">{testimonials[index].beforeAfter.after}</p>
                      </div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-1">{testimonials[index].beforeAfter.label}</p>
                  </div>
                )}

                {/* Rating */}
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Comparison - 5 Tiers */}
      <section id="pricing" className="py-24">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="badge-neon mb-4">{t.nav.pricing.toUpperCase()}</Badge>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] mb-4">
              {t.pricing.title}
              <br />
              <span className="text-gradient">{t.pricing.free.features[0]}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              {t.pricing.subtitle}
            </p>
            
            {/* Monatlich/Jährlich Toggle - Verbessert */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative inline-block"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-xl rounded-full scale-110" />
              
              <div className="relative inline-flex items-center gap-1 bg-background/80 backdrop-blur-sm border border-border/50 rounded-full p-1.5 shadow-lg">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`relative px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                    billingCycle === 'monthly'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  Monatlich
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`relative px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                    billingCycle === 'yearly'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  Jährlich
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold transition-all duration-300 ${
                    billingCycle === 'yearly'
                      ? 'bg-white/20 text-white'
                      : 'bg-emerald-500/20 text-emerald-400 animate-pulse'
                  }`}>-20%</span>
                </button>
              </div>
              
              {/* Empfehlung Badge */}
              {billingCycle === 'monthly' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
                >
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Spare 20% mit jährlicher Zahlung
                  </span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          <div className="max-w-7xl mx-auto overflow-visible">
            <div className="flex lg:grid lg:grid-cols-5 gap-4 pt-6 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {/* Free Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-5 snap-center min-w-[280px] lg:min-w-0"
              >
                <div className="text-sm font-medium text-muted-foreground mb-2">FREE</div>
                <h3 className="text-lg font-bold mb-1">{t.pricingPlans.free.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{t.pricingPlans.free.tagline}</p>
                <div className="text-2xl font-black mb-1">
                  {t.pricingPlans.free.analyses}
                </div>
                <p className="text-xs text-muted-foreground mb-4">{t.pricingPlans.free.analysesNote}</p>
                <Button 
                  onClick={() => handlePurchase('free')}
                  variant="outline" 
                  className="w-full mb-4"
                  size="sm"
                  disabled={checkoutMutation.isPending}
                >
                  {t.pricingPlans.free.cta}
                </Button>
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <span className="inline-block w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px]">6</span>
                    Features inklusive
                  </p>
                  <ul className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                    {t.pricingPlans.free.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-accent shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Starter Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-5 snap-center min-w-[280px] lg:min-w-0"
              >
                <div className="text-sm font-medium text-primary mb-2">STARTER</div>
                <h3 className="text-lg font-bold mb-1">{t.pricingPlans.starter.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{t.pricingPlans.starter.tagline}</p>
                <motion.div 
                  key={billingCycle}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-black mb-1"
                >
                  {billingCycle === 'yearly' ? (
                    <>
                      <span className="line-through text-muted-foreground text-lg mr-1">€19</span>
                      €15<span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </>
                  ) : (
                    <>€19<span className="text-sm font-normal text-muted-foreground">/mo</span></>
                  )}
                </motion.div>
                {billingCycle === 'yearly' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium mb-2"
                  >
                    <Sparkles className="w-3 h-3" />
                    Spare €48/Jahr
                  </motion.div>
                )}
                <p className="text-xs text-muted-foreground mb-4">{t.pricingPlans.starter.analyses}</p>
                <Button 
                  onClick={() => handlePurchase('starter')}
                  variant="outline" 
                  className="w-full mb-4"
                  size="sm"
                  disabled={checkoutMutation.isPending}
                >
                  {checkoutMutation.isPending ? "Wird geladen..." : t.pricingPlans.starter.cta}
                </Button>
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <span className="inline-block w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]">45</span>
                    Features inklusive
                  </p>
                  <ul className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                    {t.pricingPlans.starter.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Pro Plan - HIGHLIGHTED */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="relative overflow-visible lg:-mt-2 lg:mb-2 snap-center min-w-[280px] lg:min-w-0"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-accent text-accent-foreground font-bold px-3 text-xs">{t.pricingPlans.pro.badge}</Badge>
                </div>
                <div className="gradient-border rounded-2xl p-1 h-full">
                  <div className="bg-background rounded-2xl p-5 h-full">
                    <div className="text-sm font-medium text-accent mb-2">PRO</div>
                    <h3 className="text-lg font-bold mb-1">{t.pricingPlans.pro.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{t.pricingPlans.pro.tagline}</p>
                    <motion.div 
                      key={billingCycle}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-black mb-1"
                    >
                      {billingCycle === 'yearly' ? (
                        <>
                          <span className="line-through text-muted-foreground text-lg mr-1">€49</span>
                          €39<span className="text-sm font-normal text-muted-foreground">/mo</span>
                        </>
                      ) : (
                        <>€49<span className="text-sm font-normal text-muted-foreground">/mo</span></>
                      )}
                    </motion.div>
                    {billingCycle === 'yearly' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium mb-2"
                      >
                        <Sparkles className="w-3 h-3" />
                        Spare €120/Jahr
                      </motion.div>
                    )}
                    <p className="text-xs text-muted-foreground mb-4">{t.pricingPlans.pro.analyses}</p>
                    <Button 
                      onClick={() => handlePurchase('pro')}
                      className="btn-gradient w-full text-white border-0 mb-4"
                      size="sm"
                      disabled={checkoutMutation.isPending}
                    >
                      <Crown className="w-3 h-3 mr-1" />
                      {checkoutMutation.isPending ? "Wird geladen..." : t.pricingPlans.pro.cta}
                    </Button>
                    <div className="border-t border-accent/30 pt-4">
                      <p className="text-xs font-semibold text-accent mb-2 flex items-center gap-1">
                        <span className="inline-block w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px]">65</span>
                        Features inklusive
                      </p>
                      <ul className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                        {t.pricingPlans.pro.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="w-3 h-3 text-accent shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Business Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-5 snap-center min-w-[280px] lg:min-w-0"
              >
                <div className="text-sm font-medium text-yellow-500 mb-2">BUSINESS</div>
                <h3 className="text-lg font-bold mb-1">{t.pricingPlans.business.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{t.pricingPlans.business.tagline}</p>
                <motion.div 
                  key={billingCycle}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-black mb-1"
                >
                  {billingCycle === 'yearly' ? (
                    <>
                      <span className="line-through text-muted-foreground text-lg mr-1">€99</span>
                      €79<span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </>
                  ) : (
                    <>€99<span className="text-sm font-normal text-muted-foreground">/mo</span></>
                  )}
                </motion.div>
                {billingCycle === 'yearly' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium mb-2"
                  >
                    <Sparkles className="w-3 h-3" />
                    Spare €240/Jahr
                  </motion.div>
                )}
                <p className="text-xs text-muted-foreground mb-4">{t.pricingPlans.business.analyses}</p>
                <Button 
                  onClick={() => handlePurchase('business')}
                  variant="outline" 
                  className="w-full mb-4 border-yellow-500/50 hover:bg-yellow-500/10"
                  size="sm"
                  disabled={checkoutMutation.isPending}
                >
                  <Rocket className="w-3 h-3 mr-1" />
                  {checkoutMutation.isPending ? "Wird geladen..." : t.pricingPlans.business.cta}
                </Button>
                <div className="border-t border-yellow-500/30 pt-4">
                  <p className="text-xs font-semibold text-yellow-500 mb-2 flex items-center gap-1">
                    <span className="inline-block w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-[10px]">78</span>
                    Features inklusive
                  </p>
                  <ul className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                    {t.pricingPlans.business.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Enterprise Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-5 border-orange-500/30 snap-center min-w-[280px] lg:min-w-0"
              >
                <div className="text-sm font-medium text-orange-500 mb-2">ENTERPRISE</div>
                <h3 className="text-lg font-bold mb-1">Enterprise</h3>
                <p className="text-xs text-muted-foreground mb-3">Für große Agenturen</p>
                <motion.div 
                  key={billingCycle}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-black mb-1"
                >
                  {billingCycle === 'yearly' ? (
                    <>
                      <span className="line-through text-muted-foreground text-lg mr-1">€299</span>
                      €239<span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </>
                  ) : (
                    <>€299<span className="text-sm font-normal text-muted-foreground">/mo</span></>
                  )}
                </motion.div>
                {billingCycle === 'yearly' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium mb-2"
                  >
                    <Sparkles className="w-3 h-3" />
                    Spare €720/Jahr
                  </motion.div>
                )}
                <p className="text-xs text-muted-foreground mb-4">Unbegrenzte Analysen</p>
                <Button 
                  onClick={() => handlePurchase('enterprise')}
                  variant="outline" 
                  className="w-full mb-4 border-orange-500/50 hover:bg-orange-500/10"
                  size="sm"
                  disabled={checkoutMutation.isPending}
                >
                  <Building2 className="w-3 h-3 mr-1" />
                  {checkoutMutation.isPending ? "Wird geladen..." : "Kontakt aufnehmen"}
                </Button>
                <div className="border-t border-orange-500/30 pt-4">
                  <p className="text-xs font-semibold text-orange-500 mb-2 flex items-center gap-1">
                    <span className="inline-block w-5 h-5 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-[10px]">83</span>
                    Alle Features
                  </p>
                  <ul className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-orange-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Unbegrenzte KI-Analysen</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-orange-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Alles aus Business</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-orange-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Dedizierter Account Manager</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-orange-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Custom Integrationen</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-orange-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">SLA Garantie</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-orange-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">API Zugang</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>

            {/* Alle Features vergleichen Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Button
                variant="outline"
                size="lg"
                className="gap-2 group"
                onClick={() => setShowAllFeatures(!showAllFeatures)}
              >
                {showAllFeatures ? 'Features ausblenden' : 'Alle 83 Features vergleichen'}
                <ArrowDown className={`w-4 h-4 transition-transform ${showAllFeatures ? 'rotate-180' : 'group-hover:translate-y-1'}`} />
              </Button>
              <p className="text-xs text-muted-foreground mt-2">{showAllFeatures ? 'Klicke um die Tabelle zu schließen' : 'Klicke um alle Features zu sehen'}</p>
            </motion.div>

            {/* Feature Comparison Table */}
            <AnimatePresence>
              {showAllFeatures && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-12 overflow-hidden"
                >
                  <div className="glass-card rounded-2xl p-4 md:p-6">
                    <h3 className="text-xl font-bold mb-4 text-center">Vollständiger Feature-Vergleich</h3>
                    
                    {/* Feature Filter Buttons */}
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {[
                        { id: 'all', label: 'Alle Features' },
                        { id: 'analyse', label: 'Analyse' },
                        { id: 'ki', label: 'KI-Features' },
                        { id: 'export', label: 'Export' },
                        { id: 'team', label: 'Team & Support' },
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setFeatureFilter(filter.id)}
                          className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                            featureFilter === filter.id
                              ? 'bg-gradient-to-r from-accent to-emerald-500 text-white shadow-md'
                              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                    
                    {/* Billing Toggle für Feature-Tabelle */}
                    <div className="flex justify-center mb-4">
                      <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted/50 border border-border/50">
                        <button
                          onClick={() => setBillingCycle('monthly')}
                          className={`px-4 py-1.5 text-xs rounded-full transition-all ${billingCycle === 'monthly' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          Monatlich
                        </button>
                        <button
                          onClick={() => setBillingCycle('yearly')}
                          className={`px-4 py-1.5 text-xs rounded-full transition-all flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'bg-gradient-to-r from-accent to-emerald-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          Jährlich
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${billingCycle === 'yearly' ? 'bg-white/20' : 'bg-accent/20 text-accent'}`}>-20%</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Mobile Swipe Indicator */}
                    <div className="md:hidden mb-4">
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-full py-2 px-4 mx-auto w-fit">
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <ArrowRight className="w-3 h-3" />
                        </motion.div>
                        <span>Wische für alle Pläne</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <ArrowRight className="w-3 h-3" />
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Mobile: Horizontal scroll with snap */}
                    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth snap-x snap-mandatory md:snap-none">
                      <table className="w-full min-w-[800px] md:min-w-[700px] text-xs md:text-sm feature-comparison-table">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-4 px-4">
                            <span className="font-semibold text-foreground">Feature</span>
                            <div className="text-[10px] text-muted-foreground mt-1">83 Features insgesamt</div>
                          </th>
                          <th className="text-center py-4 px-4">
                            <span className="font-semibold text-muted-foreground">Free</span>
                            <div className="text-lg font-bold text-foreground mt-1">€0</div>
                            <div className="text-[10px] text-muted-foreground">12 Features</div>
                          </th>
                          <th className="text-center py-4 px-4">
                            <span className="font-semibold text-primary">Starter</span>
                            <div className="text-lg font-bold text-foreground mt-1">
                              {billingCycle === 'yearly' ? (
                                <><span className="line-through text-muted-foreground text-sm mr-1">€19</span>€15</>
                              ) : '€19'}
                              <span className="text-xs font-normal text-muted-foreground">/Mo</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">28 Features</div>
                          </th>
                          <th className="text-center py-4 px-4 relative">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                              <span className="bg-gradient-to-r from-accent to-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg animate-pulse">
                                ⭐ BELIEBTESTE WAHL
                              </span>
                            </div>
                            <span className="text-accent font-bold">Pro</span>
                            <div className="text-lg font-bold text-foreground mt-1">
                              {billingCycle === 'yearly' ? (
                                <><span className="line-through text-muted-foreground text-sm mr-1">€49</span>€39</>
                              ) : '€49'}
                              <span className="text-xs font-normal text-muted-foreground">/Mo</span>
                            </div>
                            <div className="text-[10px] text-accent">52 Features</div>
                          </th>
                          <th className="text-center py-4 px-4">
                            <span className="font-semibold text-yellow-500">Business</span>
                            <div className="text-lg font-bold text-foreground mt-1">
                              {billingCycle === 'yearly' ? (
                                <><span className="line-through text-muted-foreground text-sm mr-1">€99</span>€79</>
                              ) : '€99'}
                              <span className="text-xs font-normal text-muted-foreground">/Mo</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">71 Features</div>
                          </th>
                          <th className="text-center py-4 px-4">
                            <span className="font-semibold text-pink-500">Enterprise</span>
                            <div className="text-lg font-bold text-foreground mt-1">
                              {billingCycle === 'yearly' ? (
                                <><span className="line-through text-muted-foreground text-sm mr-1">€299</span>€239</>
                              ) : '€299'}
                              <span className="text-xs font-normal text-muted-foreground">/Mo</span>
                            </div>
                            <div className="text-[10px] text-pink-500">Alle 83 Features</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {/* Analyse Features */}
                        <tr className={`bg-muted/30 ${featureFilter !== 'all' && featureFilter !== 'analyse' ? 'hidden' : ''}`} data-category="analyse">
                          <td colSpan={6} className="py-2 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Analyse Features</td>
                        </tr>
                        <tr className={`hover:bg-muted/20 ${featureFilter !== 'all' && featureFilter !== 'analyse' ? 'hidden' : ''}`}>
                          <td className="py-2 px-4">KI-Analysen pro Monat</td>
                          <td className="text-center py-2 px-4">3</td>
                          <td className="text-center py-2 px-4 text-primary">10</td>
                          <td className="text-center py-2 px-4 text-accent">35</td>
                          <td className="text-center py-2 px-4 text-yellow-500">100</td>
                          <td className="text-center py-2 px-4 text-pink-500">Unbegrenzt</td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">
                            <span className="inline-flex items-center gap-1.5">
                              Viral Score Analyse
                              <span className="group relative">
                                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-popover border border-border rounded-lg text-xs w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                                  Bewertet das Viral-Potenzial basierend auf 47 Faktoren wie Hook-Qualität, Engagement-Rate und optimale Posting-Zeit.
                                </span>
                              </span>
                            </span>
                          </td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">
                            <span className="inline-flex items-center gap-1.5">
                              HAPSS-Framework
                              <span className="group relative">
                                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-popover border border-border rounded-lg text-xs w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                                  <strong>H</strong>ook, <strong>A</strong>ttention, <strong>P</strong>roblem, <strong>S</strong>tory, <strong>S</strong>olution – bewährtes Framework für viralen Content.
                                </span>
                              </span>
                            </span>
                          </td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">KI-Tiefenanalyse</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">
                            <span className="inline-flex items-center gap-1.5">
                              Hopkins, Ogilvy, Schwartz
                              <span className="group relative">
                                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-popover border border-border rounded-lg text-xs w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                                  Klassische Copywriting-Formeln von Claude Hopkins, David Ogilvy und Eugene Schwartz für überzeugende Texte.
                                </span>
                              </span>
                            </span>
                          </td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        
                        {/* Engagement Metriken */}
                        <tr className={`bg-muted/30 ${featureFilter !== 'all' && featureFilter !== 'analyse' ? 'hidden' : ''}`}>
                          <td colSpan={6} className="py-2 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Engagement Metriken</td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Likes-Analyse</td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Comments-Analyse</td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Shares-Tracking</td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Saves-Tracking</td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">
                            <span className="inline-flex items-center gap-1.5">
                              Engagement-Rate
                              <span className="group relative">
                                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-popover border border-border rounded-lg text-xs w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                                  (Likes + Comments + Saves + Shares) / Follower × 100. Zeigt wie aktiv deine Community ist.
                                </span>
                              </span>
                            </span>
                          </td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">
                            <span className="inline-flex items-center gap-1.5">
                              Branchen-Benchmarks
                              <span className="group relative">
                                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-popover border border-border rounded-lg text-xs w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                                  Vergleiche deine Metriken mit Durchschnittswerten deiner Branche (Fitness, Beauty, Business, etc.).
                                </span>
                              </span>
                            </span>
                          </td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Trend-Erkennung</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        
                        {/* Content Analyse */}
                        <tr className={`bg-muted/30 ${featureFilter !== 'all' && featureFilter !== 'analyse' ? 'hidden' : ''}`}>
                          <td colSpan={6} className="py-2 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Content Analyse</td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">
                            <span className="inline-flex items-center gap-1.5">
                              Hook-Qualität
                              <span className="group relative">
                                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-popover border border-border rounded-lg text-xs w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                                  Die ersten 3 Sekunden entscheiden. Wir analysieren Aufmerksamkeitsfaktoren, Neugier-Trigger und visuelle Hooks.
                                </span>
                              </span>
                            </span>
                          </td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Caption-Analyse</td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">CTA-Effektivität</td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Hashtag-Strategie</td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Optimale Caption-Länge</td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Reel-Transkription</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Schnittfrequenz-Analyse</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Hook-Timing Analyse</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Copywriting-Formeln Check</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        
                        {/* Plattformen */}
                        <tr className={`bg-muted/30 ${featureFilter !== 'all' && featureFilter !== 'analyse' ? 'hidden' : ''}`}>
                          <td colSpan={6} className="py-2 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Plattformen</td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Instagram Reels</td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Instagram Posts</td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Instagram Stories</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">TikTok Videos</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">YouTube Shorts</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">YouTube Videos</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">LinkedIn Posts</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">X/Twitter Posts</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        
                        {/* Tracking & Historie */}
                        <tr className={`bg-muted/30 ${featureFilter !== 'all' && featureFilter !== 'analyse' ? 'hidden' : ''}`}>
                          <td colSpan={6} className="py-2 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Tracking & Historie</td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Follower-Wachstum</td>
                          <td className="text-center py-2 px-4">7 Tage</td>
                          <td className="text-center py-2 px-4 text-primary">30 Tage</td>
                          <td className="text-center py-2 px-4 text-accent">1 Jahr</td>
                          <td className="text-center py-2 px-4 text-yellow-500">2 Jahre</td>
                          <td className="text-center py-2 px-4 text-pink-500">Unbegrenzt</td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Posting-Zeit-Analyse</td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Interaktive Heatmap</td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Competitor-Vergleich</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Analyse-Verlauf speichern</td>
                          <td className="text-center py-2 px-4">Letzte 3</td>
                          <td className="text-center py-2 px-4 text-primary">Letzte 50</td>
                          <td className="text-center py-2 px-4 text-accent">Unbegrenzt</td>
                          <td className="text-center py-2 px-4 text-yellow-500">Unbegrenzt</td>
                          <td className="text-center py-2 px-4 text-pink-500">Unbegrenzt</td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Favoriten markieren</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Wachstums-Alerts</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Viral-Trend Benachrichtigung</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        
                        {/* Export & Reports */}
                        <tr className={`bg-muted/30 ${featureFilter !== 'all' && featureFilter !== 'export' ? 'hidden' : ''}`}>
                          <td colSpan={6} className="py-2 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Export & Reports</td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">PDF-Export</td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">CSV-Export</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Automatische Reports</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">White-Label Reports</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Custom Branding</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        
                        {/* KI-Features */}
                        <tr className={`bg-muted/30 ${featureFilter !== 'all' && featureFilter !== 'ki' ? 'hidden' : ''}`}>
                          <td colSpan={6} className="py-2 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">KI-Features</td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">KI-Tiefenanalyse</td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">
                            <span className="inline-flex items-center gap-1.5">
                              HAPSS-Framework Analyse
                              <span className="group relative">
                                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-popover border border-border rounded-lg text-xs w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                                  <strong>H</strong>ook, <strong>A</strong>ttention, <strong>P</strong>roblem, <strong>S</strong>tory, <strong>S</strong>olution – bewährtes Framework für viralen Content.
                                </span>
                              </span>
                            </span>
                          </td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">
                            <span className="inline-flex items-center gap-1.5">
                              AIDA-Framework Analyse
                              <span className="group relative">
                                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-popover border border-border rounded-lg text-xs w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                                  <strong>A</strong>ttention, <strong>I</strong>nterest, <strong>D</strong>esire, <strong>A</strong>ction – klassisches Marketing-Framework für überzeugende Inhalte.
                                </span>
                              </span>
                            </span>
                          </td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">KI-Content-Plan Generator</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">KI-Verbesserungsvorschläge</td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Nischen-Empfehlungen</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">
                            <span className="inline-flex items-center gap-1.5">
                              Viral-Potenzial Vorhersage
                              <span className="group relative">
                                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-popover border border-border rounded-lg text-xs w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                                  KI-Prognose wie wahrscheinlich ein Post viral geht, basierend auf historischen Daten ähnlicher Inhalte.
                                </span>
                              </span>
                            </span>
                          </td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">
                            <span className="inline-flex items-center gap-1.5">
                              Sentiment-Analyse
                              <span className="group relative">
                                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-popover border border-border rounded-lg text-xs w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                                  KI-gestützte Analyse der Stimmung in Kommentaren – positiv, negativ oder neutral. Erkennt Trends in der Community.
                                </span>
                              </span>
                            </span>
                          </td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        
                        {/* Automatisierung */}
                        <tr className={`bg-muted/30 ${featureFilter !== 'all' && featureFilter !== 'ki' ? 'hidden' : ''}`}>
                          <td colSpan={6} className="py-2 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Automatisierung</td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Geplante Analysen</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Automatische Wettbewerber-Scans</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">
                            <span className="inline-flex items-center gap-1.5">
                              Webhook-Integration
                              <span className="group relative">
                                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-popover border border-border rounded-lg text-xs w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                                  Automatische Benachrichtigungen an deine eigenen Systeme bei neuen Analysen oder wichtigen Events.
                                </span>
                              </span>
                            </span>
                          </td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Zapier-Integration</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        
                        {/* Team & Support */}
                        <tr className={`bg-muted/30 ${featureFilter !== 'all' && featureFilter !== 'team' ? 'hidden' : ''}`}>
                          <td colSpan={6} className="py-2 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Team & Support</td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Team-Accounts</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4 text-yellow-500">Bis 5</td>
                          <td className="text-center py-2 px-4 text-pink-500">Unbegrenzt</td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Rollen & Berechtigungen</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Aktivitäts-Log</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">API-Zugang</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Support</td>
                          <td className="text-center py-2 px-4 text-xs">E-Mail</td>
                          <td className="text-center py-2 px-4 text-xs text-primary">E-Mail</td>
                          <td className="text-center py-2 px-4 text-xs text-accent">Priorität</td>
                          <td className="text-center py-2 px-4 text-xs text-yellow-500">Dediziert</td>
                          <td className="text-center py-2 px-4 text-xs text-pink-500">Account Manager</td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Onboarding-Session</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">SLA-Garantie</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2 px-4">Custom Integrationen</td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Minus className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                          <td className="text-center py-2 px-4"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-border">
                          <td className="py-4 px-4"></td>
                          <td className="text-center py-4 px-4">
                            <button
                              onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
                              className="px-4 py-2 text-xs rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                            >
                              Kostenlos testen
                            </button>
                          </td>
                          <td className="text-center py-4 px-4">
                            <button
                              onClick={() => handlePurchase('starter')}
                              className="px-4 py-2 text-xs rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                            >
                              Starter wählen
                            </button>
                          </td>
                          <td className="text-center py-4 px-4">
                            <button
                              onClick={() => handlePurchase('pro')}
                              className="px-4 py-2 text-xs rounded-lg bg-gradient-to-r from-accent to-emerald-500 hover:opacity-90 text-white font-semibold transition-opacity shadow-lg"
                            >
                              Pro wählen
                            </button>
                          </td>
                          <td className="text-center py-4 px-4">
                            <button
                              onClick={() => handlePurchase('business')}
                              className="px-4 py-2 text-xs rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border border-yellow-500/50 transition-colors"
                            >
                              Business wählen
                            </button>
                          </td>
                          <td className="text-center py-4 px-4">
                            <button
                              onClick={() => handlePurchase('enterprise')}
                              className="px-4 py-2 text-xs rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-500 border border-pink-500/50 transition-colors"
                            >
                              Enterprise wählen
                            </button>
                          </td>
                        </tr>
                      </tfoot>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-muted/20">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="badge-neon mb-4">{t.nav.faq}</Badge>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] mb-4">
              {t.faq.title.split(' ').slice(0, 2).join(' ')}
              <br />
              <span className="text-gradient">{t.faq.title.split(' ').slice(2).join(' ')}</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {t.faqItems.map((faq: {question: string, answer: string}, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-muted-foreground">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative gradient-border rounded-3xl p-1"
          >
            <div className="bg-background rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative z-10">
                <Badge className="badge-neon mb-6">{t.cta.button.toUpperCase()}</Badge>
                <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] mb-4">
                  {t.cta.title.split('?')[0]}
                  <span className="text-gradient">?</span>
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  {t.cta.subtitle}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="relative w-full sm:w-auto">
                    <Input
                      type="text"
                      placeholder="@username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                      className="w-full sm:w-64 h-12 bg-muted/50 border-border/50 input-glow"
                    />
                  </div>
                  <Button 
                    onClick={handleAnalyze}
                    size="lg"
                    className="btn-gradient h-12 px-8 text-white border-0 w-full sm:w-auto"
                  >
                    Kostenlos analysieren
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span>Keine Kreditkarte nötig</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span>Sofortige Ergebnisse</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span>100% kostenlos starten</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mt-6">
                  <div className="flex -space-x-2">
                    {['SM', 'MK', 'LT', 'TB'].map((initials, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[10px] font-bold text-white border-2 border-background">
                        {initials}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">4.9/5</span>
                    <span className="text-muted-foreground">von 2.500+ Nutzern</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-gradient-to-r from-accent to-emerald-500 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Global Footer */}
      <GlobalFooter />
    </div>
  );
}

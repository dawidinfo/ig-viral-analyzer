import { useAuth } from "@/_core/hooks/useAuth";
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
import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

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
    name: "Sarah M.",
    role: "Fitness Influencerin",
    followers: "125K Follower",
    image: "SM",
    text: "Seit ich ReelSpy nutze, hat sich mein Engagement verdreifacht. Die HAPSS-Analyse zeigt mir genau, wo meine Hooks schwächeln.",
    rating: 5,
    metric: "+312% Engagement"
  },
  {
    name: "Marco K.",
    role: "Food Blogger",
    followers: "89K Follower",
    image: "MK",
    text: "Die Posting-Zeit-Analyse war ein Game-Changer. Meine Reels erreichen jetzt 3x mehr Menschen zur richtigen Zeit.",
    rating: 5,
    metric: "+280% Reichweite"
  },
  {
    name: "Lisa T.",
    role: "Fashion Creator",
    followers: "210K Follower",
    image: "LT",
    text: "Endlich verstehe ich, warum manche Reels viral gehen und andere nicht. Die KI-Analyse ist unglaublich präzise.",
    rating: 5,
    metric: "5 virale Reels"
  },
  {
    name: "Tim B.",
    role: "Business Coach",
    followers: "67K Follower",
    image: "TB",
    text: "Der Viral Score hat mir geholfen, meinen Content-Stil komplett zu optimieren. ROI innerhalb von 2 Wochen.",
    rating: 5,
    metric: "+45K Follower"
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
    answer: "HAPSS steht für Hook, Attention, Problem, Solution, Story - ein bewährtes Framework für viralen Content. Unsere KI analysiert, wie gut deine Reels diese Elemente umsetzen."
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

  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const closeMobileMenu = () => setMobileMenuOpen(false);

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
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">Wie es funktioniert</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">Erfolge</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">Preise</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">FAQ</a>
            <button onClick={() => setLocation('/compare')} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 whitespace-nowrap">
              <ArrowLeftRight className="w-3 h-3" />
              Vergleichen
            </button>
            {isAuthenticated && (
              <button onClick={() => setLocation('/dashboard')} className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                Dashboard
              </button>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => document.getElementById('hero-input')?.focus()}
              className="btn-gradient text-white border-0 shrink-0 text-sm lg:text-base hidden sm:flex"
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-1 lg:mr-2" />
              Jetzt analysieren
            </Button>

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
            className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-background lg:hidden shadow-2xl"
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
                <ArrowLeftRight className="w-5 h-5 text-primary" />
                Vergleichen
              </button>
              {isAuthenticated && (
                <button onClick={() => { setLocation('/dashboard'); closeMobileMenu(); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left">
                  <Users className="w-5 h-5 text-primary" />
                  Dashboard
                </button>
              )}
              <div className="h-px bg-border/50 my-4" />
              <Button onClick={() => { document.getElementById('hero-input')?.focus(); closeMobileMenu(); }} className="btn-gradient text-white border-0 w-full justify-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Jetzt analysieren
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">KI-gestützte Instagram Analyse</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
              Entdecke warum
              <br />
              <span className="text-gradient">Content viral geht</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Analysiere jeden Instagram-Account. Verstehe Engagement-Muster, 
              optimiere deine Captions und steigere deine Reichweite mit datengestützten Insights.
            </p>

            {/* Search Input */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-xl mx-auto mb-8"
            >
              <div className="relative gradient-border rounded-2xl p-1">
                <div className="flex items-center gap-2 bg-background rounded-xl p-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="hero-input"
                      type="text"
                      placeholder="@username eingeben..."
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                      className="pl-12 h-14 text-lg bg-transparent border-0 focus-visible:ring-0 input-glow"
                    />
                  </div>
                  <Button 
                    onClick={handleAnalyze}
                    size="lg"
                    className="btn-gradient h-12 px-8 text-white border-0"
                  >
                    Analysieren
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>Kostenlos testen</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>Keine Anmeldung nötig</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>Sofortige Ergebnisse</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="glass-card rounded-2xl p-6 text-center stat-card"
              >
                <p className="text-3xl font-bold text-gradient mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
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
              <span className="text-sm text-muted-foreground">+2.500 aktive Nutzer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <span className="text-sm font-semibold">4.9/5</span>
              <span className="text-sm text-muted-foreground">Bewertung</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">100% Datenschutz</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Echtzeit-Analyse</span>
            </div>
          </div>
        </div>
      </section>

      {/* Niches Section */}
      <section id="niches" className="py-16">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground mb-6">
            FUNKTIONIERT FÜR ALLE NISCHEN
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {niches.map((niche, index) => (
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

      {/* Problem/Solution Section */}
      <section className="py-24 bg-muted/10">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="badge-neon mb-4">DAS PROBLEM</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Warum gehen manche Reels viral
              <br />
              <span className="text-gradient">und andere nicht?</span>
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
                <h3 className="text-2xl font-bold">Ohne ReelSpy</h3>
              </div>
              {[
                "Du postest blind und hoffst auf Reichweite",
                "Deine Hooks funktionieren nicht - aber du weißt nicht warum",
                "Du verpasst die besten Posting-Zeiten",
                "Dein Engagement stagniert seit Monaten",
                "Du kopierst Trends, statt sie zu verstehen"
              ].map((item, i) => (
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
                <h3 className="text-2xl font-bold">Mit ReelSpy</h3>
              </div>
              {[
                "Datenbasierte Content-Strategie mit klaren Insights",
                "KI analysiert jeden Hook und gibt konkrete Verbesserungen",
                "Heatmap zeigt dir die perfekten Posting-Zeiten",
                "Viral Score prognostiziert deinen Erfolg",
                "Verstehe die Muster hinter viralem Content"
              ].map((item, i) => (
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
            <Badge className="badge-neon mb-4">FEATURES</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Alles was du brauchst für
              <br />
              <span className="text-gradient">viralen Content</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Umfassende Analyse-Tools die dir helfen, die Geheimnisse viraler Instagram-Posts zu verstehen.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-6 stat-card group relative"
              >
                {feature.highlight && (
                  <Badge className="absolute -top-3 left-4 bg-accent text-accent-foreground text-xs px-2 py-0.5 whitespace-nowrap">
                    {feature.highlight}
                  </Badge>
                )}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary mb-4 group-hover:glow-purple transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
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
            <Badge className="badge-neon mb-4">SO FUNKTIONIERT'S</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              In 3 Schritten zur
              <br />
              <span className="text-gradient">perfekten Analyse</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Username eingeben",
                description: "Gib einfach den Instagram-Username ein, den du analysieren möchtest.",
                icon: <Search className="w-6 h-6" />
              },
              {
                step: "02",
                title: "KI analysiert",
                description: "Unsere KI wertet alle verfügbaren Daten aus und berechnet den Viral Score.",
                icon: <Sparkles className="w-6 h-6" />
              },
              {
                step: "03",
                title: "Insights erhalten",
                description: "Erhalte detaillierte Empfehlungen zur Optimierung deines Contents.",
                icon: <TrendingUp className="w-6 h-6" />
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white mx-auto mb-6 glow-purple">
                  {item.icon}
                </div>
                <span className="text-6xl font-black text-muted/30 absolute -top-4 left-1/2 -translate-x-1/2">
                  {item.step}
                </span>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA after steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button 
              onClick={() => document.getElementById('hero-input')?.focus()}
              size="lg"
              className="btn-gradient h-14 px-10 text-white border-0 text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Jetzt kostenlos testen
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
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
            <Badge className="badge-neon mb-4">FÜR WEN?</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Perfekt für jeden, der
              <br />
              <span className="text-gradient">auf Instagram wachsen will</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-6 stat-card"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary mb-4">
                  {useCase.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{useCase.description}</p>
                <ul className="space-y-2">
                  {useCase.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
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
            <Badge className="badge-neon mb-4">ERFOLGSGESCHICHTEN</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Was unsere Nutzer
              <br />
              <span className="text-gradient">erreicht haben</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-6 stat-card relative"
              >
                {/* Metric Badge */}
                <div className="absolute -top-3 -right-3">
                  <Badge className="bg-accent text-accent-foreground font-bold">
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
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-primary">{testimonial.followers}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-1 mt-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Comparison - 4 Tiers */}
      <section id="pricing" className="py-24">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="badge-neon mb-4">EINFACHES PRICING</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Wähle deinen Plan
              <br />
              <span className="text-gradient">3 KI-Analysen kostenlos</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Starte kostenlos mit 3 KI-Analysen. Upgrade jederzeit für mehr Power.
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Free Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-6"
              >
                <div className="text-sm font-medium text-muted-foreground mb-2">FREE</div>
                <h3 className="text-xl font-bold mb-1">Kostenlos</h3>
                <p className="text-xs text-muted-foreground mb-4">Zum Ausprobieren</p>
                <div className="text-3xl font-black mb-1">
                  3 KI-Analysen
                </div>
                <p className="text-xs text-muted-foreground mb-6">einmalig geschenkt</p>
                <Button 
                  onClick={() => document.getElementById('hero-input')?.focus()}
                  variant="outline" 
                  className="w-full mb-6"
                  size="sm"
                >
                  Jetzt starten
                </Button>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    <span><strong>3 KI-Analysen</strong> einmalig</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    <span>Viral Score (47 Faktoren)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    <span>HAPSS-Framework</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    <span>7 Tage Wachstum</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Minus className="w-4 h-4 shrink-0" />
                    <span>KI-Tiefenanalyse</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Minus className="w-4 h-4 shrink-0" />
                    <span>PDF-Export</span>
                  </li>
                </ul>
              </motion.div>

              {/* Starter Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-6"
              >
                <div className="text-sm font-medium text-primary mb-2">STARTER</div>
                <h3 className="text-xl font-bold mb-1">Starter</h3>
                <p className="text-xs text-muted-foreground mb-4">Für Einsteiger</p>
                <div className="text-3xl font-black mb-1">
                  €19<span className="text-lg font-normal text-muted-foreground">/mo</span>
                </div>
                <p className="text-xs text-muted-foreground mb-6">10 KI-Analysen/Monat</p>
                <Button 
                  onClick={() => setLocation('/pricing')}
                  variant="outline" 
                  className="w-full mb-6"
                  size="sm"
                >
                  Upgrade
                </Button>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    <span><strong>10 KI-Analysen</strong>/Monat</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    <span>3.000+ KI-Parameter</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    <span>HAPSS + AIDA Framework</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    <span>30 Tage Wachstum</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    <span>Posting-Zeit-Analyse</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Minus className="w-4 h-4 shrink-0" />
                    <span>PDF-Export</span>
                  </li>
                </ul>
              </motion.div>

              {/* Pro Plan - HIGHLIGHTED */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-accent text-accent-foreground font-bold px-4">BELIEBTESTE WAHL</Badge>
                </div>
                <div className="gradient-border rounded-2xl p-1 h-full">
                  <div className="bg-background rounded-2xl p-6 h-full">
                    <div className="text-sm font-medium text-accent mb-2">PRO</div>
                    <h3 className="text-xl font-bold mb-1">Pro</h3>
                    <p className="text-xs text-muted-foreground mb-4">Für Creator</p>
                    <div className="text-3xl font-black mb-1">
                      €49<span className="text-lg font-normal text-muted-foreground">/mo</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-6">35 KI-Analysen/Monat</p>
                    <Button 
                      onClick={() => setLocation('/pricing')}
                      className="btn-gradient w-full text-white border-0 mb-6"
                      size="sm"
                    >
                      <Crown className="w-4 h-4 mr-1" />
                      Jetzt upgraden
                    </Button>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-accent shrink-0" />
                        <span><strong>35 KI-Analysen</strong>/Monat</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-accent shrink-0" />
                        <span>Hopkins, Ogilvy, Schwartz</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-accent shrink-0" />
                        <span>KI-Tiefenanalyse</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-accent shrink-0" />
                        <span>1 Jahr Follower-Historie</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-accent shrink-0" />
                        <span>PDF-Export</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-accent shrink-0" />
                        <span>Competitor-Vergleich</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Business Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-6"
              >
                <div className="text-sm font-medium text-yellow-500 mb-2">BUSINESS</div>
                <h3 className="text-xl font-bold mb-1">Business</h3>
                <p className="text-xs text-muted-foreground mb-4">Für Agenturen</p>
                <div className="text-3xl font-black mb-1">
                  €99<span className="text-lg font-normal text-muted-foreground">/mo</span>
                </div>
                <p className="text-xs text-muted-foreground mb-6">100 KI-Analysen/Monat</p>
                <Button 
                  onClick={() => setLocation('/pricing')}
                  variant="outline" 
                  className="w-full mb-6 border-yellow-500/50 hover:bg-yellow-500/10"
                  size="sm"
                >
                  <Rocket className="w-4 h-4 mr-1" />
                  Upgrade
                </Button>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-yellow-500 shrink-0" />
                    <span><strong>100 KI-Analysen</strong>/Monat</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-yellow-500 shrink-0" />
                    <span>Alles aus Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-yellow-500 shrink-0" />
                    <span>TikTok + YouTube Module</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-yellow-500 shrink-0" />
                    <span>White-Label Reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-yellow-500 shrink-0" />
                    <span>Prioritäts-Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-yellow-500 shrink-0" />
                    <span>Team-Accounts</span>
                  </li>
                </ul>
              </motion.div>
            </div>

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
            <Badge className="badge-neon mb-4">FAQ</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Häufig gestellte
              <br />
              <span className="text-gradient">Fragen</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
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
                <Badge className="badge-neon mb-6">STARTE JETZT</Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Bereit für mehr
                  <span className="text-gradient"> Reichweite?</span>
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Schließe dich über 2.500 Creatorn an, die bereits mit ReelSpy ihre Reichweite steigern.
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

      {/* Footer */}
      <footer className="py-16 border-t border-border/50">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.svg" alt="ReelSpy.ai" className="h-8 w-auto" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Die KI-gestützte Instagram-Analyse für Creator, Influencer und Brands.
              </p>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
                <span className="text-sm ml-2">4.9/5</span>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Produkt</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Preise</a></li>
                <li><button onClick={() => setLocation('/compare')} className="hover:text-foreground transition-colors">Vergleichen</button></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Ressourcen</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Rechtliches</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Datenschutz</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">AGB</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Impressum</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Kontakt</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 ReelSpy.ai. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-4">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">SSL-verschlüsselt</span>
              <Lock className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">DSGVO-konform</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

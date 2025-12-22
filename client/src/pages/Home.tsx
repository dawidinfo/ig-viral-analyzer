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
  ArrowLeftRight
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

const features = [
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Engagement Analyse",
    description: "Detaillierte Auswertung von Likes, Comments, Shares und Saves mit Branchen-Benchmarks."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Viral Score",
    description: "KI-gestützte Bewertung des Viralitäts-Potenzials basierend auf 12+ Faktoren."
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Reels Performance",
    description: "Watch-Time, Completion Rate und Replay-Analyse für maximale Reichweite."
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
  }
];

const stats = [
  { value: "50K+", label: "Analysierte Accounts" },
  { value: "2.5M+", label: "Ausgewertete Posts" },
  { value: "98%", label: "Genauigkeit" },
  { value: "4.9/5", label: "Bewertung" }
];

const niches = [
  "🌍 Travel", "💪 Fitness", "🍔 Food", "👗 Fashion", "💄 Beauty", 
  "🐶 Pets", "🎨 Art", "📷 Photography", "🎵 Music", "⚽ Sports",
  "🎮 Gaming", "💼 Business", "🏠 Home Decor", "🌱 Wellness"
];

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");

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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation('/')}>
            <img src="/logo.png" alt="ReelSpy.ai" className="h-10 w-auto" />
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Wie es funktioniert</a>
            <a href="#niches" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Nischen</a>
            <button onClick={() => setLocation('/compare')} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeftRight className="w-3 h-3" />
              Vergleichen
            </button>
          </div>

          <Button 
            onClick={() => document.getElementById('hero-input')?.focus()}
            className="btn-gradient text-white border-0"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Jetzt analysieren
          </Button>
        </div>
      </nav>

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

      {/* Niches Section */}
      <section id="niches" className="py-16 border-y border-border/50">
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
                className="glass-card rounded-2xl p-6 stat-card group"
              >
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
        </div>
      </section>

      {/* CTA Section */}
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
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Bereit für mehr
                  <span className="text-gradient"> Reichweite?</span>
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Starte jetzt deine kostenlose Analyse und entdecke das volle Potenzial deines Instagram-Accounts.
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

                <div className="flex items-center justify-center gap-2 mt-6">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background" />
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
      <footer className="py-12 border-t border-border/50">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">ReelSpy.ai</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2024 ReelSpy.ai. Alle Rechte vorbehalten.
            </p>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Datenschutz</a>
              <a href="#" className="hover:text-foreground transition-colors">Impressum</a>
              <a href="#" className="hover:text-foreground transition-colors">Kontakt</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

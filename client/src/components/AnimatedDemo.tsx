import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  CheckCircle2,
  Play,
  ArrowRight,
  Zap,
  Target,
  Calendar,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    id: 1,
    title: "Username eingeben",
    description: "Gib einen Instagram-Username ein",
    icon: Search,
    color: "from-blue-500 to-cyan-500",
    demo: "input"
  },
  {
    id: 2,
    title: "KI analysiert",
    description: "3.000+ Parameter werden geprüft",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
    demo: "analyzing"
  },
  {
    id: 3,
    title: "Ergebnisse erhalten",
    description: "Viral Score, HAPSS & mehr",
    icon: BarChart3,
    color: "from-green-500 to-emerald-500",
    demo: "results"
  },
  {
    id: 4,
    title: "Content optimieren",
    description: "Personalisierte Empfehlungen",
    icon: TrendingUp,
    color: "from-orange-500 to-yellow-500",
    demo: "optimize"
  }
];

const analysisMetrics = [
  { label: "HAPSS-Framework", value: 94, max: 100, color: "bg-purple-500" },
  { label: "Hook-Qualität", value: 87, max: 100, color: "bg-pink-500" },
  { label: "Viral-Potenzial", value: 92, max: 100, color: "bg-cyan-500" },
  { label: "Engagement-Rate", value: 8.7, max: 10, suffix: "%", color: "bg-green-500" }
];

export function AnimatedDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [typedUsername, setTypedUsername] = useState("");
  const targetUsername = "@fitness_sarah";

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying) return;

    const stepDurations = [2500, 3000, 3500, 3000];
    
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setCurrentStep(0);
        setIsPlaying(false);
      }
    }, stepDurations[currentStep]);

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying]);

  // Typing animation for step 1
  useEffect(() => {
    if (currentStep !== 0 || !isPlaying) {
      if (currentStep !== 0) setTypedUsername(targetUsername);
      return;
    }

    setTypedUsername("");
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < targetUsername.length) {
        setTypedUsername(targetUsername.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [currentStep, isPlaying]);

  const startDemo = () => {
    setCurrentStep(0);
    setTypedUsername("");
    setIsPlaying(true);
  };

  return (
    <div className="relative">
      {/* Step Indicators */}
      <div className="flex justify-center gap-2 sm:gap-4 mb-8">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs sm:text-sm transition-all duration-300 ${
              index === currentStep 
                ? 'bg-primary text-primary-foreground' 
                : index < currentStep 
                  ? 'bg-accent/20 text-accent' 
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {index < currentStep ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <step.icon className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{step.title}</span>
            <span className="sm:hidden">{index + 1}</span>
          </motion.div>
        ))}
      </div>

      {/* Demo Container */}
      <div className="relative bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 sm:p-8 min-h-[400px] overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        
        <AnimatePresence mode="wait">
          {/* Step 1: Input */}
          {currentStep === 0 && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative z-10 flex flex-col items-center justify-center h-full min-h-[350px]"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Schritt 1: Username eingeben</h3>
                <p className="text-muted-foreground">Gib einen beliebigen Instagram-Account ein</p>
              </div>
              
              <div className="w-full max-w-md">
                <div className="relative">
                  <div className="flex items-center gap-3 bg-background border border-border rounded-xl p-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="text-lg font-medium">
                        {typedUsername}
                        {isPlaying && typedUsername.length < targetUsername.length && (
                          <span className="animate-pulse">|</span>
                        )}
                      </span>
                    </div>
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analysieren
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Analyzing */}
          {currentStep === 1 && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative z-10 flex flex-col items-center justify-center h-full min-h-[350px]"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Schritt 2: KI analysiert</h3>
                <p className="text-muted-foreground">Unsere KI prüft 3.000+ Parameter</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl">
                {[
                  { icon: Target, label: "Hook-Analyse", delay: 0 },
                  { icon: BarChart3, label: "Engagement", delay: 0.2 },
                  { icon: Calendar, label: "Posting-Zeit", delay: 0.4 },
                  { icon: FileText, label: "Caption-Check", delay: 0.6 }
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: item.delay }}
                    className="bg-background/50 border border-border rounded-xl p-4 text-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
                    >
                      <item.icon className="w-5 h-5 text-white" />
                    </motion.div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <motion.div
                      className="h-1 bg-muted rounded-full mt-2 overflow-hidden"
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                      />
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6 text-sm text-muted-foreground flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-yellow-500" />
                Analysiere {typedUsername}...
              </motion.p>
            </motion.div>
          )}

          {/* Step 3: Results */}
          {currentStep === 2 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative z-10 flex flex-col items-center justify-center h-full min-h-[350px]"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Schritt 3: Ergebnisse</h3>
                <p className="text-muted-foreground">Dein personalisierter Viral Score</p>
              </div>

              <div className="w-full max-w-xl">
                {/* Viral Score */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="text-center mb-8"
                >
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                    <div>
                      <motion.span
                        className="text-4xl font-bold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        87
                      </motion.span>
                      <span className="text-lg">/100</span>
                      <p className="text-xs mt-1">Viral Score</p>
                    </div>
                  </div>
                </motion.div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  {analysisMetrics.map((metric, i) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="bg-background/50 border border-border rounded-xl p-3"
                    >
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">{metric.label}</span>
                        <span className="font-bold">{metric.value}{metric.suffix || ''}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${metric.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(metric.value / metric.max) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Optimize */}
          {currentStep === 3 && (
            <motion.div
              key="optimize"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative z-10 flex flex-col items-center justify-center h-full min-h-[350px]"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Schritt 4: Optimieren</h3>
                <p className="text-muted-foreground">Personalisierte Empfehlungen für mehr Reichweite</p>
              </div>

              <div className="w-full max-w-xl space-y-4">
                {[
                  { icon: "🎯", title: "Hook verbessern", desc: "Starte mit einer Frage oder provokanten Aussage", priority: "Hoch" },
                  { icon: "⏰", title: "Posting-Zeit", desc: "Poste um 18:00 Uhr für maximale Reichweite", priority: "Mittel" },
                  { icon: "📝", title: "Caption-Struktur", desc: "Nutze das AIDA-Framework für deine Captions", priority: "Hoch" },
                  { icon: "🎵", title: "Trending Audio", desc: "Verwende aktuell virale Sounds", priority: "Mittel" }
                ].map((tip, i) => (
                  <motion.div
                    key={tip.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-start gap-4 bg-background/50 border border-border rounded-xl p-4"
                  >
                    <span className="text-2xl">{tip.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{tip.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          tip.priority === "Hoch" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {tip.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{tip.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play Button Overlay */}
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20"
          >
            <Button
              onClick={startDemo}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg rounded-full shadow-2xl shadow-purple-500/30"
            >
              <Play className="w-6 h-6 mr-2 fill-current" />
              Demo starten
            </Button>
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-8"
      >
        <p className="text-muted-foreground mb-4">
          Bereit, deinen Content zu optimieren?
        </p>
        <Button
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          onClick={() => {
            const heroInput = document.getElementById('hero-input');
            if (heroInput) {
              heroInput.scrollIntoView({ behavior: 'smooth' });
              heroInput.focus();
            }
          }}
        >
          Jetzt kostenlos analysieren
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}

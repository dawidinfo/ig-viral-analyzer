import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Sparkles, Clock, CheckCircle2, ArrowRight, Copy, Check, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

// Owner email addresses - don't show popup to owners
const OWNER_EMAILS = [
  "qliq.marketing@proton.me",
  "dp@dawid.info"
];

const PROMO_CODE = "REELSPY20";
const DISCOUNT_PERCENT = 20;

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const { user } = useAuth();

  useEffect(() => {
    // Don't show popup to owners
    if (user?.email && OWNER_EMAILS.includes(user.email)) {
      setHasShown(true);
      return;
    }

    // Check if popup was permanently dismissed (localStorage) or shown in this session
    const permanentlyDismissed = localStorage.getItem("exitIntentDismissed");
    const shownThisSession = sessionStorage.getItem("exitIntentShown");
    if (permanentlyDismissed || shownThisSession) {
      setHasShown(true);
      return;
    }

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem("exitIntentShown", "true");
      }
    };

    // Mobile: detect back button or scroll to top quickly
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // If user scrolls up very quickly from below
      if (lastScrollY > 500 && currentScrollY < 100 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem("exitIntentShown", "true");
      }
      lastScrollY = currentScrollY;
    };

    // Delay before enabling exit intent
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("scroll", handleScroll);
    }, 5000); // Wait 5 seconds before enabling

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasShown]);

  // Countdown timer
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      toast.success("Rabatt-Code kopiert!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Kopieren fehlgeschlagen");
    }
  };

  const handleClaim = () => {
    setIsVisible(false);
    // Navigate to pricing
    setLocation("/#pricing");
    setTimeout(() => {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleTryFree = () => {
    setIsVisible(false);
    // Scroll zur Hero-Eingabe auf der Startseite
    setLocation("/");
    setTimeout(() => {
      const heroInput = document.getElementById('hero-input');
      if (heroInput) {
        heroInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        heroInput.focus();
      }
    }, 100);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Permanently dismiss for this user
    localStorage.setItem("exitIntentDismissed", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            onClick={handleDismiss}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-sm bg-gradient-to-b from-card to-card/95 border-2 border-violet-500/50 rounded-2xl shadow-2xl overflow-hidden">
              {/* Animated Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/10" />
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/30 rounded-full blur-2xl" 
              />
              <motion.div 
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl" 
              />

              {/* Close Button - Larger and more visible */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-2.5 rounded-full bg-muted/80 hover:bg-muted transition-colors z-20 group"
                aria-label="Schließen"
              >
                <X className="w-6 h-6 text-foreground group-hover:text-red-400 transition-colors" />
              </button>

              <div className="relative p-4">
                {/* Top Badge */}
                <div className="flex justify-center mb-3">
                  <motion.div 
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/40 text-violet-300 text-xs font-semibold"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    Exklusives Angebot
                  </motion.div>
                </div>

                {/* Main Title */}
                <h2 className="text-lg sm:text-xl font-bold text-center mb-1">
                  Warte! <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400">{DISCOUNT_PERCENT}% Rabatt</span>
                </h2>

                {/* Promo Code Box */}
                <div 
                  onClick={handleCopyCode}
                  className="relative cursor-pointer group my-3"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative flex items-center justify-between bg-background/90 backdrop-blur-sm border border-violet-500/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Rabatt-Code:</p>
                        <p className="text-lg font-mono font-bold tracking-wider text-violet-400">
                          {PROMO_CODE}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/20 h-8 w-8 p-0"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Benefits - Compact Grid */}
                <div className="grid grid-cols-2 gap-1.5 mb-3 text-xs">
                  {[
                    { text: `${DISCOUNT_PERCENT}% Rabatt`, icon: CheckCircle2 },
                    { text: "Unbegrenzte Analysen", icon: CheckCircle2 },
                    { text: "Content-Plan", icon: CheckCircle2 },
                    { text: "Prioritäts-Support", icon: CheckCircle2 }
                  ].map((benefit, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 p-1.5 rounded bg-muted/30"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="truncate">{benefit.text}</span>
                    </div>
                  ))}
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center justify-center gap-2 mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <Clock className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-300">Endet in:</span>
                  <span className="font-mono font-bold text-base text-red-400">{formatTime(countdown)}</span>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handleClaim}
                    className="w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 text-sm py-2.5 shadow-lg shadow-violet-500/30"
                  >
                    <Zap className="w-4 h-4 mr-1.5" />
                    Jetzt {DISCOUNT_PERCENT}% sparen
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTryFree}
                    className="w-full border-muted-foreground/30 text-muted-foreground hover:text-foreground text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Erst kostenlos testen
                  </Button>
                </div>

                {/* Dismiss Link */}
                <button
                  onClick={handleDismiss}
                  className="w-full mt-2 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  Nein danke
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

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
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const { user } = useAuth();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

    // Desktop: Exit intent detection (mouse leaving viewport)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem("exitIntentShown", "true");
      }
    };

    // Mobile: detect scroll up from deep in page OR time-based trigger
    let lastScrollY = window.scrollY;
    let scrollUpDistance = 0;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Track continuous scroll up distance
      if (currentScrollY < lastScrollY) {
        scrollUpDistance += lastScrollY - currentScrollY;
      } else {
        scrollUpDistance = 0;
      }
      
      // Trigger if user scrolls up significantly from deep in page
      if (lastScrollY > 800 && scrollUpDistance > 400 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem("exitIntentShown", "true");
      }
      
      lastScrollY = currentScrollY;
    };

    // Mobile: Also trigger after spending time on page (30 seconds)
    let mobileTimer: ReturnType<typeof setTimeout> | null = null;
    if (isMobile) {
      mobileTimer = setTimeout(() => {
        if (!hasShown && window.scrollY > 300) {
          setIsVisible(true);
          setHasShown(true);
          sessionStorage.setItem("exitIntentShown", "true");
        }
      }, 30000); // 30 seconds
    }

    // Delay before enabling exit intent
    const timer = setTimeout(() => {
      if (!isMobile) {
        document.addEventListener("mouseleave", handleMouseLeave);
      }
      window.addEventListener("scroll", handleScroll, { passive: true });
    }, 5000); // Wait 5 seconds before enabling

    return () => {
      clearTimeout(timer);
      if (mobileTimer) clearTimeout(mobileTimer);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasShown, isMobile]);

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

          {/* Popup - Mobile optimized */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: isMobile ? 50 : 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: isMobile ? 50 : 20 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4"
          >
            <div className="relative w-full max-w-sm bg-gradient-to-b from-card to-card/95 border-2 border-violet-500/50 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
              {/* Animated Glow Effect - Smaller on mobile */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/10" />
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-8 -right-8 w-24 sm:w-32 h-24 sm:h-32 bg-violet-500/30 rounded-full blur-2xl" 
              />
              <motion.div 
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-8 -left-8 w-24 sm:w-32 h-24 sm:h-32 bg-purple-500/30 rounded-full blur-2xl" 
              />

              {/* Mobile drag indicator */}
              {isMobile && (
                <div className="flex justify-center pt-2">
                  <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
                </div>
              )}

              {/* Close Button - Touch-friendly on mobile */}
              <button
                onClick={handleDismiss}
                className="absolute top-2 sm:top-3 right-2 sm:right-3 p-2 sm:p-2.5 rounded-full bg-muted/80 hover:bg-muted active:bg-muted/60 transition-colors z-20 group touch-manipulation"
                aria-label="Schließen"
              >
                <X className="w-5 sm:w-6 h-5 sm:h-6 text-foreground group-hover:text-red-400 transition-colors" />
              </button>

              <div className="relative p-3 sm:p-4 pb-safe">
                {/* Top Badge */}
                <div className="flex justify-center mb-2 sm:mb-3">
                  <motion.div 
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/40 text-violet-300 text-[10px] sm:text-xs font-semibold"
                  >
                    <Gift className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    Exklusives Angebot
                  </motion.div>
                </div>

                {/* Main Title */}
                <h2 className="text-base sm:text-xl font-bold text-center mb-1">
                  Warte! <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400">{DISCOUNT_PERCENT}% Rabatt</span>
                </h2>

                {/* Promo Code Box - Touch-friendly */}
                <div 
                  onClick={handleCopyCode}
                  className="relative cursor-pointer group my-2 sm:my-3 touch-manipulation active:scale-[0.98] transition-transform"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg blur opacity-40 group-hover:opacity-60 group-active:opacity-70 transition-opacity" />
                  <div className="relative flex items-center justify-between bg-background/90 backdrop-blur-sm border border-violet-500/50 rounded-lg p-2.5 sm:p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-md bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                        <Crown className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground">Rabatt-Code:</p>
                        <p className="text-base sm:text-lg font-mono font-bold tracking-wider text-violet-400">
                          {PROMO_CODE}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-violet-400 px-2 py-1 rounded bg-violet-500/10">
                      {copied ? (
                        <>
                          <Check className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                          <span className="text-[10px] sm:text-xs">Kopiert!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                          <span className="text-[10px] sm:text-xs">Kopieren</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Benefits - Compact Grid, smaller on mobile */}
                <div className="grid grid-cols-2 gap-1 sm:gap-1.5 mb-2 sm:mb-3 text-[10px] sm:text-xs">
                  {[
                    { text: `${DISCOUNT_PERCENT}% Rabatt` },
                    { text: "Unbegrenzte Analysen" },
                    { text: "Content-Plan" },
                    { text: "Prioritäts-Support" }
                  ].map((benefit, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded bg-muted/30"
                    >
                      <CheckCircle2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="truncate">{benefit.text}</span>
                    </div>
                  ))}
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 p-1.5 sm:p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-red-400" />
                  <span className="text-[10px] sm:text-xs text-red-300">Endet in:</span>
                  <span className="font-mono font-bold text-sm sm:text-base text-red-400">{formatTime(countdown)}</span>
                </div>

                {/* CTA Buttons - Touch-friendly with larger tap targets */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Button
                    onClick={handleClaim}
                    className="w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 active:from-violet-700 active:via-purple-700 active:to-pink-700 text-white border-0 text-xs sm:text-sm py-3 sm:py-2.5 shadow-lg shadow-violet-500/30 touch-manipulation min-h-[44px]"
                  >
                    <Zap className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-1 sm:mr-1.5" />
                    Jetzt {DISCOUNT_PERCENT}% sparen
                    <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 ml-1 sm:ml-1.5" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleTryFree}
                    className="w-full border-muted-foreground/30 text-muted-foreground hover:text-foreground active:bg-muted/50 text-[10px] sm:text-xs py-2.5 sm:py-2 touch-manipulation min-h-[40px]"
                  >
                    <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1 sm:mr-1.5" />
                    Erst kostenlos testen
                  </Button>
                </div>

                {/* Dismiss Link - Touch-friendly */}
                <button
                  onClick={handleDismiss}
                  className="w-full mt-2 py-2 text-[10px] sm:text-[10px] text-muted-foreground/50 hover:text-muted-foreground active:text-muted-foreground transition-colors touch-manipulation"
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

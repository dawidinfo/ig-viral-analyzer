import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Sparkles, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if popup was already shown in this session
    const shown = sessionStorage.getItem("exitIntentShown");
    if (shown) {
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

  const handleClaim = () => {
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleDismiss}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-lg bg-card border-2 border-violet-500/50 rounded-2xl shadow-2xl overflow-hidden">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative p-8">
                {/* Badge */}
                <div className="flex justify-center mb-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-400 text-sm font-medium">
                    <Gift className="w-4 h-4" />
                    {t.exitIntent.limited}
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
                  {t.exitIntent.title}
                  <span className="text-gradient">{t.exitIntent.titleHighlight}</span>
                </h2>

                {/* Subtitle */}
                <p className="text-xl text-center text-violet-400 font-semibold mb-2">
                  {t.exitIntent.subtitle}
                </p>

                {/* Description */}
                <p className="text-center text-muted-foreground mb-6">
                  {t.exitIntent.description}
                </p>

                {/* Benefits */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="font-medium">{t.exitIntent.benefit1}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>{t.exitIntent.benefit2}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>{t.exitIntent.benefit3}</span>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center justify-center gap-2 mb-6 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{t.exitIntent.timer}</span>
                  <span className="font-mono font-bold text-violet-400">{formatTime(countdown)}</span>
                </div>

                {/* CTA Button */}
                <Button
                  size="lg"
                  onClick={handleClaim}
                  className="w-full btn-gradient text-white border-0 text-lg py-6"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {t.exitIntent.cta}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                {/* Dismiss Link */}
                <button
                  onClick={handleDismiss}
                  className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.exitIntent.dismiss}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

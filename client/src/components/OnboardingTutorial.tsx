import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  Search,
  BarChart3,
  Sparkles,
  Bookmark,
  Zap
} from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Willkommen bei ReelSpy.ai! 👋",
    description: "Entdecke, warum manche Reels viral gehen und andere nicht. Wir zeigen dir in 4 kurzen Schritten, wie du das Beste aus ReelSpy herausholst.",
    icon: <Sparkles className="w-8 h-8 text-primary" />,
  },
  {
    title: "Account analysieren",
    description: "Gib einfach einen Instagram-Username ein und klicke auf 'Analysieren'. Unsere KI analysiert über 3.000 Parameter in Sekunden.",
    icon: <Search className="w-8 h-8 text-cyan-400" />,
    highlight: "Tipp: Starte mit deinem eigenen Account oder einem Konkurrenten!",
  },
  {
    title: "Viral Score verstehen",
    description: "Der Viral Score (0-100) zeigt dir das Viral-Potenzial. Er basiert auf dem HAPSS-Framework, Engagement-Mustern und bewährten Copywriting-Formeln.",
    icon: <BarChart3 className="w-8 h-8 text-purple-400" />,
    highlight: "Score über 70 = Hohes Viral-Potenzial",
  },
  {
    title: "Analysen speichern",
    description: "Speichere interessante Accounts, um sie später zu vergleichen. Im Dashboard findest du alle gespeicherten Analysen und deine Nutzungsstatistiken.",
    icon: <Bookmark className="w-8 h-8 text-amber-400" />,
  },
  {
    title: "Bereit zum Starten! 🚀",
    description: "Du hast jetzt alles, was du brauchst. Analysiere deinen ersten Account und entdecke die Geheimnisse viraler Inhalte!",
    icon: <Zap className="w-8 h-8 text-green-400" />,
  },
];

interface OnboardingTutorialProps {
  onComplete: () => void;
  isOpen: boolean;
}

export function OnboardingTutorial({ onComplete, isOpen }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg mx-4 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Close Button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="p-8 pt-10">
            {/* Step Indicator */}
            <div className="flex justify-center gap-2 mb-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? "bg-primary"
                      : index < currentStep
                      ? "bg-primary/50"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Icon */}
            <motion.div
              key={currentStep}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
                {step.icon}
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              key={`text-${currentStep}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-6"
            >
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
              {step.highlight && (
                <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-primary font-medium">
                    {step.highlight}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Zurück
              </Button>

              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Überspringen
              </Button>

              <Button
                onClick={handleNext}
                className="gap-1 bg-gradient-to-r from-primary to-cyan-500 text-white border-0"
              >
                {currentStep === steps.length - 1 ? "Los geht's!" : "Weiter"}
                {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem("reelspy-onboarding-complete");
    if (!seen) {
      setHasSeenOnboarding(false);
      // Show after a short delay
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem("reelspy-onboarding-complete", "true");
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem("reelspy-onboarding-complete");
    setHasSeenOnboarding(false);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    hasSeenOnboarding,
    completeOnboarding,
    resetOnboarding,
  };
}

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Sparkles, TrendingUp, Zap, ArrowRight, X, Star, Target, Lightbulb } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

interface AnalysisCTAPopupProps {
  isOpen: boolean;
  onClose: () => void;
  viralScore?: number;
  username?: string;
}

export function AnalysisCTAPopup({ isOpen, onClose, viralScore = 0, username }: AnalysisCTAPopupProps) {
  const [, setLocation] = useLocation();

  const getScoreMessage = () => {
    if (viralScore >= 80) {
      return {
        title: "Wow! Dieser Account ist viral! 🔥",
        subtitle: "Lerne von den Besten und wende diese Strategien an",
        color: "text-green-500",
        bgColor: "bg-green-500/20",
      };
    } else if (viralScore >= 60) {
      return {
        title: "Gutes Potenzial erkannt! 📈",
        subtitle: "Mit den richtigen Optimierungen geht noch mehr",
        color: "text-amber-500",
        bgColor: "bg-amber-500/20",
      };
    } else {
      return {
        title: "Raum für Verbesserung! 💡",
        subtitle: "Analysiere erfolgreiche Accounts und lerne von ihnen",
        color: "text-blue-500",
        bgColor: "bg-blue-500/20",
      };
    }
  };

  const scoreMessage = getScoreMessage();

  const actions = [
    {
      icon: Sparkles,
      title: "Mehr Accounts analysieren",
      description: "Finde weitere virale Muster in deiner Nische",
      action: () => {
        onClose();
        setLocation("/");
        setTimeout(() => {
          document.getElementById("analyze-input")?.focus();
        }, 100);
      },
      primary: true,
    },
    {
      icon: Target,
      title: "Von Top-Accounts lernen",
      description: "Vergleiche dich mit den Besten",
      action: () => {
        onClose();
        setLocation("/compare");
      },
      primary: false,
    },
    {
      icon: Lightbulb,
      title: "Notizen machen",
      description: "Halte deine Learnings fest",
      action: () => {
        onClose();
        setLocation("/dashboard");
      },
      primary: false,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg bg-background/98 backdrop-blur-lg border border-border/50 p-4 sm:p-6 shadow-lg">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={`w-20 h-20 rounded-full ${scoreMessage.bgColor} flex items-center justify-center`}
            >
              <span className="text-4xl font-bold">{viralScore}</span>
            </motion.div>
          </div>
          <DialogTitle className={`text-xl sm:text-2xl ${scoreMessage.color} break-words`}>
            {scoreMessage.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {scoreMessage.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 sm:space-y-3 py-3 sm:py-4">
          {actions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant={action.primary ? "default" : "outline"}
                className={`w-full justify-start h-auto py-3 sm:py-4 px-3 sm:px-4 ${
                  action.primary ? "btn-gradient text-white" : "hover:bg-muted/50"
                }`}
                onClick={action.action}
              >
                <action.icon className={`w-5 h-5 mr-3 ${action.primary ? "" : "text-primary"}`} />
                <div className="text-left flex-1">
                  <p className="font-medium">{action.title}</p>
                  <p className={`text-xs ${action.primary ? "text-white/80" : "text-muted-foreground"}`}>
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="text-center pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">
            <Rocket className="w-4 h-4 inline mr-1" />
            Bereit viral zu gehen?
          </p>
          <Button
            variant="link"
            className="text-primary"
            onClick={() => {
              onClose();
              setLocation("/pricing");
            }}
          >
            <Zap className="w-4 h-4 mr-1" />
            Mehr Credits für unbegrenzte Analysen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

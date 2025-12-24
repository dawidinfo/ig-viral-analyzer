import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, MailX, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

export default function Unsubscribe() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "confirm">("confirm");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleUnsubscribe = async () => {
    setStatus("loading");
    
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token })
      });
      
      if (response.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const handleKeepSubscribed = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card border-border/50">
        <CardHeader className="text-center">
          {status === "confirm" && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                <MailX className="w-8 h-8 text-amber-500" />
              </div>
              <CardTitle className="text-2xl">E-Mails abbestellen?</CardTitle>
              <CardDescription className="text-muted-foreground">
                Bist du sicher, dass du keine wöchentlichen Performance-Reports mehr erhalten möchtest?
              </CardDescription>
            </>
          )}
          
          {status === "loading" && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Wird verarbeitet...</CardTitle>
              <CardDescription>Einen Moment bitte</CardDescription>
            </>
          )}
          
          {status === "success" && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Erfolgreich abgemeldet</CardTitle>
              <CardDescription className="text-muted-foreground">
                Du erhältst keine wöchentlichen Reports mehr an {email}
              </CardDescription>
            </>
          )}
          
          {status === "error" && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <CardTitle className="text-2xl">Fehler aufgetreten</CardTitle>
              <CardDescription className="text-muted-foreground">
                Die Abmeldung konnte nicht verarbeitet werden. Bitte versuche es später erneut.
              </CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === "confirm" && (
            <>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">Du verpasst dann:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Wöchentliche Performance-Insights</li>
                  <li>Trending Accounts in deiner Nische</li>
                  <li>Tipps für optimale Posting-Zeiten</li>
                  <li>Exklusive KI-Analysen</li>
                </ul>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleKeepSubscribed}
                  className="w-full bg-gradient-to-r from-primary to-cyan-500"
                >
                  Abonniert bleiben
                </Button>
                <Button
                  variant="outline"
                  onClick={handleUnsubscribe}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  Trotzdem abmelden
                </Button>
              </div>
            </>
          )}
          
          {status === "success" && (
            <div className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                Du kannst die E-Mails jederzeit in deinen Dashboard-Einstellungen wieder aktivieren.
              </p>
              <Button
                onClick={() => setLocation("/")}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück zur Startseite
              </Button>
            </div>
          )}
          
          {status === "error" && (
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleUnsubscribe}
                variant="outline"
                className="w-full"
              >
                Erneut versuchen
              </Button>
              <Button
                onClick={() => setLocation("/")}
                variant="ghost"
                className="w-full"
              >
                Zurück zur Startseite
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

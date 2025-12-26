import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthVerify() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  
  // Get token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  
  const verifyMutation = trpc.magicLink.verify.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setStatus("success");
        setMessage(data.message);
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.message);
      }
    },
    onError: (error) => {
      setStatus("error");
      setMessage(error.message || "Ein Fehler ist aufgetreten");
    },
  });
  
  useEffect(() => {
    if (token) {
      verifyMutation.mutate({ token });
    } else {
      setStatus("error");
      setMessage("Kein Token gefunden. Bitte fordere einen neuen Login-Link an.");
    }
  }, [token]);
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
          {/* Logo */}
          <div className="mb-6">
            <a href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold">ReelSpy.ai</span>
            </a>
          </div>
          
          {status === "loading" && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Verifizierung läuft...</h1>
              <p className="text-muted-foreground">
                Bitte warte einen Moment, während wir deinen Login-Link überprüfen.
              </p>
            </>
          )}
          
          {status === "success" && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Erfolgreich eingeloggt!</h1>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
              <p className="text-sm text-muted-foreground">
                Du wirst in Kürze zum Dashboard weitergeleitet...
              </p>
              <Button
                onClick={() => window.location.href = "/dashboard"}
                className="mt-4 btn-gradient"
              >
                Zum Dashboard
              </Button>
            </>
          )}
          
          {status === "error" && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Verifizierung fehlgeschlagen</h1>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => setLocation("/")}
                  className="w-full btn-gradient"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Neuen Login-Link anfordern
                </Button>
                <Button
                  onClick={() => setLocation("/")}
                  variant="outline"
                  className="w-full"
                >
                  Zur Startseite
                </Button>
              </div>
            </>
          )}
        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-6">
          Bei Problemen kontaktiere uns unter support@reelspy.ai
        </p>
      </div>
    </div>
  );
}

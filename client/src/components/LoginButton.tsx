import { Button } from "@/components/ui/button";
import { LogIn, Shield, Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

interface LoginButtonProps {
  variant?: "default" | "outline" | "ghost" | "gradient";
  size?: "default" | "sm" | "lg";
  showSecurityNote?: boolean;
  className?: string;
  children?: React.ReactNode;
}

type LoginView = "options" | "email" | "sent";

export function LoginButton({ 
  variant = "default", 
  size = "default",
  showSecurityNote = false,
  className = "",
  children
}: LoginButtonProps) {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginView, setLoginView] = useState<LoginView>("options");
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  
  const sendMagicLink = trpc.magicLink.send.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setSentEmail(email);
        setLoginView("sent");
        toast.success("E-Mail gesendet!", {
          description: "Prüfe dein Postfach für den Login-Link.",
        });
      } else {
        toast.error("Fehler", { description: data.message });
      }
    },
    onError: (error) => {
      toast.error("Fehler", { description: error.message });
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    sendMagicLink.mutate({ email: email.trim() });
  };

  const handleClose = () => {
    setShowLoginDialog(false);
    setTimeout(() => {
      setLoginView("options");
      setEmail("");
      setSentEmail("");
    }, 200);
  };

  const buttonVariants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    gradient: "btn-gradient text-white border-0",
  };

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <Button
          onClick={() => setShowLoginDialog(true)}
          size={size}
          className={`${buttonVariants[variant]} ${className}`}
        >
          <LogIn className="w-4 h-4 mr-2" />
          {children || "Anmelden"}
        </Button>
        
        {showSecurityNote && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span>Sicherer Login mit SSL-Verschlüsselung</span>
          </div>
        )}
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {loginView === "sent" ? "E-Mail gesendet!" : "Anmelden"}
            </DialogTitle>
          </DialogHeader>
          
          {loginView === "options" && (
            <div className="py-4">
              <p className="text-center text-sm text-muted-foreground mb-6">
                Wähle eine Login-Methode:
              </p>
              
              {/* E-Mail Login Button */}
              <Button
                onClick={() => setLoginView("email")}
                variant="outline"
                className="w-full h-12 justify-start gap-3 mb-3 bg-white/5 hover:bg-white/10 border-white/10"
              >
                <Mail className="w-5 h-5 text-blue-400" />
                <span>Mit E-Mail anmelden</span>
              </Button>
              
              <p className="text-center text-xs text-muted-foreground mt-4">
                <Shield className="w-3 h-3 inline mr-1 text-emerald-500" />
                Sicherer Login mit SSL-Verschlüsselung
              </p>
            </div>
          )}
          
          {loginView === "email" && (
            <div className="py-4">
              <button
                onClick={() => setLoginView("options")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück
              </button>
              
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">E-Mail-Adresse</label>
                  <Input
                    type="email"
                    placeholder="deine@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-white/5 border-white/10"
                    autoFocus
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={sendMagicLink.isPending || !email.trim()}
                  className="w-full h-12 btn-gradient"
                >
                  {sendMagicLink.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Login-Link senden
                    </>
                  )}
                </Button>
                
                <p className="text-center text-xs text-muted-foreground">
                  Du erhältst einen Link per E-Mail, mit dem du dich einloggen kannst.
                </p>
              </form>
            </div>
          )}
          
          {loginView === "sent" && (
            <div className="py-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              
              <p className="text-muted-foreground mb-2">
                Wir haben einen Login-Link an
              </p>
              <p className="font-medium text-lg mb-4">{sentEmail}</p>
              <p className="text-sm text-muted-foreground">
                Klicke auf den Link in der E-Mail, um dich anzumelden.
                <br />
                Der Link ist 15 Minuten gültig.
              </p>
              
              <Button
                onClick={() => setLoginView("email")}
                variant="ghost"
                className="mt-6"
              >
                Andere E-Mail verwenden
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Mobile version with security note
export function MobileLoginButton({ onClose, className = "" }: { onClose?: () => void; className?: string }) {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginView, setLoginView] = useState<LoginView>("options");
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  
  const sendMagicLink = trpc.magicLink.send.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setSentEmail(email);
        setLoginView("sent");
      } else {
        toast.error("Fehler", { description: data.message });
      }
    },
    onError: (error) => {
      toast.error("Fehler", { description: error.message });
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    sendMagicLink.mutate({ email: email.trim() });
  };

  const handleClose = () => {
    setShowLoginDialog(false);
    onClose?.();
    setTimeout(() => {
      setLoginView("options");
      setEmail("");
    }, 200);
  };

  return (
    <>
      <div className={`flex flex-col gap-2 ${className}`}>
        <Button
          onClick={() => setShowLoginDialog(true)}
          variant="outline"
          className="w-full justify-center"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Anmelden
        </Button>
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="w-3 h-3 text-emerald-500" />
          <span>Sicherer Login</span>
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {loginView === "sent" ? "E-Mail gesendet!" : "Anmelden"}
            </DialogTitle>
          </DialogHeader>
          
          {loginView === "options" && (
            <div className="py-4">
              <p className="text-center text-sm text-muted-foreground mb-6">
                Wähle eine Login-Methode:
              </p>
              
              <Button
                onClick={() => setLoginView("email")}
                variant="outline"
                className="w-full h-12 justify-start gap-3 mb-3 bg-white/5 hover:bg-white/10 border-white/10"
              >
                <Mail className="w-5 h-5 text-blue-400" />
                <span>Mit E-Mail anmelden</span>
              </Button>
              
              <p className="text-center text-xs text-muted-foreground mt-4">
                <Shield className="w-3 h-3 inline mr-1 text-emerald-500" />
                Sicherer Login mit SSL-Verschlüsselung
              </p>
            </div>
          )}
          
          {loginView === "email" && (
            <div className="py-4">
              <button
                onClick={() => setLoginView("options")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück
              </button>
              
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">E-Mail-Adresse</label>
                  <Input
                    type="email"
                    placeholder="deine@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-white/5 border-white/10"
                    autoFocus
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={sendMagicLink.isPending || !email.trim()}
                  className="w-full h-12 btn-gradient"
                >
                  {sendMagicLink.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Login-Link senden
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
          
          {loginView === "sent" && (
            <div className="py-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              
              <p className="text-muted-foreground mb-2">
                Login-Link gesendet an
              </p>
              <p className="font-medium text-lg mb-4">{sentEmail}</p>
              
              <Button
                onClick={() => setLoginView("email")}
                variant="ghost"
                className="mt-4"
              >
                Andere E-Mail verwenden
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Compact version for navigation
export function LoginButtonCompact({ className = "" }: { className?: string }) {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginView, setLoginView] = useState<LoginView>("options");
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  
  const sendMagicLink = trpc.magicLink.send.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setSentEmail(email);
        setLoginView("sent");
        toast.success("E-Mail gesendet!");
      } else {
        toast.error("Fehler", { description: data.message });
      }
    },
    onError: (error) => {
      toast.error("Fehler", { description: error.message });
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    sendMagicLink.mutate({ email: email.trim() });
  };

  const handleClose = () => {
    setShowLoginDialog(false);
    setTimeout(() => {
      setLoginView("options");
      setEmail("");
    }, 200);
  };

  return (
    <>
      <Button
        onClick={() => setShowLoginDialog(true)}
        variant="outline"
        size="sm"
        className={`border-border/50 hover:bg-muted/50 ${className}`}
      >
        <LogIn className="w-4 h-4 mr-2" />
        Login
      </Button>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {loginView === "sent" ? "E-Mail gesendet!" : "Anmelden"}
            </DialogTitle>
          </DialogHeader>
          
          {loginView === "options" && (
            <div className="py-4">
              <p className="text-center text-sm text-muted-foreground mb-6">
                Wähle eine Login-Methode:
              </p>
              
              <Button
                onClick={() => setLoginView("email")}
                variant="outline"
                className="w-full h-12 justify-start gap-3 mb-3 bg-white/5 hover:bg-white/10 border-white/10"
              >
                <Mail className="w-5 h-5 text-blue-400" />
                <span>Mit E-Mail anmelden</span>
              </Button>
              
              <p className="text-center text-xs text-muted-foreground mt-4">
                <Shield className="w-3 h-3 inline mr-1 text-emerald-500" />
                Sicherer Login mit SSL-Verschlüsselung
              </p>
            </div>
          )}
          
          {loginView === "email" && (
            <div className="py-4">
              <button
                onClick={() => setLoginView("options")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück
              </button>
              
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">E-Mail-Adresse</label>
                  <Input
                    type="email"
                    placeholder="deine@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-white/5 border-white/10"
                    autoFocus
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={sendMagicLink.isPending || !email.trim()}
                  className="w-full h-12 btn-gradient"
                >
                  {sendMagicLink.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Login-Link senden
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
          
          {loginView === "sent" && (
            <div className="py-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              
              <p className="text-muted-foreground mb-2">
                Login-Link gesendet an
              </p>
              <p className="font-medium text-lg mb-4">{sentEmail}</p>
              
              <Button
                onClick={() => setLoginView("email")}
                variant="ghost"
                className="mt-4"
              >
                Andere E-Mail verwenden
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

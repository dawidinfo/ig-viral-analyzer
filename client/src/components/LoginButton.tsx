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
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-card to-background border-2 border-primary/20 shadow-2xl shadow-primary/10">
          {/* Shine Effect */}
          <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-transparent rotate-12" />
          </div>
          
          <DialogHeader className="relative">
            <DialogTitle className="text-center text-2xl font-bold">
              {loginView === "sent" ? "✉️ E-Mail gesendet!" : "Willkommen zurück"}
            </DialogTitle>
            {loginView !== "sent" && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Wähle deine bevorzugte Anmeldemethode
              </p>
            )}
          </DialogHeader>
          
          {loginView === "options" && (
            <div className="py-6 space-y-4 relative">
              {/* Google Login */}
              <Button
                onClick={() => {
                  window.location.href = `${import.meta.env.VITE_OAUTH_PORTAL_URL || ''}/oauth/authorize?client_id=${import.meta.env.VITE_APP_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/callback')}&response_type=code&scope=openid%20profile%20email`;
                }}
                variant="outline"
                className="w-full h-14 justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 hover:border-gray-300 rounded-xl font-medium transition-all hover:shadow-lg"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Mit Google anmelden</span>
              </Button>
              
              {/* Apple Login */}
              <Button
                onClick={() => {
                  window.location.href = `${import.meta.env.VITE_OAUTH_PORTAL_URL || ''}/oauth/authorize?client_id=${import.meta.env.VITE_APP_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/callback')}&response_type=code&scope=openid%20profile%20email&provider=apple`;
                }}
                variant="outline"
                className="w-full h-14 justify-center gap-3 bg-black hover:bg-gray-900 text-white border-2 border-gray-800 rounded-xl font-medium transition-all hover:shadow-lg"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span>Mit Apple anmelden</span>
              </Button>
              
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-4 text-muted-foreground">oder</span>
                </div>
              </div>
              
              {/* E-Mail Login Button */}
              <Button
                onClick={() => setLoginView("email")}
                variant="outline"
                className="w-full h-14 justify-center gap-3 bg-primary/5 hover:bg-primary/10 border-2 border-primary/30 hover:border-primary/50 rounded-xl font-medium transition-all"
              >
                <Mail className="w-5 h-5 text-primary" />
                <span>Mit E-Mail anmelden</span>
              </Button>
              
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-6 pt-4 border-t border-border/30">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>256-bit SSL-Verschlüsselung • DSGVO-konform</span>
              </div>
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
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-card to-background border-2 border-primary/20 shadow-2xl shadow-primary/10">
          {/* Shine Effect */}
          <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-transparent rotate-12" />
          </div>
          
          <DialogHeader className="relative">
            <DialogTitle className="text-center text-2xl font-bold">
              {loginView === "sent" ? "✉️ E-Mail gesendet!" : "Willkommen zurück"}
            </DialogTitle>
            {loginView !== "sent" && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Wähle deine bevorzugte Anmeldemethode
              </p>
            )}
          </DialogHeader>
          
          {loginView === "options" && (
            <div className="py-6 space-y-4 relative">
              {/* Google Login */}
              <Button
                onClick={() => {
                  window.location.href = `${import.meta.env.VITE_OAUTH_PORTAL_URL || ''}/oauth/authorize?client_id=${import.meta.env.VITE_APP_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/callback')}&response_type=code&scope=openid%20profile%20email`;
                }}
                variant="outline"
                className="w-full h-14 justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 hover:border-gray-300 rounded-xl font-medium transition-all hover:shadow-lg"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Mit Google anmelden</span>
              </Button>
              
              {/* Apple Login */}
              <Button
                onClick={() => {
                  window.location.href = `${import.meta.env.VITE_OAUTH_PORTAL_URL || ''}/oauth/authorize?client_id=${import.meta.env.VITE_APP_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/callback')}&response_type=code&scope=openid%20profile%20email&provider=apple`;
                }}
                variant="outline"
                className="w-full h-14 justify-center gap-3 bg-black hover:bg-gray-900 text-white border-2 border-gray-800 rounded-xl font-medium transition-all hover:shadow-lg"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span>Mit Apple anmelden</span>
              </Button>
              
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-4 text-muted-foreground">oder</span>
                </div>
              </div>
              
              {/* E-Mail Login Button */}
              <Button
                onClick={() => setLoginView("email")}
                variant="outline"
                className="w-full h-14 justify-center gap-3 bg-primary/5 hover:bg-primary/10 border-2 border-primary/30 hover:border-primary/50 rounded-xl font-medium transition-all"
              >
                <Mail className="w-5 h-5 text-primary" />
                <span>Mit E-Mail anmelden</span>
              </Button>
              
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-6 pt-4 border-t border-border/30">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>256-bit SSL-Verschlüsselung • DSGVO-konform</span>
              </div>
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
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-card to-background border-2 border-primary/20 shadow-2xl shadow-primary/10">
          {/* Shine Effect */}
          <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-transparent rotate-12" />
          </div>
          
          <DialogHeader className="relative">
            <DialogTitle className="text-center text-2xl font-bold">
              {loginView === "sent" ? "✉️ E-Mail gesendet!" : "Willkommen zurück"}
            </DialogTitle>
            {loginView !== "sent" && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Wähle deine bevorzugte Anmeldemethode
              </p>
            )}
          </DialogHeader>
          
          {loginView === "options" && (
            <div className="py-6 space-y-4 relative">
              {/* Google Login */}
              <Button
                onClick={() => {
                  window.location.href = `${import.meta.env.VITE_OAUTH_PORTAL_URL || ''}/oauth/authorize?client_id=${import.meta.env.VITE_APP_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/callback')}&response_type=code&scope=openid%20profile%20email`;
                }}
                variant="outline"
                className="w-full h-14 justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 hover:border-gray-300 rounded-xl font-medium transition-all hover:shadow-lg"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Mit Google anmelden</span>
              </Button>
              
              {/* Apple Login */}
              <Button
                onClick={() => {
                  window.location.href = `${import.meta.env.VITE_OAUTH_PORTAL_URL || ''}/oauth/authorize?client_id=${import.meta.env.VITE_APP_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/callback')}&response_type=code&scope=openid%20profile%20email&provider=apple`;
                }}
                variant="outline"
                className="w-full h-14 justify-center gap-3 bg-black hover:bg-gray-900 text-white border-2 border-gray-800 rounded-xl font-medium transition-all hover:shadow-lg"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span>Mit Apple anmelden</span>
              </Button>
              
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-4 text-muted-foreground">oder</span>
                </div>
              </div>
              
              {/* E-Mail Login Button */}
              <Button
                onClick={() => setLoginView("email")}
                variant="outline"
                className="w-full h-14 justify-center gap-3 bg-primary/5 hover:bg-primary/10 border-2 border-primary/30 hover:border-primary/50 rounded-xl font-medium transition-all"
              >
                <Mail className="w-5 h-5 text-primary" />
                <span>Mit E-Mail anmelden</span>
              </Button>
              
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-6 pt-4 border-t border-border/30">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>256-bit SSL-Verschlüsselung • DSGVO-konform</span>
              </div>
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

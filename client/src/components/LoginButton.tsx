import { Button } from "@/components/ui/button";
import { usePopupLogin } from "@/hooks/usePopupLogin";
import { LogIn, Shield, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LoginButtonProps {
  variant?: "default" | "outline" | "ghost" | "gradient";
  size?: "default" | "sm" | "lg";
  showSecurityNote?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function LoginButton({ 
  variant = "default", 
  size = "default",
  showSecurityNote = false,
  className = "",
  children
}: LoginButtonProps) {
  const { openLoginPopup, showLoginDialog, setShowLoginDialog, isLoading } = usePopupLogin({
    onSuccess: () => {
      toast.success("Login erfolgreich!", {
        description: "Du wirst zum Dashboard weitergeleitet...",
      });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    },
    onError: (error) => {
      toast.error("Login fehlgeschlagen", {
        description: error,
      });
    },
  });

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
          onClick={openLoginPopup}
          disabled={isLoading}
          size={size}
          className={`${buttonVariants[variant]} ${className}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Login läuft...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              {children || "Anmelden"}
            </>
          )}
        </Button>
        
        {showSecurityNote && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span>Sicherer Login mit SSL-Verschlüsselung</span>
          </div>
        )}
      </div>

      {/* Social Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Anmelden</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-sm text-muted-foreground mb-6">
              Wähle eine Login-Methode:
            </p>
            <SocialLoginButtons variant="vertical" showLabels={true} />
            <p className="text-center text-xs text-muted-foreground mt-4">
              <Shield className="w-3 h-3 inline mr-1 text-emerald-500" />
              Sicherer Login mit SSL-Verschlüsselung
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Mobile version with security note
export function MobileLoginButton({ onClose, className = "" }: { onClose?: () => void; className?: string }) {
  const { openLoginPopup, showLoginDialog, setShowLoginDialog, isLoading } = usePopupLogin({
    onSuccess: () => {
      toast.success("Login erfolgreich!");
      onClose?.();
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    },
    onError: (error) => {
      toast.error("Login fehlgeschlagen", { description: error });
    },
  });

  return (
    <>
      <div className={`flex flex-col gap-2 ${className}`}>
        <Button
          onClick={openLoginPopup}
          disabled={isLoading}
          variant="outline"
          className="w-full justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Login läuft...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              Anmelden
            </>
          )}
        </Button>
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="w-3 h-3 text-emerald-500" />
          <span>Sicherer Login</span>
        </div>
      </div>

      {/* Social Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Anmelden</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-sm text-muted-foreground mb-6">
              Wähle eine Login-Methode:
            </p>
            <SocialLoginButtons variant="vertical" showLabels={true} />
            <p className="text-center text-xs text-muted-foreground mt-4">
              <Shield className="w-3 h-3 inline mr-1 text-emerald-500" />
              Sicherer Login mit SSL-Verschlüsselung
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Compact version for navigation
export function LoginButtonCompact({ className = "" }: { className?: string }) {
  const { openLoginPopup, showLoginDialog, setShowLoginDialog, isLoading } = usePopupLogin({
    onSuccess: () => {
      toast.success("Login erfolgreich!");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    },
    onError: (error) => {
      toast.error("Login fehlgeschlagen", { description: error });
    },
  });

  return (
    <>
      <Button
        onClick={openLoginPopup}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className={`border-border/50 hover:bg-muted/50 ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <LogIn className="w-4 h-4 mr-2" />
            Login
          </>
        )}
      </Button>

      {/* Social Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Anmelden</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-sm text-muted-foreground mb-6">
              Wähle eine Login-Methode:
            </p>
            <SocialLoginButtons variant="vertical" showLabels={true} />
            <p className="text-center text-xs text-muted-foreground mt-4">
              <Shield className="w-3 h-3 inline mr-1 text-emerald-500" />
              Sicherer Login mit SSL-Verschlüsselung
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

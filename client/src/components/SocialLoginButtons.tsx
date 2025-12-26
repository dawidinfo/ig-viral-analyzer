import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Loader2, Star } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

// Social login provider icons as SVG
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
    <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
    <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
    <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

interface SocialLoginButtonsProps {
  variant?: "horizontal" | "vertical" | "compact";
  showLabels?: boolean;
  className?: string;
}

// Track login method usage
const trackLoginMethod = (method: string) => {
  try {
    // Store in localStorage for analytics
    const loginStats = JSON.parse(localStorage.getItem('loginMethodStats') || '{}');
    loginStats[method] = (loginStats[method] || 0) + 1;
    loginStats.lastUsed = method;
    loginStats.lastAttempt = new Date().toISOString();
    localStorage.setItem('loginMethodStats', JSON.stringify(loginStats));
    
    // Also send to server if available (fire and forget)
    fetch('/api/analytics/login-method', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, timestamp: new Date().toISOString() })
    }).catch(() => {}); // Ignore errors
  } catch (e) {
    // Ignore tracking errors
  }
};

export function SocialLoginButtons({ 
  variant = "horizontal", 
  showLabels = true,
  className = "" 
}: SocialLoginButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleLogin = (provider: string) => {
    setIsLoading(provider);
    
    // Track which login method was clicked
    trackLoginMethod(provider);
    
    // Open login popup
    const loginUrl = getLoginUrl({ popup: true });
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      loginUrl,
      'reelspy-login',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      // Popup blocked - redirect instead
      window.location.href = loginUrl;
      return;
    }

    // Listen for success message
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.data?.type === 'oauth-success') {
        setIsLoading(null);
        popup.close();
        window.removeEventListener('message', handleMessage);
        window.location.href = '/dashboard';
      }
    };
    window.addEventListener('message', handleMessage);

    // Check if popup was closed
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        setIsLoading(null);
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
      }
    }, 500);
  };

  const providers = [
    { id: "google", icon: GoogleIcon, label: "Google", isPrimary: true },
    { id: "apple", icon: AppleIcon, label: "Apple", isPrimary: false },
    { id: "microsoft", icon: MicrosoftIcon, label: "Microsoft", isPrimary: false },
    { id: "email", icon: EmailIcon, label: "E-Mail", isPrimary: false },
  ];

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-xs text-muted-foreground">Login mit:</span>
        <div className="flex gap-1">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleLogin(provider.id)}
              disabled={isLoading !== null}
              className={`p-1.5 rounded-md transition-colors disabled:opacity-50 ${
                provider.isPrimary 
                  ? "bg-white/10 hover:bg-white/20 ring-1 ring-violet-500/50" 
                  : "bg-white/5 hover:bg-white/10"
              }`}
              title={`Mit ${provider.label} anmelden${provider.isPrimary ? ' (Empfohlen)' : ''}`}
            >
              {isLoading === provider.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <provider.icon />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "vertical") {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {/* Google Button - Prominent */}
        <Button
          onClick={() => handleLogin("google")}
          disabled={isLoading !== null}
          className="w-full justify-center gap-3 bg-white text-gray-800 hover:bg-gray-100 border-0 shadow-lg hover:shadow-xl transition-all py-6 text-base font-medium"
        >
          {isLoading === "google" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          <span>Mit Google fortfahren</span>
          <span className="ml-auto text-xs bg-violet-500 text-white px-2 py-0.5 rounded-full">Empfohlen</span>
        </Button>
        
        {/* Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-3 text-muted-foreground">oder</span>
          </div>
        </div>
        
        {/* Other providers - Smaller */}
        <div className="grid grid-cols-3 gap-2">
          {providers.filter(p => !p.isPrimary).map((provider) => (
            <Button
              key={provider.id}
              variant="outline"
              onClick={() => handleLogin(provider.id)}
              disabled={isLoading !== null}
              className="w-full justify-center gap-2 bg-white/5 border-white/10 hover:bg-white/10 py-5"
            >
              {isLoading === provider.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <provider.icon />
              )}
              {showLabels && <span className="text-xs">{provider.label}</span>}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // Horizontal (default)
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Google Button - Prominent */}
      <Button
        onClick={() => handleLogin("google")}
        disabled={isLoading !== null}
        className="w-full justify-center gap-3 bg-white text-gray-800 hover:bg-gray-100 border-0 shadow-lg hover:shadow-xl transition-all py-5"
      >
        {isLoading === "google" ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        <span>Mit Google fortfahren</span>
      </Button>
      
      {/* Other providers */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {providers.filter(p => !p.isPrimary).map((provider) => (
          <Button
            key={provider.id}
            variant="outline"
            size="sm"
            onClick={() => handleLogin(provider.id)}
            disabled={isLoading !== null}
            className="bg-white/5 border-white/10 hover:bg-white/10"
          >
            {isLoading === provider.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <provider.icon />
            )}
            {showLabels && <span className="ml-2 text-xs">{provider.label}</span>}
          </Button>
        ))}
      </div>
    </div>
  );
}

// Login methods hint component
export function LoginMethodsHint({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 text-xs text-muted-foreground ${className}`}>
      <div className="flex items-center gap-1.5 text-violet-400">
        <GoogleIcon />
        <span>Google</span>
        <Star className="w-3 h-3 fill-current" />
      </div>
      <div className="flex items-center gap-1.5">
        <AppleIcon />
        <span>Apple</span>
      </div>
      <div className="flex items-center gap-1.5">
        <MicrosoftIcon />
        <span>Microsoft</span>
      </div>
      <div className="flex items-center gap-1.5">
        <EmailIcon />
        <span>E-Mail</span>
      </div>
    </div>
  );
}

// Get login stats for admin dashboard
export function getLoginStats() {
  try {
    return JSON.parse(localStorage.getItem('loginMethodStats') || '{}');
  } catch {
    return {};
  }
}

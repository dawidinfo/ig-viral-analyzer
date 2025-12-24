import { getLoginUrl } from "@/const";
import { useState, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface PopupLoginOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function usePopupLogin(options?: PopupLoginOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState<Window | null>(null);
  const utils = trpc.useUtils();

  // Listen for messages from the popup
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === 'oauth-success') {
        setIsLoading(false);
        popup?.close();
        setPopup(null);
        
        // Refresh auth state
        await utils.auth.me.invalidate();
        options?.onSuccess?.();
      } else if (event.data?.type === 'oauth-error') {
        setIsLoading(false);
        popup?.close();
        setPopup(null);
        options?.onError?.(event.data.error || 'Login fehlgeschlagen');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [popup, options, utils]);

  // Check if popup was closed manually
  useEffect(() => {
    if (!popup) return;

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        setIsLoading(false);
        setPopup(null);
        clearInterval(checkClosed);
      }
    }, 500);

    return () => clearInterval(checkClosed);
  }, [popup]);

  const openLoginPopup = useCallback(() => {
    setIsLoading(true);

    // Calculate popup position (centered)
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const loginUrl = getLoginUrl({ popup: true });
    
    const newPopup = window.open(
      loginUrl,
      'manus-login',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (newPopup) {
      setPopup(newPopup);
      newPopup.focus();
    } else {
      // Popup blocked - fallback to redirect
      setIsLoading(false);
      window.location.href = loginUrl;
    }
  }, []);

  const cancelLogin = useCallback(() => {
    popup?.close();
    setPopup(null);
    setIsLoading(false);
  }, [popup]);

  return {
    openLoginPopup,
    cancelLogin,
    isLoading,
    isPopupOpen: !!popup,
  };
}

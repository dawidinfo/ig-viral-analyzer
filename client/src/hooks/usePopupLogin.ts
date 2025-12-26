import { useState, useCallback } from "react";

interface PopupLoginOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function usePopupLogin(options?: PopupLoginOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const openLoginPopup = useCallback(() => {
    // Instead of opening Manus OAuth, show the social login dialog
    setShowLoginDialog(true);
  }, []);

  const cancelLogin = useCallback(() => {
    setShowLoginDialog(false);
    setIsLoading(false);
  }, []);

  return {
    openLoginPopup,
    cancelLogin,
    isLoading,
    isPopupOpen: false,
    showLoginDialog,
    setShowLoginDialog,
  };
}

import { useEffect } from "react";

// Redirect /pricing to homepage pricing section
export default function Pricing() {
  useEffect(() => {
    // Redirect to homepage with pricing anchor
    window.location.href = "/#pricing";
  }, []);
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground">Weiterleitung...</div>
    </div>
  );
}

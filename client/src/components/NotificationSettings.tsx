import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, BellRing, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  setNotificationPreference,
  getNotificationPreference,
  sendNotification
} from "@/lib/pushNotifications";

export function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [enabled, setEnabled] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
    setEnabled(getNotificationPreference() && getNotificationPermission() === 'granted');
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    const granted = await requestNotificationPermission();
    setPermission(getNotificationPermission());
    
    if (granted) {
      setEnabled(true);
      setNotificationPreference(true);
      toast.success("Push-Benachrichtigungen aktiviert!");
      
      // Send test notification
      sendNotification("ReelSpy.ai Benachrichtigungen", {
        body: "Du erhältst jetzt Alerts wenn deine gespeicherten Accounts viral gehen!",
      });
    } else {
      toast.error("Benachrichtigungen wurden blockiert. Bitte aktiviere sie in deinen Browser-Einstellungen.");
    }
    setIsRequesting(false);
  };

  const handleToggle = (value: boolean) => {
    setEnabled(value);
    setNotificationPreference(value);
    
    if (value) {
      toast.success("Benachrichtigungen aktiviert");
    } else {
      toast.info("Benachrichtigungen deaktiviert");
    }
  };

  if (permission === 'unsupported') {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
            <BellOff className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Push-Benachrichtigungen</h3>
            <p className="text-sm text-muted-foreground">
              Dein Browser unterstützt keine Push-Benachrichtigungen
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            permission === 'granted' 
              ? 'bg-green-500/20' 
              : permission === 'denied' 
              ? 'bg-red-500/20' 
              : 'bg-primary/20'
          }`}>
            {permission === 'granted' ? (
              <BellRing className="w-6 h-6 text-green-400" />
            ) : permission === 'denied' ? (
              <BellOff className="w-6 h-6 text-red-400" />
            ) : (
              <Bell className="w-6 h-6 text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Push-Benachrichtigungen
              {permission === 'granted' && (
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Aktiv
                </Badge>
              )}
              {permission === 'denied' && (
                <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                  <XCircle className="w-3 h-3 mr-1" />
                  Blockiert
                </Badge>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {permission === 'granted' 
                ? "Erhalte Alerts wenn gespeicherte Accounts viral gehen"
                : permission === 'denied'
                ? "Aktiviere Benachrichtigungen in deinen Browser-Einstellungen"
                : "Aktiviere Benachrichtigungen für Viral-Alerts"
              }
            </p>
          </div>
        </div>

        {permission === 'granted' ? (
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
          />
        ) : permission === 'default' ? (
          <Button 
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="btn-gradient"
          >
            {isRequesting ? "..." : "Aktivieren"}
          </Button>
        ) : null}
      </div>

      {permission === 'granted' && enabled && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-3">Du erhältst Benachrichtigungen bei:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Virale Accounts (starkes Wachstum)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Follower-Meilensteine (10k, 100k, 1M)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Warnungen bei Follower-Verlust</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

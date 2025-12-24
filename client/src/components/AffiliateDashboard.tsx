import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Gift, 
  Copy, 
  Check, 
  Users, 
  Coins, 
  Clock,
  CheckCircle2,
  Share2,
  Link2,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function AffiliateDashboard() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [vanityCode, setVanityCode] = useState("");
  const [isSettingVanity, setIsSettingVanity] = useState(false);

  const { data: stats, isLoading, refetch } = trpc.affiliate.getStats.useQuery();
  const setVanityMutation = trpc.affiliate.setVanityCode.useMutation({
    onSuccess: () => {
      toast.success("Eigener Code gespeichert!");
      refetch();
      setIsSettingVanity(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const copyToClipboard = () => {
    if (!stats) return;
    const url = `${window.location.origin}?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Empfehlungslink kopiert!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSetVanityCode = () => {
    if (vanityCode.length < 4) {
      toast.error("Code muss mindestens 4 Zeichen haben");
      return;
    }
    setVanityMutation.mutate({ vanityCode });
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-8 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="h-4 bg-muted rounded w-2/3" />
      </div>
    );
  }

  if (!stats) return null;

  const referralUrl = `${window.location.origin}?ref=${stats.referralCode}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="glass-card rounded-2xl p-8 border-2 border-primary/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Gift className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Affiliate-Programm</h2>
            <p className="text-muted-foreground">
              Verdiene {stats.rewardAmount} Credits für jede qualifizierte Empfehlung
            </p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-background/50 rounded-xl p-4 mb-6">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Dein Empfehlungslink
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={referralUrl}
                readOnly
                className="pl-10 bg-muted/50 font-mono text-sm"
              />
            </div>
            <Button onClick={copyToClipboard} variant="outline" className="gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Kopiert!" : "Kopieren"}
            </Button>
          </div>
        </div>

        {/* Custom Code */}
        <div className="bg-background/50 rounded-xl p-4">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Dein Empfehlungscode: <span className="text-primary font-bold">{stats.referralCode}</span>
          </label>
          {isSettingVanity ? (
            <div className="flex gap-2">
              <Input
                value={vanityCode}
                onChange={(e) => setVanityCode(e.target.value.toUpperCase())}
                placeholder="Eigenen Code eingeben (4-20 Zeichen)"
                className="flex-1"
                maxLength={20}
              />
              <Button onClick={handleSetVanityCode} disabled={setVanityMutation.isPending}>
                Speichern
              </Button>
              <Button variant="outline" onClick={() => setIsSettingVanity(false)}>
                Abbrechen
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsSettingVanity(true)} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Eigenen Code festlegen
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <Users className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.totalReferrals}</p>
          <p className="text-sm text-muted-foreground">Gesamt Empfehlungen</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.pendingReferrals}</p>
          <p className="text-sm text-muted-foreground">Ausstehend</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.qualifiedReferrals}</p>
          <p className="text-sm text-muted-foreground">Qualifiziert</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Coins className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.totalCreditsEarned}</p>
          <p className="text-sm text-muted-foreground">Verdiente Credits</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="glass-card rounded-2xl p-8">
        <h3 className="text-lg font-semibold mb-4">So funktioniert's</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold">1</span>
            </div>
            <div>
              <p className="font-medium">Link teilen</p>
              <p className="text-sm text-muted-foreground">
                Sende deinen Empfehlungslink an Freunde und Follower
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold">2</span>
            </div>
            <div>
              <p className="font-medium">Sie registrieren sich & nutzen</p>
              <p className="text-sm text-muted-foreground">
                Wenn sie {stats.qualificationThreshold}+ Credits ausgeben
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold">3</span>
            </div>
            <div>
              <p className="font-medium">Du wirst belohnt</p>
              <p className="text-sm text-muted-foreground">
                Erhalte automatisch {stats.rewardAmount} Credits
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral List */}
      {stats.referrals.length > 0 && (
        <div className="glass-card rounded-2xl p-8">
          <h3 className="text-lg font-semibold mb-4">Deine Empfehlungen</h3>
          <div className="space-y-3">
            {stats.referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 bg-background/50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{referral.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {referral.creditsSpent} Credits ausgegeben
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={referral.status === "rewarded" ? "default" : "secondary"}
                    className={
                      referral.status === "rewarded"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : referral.status === "pending"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        : ""
                    }
                  >
                    {referral.status === "rewarded" ? "Qualifiziert" : "Ausstehend"}
                  </Badge>
                  {referral.status === "rewarded" && (
                    <p className="text-sm text-green-400 mt-1">
                      +{referral.rewardCredits} Credits
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Buttons */}
      <div className="glass-card rounded-2xl p-8">
        <h3 className="text-lg font-semibold mb-4">Teilen & verdienen</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}&quote=${encodeURIComponent(
                  `Ich nutze ReelSpy.ai um virale Inhalte zu analysieren! Starte auch du mit meinem Link:`
                )}`,
                "_blank"
              );
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Auf Facebook teilen
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              // Instagram doesn't have a direct share URL, so we copy the link and show instructions
              navigator.clipboard.writeText(referralUrl);
              toast.success("Link kopiert! Teile ihn in deiner Instagram Story oder Bio.");
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Auf Instagram teilen
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Ich nutze ReelSpy.ai um virale Inhalte zu analysieren! Starte auch du mit meinem Link: ${referralUrl}`
                )}`,
                "_blank"
              );
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Auf X teilen
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              window.open(
                `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`,
                "_blank"
              );
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Auf LinkedIn teilen
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              window.open(
                `mailto:?subject=${encodeURIComponent("Schau dir ReelSpy.ai an!")}&body=${encodeURIComponent(
                  `Ich nutze ReelSpy.ai um virale Inhalte zu analysieren. Du solltest es auch ausprobieren!\n\n${referralUrl}`
                )}`,
                "_blank"
              );
            }}
          >
            <Share2 className="w-4 h-4" />
            Per E-Mail teilen
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

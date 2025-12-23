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
      toast.success("Custom code saved!");
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
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSetVanityCode = () => {
    if (vanityCode.length < 4) {
      toast.error("Code must be at least 4 characters");
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
            <h2 className="text-2xl font-bold">Affiliate Program</h2>
            <p className="text-muted-foreground">
              Earn {stats.rewardAmount} credits for each qualified referral
            </p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-background/50 rounded-xl p-4 mb-6">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Your Referral Link
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
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Custom Code */}
        <div className="bg-background/50 rounded-xl p-4">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Your Referral Code: <span className="text-primary font-bold">{stats.referralCode}</span>
          </label>
          {isSettingVanity ? (
            <div className="flex gap-2">
              <Input
                value={vanityCode}
                onChange={(e) => setVanityCode(e.target.value.toUpperCase())}
                placeholder="Enter custom code (4-20 chars)"
                className="flex-1"
                maxLength={20}
              />
              <Button onClick={handleSetVanityCode} disabled={setVanityMutation.isPending}>
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsSettingVanity(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsSettingVanity(true)} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Set Custom Code
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <Users className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.totalReferrals}</p>
          <p className="text-sm text-muted-foreground">Total Referrals</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.pendingReferrals}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.qualifiedReferrals}</p>
          <p className="text-sm text-muted-foreground">Qualified</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Coins className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.totalCreditsEarned}</p>
          <p className="text-sm text-muted-foreground">Credits Earned</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="glass-card rounded-2xl p-8">
        <h3 className="text-lg font-semibold mb-4">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold">1</span>
            </div>
            <div>
              <p className="font-medium">Share Your Link</p>
              <p className="text-sm text-muted-foreground">
                Send your referral link to friends and followers
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold">2</span>
            </div>
            <div>
              <p className="font-medium">They Sign Up & Use</p>
              <p className="text-sm text-muted-foreground">
                When they spend {stats.qualificationThreshold}+ credits
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold">3</span>
            </div>
            <div>
              <p className="font-medium">You Get Rewarded</p>
              <p className="text-sm text-muted-foreground">
                Receive {stats.rewardAmount} credits automatically
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral List */}
      {stats.referrals.length > 0 && (
        <div className="glass-card rounded-2xl p-8">
          <h3 className="text-lg font-semibold mb-4">Your Referrals</h3>
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
                      {referral.creditsSpent} credits spent
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
                    {referral.status === "rewarded" ? "Qualified" : "Pending"}
                  </Badge>
                  {referral.status === "rewarded" && (
                    <p className="text-sm text-green-400 mt-1">
                      +{referral.rewardCredits} credits
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
        <h3 className="text-lg font-semibold mb-4">Share & Earn</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `I'm using ReelSpy.ai to analyze viral content! Get started with my link: ${referralUrl}`
                )}`,
                "_blank"
              );
            }}
          >
            <Share2 className="w-4 h-4" />
            Share on X
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
            <Share2 className="w-4 h-4" />
            Share on LinkedIn
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              window.open(
                `mailto:?subject=${encodeURIComponent("Check out ReelSpy.ai!")}&body=${encodeURIComponent(
                  `I've been using ReelSpy.ai to analyze viral content. You should try it too!\n\n${referralUrl}`
                )}`,
                "_blank"
              );
            }}
          >
            <Share2 className="w-4 h-4" />
            Share via Email
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

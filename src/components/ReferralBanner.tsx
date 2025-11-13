import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import { useReferralCode } from "@/hooks/useReferralCode";

/**
 * ReferralBanner
 * Shows a dismissible banner when a referral code is detected via URL or localStorage
 */
export default function ReferralBanner() {
  const { getReferralCode } = useReferralCode();
  const [code, setCode] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const current = getReferralCode();
    setCode(current);

    // Persist dismissal per code in session to avoid showing it repeatedly
    if (current) {
      const key = `petport_referral_dismissed_${current}`;
      const wasDismissed = sessionStorage.getItem(key) === "true";
      setDismissed(wasDismissed);
    }
  }, [getReferralCode]);

  if (!code || dismissed) return null;

  const handleDismiss = () => {
    const key = `petport_referral_dismissed_${code}`;
    sessionStorage.setItem(key, "true");
    setDismissed(true);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 mt-4">
      <Alert className="border-green-500/50 bg-green-500/5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <AlertTitle>Referral applied</AlertTitle>
            <AlertDescription>
              Thanks for using a friend’s link. Your discount will be applied at checkout. Code: <span className="font-mono">{code}</span>
            </AlertDescription>
          </div>
          <button
            onClick={handleDismiss}
            className="text-sm text-muted-foreground hover:text-foreground"
            aria-label="Dismiss referral banner"
          >
            Dismiss
          </button>
        </div>
      </Alert>
    </div>
  );
}

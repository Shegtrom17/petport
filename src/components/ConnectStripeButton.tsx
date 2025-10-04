import { AzureButton } from "@/components/ui/azure-button";
import { ExternalLink, CheckCircle2 } from "lucide-react";

interface ConnectStripeButtonProps {
  onboardingStatus: "not_started" | "pending" | "completed";
  onClick: () => void;
  isLoading?: boolean;
}

export const ConnectStripeButton = ({
  onboardingStatus,
  onClick,
  isLoading = false,
}: ConnectStripeButtonProps) => {
  if (onboardingStatus === "completed") {
    return (
      <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
        <div className="flex-1">
          <div className="font-medium text-green-900 dark:text-green-100">
            Stripe Connected
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">
            You're all set to receive payouts
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
          💸 Ready to get paid?
        </div>
        <div className="text-sm text-blue-700 dark:text-blue-300">
          Connect your Stripe account to receive referral payouts. Payouts are
          issued 45 days after your friend starts their subscription.
        </div>
      </div>

      <AzureButton
        onClick={onClick}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2"
      >
        {isLoading ? (
          "Loading..."
        ) : onboardingStatus === "pending" ? (
          <>
            Continue Stripe Setup
            <ExternalLink className="h-4 w-4" />
          </>
        ) : (
          <>
            Connect Stripe Account
            <ExternalLink className="h-4 w-4" />
          </>
        )}
      </AzureButton>

      <p className="text-xs text-muted-foreground text-center">
        Stripe securely handles all cash payouts and tax forms. Fast, private, and
        required to receive referral rewards.
      </p>
    </div>
  );
};

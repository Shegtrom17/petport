import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, AlertTriangle, CheckCircle, Loader2, Link as LinkIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PayoutSummary {
  total_approved: number;
  successful_payouts: number;
  failed_payouts: number;
  unique_referrers: number;
  errors: number;
  error_details?: any[];
}

export const ReferralPayoutsAdmin = () => {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<PayoutSummary | null>(null);
  const [linkingReferral, setLinkingReferral] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referredEmail, setReferredEmail] = useState("");

  const processPayouts = async () => {
    try {
      setProcessing(true);
      setLastResult(null);

      const { data, error } = await supabase.functions.invoke("process-payouts");

      if (error) throw error;

      setLastResult(data as PayoutSummary);

      if (data.successful_payouts > 0) {
        toast({
          title: "Payouts Processed",
          description: `Successfully paid ${data.successful_payouts} referral commission${data.successful_payouts > 1 ? 's' : ''} to ${data.unique_referrers} referrer${data.unique_referrers > 1 ? 's' : ''}.`,
        });
      } else {
        toast({
          title: "No Payouts to Process",
          description: "There are no approved referrals ready for payout.",
        });
      }
    } catch (error: any) {
      console.error("Payout error:", error);
      toast({
        title: "Payout Failed",
        description: error.message || "Failed to process payouts. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const linkReferral = async () => {
    if (!referralCode || !referredEmail) {
      toast({
        title: "Missing Information",
        description: "Please enter both referral code and referred user email.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLinkingReferral(true);

      const { data, error } = await supabase.functions.invoke("admin-link-referral", {
        body: {
          referral_code: referralCode,
          referred_user_email: referredEmail,
        },
      });

      if (error) throw error;

      toast({
        title: "Referral Linked Successfully",
        description: `${referredEmail} has been linked to ${referralCode}. Will be approved on ${new Date(data.approval_date).toLocaleDateString()}.`,
      });

      // Clear form
      setReferralCode("");
      setReferredEmail("");
    } catch (error: any) {
      console.error("Link referral error:", error);
      toast({
        title: "Failed to Link Referral",
        description: error.message || "Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLinkingReferral(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Manual Referral Linking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Manually Link Referral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Use this to manually link a referral when tracking failed (e.g., email links, localStorage issues).
              Only works for yearly subscribers.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div>
              <Label htmlFor="referral-code">Referral Code</Label>
              <Input
                id="referral-code"
                placeholder="REF-C091B2"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                disabled={linkingReferral}
              />
            </div>

            <div>
              <Label htmlFor="referred-email">Referred User Email</Label>
              <Input
                id="referred-email"
                type="email"
                placeholder="sue@petport.app"
                value={referredEmail}
                onChange={(e) => setReferredEmail(e.target.value)}
                disabled={linkingReferral}
              />
            </div>

            <Button
              onClick={linkReferral}
              disabled={linkingReferral || !referralCode || !referredEmail}
              className="w-full"
            >
              {linkingReferral ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Linking...
                </>
              ) : (
                <>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Link Referral
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payout Processing */}
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Referral Payouts Administration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This will process all approved referral commissions and transfer funds to referrers' Stripe Connect accounts.
            Only referrers who have completed Stripe onboarding will be paid.
          </AlertDescription>
        </Alert>

        <Button
          onClick={processPayouts}
          disabled={processing}
          className="w-full"
          size="lg"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payouts...
            </>
          ) : (
            <>
              <DollarSign className="mr-2 h-4 w-4" />
              Process All Approved Payouts
            </>
          )}
        </Button>

        {lastResult && (
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-sm">Last Payout Run Summary</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-700 font-medium">Total Approved</div>
                <div className="text-2xl font-bold text-blue-900">{lastResult.total_approved}</div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xs text-green-700 font-medium flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Successful
                </div>
                <div className="text-2xl font-bold text-green-900">{lastResult.successful_payouts}</div>
              </div>
              
              {lastResult.failed_payouts > 0 && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-xs text-red-700 font-medium flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Failed
                  </div>
                  <div className="text-2xl font-bold text-red-900">{lastResult.failed_payouts}</div>
                </div>
              )}
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-xs text-purple-700 font-medium">Unique Referrers</div>
                <div className="text-2xl font-bold text-purple-900">{lastResult.unique_referrers}</div>
              </div>
            </div>

            {lastResult.error_details && lastResult.error_details.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Errors encountered ({lastResult.errors}):</div>
                  <ul className="text-xs space-y-1 ml-4 list-disc">
                    {lastResult.error_details.slice(0, 5).map((err, idx) => (
                      <li key={idx}>
                        User {err.userId?.substring(0, 8)}...: {err.error}
                      </li>
                    ))}
                  </ul>
                  {lastResult.error_details.length > 5 && (
                    <p className="text-xs mt-2 italic">
                      ...and {lastResult.error_details.length - 5} more errors
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1 pt-2">
          <p><strong>How it works:</strong></p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Finds all referrals with status "approved" and no payout date</li>
            <li>Groups referrals by referrer user</li>
            <li>Verifies each referrer has completed Stripe Connect onboarding</li>
            <li>Creates Stripe transfers to each referrer's connected account</li>
            <li>Marks referrals as "paid" and updates yearly earnings</li>
          </ul>
        </div>
      </CardContent>
      </Card>
    </div>
  );
};

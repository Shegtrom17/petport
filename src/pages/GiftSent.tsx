import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Copy, Mail, Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GiftDetails {
  giftCode: string;
  recipientEmail: string;
  senderName: string;
  giftMessage: string;
  redemptionLink: string;
  expiresAt?: string;
  scheduledFor?: string;
  isScheduled: boolean;
}

const GiftSent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  
  const [isLoading, setIsLoading] = useState(true);
  const [giftDetails, setGiftDetails] = useState<GiftDetails | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      toast.error("No session ID found");
      navigate("/gift");
      return;
    }

    fetchGiftDetails();
  }, [sessionId]);

  const fetchGiftDetails = async () => {
    try {
      // First check if it's a scheduled gift
      const { data: scheduledData, error: scheduledError } = await supabase
        .from('scheduled_gifts')
        .select('*')
        .eq('stripe_checkout_session_id', sessionId)
        .maybeSingle();

      if (scheduledData) {
        const baseUrl = window.location.origin;
        setGiftDetails({
          giftCode: scheduledData.gift_code,
          recipientEmail: scheduledData.recipient_email,
          senderName: scheduledData.sender_name || "You",
          giftMessage: scheduledData.gift_message || "",
          redemptionLink: `${baseUrl}/claim-subscription?code=${scheduledData.gift_code}`,
          scheduledFor: new Date(scheduledData.scheduled_send_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          isScheduled: true
        });
        setIsLoading(false);
        return;
      }

      // If not scheduled, check gift_memberships (immediate gift)
      const { data, error } = await supabase
        .from('gift_memberships')
        .select('*')
        .eq('stripe_checkout_session_id', sessionId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const baseUrl = window.location.origin;
        setGiftDetails({
          giftCode: data.gift_code,
          recipientEmail: data.recipient_email,
          senderName: data.sender_name || "You",
          giftMessage: data.gift_message || "",
          redemptionLink: `${baseUrl}/claim-subscription?code=${data.gift_code}`,
          expiresAt: new Date(data.expires_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          isScheduled: false
        });
      }
    } catch (error: any) {
      console.error("Error fetching gift details:", error);
      toast.error("Failed to load gift details");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading gift details...</p>
        </div>
      </div>
    );
  }

  if (!giftDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Gift Not Found</CardTitle>
            <CardDescription>We couldn't find details for this gift.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/gift")} className="w-full">
              Purchase Another Gift
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-green-500/10 rounded-full mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            🎁 {giftDetails.isScheduled ? 'Gift Scheduled!' : 'Gift Sent Successfully!'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {giftDetails.isScheduled 
              ? `Your gift will be delivered on ${giftDetails.scheduledFor}`
              : 'Your PetPort gift membership is ready to share'}
          </p>
        </div>

        {/* Gift Code Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Gift Code</CardTitle>
            <CardDescription>Share this code or link with the recipient</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 bg-primary/10 rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-2">Gift Code</div>
              <div className="text-4xl font-bold font-mono tracking-wider text-primary">
                {giftDetails.giftCode}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Redemption Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={giftDetails.redemptionLink}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-muted rounded-md"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(giftDetails.redemptionLink)}
                >
                  {isCopied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() => copyToClipboard(giftDetails.redemptionLink)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Redemption Link
            </Button>
          </CardContent>
        </Card>

        {/* Gift Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Gift Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Recipient</div>
              <div className="font-medium">{giftDetails.recipientEmail}</div>
            </div>

            {giftDetails.giftMessage && (
              <div>
                <div className="text-sm text-muted-foreground">Your Message</div>
                <div className="font-medium italic">"{giftDetails.giftMessage}"</div>
              </div>
            )}

            {giftDetails.isScheduled ? (
              <div>
                <div className="text-sm text-muted-foreground">Delivery Date</div>
                <div className="font-medium">{giftDetails.scheduledFor}</div>
              </div>
            ) : (
              <div>
                <div className="text-sm text-muted-foreground">Valid Until</div>
                <div className="font-medium">{giftDetails.expiresAt}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">
                  {giftDetails.isScheduled ? 'Email Scheduled' : 'Email Sent'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {giftDetails.isScheduled 
                    ? `We'll email ${giftDetails.recipientEmail} on ${giftDetails.scheduledFor} with their gift`
                    : `We've emailed ${giftDetails.recipientEmail} with their gift code and redemption link`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Gift className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Easy Redemption</h3>
                <p className="text-sm text-muted-foreground">
                  They can click the link or enter the code at petport.app/redeem
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Instant Access</h3>
                <p className="text-sm text-muted-foreground">
                  After redemption, they'll have 12 months of full PetPort access
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
          <Button
            className="flex-1"
            onClick={() => navigate("/gift")}
          >
            <Gift className="mr-2 h-4 w-4" />
            Send Another Gift
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GiftSent;

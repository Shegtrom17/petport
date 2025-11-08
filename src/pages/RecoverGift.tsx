import { useState } from "react";
import { AzureButton } from "@/components/ui/azure-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail } from "lucide-react";

export default function RecoverGift() {
  const [sessionId, setSessionId] = useState("cs_live_a1PtRqc966yxUK6JIs6Njn7l80Cgh3hP6GwBQT0J9UnCq9FpOXMgnKssR9");
  const [giftCode, setGiftCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [resendResult, setResendResult] = useState<any>(null);
  const { toast } = useToast();

  const handleRecover = async () => {
    if (!sessionId.startsWith('cs_')) {
      toast({
        title: "Invalid Session ID",
        description: "Checkout session IDs start with 'cs_'",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('recover-gift', {
        body: { checkoutSessionId: sessionId }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Gift Recovered!",
        description: `Gift code: ${data.giftCode}. Emails sent to purchaser and recipient.`,
      });
    } catch (error: any) {
      console.error('Recovery error:', error);
      toast({
        title: "Recovery Failed",
        description: error.message || "Failed to recover gift membership",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmails = async () => {
    if (!giftCode || giftCode.length < 6) {
      toast({
        title: "Invalid Gift Code",
        description: "Please enter a valid gift code",
        variant: "destructive"
      });
      return;
    }

    setResendLoading(true);
    setResendResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('resend-gift-emails', {
        body: { giftCode: giftCode.toUpperCase() }
      });

      if (error) throw error;

      setResendResult(data);
      toast({
        title: "Emails Resent!",
        description: `Sent to ${data.purchaserEmail} and ${data.recipientEmail}`,
      });
    } catch (error: any) {
      console.error('Resend error:', error);
      toast({
        title: "Resend Failed",
        description: error.message || "Failed to resend gift emails",
        variant: "destructive"
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 flex items-center justify-center bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Gift Membership Tools</CardTitle>
          <CardDescription>
            Recover stuck purchases or resend gift emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="resend" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="resend">Resend Emails</TabsTrigger>
              <TabsTrigger value="recover">Recover Purchase</TabsTrigger>
            </TabsList>

            <TabsContent value="resend" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gift Code</label>
                <Input
                  value={giftCode}
                  onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                  placeholder="80293CED"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 8-character gift code to resend both emails
                </p>
              </div>

              <AzureButton 
                onClick={handleResendEmails} 
                disabled={resendLoading || !giftCode}
                className="w-full"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Emails...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Gift Emails
                  </>
                )}
              </AzureButton>

              {resendResult && (
                <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="text-green-700 dark:text-green-300">Emails Sent!</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <strong>Gift Code:</strong>{" "}
                      <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                        {resendResult.giftCode}
                      </code>
                    </div>
                    <div>
                      <strong>Purchaser Email:</strong> {resendResult.purchaserEmail}
                      {resendResult.emailsSent.purchaser ? 
                        " ✅" : ` ❌ ${resendResult.errors.purchaser}`}
                    </div>
                    <div>
                      <strong>Recipient Email:</strong> {resendResult.recipientEmail}
                      {resendResult.emailsSent.recipient ? 
                        " ✅" : ` ❌ ${resendResult.errors.recipient}`}
                    </div>
                    <div>
                      <strong>Redemption Link:</strong>
                      <br />
                      <a 
                        href={resendResult.redemptionLink} 
                        className="text-blue-600 dark:text-blue-400 underline text-sm break-all"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {resendResult.redemptionLink}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="mt-6 p-4 bg-muted rounded-lg text-sm space-y-2">
                <h3 className="font-semibold">When to use this:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Recipient never received the gift notification email</li>
                  <li>Purchaser needs a new copy of confirmation email</li>
                  <li>Emails went to spam or were deleted</li>
                  <li>Email addresses were corrected after purchase</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="recover" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Stripe Checkout Session ID</label>
                <Input
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="cs_live_..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Find this in your Stripe dashboard or purchase confirmation logs
                </p>
              </div>

              <AzureButton 
                onClick={handleRecover} 
                disabled={loading || !sessionId}
                className="w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Recover Gift Membership
              </AzureButton>

              {result && (
                <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="text-green-700 dark:text-green-300">Success!</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <strong>Gift Code:</strong>{" "}
                      <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                        {result.giftCode}
                      </code>
                    </div>
                    <div>
                      <strong>Recipient:</strong> {result.recipientEmail}
                    </div>
                    <div>
                      <strong>Redemption Link:</strong>
                      <br />
                      <a 
                        href={result.redemptionLink} 
                        className="text-blue-600 dark:text-blue-400 underline text-sm break-all"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {result.redemptionLink}
                      </a>
                    </div>
                    {result.existing && (
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                        Note: This gift was already recovered previously
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="mt-6 p-4 bg-muted rounded-lg text-sm space-y-2">
                <h3 className="font-semibold">What happened?</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Your purchase was made before RLS policies were added</li>
                  <li>Webhook couldn't write to database tables</li>
                  <li>Payment succeeded but gift record was never created</li>
                  <li>RLS policies are now fixed for future purchases</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

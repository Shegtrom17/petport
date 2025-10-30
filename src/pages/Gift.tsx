import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Gift as GiftIcon, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const Gift = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientEmail: "",
    senderName: "",
    giftMessage: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.recipientEmail || !formData.recipientEmail.includes("@")) {
      toast.error("Please enter a valid recipient email");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('purchase-gift-membership', {
        body: {
          recipientEmail: formData.recipientEmail,
          senderName: formData.senderName || undefined,
          giftMessage: formData.giftMessage || undefined,
          purchaserEmail: session?.user?.email || undefined
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Error purchasing gift:", error);
      toast.error(error.message || "Failed to start checkout");
      setIsLoading(false);
    }
  };

  const benefits = [
    "12 months of unlimited pet profiles",
    "Emergency contact & care instructions",
    "Medical records & vaccination tracking",
    "Beautiful photo galleries",
    "Travel maps & story streams",
    "Lost pet alert system with QR codes"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
            <GiftIcon className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Gift PetPort</h1>
          <p className="text-xl text-muted-foreground">
            Give the gift of organized pet care for an entire year
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
              <CardDescription>Everything they need to keep their pet safe and organized</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 bg-primary/10 rounded-lg text-center">
                <div className="text-3xl font-bold text-primary">$14.99</div>
                <div className="text-sm text-muted-foreground">One-time payment for 12 months</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gift Details</CardTitle>
              <CardDescription>Send a PetPort membership to someone special</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Recipient Email *</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    placeholder="friend@example.com"
                    value={formData.recipientEmail}
                    onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderName">Your Name (Optional)</Label>
                  <Input
                    id="senderName"
                    placeholder="John Doe"
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="giftMessage">Personal Message (Optional)</Label>
                  <Textarea
                    id="giftMessage"
                    placeholder="Hope your pets love PetPort!"
                    value={formData.giftMessage}
                    onChange={(e) => setFormData({ ...formData, giftMessage: e.target.value })}
                    maxLength={500}
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full text-white" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <GiftIcon className="mr-2 h-4 w-4" />
                      Purchase Gift - $14.99
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Gift;

import { PWALayout } from "@/components/PWALayout";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetaTags } from "@/components/MetaTags";
import { Link } from "react-router-dom";

export default function PaymentSuccess() {
  const url = typeof window !== 'undefined' ? window.location.href : 'https://petport.app/payment-success';
  return (
    <PWALayout>
      <MetaTags
        title="Payment Success - PetPort"
        description="Your one-time payment was successful. Thank you for supporting PetPort."
        url={url}
        noindex={true}
      />
      <AppHeader title="Payment Success" />
      <main className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Thank you!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Your payment was successful. You can continue using PetPort.</p>
            <div className="flex gap-2">
              <Link to="/app"><Button>Go to App</Button></Link>
              <Link to="/profile"><Button variant="outline">Back to Profile</Button></Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </PWALayout>
  );
}

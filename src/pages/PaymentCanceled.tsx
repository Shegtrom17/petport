import { PWALayout } from "@/components/PWALayout";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetaTags } from "@/components/MetaTags";
import { Link } from "react-router-dom";

export default function PaymentCanceled() {
  const url = typeof window !== 'undefined' ? window.location.href : 'https://petport.app/payment-canceled';
  return (
    <PWALayout>
      <MetaTags
        title="Payment Canceled - PetPort"
        description="Your payment was canceled. You can try again anytime."
        url={url}
      />
      <AppHeader title="Payment Canceled" />
      <main className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Payment Canceled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>No charge was made. If this was a mistake, you can try again.</p>
            <div className="flex gap-2">
              <Link to="/profile"><Button>Back to Profile</Button></Link>
              <Link to="/app"><Button variant="outline">Go to App</Button></Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </PWALayout>
  );
}

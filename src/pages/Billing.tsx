import { PWALayout } from "@/components/PWALayout";
import { AppHeader } from "@/components/AppHeader";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { MetaTags } from "@/components/MetaTags";

export default function Billing() {
  const url = typeof window !== 'undefined' ? `${window.location.origin}/billing` : '/billing';
  return (
    <PWALayout>
      <MetaTags
        title="Billing & Subscription - PetPort"
        description="Manage your PetPort subscription, plans, and pet slot add-ons."
        url={url}
        type="website"
      />
      <AppHeader title="Billing & Subscription" />
      <main className="p-4">
        <SubscriptionCard />
      </main>
    </PWALayout>
  );
}

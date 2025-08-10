import { MetaTags } from "@/components/MetaTags";
import PricingSection from "@/components/PricingSection";

export default function Subscribe() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <MetaTags title="Complete Subscription - PetPort" description="Subscribe to continue using PetPort." url={window.location.href} />
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <header className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">Complete Your Subscription</h1>
          <p className="text-sm text-muted-foreground mt-2">An active subscription is required to access the app.</p>
        </header>
        <PricingSection context="profile" />
      </div>
    </div>
  );
}

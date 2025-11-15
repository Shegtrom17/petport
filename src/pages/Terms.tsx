import { MetaTags } from "@/components/MetaTags";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  const navigate = useNavigate();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const url = baseUrl + "/terms";
  // TODO: Replace with confirmed go-live date
  const effectiveDate = "August 10, 2025";
  const handleClose = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", url);
    }
  }, [url]);

  useEffect(() => {
    // Signal to Prerender.io that page is ready after meta tags render
    const timer = setTimeout(() => {
      (window as any).prerenderReady = true;
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <MetaTags
        title="Terms of Service | PetPort"
        description="PetPort Terms of Service, including subscriptions, cancellations, and refunds."
        url={url}
      />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <header className="mb-6 relative">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleClose}
            className="fixed top-4 right-4 z-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-navy-900">PetPort Terms of Service</h1>
          <p className="mt-2 text-navy-700"><strong>Effective Date:</strong> {effectiveDate}</p>
          <p className="text-navy-700">Cool Change LLC, DBA "PetPort" ("PetPort", "we", "our", "us") • <a href="https://petport.app" target="_blank" rel="noopener" className="underline">https://petport.app</a></p>
        </header>

        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <article className="space-y-4">
            <h2 className="text-xl font-semibold text-navy-900">1. Acceptance of Terms</h2>
            <p className="text-navy-700">By creating an account, accessing, or using PetPort's services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you may not use our services.</p>

            <h2 className="text-xl font-semibold text-navy-900">2. Services Provided</h2>
            <p className="text-navy-700">PetPort is a web-based platform (PWA/SaaS) for organizing, storing, and sharing pet records, credentials, behavior reviews, and emergency information. Certain features may be available only to paying subscribers.</p>

            <h2 className="text-xl font-semibold text-navy-900">3. Eligibility</h2>
            <p className="text-navy-700">You must be at least 18 years old to create an account. By using PetPort, you represent that you are legally able to enter into this agreement.</p>

            <h2 className="text-xl font-semibold text-navy-900">4. Account Responsibilities</h2>
            <ul className="list-disc pl-6 text-navy-700 space-y-1">
              <li>Maintaining accurate account and pet information.</li>
              <li>Protecting your login credentials.</li>
              <li>You are responsible for any activity under your account.</li>
            </ul>
            <p className="text-navy-700">You agree not to:</p>
            <ul className="list-disc pl-6 text-navy-700 space-y-1">
              <li>Upload false or misleading pet records or reviews.</li>
              <li>Use PetPort for unlawful purposes.</li>
              <li>Interfere with the platform's operation or security.</li>
            </ul>

            <h2 className="text-xl font-semibold text-navy-900">5. Subscription & Payment</h2>
            <ul className="list-disc pl-6 text-navy-700 space-y-1">
              <li><strong>Billing:</strong> Subscriptions are billed automatically according to the plan you select (monthly or annually) until cancelled.</li>
              <li><strong>Pricing Changes:</strong> We may update subscription fees with at least 30 days' notice via email or in-app notification.</li>
              <li><strong>Payment Method:</strong> You authorize us to charge your chosen payment method for subscription fees.</li>
            </ul>

            <h2 id="cancellation" className="text-xl font-semibold text-navy-900">6. Cancellation & Refund Policy</h2>
            <ul className="list-disc pl-6 text-navy-700 space-y-1">
              <li><strong>Cancel Anytime:</strong> You may cancel your subscription at any time through your account settings.</li>
              <li><strong>No Prorated Refunds:</strong> We do not offer partial or prorated refunds. Your subscription remains active until the end of your current billing period.
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  <li><strong>Monthly Plans:</strong> Service ends at the close of the paid month.</li>
                  <li><strong>Annual Plans:</strong> Service ends at the close of the paid year.</li>
                </ul>
              </li>
              <li><strong>Data Access:</strong> Your account and stored pet information will remain accessible until your subscription expires. You may download your records at any time before the end date.</li>
            </ul>

            <h2 className="text-xl font-semibold text-navy-900">7. User Content & Intellectual Property</h2>
            <ul className="list-disc pl-6 text-navy-700 space-y-1">
              <li><strong>Your Content:</strong> You retain ownership of the pet data, photos, and documents you upload. You grant PetPort a limited license to store, display, and share this content as directed by you.</li>
              <li><strong>Our Content:</strong> All PetPort branding, logos, designs, and software are owned by Cool Change LLC and may not be copied or redistributed without permission.</li>
            </ul>

            <h2 className="text-xl font-semibold text-navy-900">8. Disclaimers & Limitation of Liability</h2>
            <p className="text-navy-700">PetPort is not a veterinary service and does not guarantee the accuracy of user-submitted information. We are not liable for lost pets, disputes between users, or damages resulting from your use of the platform. Services are provided "as is" without warranties of any kind.</p>
            <p className="text-navy-700 mt-2"><strong>Guardian Access Disclaimer:</strong> The guardian feature provides view-only access and does not transfer legal ownership or account control. PetPort has no legal authority to facilitate ownership transfers. Users must establish proper legal arrangements independently.</p>

            <h2 className="text-xl font-semibold text-navy-900">9. Termination</h2>
            <p className="text-navy-700">We reserve the right to suspend or terminate accounts that violate these Terms or disrupt the service.</p>

            <h2 className="text-xl font-semibold text-navy-900">10. Governing Law</h2>
            <p className="text-navy-700">These Terms are governed by the laws of the State of Minnesota, USA, without regard to conflict of law principles.</p>

            <h2 className="text-xl font-semibold text-navy-900">11. Changes to Terms</h2>
            <p className="text-navy-700">We may update these Terms from time to time. Continued use of PetPort after changes are posted means you accept the updated Terms.</p>

            <h2 className="text-xl font-semibold text-navy-900">12. Contact Information</h2>
            <p className="text-navy-700">
              If you have questions, contact us at: <br />
              <strong>Email:</strong> <a href="mailto:info@petport.app" className="underline">info@petport.app</a><br />
              <span>Cool Change LLC, Blaine, MN, USA</span>
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}

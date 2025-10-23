import React, { useEffect } from "react";
import { MetaTags } from "@/components/MetaTags";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const url = baseUrl + "/privacy-policy";
  const effectiveDate = "August 10, 2025"; // Update if your go-live date differs
  const navigate = useNavigate();
  const handleClose = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    // Canonical link
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    if (link) link.setAttribute('href', url);

    // JSON-LD structured data
    const scriptId = "jsonld-privacy";
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "PetPort Privacy Policy",
      url,
      description: "PetPort Privacy Policy explaining how we collect, use, and protect information."
    });
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [url]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <MetaTags
        title="Privacy Policy | PetPort"
        description="PetPort Privacy Policy explaining how we collect, use, and protect information."
        url={url}
      />

      <main className="max-w-3xl mx-auto px-4 py-10">
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
          <h1 className="text-3xl md:text-4xl font-bold text-navy-900">Privacy Policy</h1>
          <p className="text-sm text-navy-700 mt-2"><strong>Effective Date:</strong> {effectiveDate}</p>
          <p className="text-sm text-navy-700">PetPort is a registered DBA of Cool Change LLC.</p>
        </header>

        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <p className="text-navy-700">
            PetPort (“<strong>PetPort</strong>,” “we,” “our,” or “us”) values your trust and respects your privacy. This Privacy Policy explains how we collect, use, disclose, and protect information when you use the PetPort progressive web app (PWA) and related services (collectively, the “<strong>Services</strong>”).
          </p>

          <h2 className="text-xl font-semibold text-navy-900">1. Information We Collect</h2>
          <h3 className="text-lg font-semibold text-navy-900">A. Information You Provide</h3>
          <ul className="list-disc pl-5 text-navy-700 space-y-1">
            <li><strong>Account information</strong> (e.g., name, email address, phone number, password).</li>
            <li><strong>Pet profiles & content</strong> (e.g., pet name, species, breed, photos, medical history, credentials, care instructions, reviews, documents you upload).</li>
            <li><strong>Payment information</strong> collected and processed by our payment processor (e.g., Stripe). We do not store full card numbers on our servers.</li>
          </ul>

          <h3 className="text-lg font-semibold text-navy-900">B. Information Collected Automatically</h3>
          <ul className="list-disc pl-5 text-navy-700 space-y-1">
            <li><strong>Device & usage data</strong> (e.g., IP address, browser type, pages viewed, interactions, referring URLs).</li>
            <li><strong>Cookies & similar technologies</strong> used for authentication, security, and improving the Services.</li>
          </ul>

          <h2 className="text-xl font-semibold text-navy-900">2. How We Use Information</h2>
          <ul className="list-disc pl-5 text-navy-700 space-y-1">
            <li>Provide, operate, maintain, and improve the Services.</li>
            <li>Create and manage pet profiles, credentials, and digital pet résumés.</li>
            <li>Generate PDFs (e.g., records, care sheets, missing-pet flyers) and share links you choose to share.</li>
            <li>Enable lost-and-found alerts and public pages you enable.</li>
            <li>Process payments, subscriptions, and send related communications.</li>
            <li>Respond to inquiries and provide customer support.</li>
            <li>Detect, prevent, and address security or technical issues.</li>
          </ul>

          <h2 className="text-xl font-semibold text-navy-900">3. How We Share Information</h2>
          <p className="text-navy-700">We do <strong>not</strong> sell or rent your personal information. We may share information:</p>
          <ul className="list-disc pl-5 text-navy-700 space-y-1">
            <li><strong>With your consent</strong> (e.g., when you share a pet profile or transfer to an adopter).</li>
            <li><strong>With service providers</strong> that help us operate the Services (e.g., hosting, analytics, payments, customer support) under appropriate confidentiality and security obligations.</li>
            <li><strong>For legal reasons</strong> (e.g., to comply with law, court order, or protect rights, safety, and security).</li>
          </ul>

          <h2 className="text-xl font-semibold text-navy-900">4. Data Retention</h2>
          <p className="text-navy-700">We retain information for as long as your account is active or as needed to provide the Services and comply with legal obligations. You may request deletion of your account and associated data by contacting <a href="mailto:info@petport.app" className="underline">info@petport.app</a>.</p>

          <h2 className="text-xl font-semibold text-navy-900">5. Security</h2>
          <p className="text-navy-700">We use industry-standard safeguards (encryption in transit, access controls, monitoring) to protect information. However, no method of transmission or storage is 100% secure, and you use the Services at your own risk.</p>

          <h2 className="text-xl font-semibold text-navy-900">6. Your Choices & Rights</h2>
          <p className="text-navy-700">Depending on your location, you may have rights to access, correct, or delete personal information, or to object to or restrict certain processing. To exercise rights, contact <a href="mailto:info@petport.app" className="underline">info@petport.app</a>.</p>

          <h2 className="text-xl font-semibold text-navy-900">7. Children’s Privacy</h2>
          <p className="text-navy-700">The Services are not directed to children under 13, and we do not knowingly collect personal information from children under 13.</p>

          <h2 className="text-xl font-semibold text-navy-900">8. International Users</h2>
          <p className="text-navy-700">If you access the Services from outside the United States, you understand your information may be processed in the United States where data protection laws may differ from those in your jurisdiction.</p>

          <h2 className="text-xl font-semibold text-navy-900">9. Changes to This Policy</h2>
          <p className="text-navy-700">We may update this Privacy Policy from time to time. If we make material changes, we will post the updated policy here and update the Effective Date above.</p>

          <h2 className="text-xl font-semibold text-navy-900">10. Contact Us</h2>
          <p className="text-navy-700">
            If you have questions or requests, contact us at:
            <br />
            <strong>Email:</strong> <a href="mailto:info@petport.app" className="underline">info@petport.app</a><br />
            <strong>Website:</strong> <a href="https://petport.app" target="_blank" rel="noopener" className="underline">https://petport.app</a><br />
            <span className="text-navy-700">PetPort is a registered DBA of Cool Change LLC.</span>
          </p>

          <hr className="border-t border-indigo-200 my-4" />
          <footer className="text-sm text-navy-700">
            © {new Date().getFullYear()} Cool Change LLC. PetPort is a registered DBA of Cool Change LLC.
          </footer>
        </section>
      </main>
    </div>
  );
}

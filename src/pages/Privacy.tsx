import { useEffect } from "react";
import { MetaTags } from "@/components/MetaTags";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  const navigate = useNavigate();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const handleClose = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

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
        title="Privacy Policy | PetPort"
        description="Learn how PetPort (DBA of Cool Change LLC) collects, uses, and protects your data."
        url={baseUrl + "/privacy"}
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
          <h1 className="text-3xl md:text-4xl font-bold text-navy-900">Privacy Policy</h1>
          <p className="mt-2 text-navy-700">PetPort is owned and operated by Cool Change LLC (DBA "PetPort").</p>
        </header>

        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <p className="text-navy-700">
            We respect your privacy. This policy explains what information we collect and how we use it.
          </p>
          <h2 className="text-xl font-semibold text-navy-900">Information We Collect</h2>
          <p className="text-navy-700">Account details (like email), pet profiles, documents you upload, and usage data to improve the service.</p>

          <h2 className="text-xl font-semibold text-navy-900">How We Use Information</h2>
          <p className="text-navy-700">To provide core features (profiles, PDFs, sharing), maintain security, and enhance the product experience.</p>

          <h2 className="text-xl font-semibold text-navy-900">Sharing</h2>
          <p className="text-navy-700">We only share data at your direction (e.g., public profile links) or to comply with legal obligations.</p>

          <h2 className="text-xl font-semibold text-navy-900">Data Retention</h2>
          <p className="text-navy-700">You can delete pets, documents, and your account at any time. We retain data as required to operate the service.</p>

          <h2 className="text-xl font-semibold text-navy-900">Contact</h2>
          <p className="text-navy-700">For privacy inquiries, contact the PetPort team.</p>
        </section>
      </main>
    </div>
  );
}

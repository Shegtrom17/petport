import React, { useEffect } from "react";
import { MetaTags } from "@/components/MetaTags";

export default function DataDeletion() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const url = baseUrl + "/data-deletion";

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
    const scriptId = "jsonld-data-deletion";
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "PetPort Data Deletion Instructions",
      url,
      description: "Instructions for deleting your PetPort account and all associated data."
    });
    document.head.appendChild(script);
    return () => { script.remove(); };
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
        title="Data Deletion Instructions | PetPort"
        description="Instructions for deleting your PetPort account and all associated data."
        url={url}
      />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-navy-900">Data Deletion Instructions</h1>
          <p className="text-navy-700 mt-2">How to delete your PetPort account and all associated data</p>
        </header>

        <section className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Quick Overview</h2>
            <p className="text-blue-800">
              You can delete your PetPort account and all associated data at any time. 
              This action is permanent and cannot be undone.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">Method 1: Delete Account Through App Settings</h2>
            <ol className="list-decimal pl-5 text-navy-700 space-y-2">
              <li>Log into your PetPort account at <a href="https://petport.app" className="underline text-blue-600">petport.app</a></li>
              <li>Navigate to your Profile page</li>
              <li>Scroll down to the "Account Management" section</li>
              <li>Click "Delete Account"</li>
              <li>Confirm the deletion by typing "DELETE" as prompted</li>
              <li>Your account and all data will be permanently deleted within 24 hours</li>
            </ol>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">Method 2: Email Deletion Request</h2>
            <p className="text-navy-700 mb-3">
              If you're unable to access your account, you can request deletion by email:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-navy-700 mb-2"><strong>Send an email to:</strong> <a href="mailto:info@petport.app" className="underline text-blue-600">info@petport.app</a></p>
              <p className="text-navy-700 mb-2"><strong>Subject:</strong> Account Deletion Request</p>
              <p className="text-navy-700"><strong>Include:</strong></p>
              <ul className="list-disc pl-5 text-navy-700 space-y-1 mt-1">
                <li>Your registered email address</li>
                <li>Your full name</li>
                <li>Confirmation that you want to permanently delete your account</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">What Data Gets Deleted</h2>
            <p className="text-navy-700 mb-3">When you delete your account, the following data is permanently removed:</p>
            <ul className="list-disc pl-5 text-navy-700 space-y-1">
              <li><strong>Account information:</strong> Email, name, password, profile settings</li>
              <li><strong>Pet profiles:</strong> All pet information, photos, and documents</li>
              <li><strong>Medical records:</strong> Vaccination records, vet visits, medications</li>
              <li><strong>Care instructions:</strong> Feeding schedules, emergency contacts</li>
              <li><strong>Reviews and ratings:</strong> All reviews given or received</li>
              <li><strong>Travel records:</strong> Travel history and documentation</li>
              <li><strong>Shared content:</strong> All publicly shared links become inactive</li>
              <li><strong>Payment information:</strong> Billing history and saved payment methods</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">Before You Delete</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Considerations</h3>
              <ul className="list-disc pl-5 text-yellow-800 space-y-1">
                <li><strong>Download your data:</strong> Export any important records before deletion</li>
                <li><strong>Cancel subscriptions:</strong> Cancel any active subscriptions to avoid future charges</li>
                <li><strong>Inform contacts:</strong> Let emergency contacts know shared links will stop working</li>
                <li><strong>Transfer ownership:</strong> Transfer pet profiles to new owners if needed</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">Deletion Timeline</h2>
            <ul className="list-disc pl-5 text-navy-700 space-y-1">
              <li><strong>Immediate:</strong> Account access is disabled</li>
              <li><strong>Within 24 hours:</strong> All data is permanently deleted from our systems</li>
              <li><strong>Within 30 days:</strong> Data is removed from all backups</li>
              <li><strong>Shared links:</strong> Become inactive immediately</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">Data That May Remain</h2>
            <p className="text-navy-700 mb-2">Some information may be retained for legal or business purposes:</p>
            <ul className="list-disc pl-5 text-navy-700 space-y-1">
              <li>Transaction records for tax and legal compliance (7 years)</li>
              <li>Support communications for quality assurance (2 years)</li>
              <li>Anonymized analytics data (no personal identifiers)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">Need Help?</h2>
            <p className="text-navy-700">
              If you have questions about data deletion or need assistance, contact our support team:
            </p>
            <div className="mt-3 space-y-1">
              <p className="text-navy-700"><strong>Email:</strong> <a href="mailto:info@petport.app" className="underline text-blue-600">info@petport.app</a></p>
              <p className="text-navy-700"><strong>Response Time:</strong> Within 48 hours</p>
              <p className="text-navy-700"><strong>Website:</strong> <a href="https://petport.app" target="_blank" rel="noopener" className="underline text-blue-600">petport.app</a></p>
            </div>
          </div>

          <hr className="border-t border-indigo-200 my-4" />
          <footer className="text-sm text-navy-700">
            <p>This page is part of PetPort's commitment to data privacy and user control.</p>
            <p className="mt-1">© {new Date().getFullYear()} Cool Change LLC. PetPort is a registered DBA of Cool Change LLC.</p>
          </footer>
        </section>
      </main>
    </div>
  );
}
import { MetaTags } from "@/components/MetaTags";

export default function Terms() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <MetaTags
        title="Terms of Service | PetPort"
        description="Terms governing your use of PetPort, a Cool Change LLC product (DBA PetPort)."
        url={baseUrl + "/terms"}
      />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-navy-900">Terms of Service</h1>
          <p className="mt-2 text-navy-700">PetPort is owned and operated by Cool Change LLC (DBA "PetPort").</p>
        </header>

        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold text-navy-900">Using PetPort</h2>
          <p className="text-navy-700">By using PetPort, you agree to these terms. You are responsible for the content you upload and share.</p>

          <h2 className="text-xl font-semibold text-navy-900">Accounts</h2>
          <p className="text-navy-700">Keep your account credentials secure. You may not impersonate others or misuse the service.</p>

          <h2 className="text-xl font-semibold text-navy-900">Content</h2>
          <p className="text-navy-700">You retain ownership of your content. You grant PetPort a limited license to store and process it to provide features.</p>

          <h2 className="text-xl font-semibold text-navy-900">Liability</h2>
          <p className="text-navy-700">The service is provided "as is" without warranties. To the extent permitted by law, liability is limited.</p>

          <h2 className="text-xl font-semibold text-navy-900">Changes</h2>
          <p className="text-navy-700">We may update these terms. Continued use means you accept the updated terms.</p>

          <h2 className="text-xl font-semibold text-navy-900">Contact</h2>
          <p className="text-navy-700">For questions about these terms, contact the PetPort team.</p>
        </section>
      </main>
    </div>
  );
}

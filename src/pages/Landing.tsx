import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { MetaTags } from "@/components/MetaTags";

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/app', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <MetaTags
        title="PetPort: Digital Pet Passport"
        description="Create a digital pet passport for pet owners and foster caregivers."
        url={window.location.origin + "/"}
      />

      <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png" alt="PetPort logo" className="w-10 h-10" />
          <span className="text-xl font-semibold text-navy-900">PetPort</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Button onClick={() => navigate('/app')}>Open App</Button>
          ) : (
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="text-center py-10">
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900">Digital Pet Passport</h1>
          <p className="mt-3 text-navy-700 max-w-2xl mx-auto">
            One place for everything about your pet. Beautiful profiles, emergency info, sharable links, PDFs, documents, and travel maps.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button onClick={() => navigate('/auth')}>Get Started</Button>
            <Button variant="outline" onClick={() => navigate('/auth')}>For Foster Caregivers</Button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <article className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-navy-900">For Pet Owners</h2>
            <ul className="mt-3 list-disc pl-5 text-navy-700 space-y-1">
              <li><strong>One‑Tap Missing Pet Flyer</strong> with photos, last-seen details, and a shareable QR code.</li>
              <li><strong>Digital Pet File</strong> for vaccines, health records, medications, insurance, and adoption/certification—snap a photo and upload.</li>
              <li><strong>Care & Handling</strong> — routines, diet, meds, allergies, and behaviors so any caregiver has precise instructions.</li>
              <li><strong>Pet Credentials</strong> — resume, referrals, and achievements for hotels, groomers, and sitters.</li>
              <li><strong>Travel Map</strong> — drop pins to track trips and attach proof for pet‑friendly stays.</li>
              <li><strong>Reviews & Hospitality</strong> — collect, store, and share vet or host reviews for references.</li>
              <li><strong>Easy uploads • Cloud‑secure • Everything in one place</strong> — no more lost papers.</li>
            </ul>
            <div className="mt-4">
              <Link to="/auth" className="underline text-navy-900">Create your free profile →</Link>
            </div>
          </article>
          <article className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-navy-900">For Foster Caregivers</h2>
          <ul className="mt-3 list-disc pl-5 text-navy-700 space-y-1">
            <li><strong>Handoff Kit</strong> — everything an adopter needs in one link and PDF.</li>
            <li><strong>Care & Medication Schedule</strong> — diets, routines, meds, allergies, behaviors.</li>
            <li><strong>Behavior & Notes</strong> — track quirks, training progress, and tips.</li>
            <li><strong>Photos & Bio Builder</strong> — create a great adoption profile fast.</li>
            <li><strong>One‑Tap Transfer to Adopter</strong> — move the full pet record to the new owner securely.</li>
            <li><strong>Privacy by Default</strong> — you choose what’s shared publicly.</li>
          </ul>
            <div className="mt-4">
              <Link to="/auth" className="underline text-navy-900">Get started as a foster →</Link>
            </div>
          </article>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-10 text-sm text-navy-700">
        <div className="flex flex-col gap-2">
          <p>© {new Date().getFullYear()} PetPort. All rights reserved.</p>
          <p>PetPort is owned and operated by Cool Change LLC (DBA "PetPort").</p>
          <nav className="flex flex-wrap gap-4">
            <Link to="/privacy" className="underline text-navy-900">Privacy Policy</Link>
            <Link to="/terms" className="underline text-navy-900">Terms of Service</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

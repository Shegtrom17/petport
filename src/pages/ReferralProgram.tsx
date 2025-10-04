import { Link } from "react-router-dom";
import { DollarSign, Users, Clock, ArrowRight } from "lucide-react";
import { AzureButton } from "@/components/ui/azure-button";
import { MetaTags } from "@/components/MetaTags";
import { PricingSection } from "@/components/PricingSection";
export default function ReferralProgram() {
  return <>
      <MetaTags title="Referral Program - Earn $2 Per Friend | PetPort" description="Join PetPort's referral program and earn $2 for every friend who subscribes to a yearly plan. Get paid via Stripe Connect. Start earning today!" url={window.location.origin + "/referral-program"} type="website" />
      
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-100">
          <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src="/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png" alt="PetPort Logo" className="w-10 h-10" />
              <span className="text-xl font-bold text-[#5691af]">PetPort</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/learn" className="text-sm text-gray-600 hover:text-[#5691af]">
                Learn
              </Link>
              <a href="#pricing">
                <AzureButton>Get Started</AzureButton>
              </a>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#5691af]">
              Earn $2 for Every Friend
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Share PetPort with friends and earn money when they subscribe to a yearly plan. 
              Simple, transparent, and paid directly to your Stripe account.
            </p>
            <a href="#pricing">
              <AzureButton size="lg" className="text-lg px-8 py-6">
                Join & Get Your Link
                <ArrowRight className="ml-2 h-5 w-5" />
              </AzureButton>
            </a>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#5691af]">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#5691af] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">1. Share Your Link</h3>
                <p className="text-gray-600">
                  Get your unique referral link and share it with friends, family, or your audience.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[#5691af] rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">2. They Subscribe</h3>
                <p className="text-gray-600">
                  When someone signs up through your link and subscribes to a yearly plan, you earn $2.00.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[#5691af] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">3. Get Paid</h3>
                <p className="text-[#5691af]">
                  Receive your commission via Stripe Connect 45 days after paid membership begins.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Program Details */}
        <section className="py-16 px-4">
          <div className="container max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Program Details
            </h2>
            <div className="space-y-6">
              <div className="border-l-4 border-[#5691af] pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Commission Amount</h3>
                <p className="text-gray-600">
                  Earn $2.00 for every successful referral who subscribes to a yearly plan.
                </p>
              </div>
              
              <div className="border-l-4 border-[#5691af] pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Eligible Plans</h3>
                <p className="text-gray-600">
                  Only yearly subscriptions qualify for referral commissions. Monthly plans are not eligible.
                </p>
              </div>
              
              <div className="border-l-4 border-[#5691af] pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Payout Timeline</h3>
                <p className="text-gray-600">
                  Commissions are approved 45 days after paid membership begins.
                </p>
              </div>
              
              <div className="border-l-4 border-[#5691af] pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Payment Method</h3>
                <p className="text-gray-600">
                  All payouts are processed through Stripe Connect. You'll need to connect your Stripe account to receive payments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Can I participate if I'm on a monthly plan?
                </h3>
                <p className="text-gray-600">
                  Yes! Both monthly and yearly subscribers can share their referral link and earn commissions. You earn $2.00 for every friend who subscribes to a yearly plan, regardless of your own subscription type.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  If I refer someone and they sign up for a monthly plan, will I earn a commission?
                </h3>
                <p className="text-gray-600">
                  No, only referrals who subscribe to a yearly plan earn you a commission. If your friend chooses the monthly plan, you won't receive a payout.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  When do I get paid?
                </h3>
                <p className="text-gray-600">
                  Commissions are approved 45 days after paid membership begins. Once approved, payouts are processed through Stripe Connect.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Is there a limit to how many people I can refer?
                </h3>
                <p className="text-gray-600 mb-2">
                  No! You can refer as many people as you want. There's no cap on your earnings.
                </p>
                <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3 mt-2">
                  <strong>Tax Note:</strong> If you earn $600 or more in a calendar year, Stripe will automatically issue you a 1099-K form for tax reporting purposes. This is a standard IRS requirement for payment processors.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Do I need a Stripe account?
                </h3>
                <p className="text-gray-600">
                  Yes, you'll need to connect a Stripe account to receive payouts. This is free and takes just a few minutes to set up.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Can I track my referrals?
                </h3>
                <p className="text-gray-600">
                  Yes! Once you sign up, you'll have access to a referral dashboard where you can track all your referrals, pending commissions, and earnings history.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-[#5691af]">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join PetPort and get your unique referral link in seconds.
            </p>
            <a href="#pricing">
              <AzureButton size="lg" className="text-lg px-8 py-6">
                See Plans & Pricing
                <ArrowRight className="ml-2 h-5 w-5" />
              </AzureButton>
            </a>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 px-4 bg-gray-50">
          <div className="container max-w-4xl mx-auto">
            <PricingSection context="landing" />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-8 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <img src="/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png" alt="PetPort Logo" className="w-8 h-8" />
                <span className="text-sm text-gray-600">© PetPort. All rights reserved.</span>
              </div>
              <nav className="flex gap-6 text-sm text-gray-600">
                <Link to="/privacy-policy" className="hover:text-[#5691af]">Privacy</Link>
                <Link to="/terms" className="hover:text-[#5691af]">Terms</Link>
                <Link to="/help" className="hover:text-[#5691af]">Help</Link>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    </>;
}
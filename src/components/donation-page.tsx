"use client";

import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import HeroBanner from "./hero-banner";
import SidebarInfo from "./sidebar-info";
import DonationForm from "./donation-form";
import Footer from "./footer";

export default function DonationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
          {/* Left Sidebar */}
          <SidebarInfo />

          {/* Right Form Area — wrapped in Stripe Elements */}
          <div className="space-y-4">
            {stripePromise ? (
              <Elements stripe={stripePromise}>
                <DonationForm />
              </Elements>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
                <p className="text-sm text-amber-800 font-medium">
                  Payment system is not configured.
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your .env.local file.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function BuyPlanPage() {
  const params = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: plan } = await supabase
        .from("plans")
        .select("*")
        .eq("id", params.id)
        .single();

      setPlan(plan);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handlePayment = async () => {
    setPaying(true);
    setError("");

    const { error } = await supabase.from("purchases").insert({
      user_id: user.id,
      plan_id: plan.id,
      amount: plan.price,
      status: "completed",
    });

    if (error) {
      setError(error.message);
      setPaying(false);
      return;
    }

    setSuccess(true);
    setPaying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (success) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-teal-700 mb-2">Purchase Successful!</h2>
            <p className="text-gray-500 mb-2">You have successfully purchased:</p>
            <p className="font-bold text-gray-800 mb-6">{plan.title}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-sm text-green-700">
              ✅ Your plan is now available for download. Our team will send the files to your email shortly.
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/" className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition">
                Go Home
              </Link>
              <Link href="/browse" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition">
                Browse More
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href={`/plan/${plan.id}`} className="text-teal-600 hover:underline text-sm mb-6 block">
            ← Back to Plan
          </Link>

          <h2 className="text-2xl font-bold text-gray-800 mb-8">Complete Your Purchase</h2>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Plan Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">Order Summary</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-teal-50 rounded-lg p-4 text-3xl">🏠</div>
              <div>
                <p className="font-bold text-gray-800">{plan.title}</p>
                <p className="text-gray-500 text-sm">📐 {plan.plot_size} | 🛏️ {plan.bedrooms} Beds | 🏢 {plan.floors} Floors</p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
              <span className="text-gray-600">Plan Price</span>
              <span className="font-bold text-gray-800">₹{plan.price}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Platform Fee</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
            <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between items-center">
              <span className="font-bold text-gray-800 text-lg">Total</span>
              <span className="font-bold text-orange-500 text-2xl">₹{plan.price}</span>
            </div>
          </div>

          {/* Buyer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">Your Details</h3>
            <p className="text-gray-600 text-sm">📧 {user?.email}</p>
            <p className="text-gray-600 text-sm mt-1">👤 {user?.user_metadata?.full_name}</p>
          </div>

          {/* Payment Notice */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6 text-sm text-teal-700">
            ℹ️ Payment gateway integration coming soon. Click below to simulate a successful purchase.
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={paying}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50 shadow-lg"
          >
            {paying ? "Processing..." : `Pay ₹${plan.price} & Get Plan`}
          </button>

          <p className="text-center text-gray-400 text-xs mt-4">
            🔒 Secure purchase · Your data is protected
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
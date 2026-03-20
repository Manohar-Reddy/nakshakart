"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Platform fee based on floors — same as upload form
const getPlatformFee = (floors: string): number => {
  if (!floors) return 99;
  const f = floors.toLowerCase().trim();
  if (f === "g" || f === "ground")     return 99;
  if (f.includes("g+1"))               return 149;
  if (f.includes("g+2"))               return 199;
  if (f.includes("g+3"))               return 299;
  return 499;
};

export default function PayPlatformFeePage() {
  const params  = useParams();
  const router  = useRouter();
  const planId  = params.planId as string;

  const [plan,    setPlan]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying,  setPaying]  = useState(false);
  const [paid,    setPaid]    = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("plans")
        .select("*")
        .eq("id", planId)
        .single();
      setPlan(data);
      setLoading(false);
    };
    load();
  }, [planId]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  if (!plan) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Plan not found</p>
    </div>
  );

  // Use stored platform_fee or calculate from floors
  const fee = plan.platform_fee || getPlatformFee(plan.floors || "");

  const handlePay = async () => {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 2000));

    await supabase.from("plans").update({
      platform_fee_paid:    true,
      platform_fee_paid_at: new Date().toISOString(),
      platform_fee:         fee,
      status:               "live",
      live_at:              new Date().toISOString(),
    }).eq("id", planId);

    await supabase.from("notifications").insert({
      user_id: plan.architect_id,
      title:   "🎉 Your plan is now LIVE!",
      message: `Your plan "${plan.title}" is now live on NakshaKart marketplace. Customers can now browse and buy it!`,
      type:    "plan_live",
      plan_id: planId,
    });

    setPaying(false);
    setPaid(true);
  };

  if (paid) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-2">Your plan is now <strong>LIVE</strong> on NakshaKart!</p>
        <p className="text-sm text-gray-500 mb-6">Customers can now browse and purchase your plan.</p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left space-y-1">
          <p className="text-sm font-semibold text-green-700">✅ {plan.title}</p>
          <p className="text-xs text-green-600">{plan.plan_code} · {plan.floors} · {plan.plot_size}</p>
          <p className="text-xs text-green-600 mt-1">Platform fee paid: ₹{fee}</p>
        </div>
        <button onClick={() => router.push("/architect/my-plans")}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold transition">
          View My Plans →
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5 text-white">
          <p className="text-xs opacity-80 mb-1">NakshaKart Platform Fee</p>
          <h1 className="text-xl font-bold">Pay to Go Live 🚀</h1>
        </div>

        {/* Plan Info */}
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Plan Details</p>
          <p className="font-bold text-gray-800">{plan.title}</p>
          <p className="text-xs text-gray-500 mt-1">
            {plan.plan_code && <span className="font-mono text-teal-600">{plan.plan_code}</span>}
            {plan.plot_size && <span> · {plan.plot_size}</span>}
            {plan.floors    && <span> · {plan.floors}</span>}
            {plan.category  && <span> · {plan.category}</span>}
          </p>
        </div>

        {/* Fee breakdown */}
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-3 font-semibold">Fee Breakdown</p>

          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray-600">Platform listing fee</p>
              <p className="text-xs text-gray-400">
                {plan.floors
                  ? `Based on ${plan.floors} floors`
                  : "Standard fee"}
              </p>
            </div>
            <p className="font-bold text-gray-800 text-lg">₹{fee}</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mt-3">
            <p className="text-xs text-blue-600">
              💡 Fee is based on number of floors:
              G=₹99 · G+1=₹149 · G+2=₹199 · G+3=₹299 · G+4+=₹499
            </p>
          </div>
        </div>

        {/* What you get */}
        <div className="px-6 py-4 border-b border-gray-100 bg-teal-50">
          <p className="text-xs font-semibold text-teal-700 mb-2">✅ What happens after payment:</p>
          <div className="space-y-1.5">
            {[
              "Plan goes LIVE on marketplace immediately",
              "Customers can browse and buy your plan",
              "You receive 80% of every sale automatically",
              "Plan listed for lifetime — no renewal fees",
            ].map((item) => (
              <p key={item} className="text-xs text-teal-700 flex items-center gap-2">
                <span>✓</span> {item}
              </p>
            ))}
          </div>
        </div>

        {/* Commission reminder */}
        <div className="px-6 py-3 border-b border-gray-100 bg-orange-50">
          <p className="text-xs text-orange-700">
            ℹ️ <strong>20% commission</strong> applies on every customer purchase.
            You earn <strong>80%</strong> of each sale.
          </p>
        </div>

        {/* Payment methods */}
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-600 mb-3">Select Payment Method</p>
          <div className="grid grid-cols-3 gap-2">
            {["UPI", "Card", "Net Banking"].map((method) => (
              <div key={method}
                className="border-2 border-teal-500 bg-teal-50 rounded-lg p-2 text-center cursor-pointer hover:bg-teal-100 transition">
                <p className="text-xs font-semibold text-teal-700">{method}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400">🔒 Test Mode — No real payment will be made</p>
          </div>
        </div>

        {/* Pay button */}
        <div className="px-6 py-5">
          <button onClick={handlePay} disabled={paying}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2">
            {paying ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Processing Payment...
              </>
            ) : (
              `Pay ₹${fee} & Go Live 🚀`
            )}
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            🔒 Secure payment · Test mode enabled
          </p>
        </div>

      </div>
    </div>
  );
}
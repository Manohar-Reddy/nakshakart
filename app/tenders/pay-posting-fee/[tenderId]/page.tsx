"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PayPostingFeePage() {
  const params   = useParams();
  const router   = useRouter();
  const tenderId = params.tenderId as string;

  const [tender,  setTender]  = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying,  setPaying]  = useState(false);
  const [paid,    setPaid]    = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("tenders").select("*").eq("id", tenderId).single();
      setTender(data);
      setLoading(false);
    };
    load();
  }, [tenderId]);

  const handlePay = async () => {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 2000));

    await supabase.from("tenders").update({
      posting_fee_paid:    true,
      posting_fee_paid_at: new Date().toISOString(),
      status:              "open",
    }).eq("id", tenderId);

    setPaying(false);
    setPaid(true);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  if (paid) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-green-600 mb-2">Tender Published!</h1>
        <p className="text-gray-600 mb-6">
          Your tender is now live. Professionals will start bidding shortly.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm font-bold text-green-700 mb-1">✅ {tender?.title}</p>
          <p className="text-xs text-green-600">Posting fee paid: ₹200</p>
          <p className="text-xs text-green-600 mt-1">Tender live for 30 days</p>
        </div>
        <button onClick={() => router.push("/tenders/my-tenders")}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold transition mb-3">
          View My Tenders →
        </button>
        <button onClick={() => router.push("/tenders")}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition">
          Browse All Tenders
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 text-white">
          <p className="text-xs opacity-80 mb-1">NakshaKart Tender</p>
          <h1 className="text-xl font-bold">Pay to Publish Tender 📋</h1>
        </div>

        {/* Tender Info */}
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Tender</p>
          <p className="font-bold text-gray-800">{tender?.title}</p>
          <p className="text-xs text-gray-500 mt-1">
            {tender?.tender_type} · {tender?.city || "—"}
          </p>
        </div>

        {/* Fee */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Tender posting fee</p>
            <p className="text-2xl font-bold text-orange-600">₹200</p>
          </div>
          <p className="text-xs text-gray-400">One-time fee · Non-refundable · Valid 30 days</p>
        </div>

        {/* What you get */}
        <div className="px-6 py-4 border-b border-gray-100 bg-orange-50">
          <p className="text-xs font-semibold text-orange-700 mb-2">✅ After payment:</p>
          <div className="space-y-1.5">
            {[
              "Tender goes live immediately",
              "Visible to all registered professionals",
              "Professionals pay ₹10 each to bid",
              "Chat with shortlisted professionals",
              "Live for 30 days",
            ].map((item) => (
              <p key={item} className="text-xs text-orange-700 flex items-center gap-2">
                <span>✓</span> {item}
              </p>
            ))}
          </div>
        </div>

        {/* Disclaimer reminder */}
        <div className="px-6 py-3 border-b border-gray-100 bg-yellow-50">
          <p className="text-xs text-yellow-700">
            ⚠️ Reminder: NakshaKart is only a platform. We are not responsible for project execution, quality, or disputes.
          </p>
        </div>

        {/* Payment methods */}
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-600 mb-3">Payment Method</p>
          <div className="grid grid-cols-3 gap-2">
            {["UPI", "Card", "Net Banking"].map((method) => (
              <div key={method}
                className="border-2 border-orange-400 bg-orange-50 rounded-lg p-2 text-center cursor-pointer">
                <p className="text-xs font-semibold text-orange-700">{method}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400">🔒 Test Mode — No real payment</p>
          </div>
        </div>

        {/* Pay button */}
        <div className="px-6 py-5">
          <button onClick={handlePay} disabled={paying}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2">
            {paying ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Processing...
              </>
            ) : "Pay ₹200 & Publish 📋"}
          </button>
        </div>
      </div>
    </div>
  );
}
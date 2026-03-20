"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PayBidFeePage() {
  const params  = useParams();
  const router  = useRouter();
  const bidId   = params.bidId as string;

  const [bid,     setBid]     = useState<any>(null);
  const [tender,  setTender]  = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying,  setPaying]  = useState(false);
  const [paid,    setPaid]    = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: bidData } = await supabase
        .from("tender_bids").select("*, tenders(*)").eq("id", bidId).single();
      setBid(bidData);
      setTender(bidData?.tenders);
      setLoading(false);
    };
    load();
  }, [bidId]);

  const handlePay = async () => {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 2000));

    await supabase.from("tender_bids").update({
      platform_fee_paid:    true,
      platform_fee_paid_at: new Date().toISOString(),
      status:               "pending",
    }).eq("id", bidId);

    // Notify customer
    await supabase.from("notifications").insert({
      user_id: tender?.customer_id,
      title:   "📬 New bid on your tender!",
      message: `A professional has submitted a bid for "${tender?.title}". Check your tender to review it.`,
      type:    "new_bid",
      plan_id: null,
    });

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
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-green-600 mb-2">Bid Submitted!</h1>
        <p className="text-gray-600 mb-6">
          Your bid is now visible to the customer. You'll be notified if selected.
        </p>
        <button onClick={() => router.push(`/tenders/${tender?.id}`)}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold transition mb-3">
          View Tender →
        </button>
        <button onClick={() => router.push("/tenders")}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition">
          Browse More Tenders
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5 text-white">
          <p className="text-xs opacity-80 mb-1">NakshaKart Tender</p>
          <h1 className="text-xl font-bold">Pay Bid Fee 💼</h1>
        </div>

        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Tender</p>
          <p className="font-bold text-gray-800">{tender?.title}</p>
          <p className="text-xs text-gray-500 mt-1">{tender?.tender_type} · {tender?.city}</p>
        </div>

        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Your Quote</p>
          <p className="font-semibold text-gray-800">
            {bid?.quote_amount ? `₹${bid.quote_amount?.toLocaleString()}` : "Not specified"}
          </p>
        </div>

        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Bid platform fee</p>
            <p className="text-2xl font-bold text-teal-600">₹10</p>
          </div>
          <p className="text-xs text-gray-400 mt-1">Non-refundable · Bid visible to customer after payment</p>
        </div>

        <div className="px-6 py-4 border-b border-gray-100 bg-teal-50">
          <p className="text-xs font-semibold text-teal-700 mb-2">✅ After payment:</p>
          <div className="space-y-1">
            {[
              "Your bid becomes visible to the customer",
              "Customer can view your quote and message",
              "Customer may select you and initiate chat",
              "You get notified if selected",
            ].map((item) => (
              <p key={item} className="text-xs text-teal-700 flex items-center gap-2">
                <span>✓</span> {item}
              </p>
            ))}
          </div>
        </div>

        <div className="px-6 py-3 border-b border-gray-100 bg-yellow-50">
          <p className="text-xs text-yellow-700">
            ⚠️ NakshaKart is NOT responsible for project execution or disputes.
          </p>
        </div>

        <div className="px-6 py-4 border-b border-gray-100">
          <div className="grid grid-cols-3 gap-2">
            {["UPI", "Card", "Net Banking"].map((m) => (
              <div key={m} className="border-2 border-teal-500 bg-teal-50 rounded-lg p-2 text-center">
                <p className="text-xs font-semibold text-teal-700">{m}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400">🔒 Test Mode — No real payment</p>
          </div>
        </div>

        <div className="px-6 py-5">
          <button onClick={handlePay} disabled={paying}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2">
            {paying ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Processing...
              </>
            ) : "Pay ₹10 & Submit Bid 💼"}
          </button>
        </div>
      </div>
    </div>
  );
}
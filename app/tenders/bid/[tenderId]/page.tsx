"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function BidPage() {
  const params   = useParams();
  const router   = useRouter();
  const tenderId = params.tenderId as string;

  const [tender,       setTender]       = useState<any>(null);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [agreed,       setAgreed]       = useState(false);
  const [step,         setStep]         = useState<1 | 2>(1);
  const [user,         setUser]         = useState<any>(null);

  const [form, setForm] = useState({
    profession:    "",
    quote_amount:  "",
    timeline:      "",
    message:       "",
  });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      // Pre-fill profession from user metadata
      setForm((p) => ({
        ...p,
        profession: user.user_metadata?.profession || user.user_metadata?.role || "",
      }));

      const { data } = await supabase
        .from("tenders").select("*").eq("id", tenderId).single();
      setTender(data);
      setLoading(false);
    };
    load();
  }, [tenderId]);

  const handleSubmitBid = async () => {
    if (!form.profession) return alert("Please enter your profession");
    if (!form.message)    return alert("Please write a message to the customer");
    setSubmitting(true);

    // Save bid as unpaid first
    const { data, error } = await supabase.from("tender_bids").insert({
      tender_id:       tenderId,
      professional_id: user.id,
      profession:      form.profession,
      quote_amount:    form.quote_amount ? parseFloat(form.quote_amount) : null,
      timeline:        form.timeline || null,
      message:         form.message,
      platform_fee_paid: false,
      disclaimer_accepted: true,
      disclaimer_accepted_at: new Date().toISOString(),
    }).select().single();

    setSubmitting(false);
    if (error) { alert("Error: " + error.message); return; }

    // Redirect to pay bid fee
    router.push(`/tenders/pay-bid-fee/${data.id}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">💼 Submit a Bid</h1>
      <p className="text-gray-500 text-sm mb-6">
        for: <strong>{tender?.title}</strong>
      </p>

      {/* Step 1 — Disclaimer */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 mb-4">⚖️ Professional Disclaimer</h2>

          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 mb-5 space-y-2 text-sm text-red-700">
            <p>1. <strong>NakshaKart is a platform only.</strong> We facilitate connections between customers and professionals. We are NOT responsible for project outcomes.</p>
            <p>2. <strong>NakshaKart is NOT a party</strong> to any agreement between you and the customer.</p>
            <p>3. <strong>All project negotiations, contracts, and payments</strong> happen directly between you and the customer. NakshaKart has no role.</p>
            <p>4. <strong>NakshaKart does NOT verify</strong> customer authenticity or project genuineness.</p>
            <p>5. <strong>Bid fee of ₹10 is non-refundable</strong> once paid, regardless of whether you are selected.</p>
            <p>6. <strong>You are solely responsible</strong> for verifying customer details and project requirements before taking up the work.</p>
            <p>7. <strong>NakshaKart will not mediate</strong> any disputes between you and the customer.</p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer bg-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:border-teal-300 transition mb-5">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              className="accent-teal-600 w-5 h-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700 font-medium">
              I agree that NakshaKart is only a platform and is not responsible for any project-related issues. I understand the bid fee of ₹10 is non-refundable.
            </span>
          </label>

          <button onClick={() => { if (!agreed) { alert("Please accept disclaimer"); return; } setStep(2); }}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold transition">
            I Agree — Continue →
          </button>
        </div>
      )}

      {/* Step 2 — Bid Details */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-800 mb-2">📝 Your Bid Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Profession *</label>
            <input type="text" value={form.profession}
              onChange={(e) => setForm((p) => ({ ...p, profession: e.target.value }))}
              placeholder="e.g. Architect, Civil Contractor..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Quote Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
              <input type="number" value={form.quote_amount}
                onChange={(e) => setForm((p) => ({ ...p, quote_amount: e.target.value }))}
                placeholder="e.g. 50000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pl-7 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Timeline</label>
            <select value={form.timeline}
              onChange={(e) => setForm((p) => ({ ...p, timeline: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">Select timeline</option>
              {["1 week","2-4 weeks","1-2 months","3-6 months","Flexible"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message to Customer *</label>
            <textarea value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              rows={4}
              placeholder="Introduce yourself, explain your experience, why you're the right fit for this project..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <p className="text-sm font-bold text-orange-700 mb-1">💳 Bid Fee: ₹10</p>
            <p className="text-xs text-orange-600">
              You will be redirected to pay ₹10 after submitting. Your bid will only be visible to the customer after payment.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition">
              ← Back
            </button>
            <button onClick={handleSubmitBid} disabled={submitting}
              className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold transition">
              {submitting ? "Submitting..." : "Submit & Pay ₹10 →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
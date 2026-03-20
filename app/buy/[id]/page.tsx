"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function BuyPlan() {
  const { id }   = useParams();
  const router   = useRouter();

  const [plan,             setPlan]             = useState<any>(null);
  const [loading,          setLoading]          = useState(true);
  const [user,             setUser]             = useState<any>(null);
  const [packageType,      setPackageType]      = useState<"basic" | "premium">("basic");
  const [agreed,           setAgreed]           = useState(false);
  const [showAgreement,    setShowAgreement]    = useState(false);
  const [purchasing,       setPurchasing]       = useState(false);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);
  const [existingPackage,  setExistingPackage]  = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const { data: plan } = await supabase
        .from("plans").select("*").eq("id", id).single();
      if (!plan) { router.push("/browse"); return; }

      // Only allow buying live plans
      if (plan.status !== "live") {
        router.push(`/plan/${id}`); return;
      }

      setPlan(plan);

      // Check if already purchased
      const { data: existing } = await supabase
        .from("purchases").select("id, package_type")
        .eq("user_id", user.id).eq("plan_id", id).single();
      if (existing) {
        setAlreadyPurchased(true);
        setExistingPackage(existing.package_type || "basic");
        setPackageType(existing.package_type || "basic");
      }

      setLoading(false);
    };
    load();
  }, [id]);

  const basePrice = packageType === "basic"
    ? (plan?.basic_price || plan?.price || 0)
    : (plan?.premium_price || plan?.basic_price || plan?.price || 0);

  // 20% goes to NakshaKart, 80% to architect — but customer pays full price
  const nakshakartFee  = Math.round(basePrice * 0.20);
  const architectShare = Math.round(basePrice * 0.80);
  const total          = basePrice; // No extra GST shown to customer — price is inclusive

  const handleBuyClick = () => {
    if (!agreed) { setShowAgreement(true); return; }
    handlePurchase();
  };

  const handlePurchase = async () => {
    if (!agreed) return;
    setPurchasing(true);

    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 1500));

    const { error } = await supabase.from("purchases").insert({
      user_id:              user.id,
      plan_id:              plan.id,
      amount:               basePrice,
      nakshakart_fee:       nakshakartFee,
      architect_earnings:   architectShare,
      status:               "completed",
      package_type:         packageType,
      agreement_accepted:   true,
      agreement_timestamp:  new Date().toISOString(),
    });

    if (error) {
      setPurchasing(false);
      alert("Error: " + error.message);
      return;
    }

    // Notify architect of sale
    await supabase.from("notifications").insert({
      user_id: plan.architect_id,
      title:   "🎉 New Sale!",
      message: `Someone purchased your plan "${plan.title}" (${packageType} package) for ₹${basePrice.toLocaleString()}. Your earnings: ₹${architectShare.toLocaleString()}`,
      type:    "new_sale",
      plan_id: plan.id,
    });

    setPurchasing(false);
    router.push("/my-purchases?success=1");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  if (!plan) return null;

  const basicFiles = [
    { label: "3D Exterior Render",     icon: "🖼️" },
    { label: "Floor Plans PDF",        icon: "📄" },
    { label: "4 Side Elevations",      icon: "📐" },
    { label: "Staircase Sections",     icon: "📄" },
    { label: "Door & Window Schedule", icon: "📄" },
  ];

  const premiumFiles = [
    { label: "CAD File (DWG)",    icon: "📐" },
    { label: "CAD File (DXF)",    icon: "📐" },
    { label: "3D Model Viewer",   icon: "🏠" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href={`/plan/${plan.id}`} className="text-teal-600 hover:underline text-sm mb-6 inline-block">
          ← Back to Plan
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* ── Left — Plan Info ── */}
          <div>
            {(plan.exterior_render_url || plan.image_url) ? (
              <img src={plan.exterior_render_url || plan.image_url} alt={plan.title}
                className="w-full h-56 object-cover rounded-2xl mb-4 shadow-md" />
            ) : (
              <div className="w-full h-56 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-5xl">🏠</span>
              </div>
            )}

            {plan.plan_code && (
              <p className="text-xs text-teal-600 font-mono font-semibold mb-1">{plan.plan_code}</p>
            )}
            <h1 className="text-xl font-bold text-gray-800 mb-3">{plan.title}</h1>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-5">
              {plan.plot_size  && <p>📐 {plan.plot_size}</p>}
              {plan.floors     && <p>🏢 {plan.floors}</p>}
              {plan.bedrooms   && <p>🛏️ {plan.bedrooms} BHK</p>}
              {plan.bathrooms  && <p>🚿 {plan.bathrooms} Bath</p>}
            </div>

            {/* Package contents */}
            <div className="space-y-3">
              <div className={`rounded-xl p-4 border-2 transition ${
                packageType === "basic" ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-200"
              }`}>
                <p className="font-bold text-blue-700 text-sm mb-2">📦 Basic Package Includes:</p>
                <div className="space-y-1.5">
                  {basicFiles.map((f) => (
                    <div key={f.label} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="text-green-500">✅</span>
                      <span>{f.icon} {f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {plan.premium_price && (
                <div className={`rounded-xl p-4 border-2 transition ${
                  packageType === "premium" ? "bg-purple-50 border-purple-300" : "bg-gray-50 border-gray-200"
                }`}>
                  <p className="font-bold text-purple-700 text-sm mb-2">⭐ Premium Adds:</p>
                  <div className="space-y-1.5">
                    {premiumFiles.map((f) => (
                      <div key={f.label} className="flex items-center gap-2 text-xs text-purple-600">
                        <span>✅</span>
                        <span>{f.icon} {f.label}</span>
                        <span className="bg-purple-100 text-purple-500 px-1.5 py-0.5 rounded-full text-xs ml-auto">Premium</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Legal notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mt-4">
              <p className="text-xs text-yellow-700">
                🔒 Files available for instant download after purchase.
                Preview images are watermarked — full quality after purchase.
              </p>
            </div>
          </div>

          {/* ── Right — Purchase ── */}
          <div>
            {alreadyPurchased ? (
              <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-8 text-center">
                <p className="text-4xl mb-3">✅</p>
                <p className="font-bold text-green-700 text-lg mb-2">Already Purchased!</p>
                <p className="text-sm text-gray-500 mb-4">
                  You already own the <strong>{existingPackage}</strong> package of this plan.
                </p>
                <Link href="/my-purchases"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold transition inline-block">
                  Go to My Purchases →
                </Link>
              </div>
            ) : (
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-gray-800 text-lg mb-4">Choose Package</h2>

                {/* Package Selector */}
                <div className="space-y-3 mb-6">

                  {/* Basic */}
                  <label className={`flex items-start gap-3 border-2 rounded-xl p-4 cursor-pointer transition ${
                    packageType === "basic"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}>
                    <input type="radio" name="package" value="basic"
                      checked={packageType === "basic"}
                      onChange={() => setPackageType("basic")}
                      className="accent-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-gray-800">📦 Basic Package</p>
                        <p className="font-bold text-orange-600 text-lg">
                          ₹{(plan.basic_price || plan.price)?.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        3D Render + Floor Plans + Elevations + Sections + Door & Window
                      </p>
                    </div>
                  </label>

                  {/* Premium */}
                  {plan.premium_price && (
                    <label className={`flex items-start gap-3 border-2 rounded-xl p-4 cursor-pointer transition ${
                      packageType === "premium"
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}>
                      <input type="radio" name="package" value="premium"
                        checked={packageType === "premium"}
                        onChange={() => setPackageType("premium")}
                        className="accent-purple-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-800">⭐ Premium Package</p>
                            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                              Best Value
                            </span>
                          </div>
                          <p className="font-bold text-purple-600 text-lg">
                            ₹{plan.premium_price?.toLocaleString()}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Everything in Basic + CAD Files + 3D Model Viewer
                        </p>
                      </div>
                    </label>
                  )}
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {packageType === "basic" ? "📦 Basic" : "⭐ Premium"} Package
                    </span>
                    <span className="font-semibold">₹{basePrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Includes all taxes</span>
                    <span>Price inclusive of GST</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
                    <span className="text-gray-800">Total Payable</span>
                    <span className="text-orange-600 text-xl">₹{total?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Agreement */}
                <label className="flex items-start gap-3 cursor-pointer mb-5">
                  <input type="checkbox" checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="accent-teal-600 mt-0.5 w-4 h-4" />
                  <span className="text-xs text-gray-600">
                    I agree to the{" "}
                    <button onClick={(e) => { e.preventDefault(); setShowAgreement(true); }}
                      className="text-teal-600 underline">
                      purchase terms
                    </button>
                    {" "}— No refunds on digital products.
                  </span>
                </label>

                {/* Buy Button */}
                <button onClick={handleBuyClick} disabled={purchasing}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2">
                  {purchasing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    `Buy Now — ₹${total?.toLocaleString()} 🔒`
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 mt-3">
                  🔒 Secure purchase · Instant download after payment · Test mode
                </p>

                {/* Architect info */}
                {plan.modification_available && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-xs text-green-700 font-semibold">✅ Modification Available</p>
                    {plan.consultation_fee && (
                      <p className="text-xs text-gray-500 mt-1">
                        Consultation: ₹{plan.consultation_fee} · {plan.consultation_type}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Agreement Modal */}
      {showAgreement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Purchase Agreement</h2>
            <div className="text-sm text-gray-600 space-y-3 mb-6 max-h-72 overflow-y-auto pr-2">
              <p className="font-semibold text-gray-800">Please read carefully before purchasing:</p>
              <p><strong>1. No Refunds:</strong> This is a digital product. Once purchased, no refunds will be issued under any circumstances.</p>
              <p><strong>2. Personal Use Only:</strong> You are buying a license for personal construction only. You cannot resell, share, or redistribute this plan.</p>
              <p><strong>3. Municipal Approval:</strong> NakshaKart is not responsible for municipal or government approval. Please verify local building bylaws.</p>
              <p><strong>4. Professional Verification:</strong> We recommend verifying the plan with a licensed local structural engineer before construction.</p>
              <p><strong>5. Copyright:</strong> All plans are copyright protected. Unauthorized use is punishable under the Indian Copyright Act.</p>
              <p><strong>6. NakshaKart Liability:</strong> NakshaKart is a marketplace platform only. We are not responsible for construction quality or outcomes.</p>
              <p><strong>7. Commission:</strong> NakshaKart charges 20% platform commission on all sales. The architect receives 80% of your payment.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAgreement(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition">
                Cancel
              </button>
              <button onClick={() => { setAgreed(true); setShowAgreement(false); handlePurchase(); }}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold transition">
                ✅ I Agree & Buy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
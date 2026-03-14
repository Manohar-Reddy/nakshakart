"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function BuyPlan() {
  const { id } = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [packageType, setPackageType] = useState<"basic" | "premium">("basic");
  const [agreed, setAgreed] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const { data: plan } = await supabase
        .from("plans").select("*").eq("id", id).single();
      if (!plan) { router.push("/browse"); return; }
      setPlan(plan);

      const { data: existing } = await supabase
        .from("purchases").select("id, package_type")
        .eq("user_id", user.id).eq("plan_id", id).single();
      if (existing) {
        setAlreadyPurchased(true);
        setPackageType(existing.package_type || "basic");
      }

      setLoading(false);
    };
    load();
  }, [id]);

  const price = packageType === "basic"
    ? (plan?.basic_price || plan?.price || 0)
    : (plan?.premium_price || plan?.basic_price || plan?.price || 0);

  const gst = Math.round(price * 0.18);
  const total = price + gst;

  const handleBuyClick = () => {
    if (!agreed) { setShowAgreement(true); return; }
    handlePurchase();
  };

  const handlePurchase = async () => {
    if (!agreed) return;
    setPurchasing(true);
    const { error } = await supabase.from("purchases").insert({
      user_id: user.id,
      plan_id: plan.id,
      amount: price,
      status: "completed",
      package_type: packageType,
      agreement_accepted: true,
      agreement_timestamp: new Date().toISOString(),
    });
    setPurchasing(false);
    if (error) { alert("Error: " + error.message); return; }
    alert("✅ Purchase successful! You can now download the plan files.");
    router.push("/my-purchases");
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
  if (!plan) return null;

  const basicFiles = [
    "3D Exterior Render",
    "Floor Plans PDF",
    "4 Side Elevations",
    "Staircase Sections",
    "Door & Window Schedule",
  ];

  const premiumOnlyFiles = [
    "DWG File",
    "DXF File",
    "Electrical Layout",
    "Plumbing Layout",
    ...(plan.sketchfab_link ? ["3D Model Viewer"] : []),
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href={`/plan/${plan.id}`} className="text-teal-600 hover:underline text-sm mb-6 inline-block">
        ← Back to Plan
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Left - Plan Info */}
        <div>
          {(plan.exterior_render_url || plan.image_url) ? (
            <img src={plan.exterior_render_url || plan.image_url} alt={plan.title}
              className="w-full h-56 object-cover rounded-2xl mb-4 cursor-pointer"
              onClick={() => window.open(plan.exterior_render_url || plan.image_url, "_blank")} />
          ) : (
            <div className="w-full h-56 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-5xl">🏠</span>
            </div>
          )}

          <h1 className="text-xl font-bold text-gray-800 mb-1">{plan.title}</h1>
          {plan.plan_code && (
            <p className="text-xs text-teal-600 font-semibold mb-3">Plan ID: {plan.plan_code}</p>
          )}

          <div className="text-sm text-gray-500 space-y-1 mb-4">
            {plan.plot_size  && <p>📐 Plot: {plan.plot_size}</p>}
            {plan.bedrooms   && <p>🛏️ Bedrooms: {plan.bedrooms}</p>}
            {plan.floors     && <p>🏢 Floors: {plan.floors}</p>}
            {plan.bathrooms  && <p>🚿 Bathrooms: {plan.bathrooms}</p>}
          </div>

          {/* Files breakdown by package */}
          <div className="space-y-3">
            {/* Basic files */}
            <div className={`rounded-xl p-4 border-2 transition ${
              packageType === "basic" ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-200"
            }`}>
              <p className="font-bold text-blue-700 text-sm mb-2">📦 Basic Package Includes:</p>
              <div className="space-y-1">
                {basicFiles.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="text-green-500">✅</span> {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Premium files */}
            {plan.premium_price && (
              <div className={`rounded-xl p-4 border-2 transition ${
                packageType === "premium" ? "bg-purple-50 border-purple-300" : "bg-gray-50 border-gray-200"
              }`}>
                <p className="font-bold text-purple-700 text-sm mb-2">⭐ Premium Adds:</p>
                <div className="space-y-1">
                  {premiumOnlyFiles.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-purple-600">
                      <span>✅</span> {item}
                      <span className="text-xs bg-purple-100 text-purple-500 px-1.5 py-0.5 rounded-full">Premium</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right - Purchase */}
        <div>
          {alreadyPurchased ? (
            <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-8 text-center">
              <p className="text-4xl mb-3">✅</p>
              <p className="font-bold text-green-700 text-lg mb-2">Already Purchased!</p>
              <p className="text-sm text-gray-500 mb-4">
                You already own the <strong>{packageType}</strong> package of this plan.
              </p>
              <Link href="/my-purchases"
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold transition inline-block">
                Go to My Purchases →
              </Link>
            </div>
          ) : (
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
              <h2 className="font-bold text-gray-800 text-lg mb-4">Choose Package</h2>

              {/* Package Selector */}
              <div className="space-y-3 mb-6">
                {/* Basic */}
                <label className={`flex items-start gap-3 border-2 rounded-xl p-4 cursor-pointer transition ${
                  packageType === "basic" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
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
                      3D Render + Floor Plans + Elevations + Staircase + Door & Window
                    </p>
                  </div>
                </label>

                {/* Premium */}
                {plan.premium_price && (
                  <label className={`flex items-start gap-3 border-2 rounded-xl p-4 cursor-pointer transition ${
                    packageType === "premium" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300"
                  }`}>
                    <input type="radio" name="package" value="premium"
                      checked={packageType === "premium"}
                      onChange={() => setPackageType("premium")}
                      className="accent-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-800">⭐ Premium Package</p>
                          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-semibold">Best Value</span>
                        </div>
                        <p className="font-bold text-purple-600 text-lg">
                          ₹{plan.premium_price?.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Everything in Basic + DWG + DXF + Electrical + Plumbing
                        {plan.sketchfab_link ? " + 3D Model" : ""}
                      </p>
                    </div>
                  </label>
                )}
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{packageType === "basic" ? "📦 Basic" : "⭐ Premium"} Package</span>
                  <span className="font-semibold">₹{price?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-semibold">₹{gst?.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold">
                  <span>Total Payable</span>
                  <span className="text-orange-600 text-lg">₹{total?.toLocaleString()}</span>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer mb-5">
                <input type="checkbox" checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="accent-teal-600 mt-0.5 w-4 h-4" />
                <span className="text-xs text-gray-600">
                  I agree to the{" "}
                  <button onClick={() => setShowAgreement(true)} className="text-teal-600 underline">
                    purchase terms
                  </button>
                  {" "}— No refunds once files are downloaded.
                </span>
              </label>

              {/* Buy Button */}
              <button onClick={handleBuyClick} disabled={purchasing}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg transition">
                {purchasing ? "Processing..." : `Buy Now — ₹${total?.toLocaleString()}`}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                🔒 Secure payment · Instant download after purchase
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Agreement Modal */}
      {showAgreement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Purchase Agreement</h2>
            <div className="text-sm text-gray-600 space-y-3 mb-6 max-h-64 overflow-y-auto">
              <p className="font-semibold text-gray-800">Please read carefully before purchasing:</p>
              <p>1. <strong>No Refunds:</strong> This is a digital product. Once files are downloaded, no refunds will be issued under any circumstances.</p>
              <p>2. <strong>Personal Use Only:</strong> You are buying a license for personal construction only. You cannot resell, share, or redistribute this plan.</p>
              <p>3. <strong>Municipal Approval:</strong> NakshaKart is not responsible for municipal or government approval. Please verify local building bylaws.</p>
              <p>4. <strong>Professional Verification:</strong> We recommend verifying the plan with a licensed local engineer before construction.</p>
              <p>5. <strong>Copyright:</strong> All plans are copyright protected. Unauthorized use is punishable under Indian Copyright Act.</p>
              <p>6. <strong>NakshaKart Liability:</strong> NakshaKart is only a marketplace platform. We are not responsible for construction quality or outcomes.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAgreement(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition">
                Cancel
              </button>
              <button onClick={() => { setAgreed(true); setShowAgreement(false); }}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold transition">
                ✅ I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
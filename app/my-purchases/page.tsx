"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FilePreviewModal, buildFileList } from "@/app/components/FilePreviewModal";

export default function MyPurchases() {
  const [purchases,   setPurchases]   = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router       = useRouter();
  const searchParams = useSearchParams();
  const showSuccess  = searchParams.get("success") === "1";

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setCurrentUser(user);

      const { data } = await supabase
        .from("purchases")
        .select("*, plans(*)")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      setPurchases(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleMessage = (architectId: string, planId: string, userId: string) => {
    const convId = `customer-${userId}-architect-${architectId}-plan-${planId}`;
    router.push(`/messages/${convId}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading purchases...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Success Banner */}
      {showSuccess && (
        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <span className="text-4xl">🎉</span>
          <div>
            <p className="font-bold text-green-700 text-lg">Purchase Successful!</p>
            <p className="text-green-600 text-sm">Your plan files are ready to preview and download below.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🛒 My Purchases</h1>
          <p className="text-gray-500 text-sm mt-1">
            {purchases.length} plan{purchases.length !== 1 ? "s" : ""} purchased
          </p>
        </div>
        <Link href="/browse"
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
          Browse More Plans →
        </Link>
      </div>

      {purchases.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center text-gray-400">
          <p className="text-5xl mb-4">🛒</p>
          <p className="font-semibold text-lg text-gray-600">No purchases yet</p>
          <p className="text-sm mt-2 mb-6">Browse and buy plans to see them here</p>
          <Link href="/browse"
            className="bg-teal-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-teal-700 transition">
            Browse Plans →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase) => {
            const plan    = purchase.plans;
            if (!plan) return null;
            const isBasic = purchase.package_type === "basic" || !purchase.package_type;
            const thumb   = plan.exterior_render_url || plan.image_url;

            return (
              <div key={purchase.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">

                {/* Plan Header */}
                <div className="flex gap-4 p-5 border-b border-gray-100">
                  {thumb ? (
                    <img src={thumb} alt={plan.title}
                      className="w-24 h-24 object-cover rounded-xl flex-shrink-0 border border-gray-100" />
                  ) : (
                    <div className="w-24 h-24 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">🏠</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        {plan.plan_code && (
                          <p className="text-xs text-teal-600 font-mono font-semibold">{plan.plan_code}</p>
                        )}
                        <h3 className="font-bold text-gray-800 text-base leading-tight mt-0.5">{plan.title}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                        isBasic ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                      }`}>
                        {isBasic ? "📦 Basic" : "⭐ Premium"} Package
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-2">
                      {plan.plot_size && <span>📐 {plan.plot_size}</span>}
                      {plan.bedrooms  && <span>🛏️ {plan.bedrooms} BHK</span>}
                      {plan.floors    && <span>🏢 {plan.floors}</span>}
                      <span>💰 Paid: <strong className="text-orange-600">₹{purchase.amount?.toLocaleString()}</strong></span>
                      <span>📅 {new Date(purchase.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}</span>
                    </div>

                    {/* Earnings breakdown */}
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className="text-gray-400">
                        Architect: <strong className="text-green-600">₹{Math.round((purchase.amount || 0) * 0.8).toLocaleString()}</strong>
                      </span>
                      <span className="text-gray-400">
                        NakshaKart: <strong className="text-orange-500">₹{Math.round((purchase.amount || 0) * 0.2).toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Files — Inline Preview */}
                <div className="p-5 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-700 mb-3 text-sm">
                    📁 Your Files — Click to preview inline
                  </h4>
                  <FilePreviewModal
                    files={buildFileList(plan, isBasic ? "basic" : "premium")}
                  />

                  {/* Upgrade prompt for basic users */}
                  {isBasic && plan.premium_price && (
                    <div className="mt-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-purple-700">🔒 Premium Files Locked</p>
                        <p className="text-xs text-purple-500 mt-0.5">
                          CAD Files (DWG/DXF) + 3D Model Viewer
                        </p>
                      </div>
                      <Link href={`/buy/${plan.id}`}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition">
                        Upgrade to Premium →
                      </Link>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-5 py-4 flex gap-3 flex-wrap bg-gray-50">
                  <Link href={`/plan/${plan.id}`}
                    className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold transition">
                    👁️ View Plan
                  </Link>
                  {plan.architect_id && (
                    <button
                      onClick={() => handleMessage(plan.architect_id, plan.id, currentUser.id)}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                      💬 Message Architect
                    </button>
                  )}
                  <Link href={`/plan/${plan.id}#reviews`}
                    className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 px-4 py-2 rounded-lg text-sm font-semibold transition">
                    ⭐ Leave Review
                  </Link>
                  {plan.modification_available && (
                    <button
                      onClick={() => handleMessage(plan.architect_id, plan.id, currentUser?.id)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg text-sm font-semibold transition">
                      🔧 Request Modification
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
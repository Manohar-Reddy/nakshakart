"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyPurchases() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setCurrentUser(user);

      const { data } = await supabase
        .from("purchases")
        .select("*, plans(*)")
        .eq("user_id", user.id)
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

  const handleDownload = async (url: string, filename: string) => {
    if (!url) { alert("File not available"); return; }
    const response = await fetch(url);
    const blob = await response.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading purchases...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">🛒 My Purchases</h1>
        <p className="text-gray-500 text-sm mt-1">{purchases.length} plans purchased</p>
      </div>

      {purchases.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center text-gray-400">
          <p className="text-5xl mb-4">🛒</p>
          <p className="font-semibold text-lg">No purchases yet</p>
          <p className="text-sm mt-2">Browse and buy plans to see them here</p>
          <Link href="/browse"
            className="mt-4 inline-block bg-teal-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-teal-700 transition">
            Browse Plans →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase) => {
            const plan = purchase.plans;
            if (!plan) return null;

            const isBasic = purchase.package_type === "basic" || !purchase.package_type;

            const basicFiles = [
              { label: "Floor Plans PDF",        url: plan.floor_plan_pdf_url,    filename: "floor-plans.pdf"        },
              { label: "Elevation - North",       url: plan.elevation_north_url,   filename: "elevation-north.pdf"    },
              { label: "Elevation - South",       url: plan.elevation_south_url,   filename: "elevation-south.pdf"    },
              { label: "Elevation - East",        url: plan.elevation_east_url,    filename: "elevation-east.pdf"     },
              { label: "Elevation - West",        url: plan.elevation_west_url,    filename: "elevation-west.pdf"     },
              { label: "Staircase Section",       url: plan.staircase_section_url, filename: "staircase-section.pdf"  },
              { label: "Door & Window Schedule",  url: plan.door_window_pdf_url,   filename: "door-window-schedule.pdf"},
              { label: "DWG File",                url: plan.dwg_url,               filename: "plan.dwg"               },
              { label: "DXF File",                url: plan.dxf_url,               filename: "plan.dxf"               },
            ];

            const premiumFiles = [
              { label: "Electrical Layout PDF",  url: plan.electrical_pdf_url,   filename: "electrical-layout.pdf"  },
              { label: "Plumbing Layout PDF",    url: plan.plumbing_pdf_url,     filename: "plumbing-layout.pdf"    },
            ];

            return (
              <div key={purchase.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Plan Header */}
                <div className="flex gap-4 p-6 border-b border-gray-100">
                  {plan.image_url ? (
                    <img src={plan.image_url} alt={plan.title}
                      className="w-24 h-24 object-cover rounded-xl flex-shrink-0 cursor-pointer"
                      onClick={() => window.open(plan.image_url, "_blank")} />
                  ) : (
                    <div className="w-24 h-24 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">🏠</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">{plan.title}</h3>
                        {plan.plan_code && (
                          <p className="text-xs text-teal-600 font-semibold mt-0.5">
                            Plan ID: {plan.plan_code}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                        isBasic
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        {isBasic ? "Basic" : "Premium"} Package
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                      <p>📐 {plan.plot_size} · 🛏️ {plan.bedrooms} BHK · 🏢 {plan.floors} Floor{plan.floors > 1 ? "s" : ""}</p>
                      <p>💰 Paid: <strong className="text-orange-600">₹{purchase.amount}</strong></p>
                      <p>📅 Purchased: {new Date(purchase.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}</p>
                    </div>
                  </div>
                </div>

                {/* Downloads */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-700 mb-3 text-sm">📥 Download Files</h4>

                  {/* Basic Files */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {basicFiles.map((file) => (
                      <button key={file.label}
                        onClick={() => handleDownload(file.url, file.filename)}
                        disabled={!file.url}
                        className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition border ${
                          file.url
                            ? "bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100"
                            : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                        }`}>
                        📄 {file.label}
                        {!file.url && <span className="block text-gray-300 text-xs">Not uploaded</span>}
                      </button>
                    ))}
                  </div>

                  {/* Premium Files */}
                  {!isBasic ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {premiumFiles.map((file) => (
                        <button key={file.label}
                          onClick={() => handleDownload(file.url, file.filename)}
                          disabled={!file.url}
                          className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition border ${
                            file.url
                              ? "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                              : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                          }`}>
                          📄 {file.label}
                          {!file.url && <span className="block text-gray-300 text-xs">Not uploaded</span>}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 text-sm text-purple-700">
                      🔒 Upgrade to <strong>Premium Package</strong> to access Electrical & Plumbing layouts
                      {plan.sketchfab_link && " + 3D Model Viewer"}
                    </div>
                  )}
                </div>

                {/* 3D Viewer - Premium only */}
                {!isBasic && plan.sketchfab_link && (
                  <div className="p-6 border-b border-gray-100">
                    <h4 className="font-semibold text-gray-700 mb-3 text-sm">🎮 3D Model Viewer</h4>
                    <iframe
                      src={plan.sketchfab_link.replace("models/", "models/") + "/embed"}
                      className="w-full h-64 rounded-xl border border-gray-200"
                      allow="autoplay; fullscreen; xr-spatial-tracking"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="px-6 py-4 flex gap-3 flex-wrap">
                  <Link href={`/plan/${plan.id}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition">
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
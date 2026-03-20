"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { FilePreviewModal, buildFileList } from "@/app/components/FilePreviewModal";

const getPlatformFee = (floors: string): number => {
  if (!floors) return 99;
  const f = floors.toLowerCase().trim();
  if (f === "g" || f === "ground") return 99;
  if (f.includes("g+1"))           return 149;
  if (f.includes("g+2"))           return 199;
  if (f.includes("g+3"))           return 299;
  return 499;
};

export default function MyPlans() {
  const [plans,   setPlans]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("plans")
        .select("*")
        .eq("architect_id", user.id)
        .order("created_at", { ascending: false });
      setPlans(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan? This cannot be undone.")) return;
    await supabase.from("plans").delete().eq("id", id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const pending        = plans.filter((p) => p.status === "pending" || !p.status);
  const paymentPending = plans.filter((p) => p.status === "payment_pending");
  const live           = plans.filter((p) => p.status === "live");
  const rejected       = plans.filter((p) => p.status === "rejected");

  const filteredByTab =
    filter === "pending"         ? pending        :
    filter === "payment_pending" ? paymentPending :
    filter === "live"            ? live           :
    filter === "rejected"        ? rejected       : plans;

  const filtered = filteredByTab.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q)     ||
      p.plan_code?.toLowerCase().includes(q) ||
      p.plot_size?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "live":            return "bg-green-100 text-green-700 border-green-200";
      case "payment_pending": return "bg-blue-100 text-blue-700 border-blue-200";
      case "pending":         return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "rejected":        return "bg-red-100 text-red-700 border-red-200";
      default:                return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "live":            return "🟢 Live";
      case "payment_pending": return "💳 Pay to Go Live";
      case "pending":         return "⏳ Pending Review";
      case "rejected":        return "❌ Rejected";
      default:                return "⏳ Pending";
    }
  };

  const cardBorder = (status: string) => {
    switch (status) {
      case "live":            return "border-green-300";
      case "payment_pending": return "border-blue-300";
      case "pending":         return "border-yellow-200";
      case "rejected":        return "border-red-300";
      default:                return "border-yellow-200";
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading plans...</div>;

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📁 My Plans</h1>
          <p className="text-gray-400 text-sm">{plans.length} plans uploaded</p>
        </div>
        <Link href="/architect/upload-plan"
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition">
          + Upload New Plan
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total",           value: plans.length,          color: "bg-gray-50 border-gray-200 text-gray-700"    },
          { label: "🟢 Live",         value: live.length,           color: "bg-green-50 border-green-200 text-green-700" },
          { label: "⏳ Pending",      value: pending.length,        color: "bg-yellow-50 border-yellow-200 text-yellow-700"},
          { label: "💳 Awaiting Pay", value: paymentPending.length, color: "bg-blue-50 border-blue-200 text-blue-700"    },
        ].map((s) => (
          <div key={s.label} className={`border-2 ${s.color} rounded-xl p-3 text-center`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter Tabs */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search by title, plan code, plot size..."
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all",             label: "All",             count: plans.length          },
            { key: "live",            label: "🟢 Live",         count: live.length           },
            { key: "pending",         label: "⏳ Pending",      count: pending.length        },
            { key: "payment_pending", label: "💳 Awaiting Pay", count: paymentPending.length },
            { key: "rejected",        label: "❌ Rejected",     count: rejected.length       },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border-2 ${
                filter === tab.key
                  ? "bg-teal-600 border-teal-600 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-teal-400"
              }`}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center text-gray-400">
          <p className="text-5xl mb-3">📭</p>
          <p className="font-semibold">No plans found</p>
          <Link href="/architect/upload-plan"
            className="mt-3 inline-block bg-teal-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-teal-700 transition">
            Upload First Plan →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((plan) => {
            const thumb        = plan.exterior_render_url || plan.image_url;
            const displayPrice = plan.basic_price || plan.price;
            const canEdit      = plan.status === "pending" || plan.status === "rejected";
            const needsPay     = plan.status === "payment_pending";
            const fee          = plan.platform_fee || getPlatformFee(plan.floors || "");

            const basicFiles = [
              { label: "3D Exterior Render",    ok: !!(plan.exterior_render_url || plan.image_url) },
              { label: "Floor Plans PDF",        ok: !!plan.floor_plan_pdf_url    },
              { label: "4 Side Elevations",      ok: !!plan.elevation_north_url   },
              { label: "Staircase Sections",     ok: !!plan.staircase_section_url },
              { label: "Door & Window Schedule", ok: !!plan.door_window_pdf_url   },
            ];

            const premiumFiles = [
              { label: "CAD File (DWG/DXF)", ok: !!(plan.dwg_url || plan.dxf_url) },
              { label: "3D Model Viewer",     ok: !!plan.model_3d_url              },
            ];

            const basicCount   = basicFiles.filter((f) => f.ok).length;
            const premiumCount = premiumFiles.filter((f) => f.ok).length;

            return (
              <div key={plan.id} className={`bg-white border-2 ${cardBorder(plan.status)} rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col`}>

                {/* Image */}
                <div className="relative">
                  {thumb ? (
                    <img src={thumb} alt={plan.title} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
                      <span className="text-4xl">🏠</span>
                    </div>
                  )}
                  {plan.status === "live" && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      🟢 LIVE
                    </span>
                  )}
                  {plan.model_3d_url && (
                    <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      🏠 3D
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">

                  {/* Status + Plan Code */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusBadge(plan.status)}`}>
                      {statusLabel(plan.status)}
                    </span>
                    {plan.plan_code && (
                      <span className="text-teal-600 font-mono text-xs font-bold">{plan.plan_code}</span>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">{plan.title}</h3>
                  <p className="text-xs text-gray-400 mb-2">
                    {[plan.plot_size, plan.bedrooms && `${plan.bedrooms} BHK`, plan.floors, plan.category].filter(Boolean).join(" · ")}
                  </p>

                  {/* Rejection reason */}
                  {plan.status === "rejected" && plan.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 mb-2 text-xs text-red-600">
                      ❌ <strong>{plan.rejection_reason}</strong>
                    </div>
                  )}

                  {/* Payment pending alert */}
                  {needsPay && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 mb-2 text-xs text-blue-700">
                      💳 Pay <strong>₹{fee}</strong> to go live
                    </div>
                  )}

                  {/* File counts */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 text-center">
                      <p className={`text-sm font-bold ${basicCount === 5 ? "text-green-600" : "text-orange-500"}`}>
                        {basicCount}/5
                      </p>
                      <p className="text-xs text-gray-500">📦 Basic</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-2 text-center">
                      <p className={`text-sm font-bold ${premiumCount === 2 ? "text-green-600" : "text-gray-400"}`}>
                        {premiumCount}/2
                      </p>
                      <p className="text-xs text-gray-500">⭐ Premium</p>
                    </div>
                  </div>

                  {/* File Preview */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 font-medium mb-1.5">📁 Preview Files Inline:</p>
                    <FilePreviewModal files={buildFileList(plan)} />
                  </div>

                  {/* Price + Platform fee */}
                  <div className="flex justify-between items-center text-xs mb-3 px-1">
                    <span className="text-gray-500">
                      Basic: <strong className="text-orange-500">₹{(displayPrice || 0).toLocaleString()}</strong>
                      {plan.premium_price && (
                        <span className="ml-2 text-purple-500">Premium: <strong>₹{plan.premium_price.toLocaleString()}</strong></span>
                      )}
                    </span>
                  </div>

                  {/* Live stats */}
                  {plan.status === "live" && plan.live_at && (
                    <div className="bg-green-50 border border-green-100 rounded-lg px-2.5 py-1.5 mb-3 text-xs text-green-700">
                      🟢 Live since {new Date(plan.live_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-1.5 mt-auto">
                    <Link href={`/plan/${plan.id}`}
                      className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-600 py-1.5 rounded-lg text-xs font-semibold transition">
                      👁️ View
                    </Link>

                    {canEdit && (
                      <Link href={`/architect/edit-plan/${plan.id}`}
                        className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-xs font-semibold transition">
                        ✏️ Edit
                      </Link>
                    )}

                    {needsPay && (
                      <Link href={`/architect/pay-platform-fee/${plan.id}`}
                        className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-xs font-semibold transition">
                        💳 Pay ₹{fee}
                      </Link>
                    )}

                    {plan.status === "live" && (
                      <span className="flex-1 text-center bg-green-50 text-green-600 border border-green-200 py-1.5 rounded-lg text-xs font-semibold">
                        🟢 Live
                      </span>
                    )}

                    {plan.status === "pending" && (
                      <span className="flex-1 text-center bg-yellow-50 text-yellow-600 border border-yellow-200 py-1.5 rounded-lg text-xs font-semibold">
                        ⏳ In Review
                      </span>
                    )}

                    <button onClick={() => handleDelete(plan.id)}
                      className="px-3 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 py-1.5 rounded-lg text-xs font-semibold transition">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
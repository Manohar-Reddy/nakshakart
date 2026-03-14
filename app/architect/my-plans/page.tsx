"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function MyPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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
    if (!confirm("Delete this plan?")) return;
    await supabase.from("plans").delete().eq("id", id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const filtered = filter === "all" ? plans : plans.filter((p) => p.status === filter);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📁 My Plans</h1>
          <p className="text-gray-400 text-sm">{plans.length} plans uploaded</p>
        </div>
        <Link href="/architect/upload-plan"
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition">
          + Upload New Plan
        </Link>
      </div>

      <div className="flex gap-2 mb-5">
        {[
          { key: "all",      label: "All",        count: plans.length },
          { key: "approved", label: "✅ Approved", count: plans.filter((p) => p.status === "approved").length },
          { key: "pending",  label: "⏳ Pending",  count: plans.filter((p) => p.status === "pending").length  },
          { key: "rejected", label: "❌ Rejected", count: plans.filter((p) => p.status === "rejected").length },
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
            const thumb = plan.exterior_render_url || plan.image_url;
            const displayPrice = plan.basic_price || plan.price;
            const canEdit = plan.status === "pending" || plan.status === "rejected";

            const basicFiles = [
              { label: "3D Exterior Render",    ok: !!(plan.exterior_render_url || plan.image_url) },
              { label: "Floor Plans PDF",        ok: !!plan.floor_plan_pdf_url    },
              { label: "4 Side Elevations",      ok: !!plan.elevation_north_url   },
              { label: "Staircase Sections",     ok: !!plan.staircase_section_url },
              { label: "Door & Window Schedule", ok: !!plan.door_window_pdf_url   },
            ];

            const premiumFiles = [
              { label: "CAD File (DWG or DXF)", ok: !!(plan.dwg_url || plan.dxf_url) },
              { label: "3D Model Viewer",        ok: !!plan.model_3d_url              },
            ];

            const basicCount   = basicFiles.filter((f) => f.ok).length;
            const premiumCount = premiumFiles.filter((f) => f.ok).length;

            return (
              <div key={plan.id} className={`bg-white border-2 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col ${
                plan.status === "approved" ? "border-green-200" :
                plan.status === "pending"  ? "border-yellow-200" : "border-red-200"
              }`}>
                {thumb ? (
                  <img src={thumb} alt={plan.title} className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-36 bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
                    <span className="text-4xl">🏠</span>
                  </div>
                )}

                <div className="p-3 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      plan.status === "approved" ? "bg-green-100 text-green-700" :
                      plan.status === "pending"  ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {plan.status === "approved" ? "✅ Approved" :
                       plan.status === "pending"  ? "⏳ Pending" : "❌ Rejected"}
                    </span>
                    {plan.plan_code && (
                      <span className="text-teal-600 font-mono text-xs font-bold">{plan.plan_code}</span>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1 truncate">{plan.title}</h3>
                  <p className="text-xs text-gray-400 mb-2">
                    {[plan.plot_size, plan.bedrooms && `${plan.bedrooms} BHK`, plan.floors, plan.category].filter(Boolean).join(" · ")}
                  </p>

                  {plan.status === "rejected" && plan.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 mb-2 text-xs text-red-600">
                      ❌ <strong>{plan.rejection_reason}</strong>
                    </div>
                  )}

                  {/* Basic Package */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 mb-2">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-blue-700">📦 Basic Package</span>
                      <span className={`text-xs font-bold ${basicCount === 5 ? "text-green-600" : "text-orange-500"}`}>
                        {basicCount}/5
                      </span>
                    </div>
                    {basicFiles.map((f) => (
                      <div key={f.label} className="flex items-center gap-1 py-0.5">
                        <span className="text-xs">{f.ok ? "✅" : "⬜"}</span>
                        <span className={`text-xs ${f.ok ? "text-gray-600" : "text-gray-300"}`}>{f.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Premium Package */}
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-2.5 mb-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-purple-700">⭐ Premium Package</span>
                      <span className={`text-xs font-bold ${premiumCount === 2 ? "text-green-600" : "text-orange-500"}`}>
                        {premiumCount}/2
                      </span>
                    </div>
                    {premiumFiles.map((f) => (
                      <div key={f.label} className="flex items-center gap-1 py-0.5">
                        <span className="text-xs">{f.ok ? "✅" : "⬜"}</span>
                        <span className={`text-xs ${f.ok ? "text-gray-600" : "text-gray-300"}`}>{f.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-xs mb-3 px-1">
                    <span className="text-gray-400">Basic price</span>
                    <span className="font-bold text-orange-500">₹{(displayPrice || 0).toLocaleString()}</span>
                  </div>

                  <div className="flex gap-1.5 mt-auto">
                    <Link href={`/plan/${plan.id}`}
                      className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-600 py-1.5 rounded-lg text-xs font-semibold transition">
                      👁️ View
                    </Link>
                    {canEdit ? (
                      <Link href={`/architect/edit-plan/${plan.id}`}
                        className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-xs font-semibold transition">
                        ✏️ Edit
                      </Link>
                    ) : (
                      <span className="flex-1 text-center bg-gray-50 text-gray-300 py-1.5 rounded-lg text-xs font-semibold cursor-not-allowed border border-gray-100">
                        🔒 Locked
                      </span>
                    )}
                    <button onClick={() => handleDelete(plan.id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 py-1.5 rounded-lg text-xs font-semibold transition">
                      🗑️ Delete
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
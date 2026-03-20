"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import ModelViewerClient from "@/app/components/ModelViewerClient";
import { FilePreviewModal, buildFileList } from "@/app/components/FilePreviewModal";

const REJECTION_REASONS = [
  "Missing floor plans",
  "Missing elevations",
  "Poor image quality",
  "Wrong dimensions",
  "Incomplete files",
  "Incorrect pricing",
  "Plan does not match description",
  "Other",
];

export default function AdminPlansPage() {
  const [plans,       setPlans]       = useState<any[]>([]);
  const [architects,  setArchitects]  = useState<Record<string, string>>({});
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("pending");
  const [search,      setSearch]      = useState("");
  const [viewing3d,   setViewing3d]   = useState<string | null>(null);
  const [rejectPlanId, setRejectPlanId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState(REJECTION_REASONS[0]);
  const [rejectCustom, setRejectCustom] = useState("");
  const [rejecting,   setRejecting]   = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: plansData } = await supabase
        .from("plans").select("*").order("created_at", { ascending: false });

      const ids = [...new Set(plansData?.map((p) => p.architect_id).filter(Boolean))];
      let archMap: Record<string, string> = {};
      if (ids.length > 0) {
        const { data: archData } = await supabase
          .from("users").select("id, name").in("id", ids);
        archData?.forEach((a) => { archMap[a.id] = a.name; });
      }
      setPlans(plansData || []);
      setArchitects(archMap);
      setLoading(false);
    };
    load();
  }, []);

  const handleApprove = async (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    await supabase.from("plans").update({
      status: "payment_pending",
      rejection_reason: null,
    }).eq("id", planId);

    await supabase.from("notifications").insert({
      user_id: plan?.architect_id,
      title:   "🎉 Plan Approved! Pay to Go Live",
      message: `Your plan "${plan?.title}" has been approved! Pay the platform fee to make it live on the marketplace.`,
      type:    "plan_approved",
      plan_id: planId,
    });

    setPlans((prev) => prev.map((p) =>
      p.id === planId ? { ...p, status: "payment_pending", rejection_reason: null } : p
    ));
  };

  const handleRejectConfirm = async () => {
    if (!rejectPlanId) return;
    setRejecting(true);
    const reason = rejectReason === "Other" ? rejectCustom : rejectReason;
    await supabase.from("plans").update({ status: "rejected", rejection_reason: reason }).eq("id", rejectPlanId);
    setPlans((prev) => prev.map((p) => p.id === rejectPlanId ? { ...p, status: "rejected", rejection_reason: reason } : p));
    setRejectPlanId(null);
    setRejectReason(REJECTION_REASONS[0]);
    setRejectCustom("");
    setRejecting(false);
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
      p.title?.toLowerCase().includes(q)        ||
      p.plan_code?.toLowerCase().includes(q)    ||
      p.plot_size?.toLowerCase().includes(q)    ||
      p.category?.toLowerCase().includes(q)     ||
      architects[p.architect_id]?.toLowerCase().includes(q)
    );
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":         return "bg-yellow-900 text-yellow-300";
      case "payment_pending": return "bg-blue-900 text-blue-300";
      case "live":            return "bg-green-900 text-green-300";
      case "rejected":        return "bg-red-900 text-red-300";
      default:                return "bg-yellow-900 text-yellow-300";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "pending":         return "⏳ Pending";
      case "payment_pending": return "💳 Payment Pending";
      case "live":            return "🟢 Live";
      case "rejected":        return "❌ Rejected";
      default:                return "⏳ Pending";
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
      Loading plans...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* Reject Modal */}
      {rejectPlanId && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-1">❌ Reject Plan</h2>
            <p className="text-gray-500 text-sm mb-5">Select a reason — shown to architect so they can fix it.</p>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rejection Reason</label>
            <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-400">
              {REJECTION_REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
            {rejectReason === "Other" && (
              <textarea value={rejectCustom} onChange={(e) => setRejectCustom(e.target.value)}
                rows={3} placeholder="Describe the issue in detail..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none resize-none" />
            )}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-5 text-xs text-yellow-700">
              ⚠️ The architect will see this reason and can fix + resubmit.
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setRejectPlanId(null); setRejectCustom(""); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold transition">
                Cancel
              </button>
              <button onClick={handleRejectConfirm}
                disabled={rejecting || (rejectReason === "Other" && !rejectCustom.trim())}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-2.5 rounded-xl font-bold transition">
                {rejecting ? "Rejecting..." : "❌ Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Model Modal */}
      {viewing3d && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-2xl w-full max-w-4xl border border-gray-700 my-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
              <p className="font-bold text-white">🏠 3D Model Preview</p>
              <button onClick={() => setViewing3d(null)}
                className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
            </div>
            <ModelViewerClient url={viewing3d} />
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold">Manage Plans</h2>
            <p className="text-gray-400 mt-1">Review all uploaded files before approving</p>
          </div>
          <div className="flex gap-3 flex-wrap items-center">
            <Link href="/admin/review"
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition">
              🔍 Quick Review
            </Link>
            <span className="bg-yellow-900 text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold">{pending.length} Pending</span>
            <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">{paymentPending.length} Awaiting Pay</span>
            <span className="bg-green-900 text-green-300 px-3 py-1 rounded-full text-sm font-semibold">{live.length} Live</span>
            <span className="bg-red-900 text-red-300 px-3 py-1 rounded-full text-sm font-semibold">{rejected.length} Rejected</span>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search by title, plan code, architect, plot size, category..."
            className="flex-1 bg-gray-800 border border-gray-600 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "all",             label: "All",             count: plans.length          },
              { key: "pending",         label: "⏳ Pending",      count: pending.length        },
              { key: "payment_pending", label: "💳 Awaiting Pay", count: paymentPending.length },
              { key: "live",            label: "🟢 Live",         count: live.length           },
              { key: "rejected",        label: "❌ Rejected",     count: rejected.length       },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                  filter === tab.key
                    ? "bg-teal-600 border-teal-600 text-white"
                    : "bg-gray-800 border-gray-600 text-gray-300 hover:border-teal-500"
                }`}>
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Plans List */}
        <div className="space-y-6">
          {filtered.length === 0 && (
            <div className="bg-gray-800 rounded-xl p-16 text-center text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p>No plans found</p>
            </div>
          )}

          {filtered.map((plan) => {
            const thumb        = plan.exterior_render_url || plan.image_url;
            const architectName = architects[plan.architect_id] || "Unknown";
            const displayPrice  = plan.basic_price || plan.price;
            const basicCount    = [
              plan.exterior_render_url || plan.image_url,
              plan.floor_plan_pdf_url,
              plan.elevation_north_url,
              plan.staircase_section_url,
              plan.door_window_pdf_url,
            ].filter(Boolean).length;
            const premiumCount = [
              plan.dwg_url || plan.dxf_url,
              plan.model_3d_url,
            ].filter(Boolean).length;

            return (
              <div key={plan.id} className={`bg-gray-800 rounded-xl border-2 overflow-hidden ${
                plan.status === "pending"         ? "border-yellow-600" :
                plan.status === "payment_pending" ? "border-blue-600"   :
                plan.status === "live"            ? "border-green-600"  :
                "border-red-700"
              }`}>
                <div className="grid grid-cols-12 gap-0">

                  {/* Preview Image */}
                  <div className="col-span-2">
                    {thumb ? (
                      <img src={thumb} alt={plan.title}
                        className="w-full h-full object-cover min-h-[200px]" />
                    ) : (
                      <div className="w-full min-h-[200px] bg-gray-700 flex items-center justify-center">
                        <span className="text-4xl">🏠</span>
                      </div>
                    )}
                  </div>

                  {/* Plan Info + Files */}
                  <div className="col-span-7 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        {plan.plan_code && (
                          <p className="text-teal-400 text-xs font-mono font-semibold mb-1">{plan.plan_code}</p>
                        )}
                        <h3 className="text-white font-bold text-base">{plan.title}</h3>
                        <p className="text-gray-400 text-xs mt-0.5">
                          👤 {architectName} &nbsp;·&nbsp;
                          📐 {plan.plot_size || "—"} &nbsp;·&nbsp;
                          🛏️ {plan.bedrooms || "—"} &nbsp;·&nbsp;
                          🏢 {plan.floors || "—"} &nbsp;·&nbsp;
                          🏠 {plan.category || "—"}
                        </p>
                        {plan.description && (
                          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{plan.description}</p>
                        )}
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="text-orange-400 font-bold">₹{displayPrice?.toLocaleString()}</p>
                        {plan.premium_price && (
                          <p className="text-purple-400 text-xs">Premium: ₹{plan.premium_price?.toLocaleString()}</p>
                        )}
                      </div>
                    </div>

                    {/* Status alerts */}
                    {plan.status === "rejected" && plan.rejection_reason && (
                      <div className="bg-red-900 border border-red-700 rounded-lg px-3 py-2 mb-3">
                        <p className="text-xs text-red-300 font-semibold">❌ Rejection Reason:</p>
                        <p className="text-xs text-red-200 mt-0.5">{plan.rejection_reason}</p>
                      </div>
                    )}
                    {plan.status === "payment_pending" && (
                      <div className="bg-blue-900 border border-blue-700 rounded-lg px-3 py-2 mb-3">
                        <p className="text-xs text-blue-300 font-semibold">💳 Awaiting platform fee · ₹{plan.platform_fee || 99}</p>
                      </div>
                    )}
                    {plan.status === "live" && (
                      <div className="bg-green-900 border border-green-700 rounded-lg px-3 py-2 mb-3">
                        <p className="text-xs text-green-300 font-semibold">🟢 Live since {plan.live_at ? new Date(plan.live_at).toLocaleDateString("en-IN") : "—"}</p>
                      </div>
                    )}

                    {/* File counts */}
                    <div className="flex gap-2 mb-3 flex-wrap">
                      <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full">📦 Basic: {basicCount}/5</span>
                      <span className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded-full">⭐ Premium: {premiumCount}/2</span>
                      {plan.modification_available && (
                        <span className="text-xs bg-teal-900 text-teal-300 px-2 py-1 rounded-full">🔧 Modifiable</span>
                      )}
                      {plan.platform_fee_paid && (
                        <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">💰 Fee paid</span>
                      )}
                    </div>

                    {/* ✅ Inline File Preview */}
                    <div className="mt-2">
                      <p className="text-xs text-gray-400 font-semibold mb-2">📁 Files — click to preview inline:</p>
                      <FilePreviewModal files={buildFileList(plan)} />
                    </div>

                    {plan.architect_notes && (
                      <div className="bg-gray-700 rounded-lg p-2 mt-3">
                        <p className="text-xs text-gray-400 font-semibold mb-1">📝 Architect Notes:</p>
                        <p className="text-xs text-gray-300">{plan.architect_notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 p-4 border-l border-gray-700 flex flex-col justify-between">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${statusBadge(plan.status)}`}>
                      {statusLabel(plan.status || "pending")}
                    </span>
                    <div className="space-y-2 mt-4">
                      <Link href={`/plan/${plan.id}`} target="_blank"
                        className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition">
                        👁️ Preview Page
                      </Link>
                      <Link href={`/messages/admin-${plan.architect_id}`}
                        className="block w-full text-center bg-blue-800 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition">
                        💬 Message Architect
                      </Link>
                      {(plan.status === "pending" || !plan.status) && (
                        <button onClick={() => handleApprove(plan.id)}
                          className="block w-full text-center bg-green-700 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition">
                          ✅ Approve
                        </button>
                      )}
                      {plan.status !== "rejected" && plan.status !== "live" && (
                        <button onClick={() => setRejectPlanId(plan.id)}
                          className="block w-full text-center bg-red-700 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition">
                          ❌ Reject
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { FilePreviewModal, buildFileList } from "@/app/components/FilePreviewModal";

const DRAWING_CHECK_LABELS: Record<string, string> = {
  check_room_labels: "Room labels on floor plan",
  check_dimensions:  "Dimensions shown",
  check_north:       "North direction marked",
  check_scale:       "Scale mentioned",
  check_elevations:  "All 4 elevations included",
  check_legible:     "Drawings clear & legible",
  check_site_match:  "Site dimensions match",
  check_original:    "Original drawings",
};

const REJECTION_REASONS = [
  "Missing floor plans",
  "Missing elevations",
  "Poor image quality",
  "Wrong dimensions",
  "Incomplete files",
  "Incorrect pricing",
  "Plan does not match description",
  "Drawings not legible",
  "Missing room labels",
  "Missing scale/north direction",
  "Other",
];

export default function AdminReviewPage() {
  const [plans,       setPlans]       = useState<any[]>([]);
  const [architects,  setArchitects]  = useState<Record<string, any>>({});
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [expandedId,  setExpandedId]  = useState<string | null>(null);
  const [notes,       setNotes]       = useState<Record<string, string>>({});
  const [rejectId,    setRejectId]    = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState(REJECTION_REASONS[0]);
  const [rejectCustom, setRejectCustom] = useState("");
  const [processing,  setProcessing]  = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: plansData } = await supabase
        .from("plans")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true }); // oldest first

      const ids = [...new Set(plansData?.map((p) => p.architect_id).filter(Boolean))];
      let archMap: Record<string, any> = {};
      if (ids.length > 0) {
        const { data: archData } = await supabase
          .from("users").select("id, name, email, experience, city, is_coa_verified").in("id", ids);
        archData?.forEach((a) => { archMap[a.id] = a; });
      }

      setPlans(plansData || []);
      setArchitects(archMap);
      setLoading(false);
    };
    load();
  }, []);

  const handleApprove = async (plan: any) => {
    setProcessing(plan.id);
    const adminNote = notes[plan.id] || "";

    await supabase.from("plans").update({
      status:            "payment_pending",
      rejection_reason:  null,
      admin_review_notes: adminNote || null,
    }).eq("id", plan.id);

    await supabase.from("notifications").insert({
      user_id: plan.architect_id,
      title:   "🎉 Plan Approved! Pay to Go Live",
      message: `Your plan "${plan.title}" has been approved! Pay the platform fee of ₹${plan.platform_fee || 99} to make it live.`,
      type:    "plan_approved",
      plan_id: plan.id,
    });

    setPlans((prev) => prev.filter((p) => p.id !== plan.id));
    setProcessing(null);
  };

  const handleReject = async (plan: any) => {
    setProcessing(plan.id);
    const reason    = rejectReason === "Other" ? rejectCustom : rejectReason;
    const adminNote = notes[plan.id] || "";

    await supabase.from("plans").update({
      status:             "rejected",
      rejection_reason:   reason,
      admin_review_notes: adminNote || null,
    }).eq("id", plan.id);

    await supabase.from("notifications").insert({
      user_id: plan.architect_id,
      title:   "❌ Plan Rejected",
      message: `Your plan "${plan.title}" was rejected. Reason: ${reason}. Please fix and resubmit.`,
      type:    "plan_rejected",
      plan_id: plan.id,
    });

    setPlans((prev) => prev.filter((p) => p.id !== plan.id));
    setRejectId(null);
    setRejectReason(REJECTION_REASONS[0]);
    setRejectCustom("");
    setProcessing(null);
  };

  const filtered = plans.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.plan_code?.toLowerCase().includes(q) ||
      architects[p.architect_id]?.name?.toLowerCase().includes(q)
    );
  });

  const getCheckScore = (checklist: any) => {
    if (!checklist) return { passed: 0, total: 8 };
    const passed = Object.values(checklist).filter(Boolean).length;
    return { passed, total: Object.keys(DRAWING_CHECK_LABELS).length };
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
      Loading plans for review...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-1">❌ Reject Plan</h2>
            <p className="text-gray-500 text-sm mb-4">Select rejection reason — architect will see this.</p>
            <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-400">
              {REJECTION_REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
            {rejectReason === "Other" && (
              <textarea value={rejectCustom} onChange={(e) => setRejectCustom(e.target.value)}
                rows={3} placeholder="Describe the issue..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-3 focus:outline-none resize-none" />
            )}
            <div className="flex gap-3 mt-2">
              <button onClick={() => { setRejectId(null); setRejectCustom(""); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold transition">
                Cancel
              </button>
              <button
                onClick={() => {
                  const plan = plans.find((p) => p.id === rejectId);
                  if (plan) handleReject(plan);
                }}
                disabled={rejectReason === "Other" && !rejectCustom.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-2.5 rounded-xl font-bold transition">
                ❌ Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">🔍 Plan Review Dashboard</h1>
            <p className="text-gray-400 mt-1 text-sm">
              {filtered.length} plans pending review · Oldest submissions first
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/plans"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
              ← All Plans
            </Link>
          </div>
        </div>

        {/* Search */}
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search by title, plan code, architect..."
          className="w-full bg-gray-800 border border-gray-600 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-teal-500" />

        {filtered.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-16 text-center text-gray-400">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-lg font-semibold">No plans pending review!</p>
            <p className="text-sm mt-2">All caught up.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((plan) => {
              const arch      = architects[plan.architect_id];
              const checklist = plan.drawing_checklist || {};
              const { passed, total } = getCheckScore(checklist);
              const allPassed = passed === total && total > 0;
              const isExpanded = expandedId === plan.id;
              const thumb      = plan.exterior_render_url || plan.image_url;

              return (
                <div key={plan.id} className={`bg-gray-800 rounded-xl border-2 overflow-hidden ${
                  allPassed ? "border-green-700" : "border-yellow-600"
                }`}>

                  {/* Plan Summary Row */}
                  <div className="flex items-start gap-4 p-4">

                    {/* Thumb */}
                    <div className="flex-shrink-0">
                      {thumb ? (
                        <a href={thumb} target="_blank" rel="noopener noreferrer">
                          <img src={thumb} alt={plan.title}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-600 hover:opacity-90 transition" />
                        </a>
                      ) : (
                        <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                          <span className="text-3xl">🏠</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          {plan.plan_code && (
                            <p className="text-teal-400 text-xs font-mono font-semibold">{plan.plan_code}</p>
                          )}
                          <h3 className="text-white font-bold text-base">{plan.title}</h3>
                          <p className="text-gray-400 text-xs mt-0.5">
                            👤 {arch?.name || "Unknown"} · 📍 {arch?.city || "—"} ·
                            {arch?.is_coa_verified && " ✅ CoA Verified ·"}
                            📐 {plan.plot_size || "—"} · 🏢 {plan.floors || "—"} · 🛏️ {plan.bedrooms || "—"} BHK
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            📅 Submitted: {new Date(plan.created_at).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                            })}
                          </p>
                        </div>

                        {/* Checklist score */}
                        <div className={`px-3 py-2 rounded-xl text-center flex-shrink-0 ${
                          allPassed ? "bg-green-900 border border-green-700" : "bg-yellow-900 border border-yellow-700"
                        }`}>
                          <p className={`text-lg font-bold ${allPassed ? "text-green-300" : "text-yellow-300"}`}>
                            {passed}/{total}
                          </p>
                          <p className={`text-xs ${allPassed ? "text-green-400" : "text-yellow-400"}`}>
                            {allPassed ? "✅ All checks" : "⚠️ Checks"}
                          </p>
                        </div>
                      </div>

                      {/* Quick file status */}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {[
                          { label: "Render",    ok: !!(plan.exterior_render_url || plan.image_url) },
                          { label: "Floor Plan", ok: !!plan.floor_plan_pdf_url   },
                          { label: "Elevations", ok: !!plan.elevation_north_url  },
                          { label: "Sections",   ok: !!plan.staircase_section_url},
                          { label: "Door/Win",   ok: !!plan.door_window_pdf_url  },
                          { label: "CAD",        ok: !!(plan.dwg_url || plan.dxf_url), optional: true },
                          { label: "3D Model",   ok: !!plan.model_3d_url,         optional: true },
                        ].map((f) => (
                          <span key={f.label} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            f.ok
                              ? "bg-green-900 text-green-300"
                              : f.optional
                                ? "bg-gray-700 text-gray-400"
                                : "bg-red-900 text-red-300"
                          }`}>
                            {f.ok ? "✅" : f.optional ? "—" : "❌"} {f.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button onClick={() => setExpandedId(isExpanded ? null : plan.id)}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition">
                        {isExpanded ? "▲ Collapse" : "▼ Full Review"}
                      </button>
                      <button
                        onClick={() => handleApprove(plan)}
                        disabled={processing === plan.id}
                        className="bg-green-700 hover:bg-green-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition">
                        {processing === plan.id ? "..." : "✅ Approve"}
                      </button>
                      <button
                        onClick={() => setRejectId(plan.id)}
                        disabled={processing === plan.id}
                        className="bg-red-700 hover:bg-red-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition">
                        ❌ Reject
                      </button>
                    </div>
                  </div>

                  {/* Expanded Full Review */}
                  {isExpanded && (
                    <div className="border-t border-gray-700 p-4 space-y-5">

                      {/* Architect Info */}
                      <div className="bg-gray-700 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-300 mb-2">👤 Architect Details</p>
                        <div className="grid grid-cols-3 gap-3 text-xs text-gray-300">
                          <p>Name: <strong className="text-white">{arch?.name || "—"}</strong></p>
                          <p>City: <strong className="text-white">{arch?.city || "—"}</strong></p>
                          <p>Experience: <strong className="text-white">{arch?.experience || "—"} yrs</strong></p>
                          <p>Email: <strong className="text-white">{arch?.email || "—"}</strong></p>
                          <p>CoA: <strong className={arch?.is_coa_verified ? "text-green-400" : "text-gray-400"}>
                            {arch?.is_coa_verified ? "✅ Verified" : "Not verified"}
                          </strong></p>
                        </div>
                      </div>

                      {/* Plan Details */}
                      <div className="bg-gray-700 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-300 mb-2">📋 Plan Details</p>
                        <div className="grid grid-cols-3 gap-3 text-xs text-gray-300">
                          <p>Category: <strong className="text-white">{plan.category || "—"}</strong></p>
                          <p>Plot: <strong className="text-white">{plan.plot_size || "—"}</strong></p>
                          <p>Floors: <strong className="text-white">{plan.floors || "—"}</strong></p>
                          <p>Bedrooms: <strong className="text-white">{plan.bedrooms || "—"}</strong></p>
                          <p>Bathrooms: <strong className="text-white">{plan.bathrooms || "—"}</strong></p>
                          <p>Built-up: <strong className="text-white">{plan.built_up_area || "—"}</strong></p>
                          <p>Basic Price: <strong className="text-orange-400">₹{plan.basic_price?.toLocaleString() || "—"}</strong></p>
                          <p>Premium Price: <strong className="text-purple-400">₹{plan.premium_price?.toLocaleString() || "—"}</strong></p>
                          <p>Platform Fee: <strong className="text-blue-400">₹{plan.platform_fee || 99}</strong></p>
                        </div>
                        {plan.description && (
                          <p className="text-xs text-gray-400 mt-2">Description: {plan.description}</p>
                        )}
                        {plan.architect_notes && (
                          <p className="text-xs text-yellow-400 mt-1">📝 Architect Notes: {plan.architect_notes}</p>
                        )}
                      </div>

                     {/* Files */}
                      <div className="bg-gray-700 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-300 mb-3">📁 Files — Click to Preview Inline</p>
                        <FilePreviewModal files={buildFileList(plan)} />
                      </div>

                      {/* Drawing Checklist Report */}
                      <div className="bg-gray-700 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-semibold text-gray-300">✅ Architect Drawing Checklist</p>
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                            allPassed ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"
                          }`}>
                            {passed}/{total} passed
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(DRAWING_CHECK_LABELS).map(([key, label]) => {
                            const checked = checklist[key];
                            return (
                              <div key={key} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                                checked
                                  ? "bg-green-900 border border-green-800 text-green-300"
                                  : "bg-red-900 border border-red-800 text-red-300"
                              }`}>
                                <span>{checked ? "✅" : "❌"}</span>
                                <span>{label}</span>
                              </div>
                            );
                          })}
                        </div>
                        {!allPassed && (
                          <p className="text-xs text-yellow-400 mt-2">
                            ⚠️ Architect did not confirm all checklist items. Review carefully before approving.
                          </p>
                        )}
                      </div>

                      {/* Admin Notes */}
                      <div className="bg-gray-700 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-300 mb-2">📝 Admin Review Notes (optional)</p>
                        <textarea
                          value={notes[plan.id] || ""}
                          onChange={(e) => setNotes((p) => ({ ...p, [plan.id]: e.target.value }))}
                          rows={2}
                          placeholder="Add internal notes about this plan..."
                          className="w-full bg-gray-600 border border-gray-500 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                        />
                      </div>

                      {/* Final Actions */}
                      <div className="flex gap-3">
                        <button onClick={() => handleApprove(plan)}
                          disabled={processing === plan.id}
                          className="flex-1 bg-green-700 hover:bg-green-600 disabled:bg-gray-600 text-white py-3 rounded-xl font-bold transition">
                          {processing === plan.id ? "Processing..." : "✅ Approve Plan"}
                        </button>
                        <button onClick={() => setRejectId(plan.id)}
                          disabled={processing === plan.id}
                          className="flex-1 bg-red-700 hover:bg-red-600 disabled:bg-gray-600 text-white py-3 rounded-xl font-bold transition">
                          ❌ Reject Plan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
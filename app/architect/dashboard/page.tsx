"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Platform fee based on floors
const getPlatformFee = (floors: string): number => {
  if (!floors) return 99;
  const f = floors.toLowerCase().trim();
  if (f === "g" || f === "ground") return 99;
  if (f.includes("g+1"))           return 149;
  if (f.includes("g+2"))           return 199;
  if (f.includes("g+3"))           return 299;
  return 499;
};

export default function ArchitectDashboard() {
  const [user,        setUser]        = useState<any>(null);
  const [stats,       setStats]       = useState({
    totalPlans: 0, livePlans: 0, pendingPlans: 0, rejectedPlans: 0,
    paymentPendingPlans: 0, totalEarnings: 0, totalSales: 0,
  });
  const [recentPlans, setRecentPlans] = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data: plans } = await supabase
        .from("plans")
        .select("id, title, plot_size, price, basic_price, status, plan_code, exterior_render_url, image_url, created_at, rejection_reason, platform_fee_paid, platform_fee, floors")
        .eq("architect_id", user.id)
        .order("created_at", { ascending: false });

      if (plans) {
        const live           = plans.filter((p) => p.status === "live").length;
        const pending        = plans.filter((p) => p.status === "pending" || !p.status).length;
        const rejected       = plans.filter((p) => p.status === "rejected").length;
        const paymentPending = plans.filter((p) => p.status === "payment_pending").length;
        setRecentPlans(plans.slice(0, 5));

        const planIds = plans.map((p) => p.id);
        if (planIds.length > 0) {
          const { data: purchases } = await supabase
            .from("purchases").select("amount").in("plan_id", planIds).eq("status", "completed");
          const totalEarnings = purchases
            ? purchases.reduce((sum, p) => sum + (p.amount * 0.8), 0) : 0;
          setStats({
            totalPlans: plans.length, livePlans: live, pendingPlans: pending,
            rejectedPlans: rejected, paymentPendingPlans: paymentPending,
            totalEarnings: Math.round(totalEarnings), totalSales: purchases?.length || 0,
          });
        } else {
          setStats({
            totalPlans: plans.length, livePlans: live, pendingPlans: pending,
            rejectedPlans: rejected, paymentPendingPlans: paymentPending,
            totalEarnings: 0, totalSales: 0,
          });
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading dashboard...</div>;

  const statCards = [
    { label: "Total Plans",    value: stats.totalPlans,    icon: "📁", color: "bg-blue-50 border-blue-200 text-blue-700"      },
    { label: "Live",           value: stats.livePlans,     icon: "🟢", color: "bg-green-50 border-green-200 text-green-700"   },
    { label: "Pending Review", value: stats.pendingPlans,  icon: "⏳", color: "bg-yellow-50 border-yellow-200 text-yellow-700"},
    { label: "Rejected",       value: stats.rejectedPlans, icon: "❌", color: "bg-red-50 border-red-200 text-red-700"         },
    { label: "Total Sales",    value: stats.totalSales,    icon: "🛒", color: "bg-purple-50 border-purple-200 text-purple-700"},
    { label: "Earnings (80%)", value: `₹${stats.totalEarnings.toLocaleString()}`, icon: "💰", color: "bg-teal-50 border-teal-200 text-teal-700" },
  ];

  const rejectedPlans       = recentPlans.filter((p) => p.status === "rejected");
  const paymentPendingPlans = recentPlans.filter((p) => p.status === "payment_pending");

  const statusBadge = (status: string) => {
    switch (status) {
      case "live":            return "bg-green-100 text-green-700";
      case "pending":         return "bg-yellow-100 text-yellow-700";
      case "payment_pending": return "bg-blue-100 text-blue-700";
      case "rejected":        return "bg-red-100 text-red-700";
      default:                return "bg-yellow-100 text-yellow-700";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "live":            return "🟢 Live";
      case "pending":         return "⏳ Pending";
      case "payment_pending": return "💳 Pay to Go Live";
      case "rejected":        return "❌ Rejected";
      default:                return "⏳ Pending";
    }
  };

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "Architect"} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's an overview of your plans and earnings</p>
      </div>

      {/* 💳 Payment Pending Alert */}
      {paymentPendingPlans.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-5 mb-6">
          <h2 className="text-blue-700 font-bold text-sm mb-1 flex items-center gap-2">
            🎉 {paymentPendingPlans.length} Plan{paymentPendingPlans.length > 1 ? "s" : ""} Approved — Pay to Go Live!
          </h2>
          <p className="text-blue-600 text-xs mb-4">
            Your plan has been approved by NakshaKart admin. Pay the platform fee to make it live on the marketplace.
          </p>
          <div className="space-y-3">
            {paymentPendingPlans.map((plan) => {
              const fee = plan.platform_fee || getPlatformFee(plan.floors || "");
              return (
                <div key={plan.id} className="bg-white border border-blue-200 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {(plan.exterior_render_url || plan.image_url) && (
                      <img src={plan.exterior_render_url || plan.image_url} alt={plan.title}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0 border border-blue-100" />
                    )}
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{plan.title}</p>
                      {plan.plan_code && (
                        <p className="text-teal-600 font-mono text-xs">{plan.plan_code}</p>
                      )}
                      <p className="text-blue-600 text-xs mt-1">
                        ✅ Approved · Platform fee: <strong>₹{fee}</strong>
                      </p>
                    </div>
                  </div>
                  <Link href={`/architect/pay-platform-fee/${plan.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex-shrink-0 flex items-center gap-1">
                    💳 Pay ₹{fee} →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ❌ Rejected Plans Alert */}
      {rejectedPlans.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 mb-6">
          <h2 className="text-red-700 font-bold text-sm mb-3 flex items-center gap-2">
            ❌ {rejectedPlans.length} Plan{rejectedPlans.length > 1 ? "s" : ""} Rejected — Action Required
          </h2>
          <div className="space-y-3">
            {rejectedPlans.map((plan) => (
              <div key={plan.id} className="bg-white border border-red-200 rounded-lg p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {(plan.exterior_render_url || plan.image_url) && (
                    <img src={plan.exterior_render_url || plan.image_url} alt={plan.title}
                      className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{plan.title}</p>
                    {plan.plan_code && (
                      <p className="text-teal-600 font-mono text-xs">{plan.plan_code}</p>
                    )}
                    {plan.rejection_reason && (
                      <p className="text-red-600 text-xs mt-1">
                        ❌ Reason: <strong>{plan.rejection_reason}</strong>
                      </p>
                    )}
                  </div>
                </div>
                <Link href={`/architect/edit-plan/${plan.id}`}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex-shrink-0">
                  ✏️ Fix & Resubmit
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className={`border-2 ${card.color} rounded-xl p-4 text-center`}>
            <p className="text-2xl mb-1">{card.icon}</p>
            <p className="text-xl font-bold">{card.value}</p>
            <p className="text-xs mt-1 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-gray-800 mb-3">Quick Actions</h2>
        <div className="flex gap-3 flex-wrap">
          <Link href="/architect/upload-plan"
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-2">
            📤 Upload New Plan
          </Link>
          <Link href="/architect/my-plans"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-2">
            📁 View My Plans
          </Link>
          <Link href="/architect/earnings"
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-2">
            💰 View Earnings
          </Link>
        </div>
      </div>

      {/* Recent Plans */}
      <div>
        <h2 className="text-base font-bold text-gray-800 mb-3">Recent Plans</h2>
        {recentPlans.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold">No plans uploaded yet</p>
            <Link href="/architect/upload-plan"
              className="mt-4 inline-block bg-teal-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-teal-700 transition">
              Upload Your First Plan →
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-center px-3 py-2.5 font-semibold text-gray-500 w-8">#</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Preview</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Plan ID</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Title</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Plot Size</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Price</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Status</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentPlans.map((plan, index) => {
                  const thumb        = plan.exterior_render_url || plan.image_url;
                  const displayPrice = plan.basic_price || plan.price;
                  const canEdit      = plan.status === "pending" || plan.status === "rejected";
                  const needsPayment = plan.status === "payment_pending";
                  const fee          = plan.platform_fee || getPlatformFee(plan.floors || "");
                  return (
                    <tr key={plan.id} className={`border-b border-gray-100 hover:bg-gray-50 ${
                      plan.status === "rejected"        ? "bg-red-50"  :
                      plan.status === "payment_pending" ? "bg-blue-50" : ""
                    }`}>
                      <td className="px-3 py-2 text-center text-gray-400 font-semibold">{index + 1}</td>
                      <td className="px-3 py-2">
                        {thumb ? (
                          <img src={thumb} alt={plan.title}
                            className="w-12 h-10 object-cover rounded-lg border border-gray-200" />
                        ) : (
                          <div className="w-12 h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-lg">🏠</div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-teal-600 font-mono font-semibold">
                          {plan.plan_code || <span className="text-gray-300 italic">No ID</span>}
                        </span>
                      </td>
                      <td className="px-3 py-2 max-w-[160px]">
                        <p className="font-medium text-gray-800 truncate">{plan.title}</p>
                        {plan.status === "rejected" && plan.rejection_reason && (
                          <p className="text-red-500 text-xs mt-0.5 truncate">❌ {plan.rejection_reason}</p>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-500">{plan.plot_size || "—"}</td>
                      <td className="px-3 py-2 text-orange-600 font-semibold">
                        ₹{displayPrice?.toLocaleString() || "—"}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge(plan.status)}`}>
                          {statusLabel(plan.status)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <Link href={`/plan/${plan.id}`}
                            className="text-teal-600 hover:underline font-medium">
                            View →
                          </Link>
                          {canEdit && (
                            <Link href={`/architect/edit-plan/${plan.id}`}
                              className="text-red-600 hover:underline font-medium">
                              ✏️ Fix
                            </Link>
                          )}
                          {needsPayment && (
                            <Link href={`/architect/pay-platform-fee/${plan.id}`}
                              className="text-blue-600 hover:underline font-bold">
                              💳 Pay ₹{fee}
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
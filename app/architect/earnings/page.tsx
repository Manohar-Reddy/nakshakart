"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Earnings() {
  const [loading,   setLoading]   = useState(true);
  const [plans,     setPlans]     = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [platformFees, setPlatformFees] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"sales" | "plans" | "platform">("sales");
  const [filterPlan, setFilterPlan] = useState("all");

  const [stats, setStats] = useState({
    totalSales:        0,
    totalRevenue:      0,
    totalEarnings:     0,
    nakshakartFee:     0,
    avgPerSale:        0,
    basicSales:        0,
    premiumSales:      0,
    totalPlatformFees: 0,
    livePlans:         0,
    totalPlans:        0,
  });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all architect's plans
      const { data: plansData } = await supabase
        .from("plans")
        .select("id, title, price, basic_price, premium_price, plot_size, floors, status, plan_code, platform_fee, platform_fee_paid, platform_fee_paid_at, live_at, created_at, exterior_render_url, image_url")
        .eq("architect_id", user.id)
        .order("created_at", { ascending: false });

      if (!plansData || plansData.length === 0) { setLoading(false); return; }

      setPlans(plansData);
      const planIds = plansData.map((p) => p.id);
      const planMap = Object.fromEntries(plansData.map((p) => [p.id, p]));

      // Get all purchases for this architect's plans
      const { data: purchaseData } = await supabase
        .from("purchases")
        .select("*, users:user_id(name, email)")
        .in("plan_id", planIds)
        .order("created_at", { ascending: false });

      if (purchaseData) {
        const completed    = purchaseData.filter((p) => p.status === "completed");
        const basicSales   = completed.filter((p) => p.package_type === "basic" || !p.package_type).length;
        const premiumSales = completed.filter((p) => p.package_type === "premium").length;
        const totalRevenue = completed.reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalEarnings = Math.round(totalRevenue * 0.8);
        const nakshakartFee = Math.round(totalRevenue * 0.2);

        setPurchases(purchaseData.map((p) => ({ ...p, plan: planMap[p.plan_id] })));

        // Platform fees paid
        const feesPaid = plansData.filter((p) => p.platform_fee_paid);
        const totalPlatformFees = feesPaid.reduce((sum, p) => sum + (p.platform_fee || 99), 0);

        setPlatformFees(feesPaid);

        setStats({
          totalSales:        completed.length,
          totalRevenue:      Math.round(totalRevenue),
          totalEarnings,
          nakshakartFee,
          avgPerSale:        completed.length > 0 ? Math.round(totalEarnings / completed.length) : 0,
          basicSales,
          premiumSales,
          totalPlatformFees: Math.round(totalPlatformFees),
          livePlans:         plansData.filter((p) => p.status === "live").length,
          totalPlans:        plansData.length,
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  const filteredPurchases = filterPlan === "all"
    ? purchases
    : purchases.filter((p) => p.plan_id === filterPlan);

  const livePlans = plans.filter((p) => p.status === "live");

  if (loading) return <div className="p-10 text-center text-gray-500">Loading earnings...</div>;

  return (
    <div className="p-6 max-w-6xl">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">💰 Earnings & Transactions</h1>
        <p className="text-gray-500 text-sm mt-1">Complete financial overview of your plans</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
          <p className="text-3xl mb-1">💰</p>
          <p className="text-2xl font-bold text-green-700">₹{stats.totalEarnings.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Total Earnings (80%)</p>
        </div>
        <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4 text-center">
          <p className="text-3xl mb-1">🛒</p>
          <p className="text-2xl font-bold text-teal-700">{stats.totalSales}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Total Sales</p>
          <p className="text-xs text-gray-400">{stats.basicSales} Basic · {stats.premiumSales} Premium</p>
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
          <p className="text-3xl mb-1">📊</p>
          <p className="text-2xl font-bold text-blue-700">₹{stats.avgPerSale.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Avg. per Sale</p>
        </div>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 text-center">
          <p className="text-3xl mb-1">🟢</p>
          <p className="text-2xl font-bold text-purple-700">{stats.livePlans}/{stats.totalPlans}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Live Plans</p>
        </div>
      </div>

      {/* Revenue breakdown */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💳 Revenue Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
            <p className="text-lg font-bold text-gray-800">₹{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-400">100% of sales</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Your Earnings</p>
            <p className="text-lg font-bold text-green-700">₹{stats.totalEarnings.toLocaleString()}</p>
            <p className="text-xs text-green-500">80% of sales</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">NakshaKart (20%)</p>
            <p className="text-lg font-bold text-orange-600">₹{stats.nakshakartFee.toLocaleString()}</p>
            <p className="text-xs text-orange-400">Commission</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Platform Fees Paid</p>
            <p className="text-lg font-bold text-blue-700">₹{stats.totalPlatformFees.toLocaleString()}</p>
            <p className="text-xs text-blue-400">{platformFees.length} plans</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b border-gray-200">
        {[
          { key: "sales",    label: `🛒 Sales (${purchases.length})`               },
          { key: "plans",    label: `📁 Per Plan (${livePlans.length} live)`        },
          { key: "platform", label: `💳 Platform Fees (${platformFees.length})`     },
        ].map((tab) => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === tab.key
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: Sales Transactions ── */}
      {activeTab === "sales" && (
        <div>
          {/* Filter by plan */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <p className="text-sm text-gray-600 font-medium">Filter by plan:</p>
            <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Plans</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            <span className="text-xs text-gray-400">{filteredPurchases.length} transactions</span>
          </div>

          {filteredPurchases.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-semibold">No sales yet</p>
              <p className="text-sm mt-1">Once customers buy your plans, transactions appear here</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Plan</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Package</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Buyer</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Sale Price</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">NakshaKart (20%)</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Your Earning (80%)</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((purchase, index) => {
                    const earning     = Math.round((purchase.amount || 0) * 0.8);
                    const commission  = Math.round((purchase.amount || 0) * 0.2);
                    const isBasic     = purchase.package_type === "basic" || !purchase.package_type;
                    return (
                      <tr key={purchase.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400 text-xs">{index + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 text-xs">{purchase.plan?.title || "—"}</p>
                          <p className="text-xs text-teal-600 font-mono">{purchase.plan?.plan_code || ""}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isBasic ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                          }`}>
                            {isBasic ? "📦 Basic" : "⭐ Premium"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-700 font-medium">{purchase.users?.name || "Customer"}</p>
                          <p className="text-xs text-gray-400">{purchase.users?.email || ""}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800 text-xs">
                          ₹{purchase.amount?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-xs text-orange-600 font-semibold">
                          ₹{commission.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-bold text-green-700 text-xs">
                          ₹{earning.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {new Date(purchase.created_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                          <p className="text-gray-400">
                            {new Date(purchase.created_at).toLocaleTimeString("en-IN", {
                              hour: "2-digit", minute: "2-digit"
                            })}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            purchase.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {purchase.status === "completed" ? "✅ Paid" : "⏳ Pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Totals row */}
                {filteredPurchases.length > 0 && (
                  <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 font-bold text-gray-700 text-xs">
                        Total ({filteredPurchases.length} transactions)
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-800 text-xs">
                        ₹{filteredPurchases.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-bold text-orange-600 text-xs">
                        ₹{filteredPurchases.reduce((s, p) => s + Math.round((p.amount || 0) * 0.2), 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-bold text-green-700 text-xs">
                        ₹{filteredPurchases.reduce((s, p) => s + Math.round((p.amount || 0) * 0.8), 0).toLocaleString()}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: Per Plan Summary ── */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          {plans.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-semibold">No plans yet</p>
            </div>
          ) : (
            plans.map((plan) => {
              const planPurchases = purchases.filter((p) => p.plan_id === plan.id && p.status === "completed");
              const revenue       = planPurchases.reduce((s, p) => s + (p.amount || 0), 0);
              const earnings      = Math.round(revenue * 0.8);
              const thumb         = plan.exterior_render_url || plan.image_url;
              return (
                <div key={plan.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition">
                  <div className="flex items-start gap-4">
                    {thumb ? (
                      <img src={thumb} alt={plan.title}
                        className="w-16 h-16 object-cover rounded-xl flex-shrink-0 border border-gray-100" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">🏠</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="text-xs text-teal-600 font-mono font-semibold">{plan.plan_code}</p>
                          <p className="font-bold text-gray-800">{plan.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            📐 {plan.plot_size || "—"} · 🏢 {plan.floors || "—"} ·
                            Basic: ₹{plan.basic_price?.toLocaleString() || "—"}
                            {plan.premium_price && ` · Premium: ₹${plan.premium_price?.toLocaleString()}`}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                          plan.status === "live"            ? "bg-green-100 text-green-700"  :
                          plan.status === "payment_pending" ? "bg-blue-100 text-blue-700"   :
                          plan.status === "pending"         ? "bg-yellow-100 text-yellow-700":
                          "bg-red-100 text-red-700"
                        }`}>
                          {plan.status === "live"            ? "🟢 Live"            :
                           plan.status === "payment_pending" ? "💳 Pay to go live"  :
                           plan.status === "pending"         ? "⏳ Pending"         :
                           "❌ Rejected"}
                        </span>
                      </div>

                      {/* Plan stats */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                        <div className="bg-teal-50 rounded-lg p-2 text-center">
                          <p className="text-sm font-bold text-teal-700">{planPurchases.length}</p>
                          <p className="text-xs text-gray-500">Sales</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <p className="text-sm font-bold text-gray-700">₹{revenue.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Revenue</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2 text-center">
                          <p className="text-sm font-bold text-green-700">₹{earnings.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Your Earnings</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-2 text-center">
                          <p className="text-sm font-bold text-orange-600">₹{Math.round(revenue * 0.2).toLocaleString()}</p>
                          <p className="text-xs text-gray-500">NakshaKart</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2 text-center">
                          <p className="text-sm font-bold text-blue-700">
                            {plan.platform_fee_paid ? `₹${plan.platform_fee || 99}` : "—"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {plan.platform_fee_paid ? "Fee Paid ✅" : "Fee Pending"}
                          </p>
                        </div>
                      </div>

                      {/* Platform fee info */}
                      {plan.platform_fee_paid && plan.platform_fee_paid_at && (
                        <p className="text-xs text-gray-400 mt-2">
                          Platform fee paid on {new Date(plan.platform_fee_paid_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })} · Live since {plan.live_at ? new Date(plan.live_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          }) : "—"}
                        </p>
                      )}

                      {/* Not live yet */}
                      {plan.status === "payment_pending" && (
                        <div className="mt-2 flex items-center gap-3">
                          <p className="text-xs text-blue-600">💳 Pay platform fee to start earning from this plan</p>
                          <Link href={`/architect/pay-platform-fee/${plan.id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition">
                            Pay ₹{plan.platform_fee || 99} →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── TAB 3: Platform Fees ── */}
      {activeTab === "platform" && (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-blue-700">
              💳 Platform fees are one-time payments to make your plan live on NakshaKart.
              Total paid so far: <strong>₹{stats.totalPlatformFees.toLocaleString()}</strong>
            </p>
          </div>

          {platformFees.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
              <p className="text-4xl mb-3">💳</p>
              <p className="font-semibold">No platform fees paid yet</p>
              <p className="text-sm mt-1">Pay platform fee after admin approval to go live</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Plan</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Floors</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Fee Paid</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Paid On</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Live Since</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {platformFees.map((plan, index) => (
                    <tr key={plan.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400 text-xs">{index + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 text-xs">{plan.title}</p>
                        <p className="text-xs text-teal-600 font-mono">{plan.plan_code}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{plan.floors || "—"}</td>
                      <td className="px-4 py-3 font-bold text-blue-700 text-xs">
                        ₹{plan.platform_fee || 99}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {plan.platform_fee_paid_at
                          ? new Date(plan.platform_fee_paid_at).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric"
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {plan.live_at
                          ? new Date(plan.live_at).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric"
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                          ✅ Live
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 font-bold text-gray-700 text-xs">
                      Total ({platformFees.length} plans)
                    </td>
                    <td className="px-4 py-3 font-bold text-blue-700 text-xs">
                      ₹{stats.totalPlatformFees.toLocaleString()}
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Commission info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6 flex items-start gap-3">
        <span className="text-xl">ℹ️</span>
        <div className="text-xs text-yellow-800">
          <p className="font-semibold mb-1">Commission Structure</p>
          <p>NakshaKart charges <strong>20% commission</strong> on every sale.
          You receive <strong>80%</strong> of the plan price.
          Platform fee is a one-time charge based on number of floors — no renewal fees.</p>
        </div>
      </div>
    </div>
  );
}
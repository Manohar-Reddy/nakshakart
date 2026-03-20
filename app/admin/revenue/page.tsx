"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminRevenuePage() {
  const [loading,      setLoading]      = useState(true);
  const [purchases,    setPurchases]    = useState<any[]>([]);
  const [platformFees, setPlatformFees] = useState<any[]>([]);
  const [architects,   setArchitects]   = useState<Record<string, any>>({});
  const [activeTab,    setActiveTab]    = useState<"overview" | "sales" | "platform" | "architects">("overview");
  const [filterMonth,  setFilterMonth]  = useState("all");

  const [stats, setStats] = useState({
    totalRevenue:       0,
    nakshakartEarnings: 0,
    architectEarnings:  0,
    totalSales:         0,
    basicSales:         0,
    premiumSales:       0,
    totalPlatformFees:  0,
    livePlans:          0,
    totalPlans:         0,
    totalArchitects:    0,
    avgOrderValue:      0,
  });

  useEffect(() => {
    const load = async () => {
      // All completed purchases
      const { data: purchaseData } = await supabase
        .from("purchases")
        .select("*, plans(id, title, plan_code, basic_price, premium_price, architect_id, plot_size, floors), users:user_id(name, email)")
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      // All plans with platform fee info
      const { data: plansData } = await supabase
        .from("plans")
        .select("id, title, plan_code, status, platform_fee, platform_fee_paid, platform_fee_paid_at, architect_id, floors, plot_size, live_at, created_at");

      // Architect info
      const { data: archData } = await supabase
        .from("users")
        .select("id, name, email, city, created_at")
        .eq("role", "architect");

      const archMap: Record<string, any> = {};
      archData?.forEach((a) => { archMap[a.id] = a; });
      setArchitects(archMap);

      if (purchaseData) {
        setPurchases(purchaseData);
        const totalRevenue       = purchaseData.reduce((s, p) => s + (p.amount || 0), 0);
        const nakshakartEarnings = Math.round(totalRevenue * 0.2);
        const architectEarnings  = Math.round(totalRevenue * 0.8);
        const basicSales         = purchaseData.filter((p) => p.package_type === "basic" || !p.package_type).length;
        const premiumSales       = purchaseData.filter((p) => p.package_type === "premium").length;

        const feesPaid           = plansData?.filter((p) => p.platform_fee_paid) || [];
        const totalPlatformFees  = feesPaid.reduce((s, p) => s + (p.platform_fee || 99), 0);
        setPlatformFees(feesPaid.sort((a, b) => new Date(b.platform_fee_paid_at).getTime() - new Date(a.platform_fee_paid_at).getTime()));

        setStats({
          totalRevenue:       Math.round(totalRevenue),
          nakshakartEarnings,
          architectEarnings,
          totalSales:         purchaseData.length,
          basicSales,
          premiumSales,
          totalPlatformFees:  Math.round(totalPlatformFees),
          livePlans:          plansData?.filter((p) => p.status === "live").length || 0,
          totalPlans:         plansData?.length || 0,
          totalArchitects:    archData?.length || 0,
          avgOrderValue:      purchaseData.length > 0 ? Math.round(totalRevenue / purchaseData.length) : 0,
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  // Filter purchases by month
  const filteredPurchases = filterMonth === "all"
    ? purchases
    : purchases.filter((p) => {
        const d = new Date(p.created_at);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === filterMonth;
      });

  // Get unique months for filter
  const months = [...new Set(purchases.map((p) => {
    const d = new Date(p.created_at);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }))].sort().reverse();

  // Per architect earnings
  const archEarnings = Object.entries(
    purchases.reduce((acc: Record<string, any>, p) => {
      const archId = p.plans?.architect_id;
      if (!archId) return acc;
      if (!acc[archId]) acc[archId] = { sales: 0, revenue: 0, nakshakart: 0, architect: 0 };
      acc[archId].sales++;
      acc[archId].revenue    += p.amount || 0;
      acc[archId].nakshakart += Math.round((p.amount || 0) * 0.2);
      acc[archId].architect  += Math.round((p.amount || 0) * 0.8);
      return acc;
    }, {})
  ).sort((a, b) => (b[1] as any).revenue - (a[1] as any).revenue);

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
      Loading revenue data...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">💰 Revenue Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Complete financial overview of NakshaKart</p>
          </div>
          <Link href="/admin/dashboard"
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
            ← Admin Dashboard
          </Link>
        </div>

        {/* ── Top Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-900 border border-green-700 rounded-2xl p-4 text-center">
            <p className="text-3xl mb-1">💰</p>
            <p className="text-2xl font-bold text-green-300">₹{stats.nakshakartEarnings.toLocaleString()}</p>
            <p className="text-xs text-green-400 mt-1">NakshaKart Earnings</p>
            <p className="text-xs text-gray-500 mt-0.5">20% of all sales</p>
          </div>
          <div className="bg-teal-900 border border-teal-700 rounded-2xl p-4 text-center">
            <p className="text-3xl mb-1">🛒</p>
            <p className="text-2xl font-bold text-teal-300">{stats.totalSales}</p>
            <p className="text-xs text-teal-400 mt-1">Total Sales</p>
            <p className="text-xs text-gray-500 mt-0.5">{stats.basicSales} Basic · {stats.premiumSales} Premium</p>
          </div>
          <div className="bg-blue-900 border border-blue-700 rounded-2xl p-4 text-center">
            <p className="text-3xl mb-1">💳</p>
            <p className="text-2xl font-bold text-blue-300">₹{stats.totalPlatformFees.toLocaleString()}</p>
            <p className="text-xs text-blue-400 mt-1">Platform Fees</p>
            <p className="text-xs text-gray-500 mt-0.5">{platformFees.length} plans paid</p>
          </div>
          <div className="bg-purple-900 border border-purple-700 rounded-2xl p-4 text-center">
            <p className="text-3xl mb-1">📊</p>
            <p className="text-2xl font-bold text-purple-300">₹{stats.avgOrderValue.toLocaleString()}</p>
            <p className="text-xs text-purple-400 mt-1">Avg Order Value</p>
            <p className="text-xs text-gray-500 mt-0.5">{stats.livePlans}/{stats.totalPlans} plans live</p>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-gray-800 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-white mb-4">📊 Revenue Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Total Revenue",        value: `₹${stats.totalRevenue.toLocaleString()}`,       color: "bg-gray-700 text-white",        sub: "100% of sales"     },
              { label: "NakshaKart (20%)",      value: `₹${stats.nakshakartEarnings.toLocaleString()}`, color: "bg-green-900 text-green-300",   sub: "Commission"        },
              { label: "Architects (80%)",      value: `₹${stats.architectEarnings.toLocaleString()}`,  color: "bg-blue-900 text-blue-300",     sub: "Paid to architects"},
              { label: "Platform Fees",         value: `₹${stats.totalPlatformFees.toLocaleString()}`,  color: "bg-teal-900 text-teal-300",     sub: "One-time listing"  },
              { label: "Total NakshaKart Inc.", value: `₹${(stats.nakshakartEarnings + stats.totalPlatformFees).toLocaleString()}`, color: "bg-yellow-900 text-yellow-300", sub: "Commission + Fees" },
            ].map((s) => (
              <div key={s.label} className={`${s.color} rounded-xl p-3 text-center border border-gray-700`}>
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-xs font-semibold mt-1">{s.label}</p>
                <p className="text-xs opacity-60 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 border-b border-gray-700 flex-wrap">
          {[
            { key: "overview",    label: "📈 Overview"                                  },
            { key: "sales",       label: `🛒 All Sales (${purchases.length})`           },
            { key: "platform",    label: `💳 Platform Fees (${platformFees.length})`    },
            { key: "architects",  label: `👤 By Architect (${archEarnings.length})`     },
          ].map((tab) => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
                activeTab === tab.key
                  ? "border-teal-500 text-teal-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: Overview ── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Sales by package */}
            <div className="bg-gray-800 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-4">📦 Sales by Package</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"/>
                    <span className="text-sm text-gray-300">Basic Package</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{stats.basicSales} sales</p>
                    <p className="text-xs text-gray-400">
                      {stats.totalSales > 0 ? Math.round(stats.basicSales / stats.totalSales * 100) : 0}%
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${stats.totalSales > 0 ? (stats.basicSales / stats.totalSales * 100) : 0}%` }} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"/>
                    <span className="text-sm text-gray-300">Premium Package</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{stats.premiumSales} sales</p>
                    <p className="text-xs text-gray-400">
                      {stats.totalSales > 0 ? Math.round(stats.premiumSales / stats.totalSales * 100) : 0}%
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${stats.totalSales > 0 ? (stats.premiumSales / stats.totalSales * 100) : 0}%` }} />
                </div>
              </div>
            </div>

            {/* Platform stats */}
            <div className="bg-gray-800 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-4">🏠 Platform Stats</h3>
              <div className="space-y-3">
                {[
                  { label: "Total Architects",   value: stats.totalArchitects, icon: "👤" },
                  { label: "Total Plans",         value: stats.totalPlans,      icon: "📁" },
                  { label: "Live Plans",          value: stats.livePlans,       icon: "🟢" },
                  { label: "Platform Fees Paid",  value: platformFees.length,   icon: "💳" },
                  { label: "Total Transactions",  value: stats.totalSales,      icon: "🛒" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-gray-700">
                    <span className="text-sm text-gray-400">{s.icon} {s.label}</span>
                    <span className="text-sm font-bold text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent sales */}
            <div className="bg-gray-800 rounded-2xl p-5 md:col-span-2">
              <h3 className="font-bold text-white mb-4">🕐 Recent Sales</h3>
              {purchases.slice(0, 5).length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No sales yet</p>
              ) : (
                <div className="space-y-2">
                  {purchases.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between bg-gray-700 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{p.plans?.title || "—"}</p>
                        <p className="text-xs text-gray-400">
                          {p.users?.name || "Customer"} ·
                          {p.package_type === "premium" ? " ⭐ Premium" : " 📦 Basic"} ·
                          {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">₹{p.amount?.toLocaleString()}</p>
                        <p className="text-xs text-green-400">NK: ₹{Math.round((p.amount || 0) * 0.2).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: All Sales ── */}
        {activeTab === "sales" && (
          <div>
            {/* Month filter */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <p className="text-sm text-gray-400">Filter by month:</p>
              <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none">
                <option value="all">All Time</option>
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <span className="text-xs text-gray-500">{filteredPurchases.length} transactions</span>
              <span className="text-xs text-green-400">
                NK Earnings: ₹{filteredPurchases.reduce((s, p) => s + Math.round((p.amount || 0) * 0.2), 0).toLocaleString()}
              </span>
            </div>

            {filteredPurchases.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-12 text-center text-gray-500">
                <p className="text-4xl mb-3">📭</p>
                <p>No sales found</p>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700 border-b border-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300">#</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300">Plan</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300">Package</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300">Buyer</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300">Architect</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300">Sale Price</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300">NK (20%)</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300">Arch (80%)</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.map((p, index) => {
                      const nk   = Math.round((p.amount || 0) * 0.2);
                      const arch = Math.round((p.amount || 0) * 0.8);
                      const archInfo = architects[p.plans?.architect_id];
                      return (
                        <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-750">
                          <td className="px-4 py-3 text-gray-500 text-xs">{index + 1}</td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-medium text-white">{p.plans?.title || "—"}</p>
                            <p className="text-xs text-teal-400 font-mono">{p.plans?.plan_code || ""}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              p.package_type === "premium"
                                ? "bg-purple-900 text-purple-300"
                                : "bg-blue-900 text-blue-300"
                            }`}>
                              {p.package_type === "premium" ? "⭐ Premium" : "📦 Basic"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-white">{p.users?.name || "Customer"}</p>
                            <p className="text-xs text-gray-500">{p.users?.email || ""}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-white">{archInfo?.name || "—"}</p>
                            <p className="text-xs text-gray-500">{archInfo?.city || ""}</p>
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-white">
                            ₹{p.amount?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-green-400">
                            ₹{nk.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-blue-400">
                            ₹{arch.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {new Date(p.created_at).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric"
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-700 border-t-2 border-gray-600">
                    <tr>
                      <td colSpan={5} className="px-4 py-3 text-xs font-bold text-gray-300">
                        Total ({filteredPurchases.length})
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-white">
                        ₹{filteredPurchases.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-green-400">
                        ₹{filteredPurchases.reduce((s, p) => s + Math.round((p.amount || 0) * 0.2), 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-blue-400">
                        ₹{filteredPurchases.reduce((s, p) => s + Math.round((p.amount || 0) * 0.8), 0).toLocaleString()}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Platform Fees ── */}
        {activeTab === "platform" && (
          <div>
            <div className="bg-blue-900 border border-blue-700 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-300">
                💳 Total platform fees collected: <strong>₹{stats.totalPlatformFees.toLocaleString()}</strong>
                from <strong>{platformFees.length}</strong> plans
              </p>
            </div>
            {platformFees.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-12 text-center text-gray-500">
                <p className="text-4xl mb-3">💳</p>
                <p>No platform fees collected yet</p>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700 border-b border-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300">#</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300">Plan</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300">Architect</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300">Floors</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300">Fee</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300">Paid On</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300">Live Since</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformFees.map((plan, index) => {
                      const arch = architects[plan.architect_id];
                      return (
                        <tr key={plan.id} className="border-b border-gray-700 hover:bg-gray-750">
                          <td className="px-4 py-3 text-gray-500 text-xs">{index + 1}</td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-medium text-white">{plan.title}</p>
                            <p className="text-xs text-teal-400 font-mono">{plan.plan_code}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-white">{arch?.name || "—"}</p>
                            <p className="text-xs text-gray-500">{arch?.city || ""}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-300">{plan.floors || "—"}</td>
                          <td className="px-4 py-3 text-xs font-bold text-blue-300">
                            ₹{plan.platform_fee || 99}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {plan.platform_fee_paid_at
                              ? new Date(plan.platform_fee_paid_at).toLocaleDateString("en-IN", {
                                  day: "numeric", month: "short", year: "numeric"
                                })
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {plan.live_at
                              ? new Date(plan.live_at).toLocaleDateString("en-IN", {
                                  day: "numeric", month: "short", year: "numeric"
                                })
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-700 border-t-2 border-gray-600">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-xs font-bold text-gray-300">
                        Total ({platformFees.length} plans)
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-blue-300">
                        ₹{stats.totalPlatformFees.toLocaleString()}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: By Architect ── */}
        {activeTab === "architects" && (
          <div className="space-y-3">
            {archEarnings.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-12 text-center text-gray-500">
                <p className="text-4xl mb-3">👤</p>
                <p>No architect sales yet</p>
              </div>
            ) : (
              archEarnings.map(([archId, data]: [string, any], index) => {
                const arch     = architects[archId];
                const archPlans = platformFees.filter((p) => p.architect_id === archId);
                return (
                  <div key={archId} className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-800 rounded-full flex items-center justify-center text-teal-300 font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-white">{arch?.name || "Unknown"}</p>
                          <p className="text-xs text-gray-400">{arch?.email || ""} · {arch?.city || ""}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {archPlans.length} live plans · {data.sales} sales
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-gray-700 rounded-xl p-2">
                          <p className="text-sm font-bold text-white">₹{data.revenue.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">Revenue</p>
                        </div>
                        <div className="bg-green-900 rounded-xl p-2">
                          <p className="text-sm font-bold text-green-300">₹{data.nakshakart.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">NakshaKart</p>
                        </div>
                        <div className="bg-blue-900 rounded-xl p-2">
                          <p className="text-sm font-bold text-blue-300">₹{data.architect.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">Architect</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </main>
    </div>
  );
}
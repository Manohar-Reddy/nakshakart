import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function AdminDashboard() {
  const { data: plans }     = await supabase.from("plans").select("*");
  const { data: users }     = await supabase.from("users").select("*");
  const { data: purchases } = await supabase.from("purchases").select("*").eq("status", "completed");

  const totalPlans     = plans?.length || 0;
  const totalUsers     = users?.length || 0;
  const totalPurchases = purchases?.length || 0;
  const pendingPlans   = plans?.filter((p) => p.status === "pending").length || 0;
  const livePlans      = plans?.filter((p) => p.status === "live").length || 0;
  const paymentPending = plans?.filter((p) => p.status === "payment_pending").length || 0;
  const totalRevenue   = purchases?.reduce((s, p) => s + (p.amount || 0), 0) || 0;
  const nkEarnings     = Math.round(totalRevenue * 0.2);
  const platformFees   = plans?.filter((p) => p.platform_fee_paid).reduce((s, p) => s + (p.platform_fee || 99), 0) || 0;
  const totalNKIncome  = nkEarnings + platformFees;

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* Admin Navbar */}
      <nav className="bg-gray-800 px-8 py-4 flex items-center justify-between border-b border-gray-700">
        <div>
          <h1 className="text-xl font-bold text-white">
            Naksha<span className="text-orange-400">Kart</span>
            <span className="text-gray-400 text-sm font-normal ml-2">Admin Panel</span>
          </h1>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <Link href="/admin/plans"
            className="text-gray-300 hover:text-white text-sm transition">
            Plans
          </Link>
          <Link href="/admin/review"
            className="text-teal-400 hover:text-teal-300 text-sm font-semibold transition">
            🔍 Review
          </Link>
          <Link href="/admin/revenue"
            className="text-green-400 hover:text-green-300 text-sm font-semibold transition">
            💰 Revenue
          </Link>
          <Link href="/admin/users"
            className="text-gray-300 hover:text-white text-sm transition">
            Users
          </Link>
          <Link href="/admin/purchases"
            className="text-gray-300 hover:text-white text-sm transition">
            Purchases
          </Link>
          <Link href="/"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            View Website
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10">
        <h2 className="text-2xl font-bold mb-1">Dashboard Overview</h2>
        <p className="text-gray-400 mb-8 text-sm">Welcome back, Admin! Here's what's happening on NakshaKart.</p>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-xs mb-1">Total Plans</p>
            <p className="text-4xl font-bold text-orange-400">{totalPlans}</p>
            <p className="text-gray-500 text-xs mt-2">
              🟢 {livePlans} Live · ⏳ {pendingPlans} Pending
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-xs mb-1">Total Users</p>
            <p className="text-4xl font-bold text-teal-400">{totalUsers}</p>
            <p className="text-gray-500 text-xs mt-2">Architects + Customers</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-xs mb-1">Total Sales</p>
            <p className="text-4xl font-bold text-green-400">{totalPurchases}</p>
            <p className="text-gray-500 text-xs mt-2">Completed purchases</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-xs mb-1">Pending Review</p>
            <p className="text-4xl font-bold text-yellow-400">{pendingPlans}</p>
            <p className="text-gray-500 text-xs mt-2">
              💳 {paymentPending} awaiting payment
            </p>
          </div>
        </div>

        {/* ── Revenue Summary ── */}
        <div className="bg-gradient-to-r from-green-900 to-teal-900 border border-green-700 rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="font-bold text-white text-lg">💰 NakshaKart Revenue</h3>
            <Link href="/admin/revenue"
              className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition">
              View Full Revenue Dashboard →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black bg-opacity-20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">₹{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-300 mt-1">Total Sales Revenue</p>
            </div>
            <div className="bg-black bg-opacity-20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-300">₹{nkEarnings.toLocaleString()}</p>
              <p className="text-xs text-green-400 mt-1">Commission (20%)</p>
            </div>
            <div className="bg-black bg-opacity-20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-300">₹{platformFees.toLocaleString()}</p>
              <p className="text-xs text-blue-400 mt-1">Platform Fees</p>
            </div>
            <div className="bg-black bg-opacity-20 rounded-xl p-3 text-center border-2 border-yellow-500">
              <p className="text-2xl font-bold text-yellow-300">₹{totalNKIncome.toLocaleString()}</p>
              <p className="text-xs text-yellow-400 mt-1">Total NakshaKart Income</p>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/plans"
            className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-orange-500 transition group">
            <div className="text-3xl mb-3">📐</div>
            <h4 className="font-bold text-white group-hover:text-orange-400 transition text-sm">Manage Plans</h4>
            <p className="text-gray-400 text-xs mt-1">Approve, reject or edit plans</p>
          </Link>
          <Link href="/admin/review"
            className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-teal-500 transition group">
            <div className="text-3xl mb-3">🔍</div>
            <h4 className="font-bold text-white group-hover:text-teal-400 transition text-sm">Quick Review</h4>
            <p className="text-gray-400 text-xs mt-1">
              Review pending plans
              {pendingPlans > 0 && (
                <span className="ml-1 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {pendingPlans}
                </span>
              )}
            </p>
          </Link>
          <Link href="/admin/revenue"
            className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-green-500 transition group">
            <div className="text-3xl mb-3">💰</div>
            <h4 className="font-bold text-white group-hover:text-green-400 transition text-sm">Revenue Dashboard</h4>
            <p className="text-gray-400 text-xs mt-1">Track earnings & commissions</p>
          </Link>
          <Link href="/admin/users"
            className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-purple-500 transition group">
            <div className="text-3xl mb-3">👥</div>
            <h4 className="font-bold text-white group-hover:text-purple-400 transition text-sm">Manage Users</h4>
            <p className="text-gray-400 text-xs mt-1">View and manage all users</p>
          </Link>
        </div>

        {/* ── Recent Plans ── */}
        <h3 className="text-lg font-bold mb-4">Recent Plans</h3>
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-gray-300 text-xs">Plan</th>
                <th className="px-4 py-3 text-left text-gray-300 text-xs">Plot Size</th>
                <th className="px-4 py-3 text-left text-gray-300 text-xs">Floors</th>
                <th className="px-4 py-3 text-left text-gray-300 text-xs">Price</th>
                <th className="px-4 py-3 text-left text-gray-300 text-xs">Status</th>
                <th className="px-4 py-3 text-left text-gray-300 text-xs">Action</th>
              </tr>
            </thead>
            <tbody>
              {plans?.slice(0, 10).map((plan) => (
                <tr key={plan.id} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="px-4 py-3">
                    <p className="text-white text-xs font-medium">{plan.title}</p>
                    {plan.plan_code && (
                      <p className="text-teal-400 font-mono text-xs">{plan.plan_code}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs">{plan.plot_size || "—"}</td>
                  <td className="px-4 py-3 text-gray-300 text-xs">{plan.floors || "—"}</td>
                  <td className="px-4 py-3 text-green-400 text-xs font-semibold">
                    ₹{(plan.basic_price || plan.price)?.toLocaleString() || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      plan.status === "live"            ? "bg-green-900 text-green-300"  :
                      plan.status === "payment_pending" ? "bg-blue-900 text-blue-300"   :
                      plan.status === "rejected"        ? "bg-red-900 text-red-300"     :
                      "bg-yellow-900 text-yellow-300"
                    }`}>
                      {plan.status === "live"            ? "🟢 Live"     :
                       plan.status === "payment_pending" ? "💳 Pay"      :
                       plan.status === "rejected"        ? "❌ Rejected" :
                       "⏳ Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href="/admin/plans"
                      className="text-orange-400 hover:text-orange-300 text-xs font-medium">
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
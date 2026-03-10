import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function AdminDashboard() {
  const { data: plans } = await supabase.from("plans").select("*");
  const { data: users } = await supabase.from("users").select("*");
  const { data: purchases } = await supabase.from("purchases").select("*");

  const totalPlans = plans?.length || 0;
  const totalUsers = users?.length || 0;
  const totalPurchases = purchases?.length || 0;

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
        <div className="flex gap-4 items-center">
          <Link href="/admin/plans" className="text-gray-300 hover:text-white text-sm transition">
            Plans
          </Link>
          <Link href="/admin/users" className="text-gray-300 hover:text-white text-sm transition">
            Users
          </Link>
          <Link href="/admin/purchases" className="text-gray-300 hover:text-white text-sm transition">
            Purchases
          </Link>
          <Link
            href="/"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            View Website
          </Link>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-8 py-10">
        <h2 className="text-2xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-gray-400 mb-8">Welcome back, Admin! Here's what's happening on NakshaKart.</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Plans</p>
            <p className="text-4xl font-bold text-orange-400">{totalPlans}</p>
            <p className="text-gray-500 text-xs mt-2">All house plans</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Users</p>
            <p className="text-4xl font-bold text-teal-400">{totalUsers}</p>
            <p className="text-gray-500 text-xs mt-2">Registered users</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Purchases</p>
            <p className="text-4xl font-bold text-green-400">{totalPurchases}</p>
            <p className="text-gray-500 text-xs mt-2">Completed orders</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Pending Approval</p>
            <p className="text-4xl font-bold text-yellow-400">
              {plans?.filter(p => p.status === "pending").length || 0}
            </p>
            <p className="text-gray-500 text-xs mt-2">Plans waiting review</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link href="/admin/plans" className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-orange-500 transition group">
            <div className="text-3xl mb-3">📐</div>
            <h4 className="font-bold text-white group-hover:text-orange-400 transition">Manage Plans</h4>
            <p className="text-gray-400 text-sm mt-1">Approve, reject or edit house plans</p>
          </Link>
          <Link href="/admin/users" className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-teal-500 transition group">
            <div className="text-3xl mb-3">👥</div>
            <h4 className="font-bold text-white group-hover:text-teal-400 transition">Manage Users</h4>
            <p className="text-gray-400 text-sm mt-1">View and manage all users</p>
          </Link>
          <Link href="/admin/purchases" className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-green-500 transition group">
            <div className="text-3xl mb-3">💰</div>
            <h4 className="font-bold text-white group-hover:text-green-400 transition">View Purchases</h4>
            <p className="text-gray-400 text-sm mt-1">Track all orders and revenue</p>
          </Link>
        </div>

        {/* Recent Plans */}
        <h3 className="text-lg font-bold mb-4">Recent Plans</h3>
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-gray-300">Plan Title</th>
                <th className="px-6 py-3 text-left text-gray-300">Plot Size</th>
                <th className="px-6 py-3 text-left text-gray-300">Bedrooms</th>
                <th className="px-6 py-3 text-left text-gray-300">Price</th>
                <th className="px-6 py-3 text-left text-gray-300">Status</th>
                <th className="px-6 py-3 text-left text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {plans?.map((plan) => (
                <tr key={plan.id} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="px-6 py-4 text-white">{plan.title}</td>
                  <td className="px-6 py-4 text-gray-300">{plan.plot_size}</td>
                  <td className="px-6 py-4 text-gray-300">{plan.bedrooms}</td>
                  <td className="px-6 py-4 text-green-400">₹{plan.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      plan.status === "approved"
                        ? "bg-green-900 text-green-300"
                        : plan.status === "rejected"
                        ? "bg-red-900 text-red-300"
                        : "bg-yellow-900 text-yellow-300"
                    }`}>
                      {plan.status || "pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/plans`}
                      className="text-orange-400 hover:text-orange-300 text-xs font-medium"
                    >
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
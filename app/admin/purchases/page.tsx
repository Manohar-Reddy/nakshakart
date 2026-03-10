import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function AdminPurchasesPage() {
  const { data: purchases } = await supabase
    .from("purchases")
    .select("*, plans(title, price), users(name, email)")
    .order("created_at", { ascending: false });

  const totalRevenue = purchases?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-8 py-4 flex items-center justify-between border-b border-gray-700">
        <h1 className="text-xl font-bold">
          Naksha<span className="text-orange-400">Kart</span>
          <span className="text-gray-400 text-sm font-normal ml-2">Admin Panel</span>
        </h1>
        <div className="flex gap-4 items-center">
          <Link href="/admin/dashboard" className="text-gray-300 hover:text-white text-sm">Dashboard</Link>
          <Link href="/admin/plans" className="text-gray-300 hover:text-white text-sm">Plans</Link>
          <Link href="/admin/users" className="text-gray-300 hover:text-white text-sm">Users</Link>
          <Link href="/admin/purchases" className="text-orange-400 text-sm font-semibold">Purchases</Link>
          <Link href="/" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition">
            View Website
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Purchases</h2>
            <p className="text-gray-400 mt-1">Track all orders and revenue</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Purchases</p>
            <p className="text-4xl font-bold text-green-400">{purchases?.length || 0}</p>
            <p className="text-gray-500 text-xs mt-2">All time orders</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
            <p className="text-4xl font-bold text-orange-400">₹{totalRevenue}</p>
            <p className="text-gray-500 text-xs mt-2">All time earnings</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Completed</p>
            <p className="text-4xl font-bold text-teal-400">
              {purchases?.filter(p => p.status === "completed").length || 0}
            </p>
            <p className="text-gray-500 text-xs mt-2">Successful orders</p>
          </div>
        </div>

        {/* Purchases Table */}
        {purchases && purchases.length > 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-300">Customer</th>
                  <th className="px-6 py-4 text-left text-gray-300">Email</th>
                  <th className="px-6 py-4 text-left text-gray-300">Plan</th>
                  <th className="px-6 py-4 text-left text-gray-300">Amount</th>
                  <th className="px-6 py-4 text-left text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-gray-300">Date</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-t border-gray-700 hover:bg-gray-750">
                    <td className="px-6 py-4 text-white font-medium">
                      {purchase.users?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {purchase.users?.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {purchase.plans?.title || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-green-400 font-semibold">
                      ₹{purchase.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-green-900 text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                        {purchase.status || "completed"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <p className="text-4xl mb-4">💰</p>
            <p className="text-gray-400">No purchases yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}

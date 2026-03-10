import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function AdminPlansPage() {
  const { data: plans } = await supabase
    .from("plans")
    .select("*");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-8 py-4 flex items-center justify-between border-b border-gray-700">
        <h1 className="text-xl font-bold">
          Naksha<span className="text-orange-400">Kart</span>
          <span className="text-gray-400 text-sm font-normal ml-2">Admin Panel</span>
        </h1>
        <div className="flex gap-4 items-center">
          <Link href="/admin/dashboard" className="text-gray-300 hover:text-white text-sm">Dashboard</Link>
          <Link href="/admin/plans" className="text-orange-400 text-sm font-semibold">Plans</Link>
          <Link href="/admin/users" className="text-gray-300 hover:text-white text-sm">Users</Link>
          <Link href="/" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition">
            View Website
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Manage Plans</h2>
            <p className="text-gray-400 mt-1">Approve or reject house plans</p>
          </div>
          <div className="flex gap-3">
            <span className="bg-yellow-900 text-yellow-300 px-3 py-1 rounded-full text-sm">
              {plans?.filter(p => !p.status || p.status === "pending").length} Pending
            </span>
            <span className="bg-green-900 text-green-300 px-3 py-1 rounded-full text-sm">
              {plans?.filter(p => p.status === "approved").length} Approved
            </span>
            <span className="bg-red-900 text-red-300 px-3 py-1 rounded-full text-sm">
              {plans?.filter(p => p.status === "rejected").length} Rejected
            </span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-gray-300">Plan Title</th>
                <th className="px-6 py-4 text-left text-gray-300">Plot Size</th>
                <th className="px-6 py-4 text-left text-gray-300">Bedrooms</th>
                <th className="px-6 py-4 text-left text-gray-300">Price</th>
                <th className="px-6 py-4 text-left text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans?.map((plan) => (
                <tr key={plan.id} className="border-t border-gray-700">
                  <td className="px-6 py-4 text-white font-medium">{plan.title}</td>
                  <td className="px-6 py-4 text-gray-300">{plan.plot_size}</td>
                  <td className="px-6 py-4 text-gray-300">{plan.bedrooms}</td>
                  <td className="px-6 py-4 text-green-400 font-semibold">₹{plan.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/plans/${plan.id}/approve`}
                        className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition"
                      >
                        ✅ Approve
                      </Link>
                      <Link
                        href={`/admin/plans/${plan.id}/reject`}
                        className="bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition"
                      >
                        ❌ Reject
                      </Link>
                    </div>
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
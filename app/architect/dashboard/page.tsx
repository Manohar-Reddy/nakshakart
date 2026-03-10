import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function ArchitectDashboard() {
  const { data: plans } = await supabase
    .from("plans")
    .select("*");

  const totalPlans = plans?.length || 0;
  const approvedPlans = plans?.filter(p => p.status === "approved").length || 0;
  const pendingPlans = plans?.filter(p => !p.status || p.status === "pending").length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white px-8 py-4 flex items-center justify-between shadow-md border-b-4 border-teal-600">
        <div>
          <h1 className="text-xl font-bold text-teal-700">
            Naksha<span className="text-orange-500">Kart</span>
          </h1>
          <p className="text-xs text-gray-400">Architect Panel</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/architect/dashboard" className="text-teal-600 font-semibold text-sm">Dashboard</Link>
          <Link href="/architect/my-plans" className="text-gray-600 hover:text-teal-600 text-sm">My Plans</Link>
          <Link href="/architect/upload-plan" className="text-gray-600 hover:text-teal-600 text-sm">Upload Plan</Link>
          <Link href="/architect/profile" className="text-gray-600 hover:text-teal-600 text-sm">Profile</Link>
          <Link href="/" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            View Website
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, Architect! 👋</h2>
        <p className="text-gray-500 mb-8">Here's an overview of your plans and performance.</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm mb-1">Total Plans</p>
            <p className="text-4xl font-bold text-teal-600">{totalPlans}</p>
            <p className="text-gray-400 text-xs mt-2">All uploaded plans</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm mb-1">Approved</p>
            <p className="text-4xl font-bold text-green-500">{approvedPlans}</p>
            <p className="text-gray-400 text-xs mt-2">Live on marketplace</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm mb-1">Pending Review</p>
            <p className="text-4xl font-bold text-yellow-500">{pendingPlans}</p>
            <p className="text-gray-400 text-xs mt-2">Waiting for approval</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm mb-1">Total Earnings</p>
            <p className="text-4xl font-bold text-orange-500">₹0</p>
            <p className="text-gray-400 text-xs mt-2">Revenue earned</p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link href="/architect/upload-plan" className="bg-white border border-gray-100 rounded-xl p-6 hover:border-teal-500 hover:shadow-md transition group">
            <div className="text-3xl mb-3">📤</div>
            <h4 className="font-bold text-gray-800 group-hover:text-teal-600 transition">Upload New Plan</h4>
            <p className="text-gray-400 text-sm mt-1">Submit a new house plan for review</p>
          </Link>
          <Link href="/architect/my-plans" className="bg-white border border-gray-100 rounded-xl p-6 hover:border-orange-500 hover:shadow-md transition group">
            <div className="text-3xl mb-3">📐</div>
            <h4 className="font-bold text-gray-800 group-hover:text-orange-500 transition">My Plans</h4>
            <p className="text-gray-400 text-sm mt-1">View and manage your uploaded plans</p>
          </Link>
          <Link href="/architect/profile" className="bg-white border border-gray-100 rounded-xl p-6 hover:border-blue-500 hover:shadow-md transition group">
            <div className="text-3xl mb-3">👤</div>
            <h4 className="font-bold text-gray-800 group-hover:text-blue-500 transition">My Profile</h4>
            <p className="text-gray-400 text-sm mt-1">Update your architect profile</p>
          </Link>
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Plans</h3>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-gray-500">Plan Title</th>
                <th className="px-6 py-4 text-left text-gray-500">Plot Size</th>
                <th className="px-6 py-4 text-left text-gray-500">Price</th>
                <th className="px-6 py-4 text-left text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {plans?.map((plan) => (
                <tr key={plan.id} className="border-t border-gray-100">
                  <td className="px-6 py-4 font-medium text-gray-800">{plan.title}</td>
                  <td className="px-6 py-4 text-gray-500">{plan.plot_size}</td>
                  <td className="px-6 py-4 text-green-600 font-semibold">₹{plan.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      plan.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : plan.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {plan.status || "pending"}
                    </span>
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
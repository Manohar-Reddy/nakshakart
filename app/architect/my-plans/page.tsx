import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function MyPlansPage() {
  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .order("created_at", { ascending: false });

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
          <Link href="/architect/dashboard" className="text-gray-600 hover:text-teal-600 text-sm">Dashboard</Link>
          <Link href="/architect/my-plans" className="text-teal-600 font-semibold text-sm">My Plans</Link>
          <Link href="/architect/upload-plan" className="text-gray-600 hover:text-teal-600 text-sm">Upload Plan</Link>
          <Link href="/" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition">
            View Website
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Plans</h2>
            <p className="text-gray-500 mt-1">Manage all your uploaded house plans</p>
          </div>
          <Link
            href="/architect/upload-plan"
            className="bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 transition font-medium text-sm"
          >
            + Upload New Plan
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-teal-600">{plans?.length || 0}</p>
            <p className="text-gray-400 text-sm">Total Plans</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-green-500">
              {plans?.filter(p => p.status === "approved").length || 0}
            </p>
            <p className="text-gray-400 text-sm">Approved</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-yellow-500">
              {plans?.filter(p => !p.status || p.status === "pending").length || 0}
            </p>
            <p className="text-gray-400 text-sm">Pending</p>
          </div>
        </div>

        {/* Plans Grid */}
        {plans && plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
              >
                <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-6 text-center">
                  <span className="text-4xl">🏠</span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-800 text-sm leading-tight">{plan.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 whitespace-nowrap ${
                      plan.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : plan.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {plan.status || "pending"}
                    </span>
                  </div>
                  <div className="space-y-1 text-gray-500 text-xs mb-4">
                    <p>📐 Plot: {plan.plot_size}</p>
                    <p>🛏️ Bedrooms: {plan.bedrooms}</p>
                    <p>🏢 Floors: {plan.floors}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-orange-500 font-bold text-lg">₹{plan.price}</p>
                    <Link
                      href={`/plan/${plan.id}`}
                      className="text-teal-600 hover:text-teal-700 text-xs font-medium"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-4">📐</p>
            <p className="text-gray-500 mb-4">You haven't uploaded any plans yet.</p>
            <Link
              href="/architect/upload-plan"
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition"
            >
              Upload Your First Plan
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
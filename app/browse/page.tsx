import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default async function BrowsePlansPage({
  searchParams,
}: {
  searchParams: Promise<{ bedrooms?: string; floors?: string; minPrice?: string; maxPrice?: string; search?: string }>;
}) {
  const params = await searchParams;

  let query = supabase.from("plans").select("*").eq("status", "approved");

  if (params.bedrooms) query = query.eq("bedrooms", parseInt(params.bedrooms));
  if (params.floors) query = query.eq("floors", params.floors);
  if (params.minPrice) query = query.gte("price", parseInt(params.minPrice));
  if (params.maxPrice) query = query.lte("price", parseInt(params.maxPrice));

  const { data: plans } = await query;

  const filtered = params.search
    ? plans?.filter(p => p.title.toLowerCase().includes(params.search!.toLowerCase()))
    : plans;

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">

        {/* Header */}
        <section className="bg-gradient-to-br from-teal-700 to-teal-500 text-white py-10 px-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Browse House Plans</h1>
          <p className="text-teal-100">Find the perfect plan for your dream home</p>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex gap-8">

            {/* Filters Sidebar */}
            <div className="w-64 flex-shrink-0">
              <form method="GET" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">

                <div>
                  <h3 className="font-bold text-gray-800 mb-3">🔍 Search</h3>
                  <input
                    type="text"
                    name="search"
                    defaultValue={params.search || ""}
                    placeholder="Search plans..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-3">🛏️ Bedrooms</h3>
                  <select
                    name="bedrooms"
                    defaultValue={params.bedrooms || ""}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Any</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5">5 BHK</option>
                  </select>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-3">🏢 Floors</h3>
                  <select
                    name="floors"
                    defaultValue={params.floors || ""}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Any</option>
                    <option value="1">1 Floor</option>
                    <option value="2">2 Floors</option>
                    <option value="3">3 Floors</option>
                  </select>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-3">💰 Price Range</h3>
                  <input
                    type="number"
                    name="minPrice"
                    defaultValue={params.minPrice || ""}
                    placeholder="Min ₹"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    defaultValue={params.maxPrice || ""}
                    placeholder="Max ₹"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition text-sm font-semibold"
                >
                  Apply Filters
                </button>

                <Link
                  href="/browse"
                  className="block text-center text-gray-400 hover:text-gray-600 text-xs"
                >
                  Clear Filters
                </Link>
              </form>
            </div>

            {/* Plans Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-500 text-sm">
                  Showing <span className="font-bold text-gray-800">{filtered?.length || 0}</span> approved plans
                </p>
              </div>

              {filtered && filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filtered.map((plan) => (
                    <div
                      key={plan.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100 overflow-hidden group"
                    >
                      <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-6 text-center group-hover:from-teal-100 transition">
                        <span className="text-4xl">🏠</span>
                      </div>
                      <div className="p-4">
                        <h2 className="text-sm font-bold text-gray-800 mb-2">{plan.title}</h2>
                        <div className="space-y-1 text-gray-500 text-xs mb-3">
                          <p>📐 {plan.plot_size}</p>
                          <p>🛏️ {plan.bedrooms} Bedrooms</p>
                          <p>🏢 {plan.floors} Floors</p>
                        </div>
                        <p className="text-orange-500 font-bold text-lg mb-3">₹{plan.price}</p>
                        <Link
                          href={`/plan/${plan.id}`}
                          className="block text-center bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition text-xs font-semibold"
                        >
                          View Plan →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                  <p className="text-4xl mb-4">🔍</p>
                  <p className="text-gray-500 mb-2">No plans found matching your filters.</p>
                  <Link href="/browse" className="text-teal-600 hover:underline text-sm">
                    Clear filters
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

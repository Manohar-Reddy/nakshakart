import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default async function BrowsePlansPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string; category?: string; road_facing?: string;
    bedrooms?: string; floors?: string;
    minPrice?: string; maxPrice?: string;
    plot_width?: string; plot_depth?: string;
    vastu?: string; sort?: string;
  }>;
}) {
  const params = await searchParams;

  // Only show LIVE plans
  let query = supabase.from("plans").select("*").eq("status", "live");

  if (params.category)    query = query.eq("category",    params.category);
  if (params.road_facing) query = query.eq("road_facing", params.road_facing);
  if (params.bedrooms)    query = query.eq("bedrooms",    params.bedrooms);
  if (params.floors)      query = query.eq("floors",      params.floors);
  if (params.minPrice)    query = query.gte("basic_price", parseInt(params.minPrice));
  if (params.maxPrice)    query = query.lte("basic_price", parseInt(params.maxPrice));
  if (params.vastu === "1") query = query.eq("is_vastu_compliant", true);

  // Plot size filters
  if (params.plot_width)  query = query.eq("plot_width",  parseFloat(params.plot_width));
  if (params.plot_depth)  query = query.eq("plot_depth",  parseFloat(params.plot_depth));

  const { data: allPlans } = await query;

  // Search filter
  let filtered = allPlans || [];
  if (params.search) {
    const s = params.search.toLowerCase().trim();
    const bedroomMatch   = s.match(/(\d+)\s*(bhk|bed|bedroom)/i);
    const dimensionMatch = s.match(/(\d+)\s*x\s*(\d+)/i);
    filtered = filtered.filter((p) => {
      if (bedroomMatch)   return String(p.bedrooms) === bedroomMatch[1];
      if (dimensionMatch) return p.plot_size?.toLowerCase().includes(dimensionMatch[0].replace(/\s/g,""));
      return (
        p.title?.toLowerCase().includes(s)       ||
        p.plot_size?.toLowerCase().includes(s)   ||
        p.category?.toLowerCase().includes(s)    ||
        p.road_facing?.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s) ||
        String(p.bedrooms).includes(s)           ||
        String(p.floors).toLowerCase().includes(s)
      );
    });
  }

  // Sort
  if (params.sort === "price_asc")  filtered = [...filtered].sort((a,b) => (a.basic_price||a.price) - (b.basic_price||b.price));
  if (params.sort === "price_desc") filtered = [...filtered].sort((a,b) => (b.basic_price||b.price) - (a.basic_price||a.price));
  if (params.sort === "newest")     filtered = [...filtered].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const hasFilters = params.search || params.category || params.road_facing ||
    params.bedrooms || params.floors || params.minPrice || params.maxPrice ||
    params.plot_width || params.plot_depth || params.vastu;

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">

        {/* Hero */}
        <section className="bg-gradient-to-br from-teal-700 to-teal-500 text-white py-10 px-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Browse House Plans</h1>
          <p className="text-teal-100 mb-6">Find the perfect plan for your dream home</p>

          {/* Quick search */}
          <form method="GET" className="max-w-xl mx-auto">
            <div className="flex gap-2">
              <input type="text" name="search"
                defaultValue={params.search || ""}
                placeholder="Search by 3BHK, 30x40, Villa, North Facing..."
                className="flex-1 px-4 py-3 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
              <button type="submit"
                className="bg-white text-teal-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-teal-50 transition">
                Search
              </button>
            </div>
          </form>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex gap-8">

            {/* ── Filters Sidebar ── */}
            <div className="w-64 flex-shrink-0">
              <form method="GET" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-5 sticky top-4">
                <h3 className="font-bold text-gray-800 text-base">🔧 Filters</h3>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">🏠 Building Type</label>
                  <select name="category" defaultValue={params.category || ""}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">All Types</option>
                    {["Independent House","Duplex House","Villa","Apartment Building","Farmhouse","Row House","Commercial Building","Mixed Use Building","Rental House","PG / Hostel"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Plot dimensions */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">📐 Plot Size (ft)</label>
                  <div className="flex gap-2">
                    <input type="number" name="plot_width"
                      defaultValue={params.plot_width || ""}
                      placeholder="Width"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <span className="text-gray-400 self-center text-sm">×</span>
                    <input type="number" name="plot_depth"
                      defaultValue={params.plot_depth || ""}
                      placeholder="Depth"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">e.g. 30 × 40</p>
                </div>

                {/* Floors */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">🏢 Floors</label>
                  <select name="floors" defaultValue={params.floors || ""}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">Any</option>
                    <option value="G">G (Ground only)</option>
                    <option value="G+1">G+1 (2 floors)</option>
                    <option value="G+2">G+2 (3 floors)</option>
                    <option value="G+3">G+3 (4 floors)</option>
                    <option value="G+4">G+4+</option>
                    <option value="Duplex">Duplex</option>
                    <option value="Villa">Villa</option>
                  </select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">🛏️ Bedrooms</label>
                  <select name="bedrooms" defaultValue={params.bedrooms || ""}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">Any</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5">5 BHK</option>
                    <option value="6">6+ BHK</option>
                  </select>
                </div>

                {/* Road Facing */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">🧭 Road Facing</label>
                  <select name="road_facing" defaultValue={params.road_facing || ""}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">Any Direction</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="North-East">North-East</option>
                    <option value="North-West">North-West</option>
                    <option value="South-East">South-East</option>
                    <option value="South-West">South-West</option>
                    <option value="Corner Plot">Corner Plot</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">💰 Price Range (₹)</label>
                  <div className="flex gap-2">
                    <input type="number" name="minPrice"
                      defaultValue={params.minPrice || ""}
                      placeholder="Min"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <input type="number" name="maxPrice"
                      defaultValue={params.maxPrice || ""}
                      placeholder="Max"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                </div>

                {/* Vastu */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="vastu" value="1"
                      defaultChecked={params.vastu === "1"}
                      className="accent-teal-600 w-4 h-4" />
                    <span className="text-sm text-gray-700">🔶 Vastu Compliant only</span>
                  </label>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">↕️ Sort By</label>
                  <select name="sort" defaultValue={params.sort || ""}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">Default</option>
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>

                <button type="submit"
                  className="w-full bg-teal-600 text-white py-2.5 rounded-xl hover:bg-teal-700 transition text-sm font-bold">
                  Apply Filters
                </button>
                {hasFilters && (
                  <Link href="/browse"
                    className="block text-center text-gray-400 hover:text-red-500 text-xs transition">
                    ✕ Clear All Filters
                  </Link>
                )}
              </form>
            </div>

            {/* ── Plans Grid ── */}
            <div className="flex-1">

              {/* Results header */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <p className="text-gray-500 text-sm">
                  Showing <span className="font-bold text-gray-800">{filtered.length}</span> plans
                  {params.search && <span className="ml-1 text-teal-600">for "<b>{params.search}</b>"</span>}
                </p>
              </div>

              {/* Active filter tags */}
              {hasFilters && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {params.search     && <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-medium">🔍 {params.search}</span>}
                  {params.category   && <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">🏠 {params.category}</span>}
                  {params.road_facing && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">🧭 {params.road_facing}</span>}
                  {params.bedrooms   && <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">🛏️ {params.bedrooms} BHK</span>}
                  {params.floors     && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">🏢 {params.floors}</span>}
                  {params.plot_width && params.plot_depth && <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">📐 {params.plot_width}×{params.plot_depth} ft</span>}
                  {params.minPrice   && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">💰 Min ₹{parseInt(params.minPrice).toLocaleString()}</span>}
                  {params.maxPrice   && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">💰 Max ₹{parseInt(params.maxPrice).toLocaleString()}</span>}
                  {params.vastu === "1" && <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">🔶 Vastu</span>}
                </div>
              )}

              {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((plan) => {
                    const thumb        = plan.exterior_render_url || plan.image_url;
                    const displayPrice = plan.basic_price || plan.price;
                    return (
                      <div key={plan.id}
                        className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">

                        {/* Image */}
                        <div className="relative overflow-hidden">
                          {thumb ? (
                            <img src={thumb} alt={plan.title}
                              className="w-full h-44 object-cover group-hover:scale-105 transition duration-500" />
                          ) : (
                            <div className="w-full h-44 bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
                              <span className="text-5xl">🏠</span>
                            </div>
                          )}

                          {/* Category badge */}
                          {plan.category && (
                            <span className="absolute top-2 left-2 bg-white bg-opacity-90 text-teal-700 px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm">
                              {plan.category}
                            </span>
                          )}

                          {/* 3D badge */}
                          {plan.model_3d_url && (
                            <span className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm">
                              🏠 3D
                            </span>
                          )}
                        </div>

                        <div className="p-4">
                          {/* Plan code */}
                          {plan.plan_code && (
                            <p className="text-teal-600 font-mono text-xs font-semibold mb-1">{plan.plan_code}</p>
                          )}

                          <h2 className="text-sm font-bold text-gray-800 mb-2 line-clamp-2">{plan.title}</h2>

                          {/* Specs */}
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-500 mb-3">
                            {plan.plot_size  && <p>📐 {plan.plot_size}</p>}
                            {plan.floors     && <p>🏢 {plan.floors}</p>}
                            {plan.bedrooms   && <p>🛏️ {plan.bedrooms} BHK</p>}
                            {plan.bathrooms  && <p>🚿 {plan.bathrooms} Bath</p>}
                            {plan.road_facing && <p>🧭 {plan.road_facing}</p>}
                            {plan.built_up_area && <p>📏 {plan.built_up_area}</p>}
                          </div>

                          {/* Feature badges */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {plan.is_vastu_compliant && <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded text-xs">🔶 Vastu</span>}
                            {plan.is_green_building  && <span className="bg-green-50 text-green-600 px-1.5 py-0.5 rounded text-xs">♻️ Green</span>}
                            {plan.is_solar_ready     && <span className="bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded text-xs">☀️ Solar</span>}
                            {plan.has_swimming_pool  && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-xs">🏊 Pool</span>}
                            {plan.has_gym            && <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-xs">🏋️ Gym</span>}
                            {plan.modification_available && <span className="bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded text-xs">🔧 Modifiable</span>}
                          </div>

                          {/* Price + CTA */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-orange-500 font-bold text-lg">₹{displayPrice?.toLocaleString()}</p>
                              {plan.premium_price && (
                                <p className="text-purple-500 text-xs">Premium: ₹{plan.premium_price?.toLocaleString()}</p>
                              )}
                            </div>
                            <Link href={`/plan/${plan.id}`}
                              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition">
                              View Plan →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                  <p className="text-5xl mb-4">🔍</p>
                  <p className="text-gray-600 font-semibold mb-2">No plans found</p>
                  <p className="text-gray-400 text-sm mb-6">
                    Try different filters or search terms like "3BHK", "30x40", "Villa"
                  </p>
                  <Link href="/browse"
                    className="bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 transition">
                    Clear Filters
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
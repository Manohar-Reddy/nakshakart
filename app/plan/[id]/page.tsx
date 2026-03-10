import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { data: plan, error } = await supabase
    .from("plans")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !plan) {
    return <p className="p-8 text-red-500">Plan not found.</p>;
  }

  // Fetch architect details if architect_id exists
  let architect = null;
  if (plan.architect_id) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", plan.architect_id)
      .single();
    architect = data;
  }

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/browse" className="text-teal-600 hover:underline text-sm mb-6 block">
            ← Back to all plans
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Left - Image */}
            <div>
              {plan.image_url ? (
                <img src={plan.image_url} alt={plan.title} className="w-full h-72 object-cover rounded-2xl shadow-md" />
              ) : (
                <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl h-72 flex items-center justify-center">
                  <span className="text-8xl">🏠</span>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {plan.is_vastu_compliant && <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">🕉️ Vastu Compliant</span>}
                {plan.is_green_building && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">🌿 Green Building</span>}
                {plan.is_solar_ready && <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">☀️ Solar Ready</span>}
              </div>

              {/* Architect Card */}
              {architect && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mt-4">
                  <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wide">Designed By</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {architect.name?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{architect.name}</p>
                      {architect.specialization && <p className="text-orange-500 text-xs">{architect.specialization}</p>}
                      {architect.location && <p className="text-gray-500 text-xs">📍 {architect.location}</p>}
                    </div>
                  </div>
                  <Link
                    href={`/architect-profile/${plan.architect_id}`}
                    className="block text-center mt-3 border border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white py-2 rounded-lg text-sm font-semibold transition"
                  >
                    View Architect Profile
                  </Link>
                </div>
              )}
            </div>

            {/* Right - Details */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-800">{plan.title}</h1>
              </div>
              {plan.category && <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold">{plan.category}</span>}

              <p className="text-3xl font-bold text-orange-500 mt-4">₹{plan.price}</p>
              <p className="text-green-600 text-sm mt-1">✅ Architect Verified · Instant download after purchase</p>

              {plan.description && (
                <p className="text-gray-600 text-sm mt-4 leading-relaxed">{plan.description}</p>
              )}

              <Link
                href={`/buy/${plan.id}`}
                className="block text-center bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-lg transition shadow-lg mt-6"
              >
                Buy Plan ₹{plan.price}
              </Link>
              <p className="text-center text-gray-400 text-xs mt-2">🔒 Secure purchase · Money back guarantee</p>
            </div>
          </div>

          {/* Plan Specs */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Plan Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl mb-1">📐</p>
                <p className="text-xs text-gray-500">Plot Size</p>
                <p className="font-bold text-gray-800">{plan.plot_size}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl mb-1">🛏️</p>
                <p className="text-xs text-gray-500">Bedrooms</p>
                <p className="font-bold text-gray-800">{plan.bedrooms}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl mb-1">🚿</p>
                <p className="text-xs text-gray-500">Bathrooms</p>
                <p className="font-bold text-gray-800">{plan.bathrooms || "N/A"}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl mb-1">🏢</p>
                <p className="text-xs text-gray-500">Floors</p>
                <p className="font-bold text-gray-800">{plan.floors}</p>
              </div>
              {plan.built_up_area && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                  <p className="text-2xl mb-1">📏</p>
                  <p className="text-xs text-gray-500">Built-up Area</p>
                  <p className="font-bold text-gray-800">{plan.built_up_area}</p>
                </div>
              )}
              {plan.parking && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                  <p className="text-2xl mb-1">🚗</p>
                  <p className="text-xs text-gray-500">Parking</p>
                  <p className="font-bold text-gray-800">{plan.parking}</p>
                </div>
              )}
              {plan.road_facing && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                  <p className="text-2xl mb-1">🧭</p>
                  <p className="text-xs text-gray-500">Road Facing</p>
                  <p className="font-bold text-gray-800">{plan.road_facing}</p>
                </div>
              )}
              {plan.road_width && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                  <p className="text-2xl mb-1">🛣️</p>
                  <p className="text-xs text-gray-500">Road Width</p>
                  <p className="font-bold text-gray-800">{plan.road_width}</p>
                </div>
              )}
            </div>

            {/* Setbacks */}
            {(plan.setback_front || plan.setback_rear || plan.setback_left || plan.setback_right) && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <h3 className="font-bold text-gray-800 mb-4">📏 Setbacks</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {plan.setback_front && <div><p className="text-xs text-gray-500">Front</p><p className="font-bold text-gray-800">{plan.setback_front}</p></div>}
                  {plan.setback_rear && <div><p className="text-xs text-gray-500">Rear</p><p className="font-bold text-gray-800">{plan.setback_rear}</p></div>}
                  {plan.setback_left && <div><p className="text-xs text-gray-500">Left</p><p className="font-bold text-gray-800">{plan.setback_left}</p></div>}
                  {plan.setback_right && <div><p className="text-xs text-gray-500">Right</p><p className="font-bold text-gray-800">{plan.setback_right}</p></div>}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">✨ Features & Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {plan.has_balcony && <div className="flex items-center gap-2 text-sm text-gray-700"><span>🪟</span> Balcony</div>}
                {plan.has_pooja_room && <div className="flex items-center gap-2 text-sm text-gray-700"><span>🙏</span> Pooja Room</div>}
                {plan.has_servant_room && <div className="flex items-center gap-2 text-sm text-gray-700"><span>🧹</span> Servant Room</div>}
                {plan.has_study_room && <div className="flex items-center gap-2 text-sm text-gray-700"><span>📚</span> Study Room</div>}
                {plan.has_home_theatre && <div className="flex items-center gap-2 text-sm text-gray-700"><span>🎬</span> Home Theatre</div>}
                {plan.has_gym && <div className="flex items-center gap-2 text-sm text-gray-700"><span>🏋️</span> Gym</div>}
                {plan.has_store_room && <div className="flex items-center gap-2 text-sm text-gray-700"><span>📦</span> Store Room</div>}
                {plan.has_terrace && <div className="flex items-center gap-2 text-sm text-gray-700"><span>🏠</span> Terrace</div>}
                {plan.has_garden && <div className="flex items-center gap-2 text-sm text-gray-700"><span>🌱</span> Garden / Lawn</div>}
                {plan.has_swimming_pool && <div className="flex items-center gap-2 text-sm text-gray-700"><span>🏊</span> Swimming Pool</div>}
                {plan.has_open_courtyard && <div className="flex items-center gap-2 text-sm text-gray-700"><span>🏛️</span> Open Courtyard</div>}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

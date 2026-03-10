import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArchitectProfilePage({ params }: PageProps) {
  const { id } = await params;

  const { data: architect } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .eq("architect_id", id)
    .eq("status", "approved");

  if (!architect) {
    return <p className="p-8 text-red-500">Architect not found.</p>;
  }

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/browse" className="text-teal-600 hover:underline text-sm mb-6 block">
            ← Back to Browse
          </Link>

          {/* Architect Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {architect.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-800">{architect.name}</h1>
                  <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold">✅ Verified Architect</span>
                </div>
                {architect.specialization && (
                  <p className="text-orange-500 font-medium text-sm mb-2">{architect.specialization}</p>
                )}
                {architect.location && (
                  <p className="text-gray-500 text-sm mb-2">📍 {architect.location}</p>
                )}
                {architect.experience && (
                  <p className="text-gray-500 text-sm mb-3">🏆 {architect.experience} years of experience</p>
                )}
                {architect.bio && (
                  <p className="text-gray-600 text-sm leading-relaxed">{architect.bio}</p>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-center flex-shrink-0">
                <div className="bg-teal-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-teal-700">{plans?.length || 0}</p>
                  <p className="text-xs text-gray-500">Plans</p>
                </div>
              </div>
            </div>

            {/* Contact */}
            {architect.phone && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500">📞 Contact: <span className="text-gray-800 font-medium">{architect.phone}</span></p>
              </div>
            )}
          </div>

          {/* Architect's Plans */}
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Plans by {architect.name} ({plans?.length || 0})
          </h2>

          {plans && plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100 overflow-hidden group">
                  {plan.image_url ? (
                    <img src={plan.image_url} alt={plan.title} className="w-full h-40 object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-6 text-center">
                      <span className="text-4xl">🏠</span>
                    </div>
                  )}
                  <div className="p-4">
                    {plan.category && <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full text-xs font-medium">{plan.category}</span>}
                    <h3 className="text-sm font-bold text-gray-800 mt-2 mb-2">{plan.title}</h3>
                    <div className="space-y-1 text-gray-500 text-xs mb-3">
                      <p>📐 {plan.plot_size}</p>
                      <p>🛏️ {plan.bedrooms} Bedrooms</p>
                      <p>🏢 {plan.floors} Floors</p>
                      {plan.road_facing && <p>🧭 {plan.road_facing}</p>}
                    </div>
                    <p className="text-orange-500 font-bold text-lg mb-3">₹{plan.price}</p>
                    <Link href={`/plan/${plan.id}`} className="block text-center bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition text-xs font-semibold">
                      View Plan →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <p className="text-4xl mb-4">📋</p>
              <p className="text-gray-500">No approved plans yet from this architect.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
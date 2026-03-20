"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WishlistButton from "@/app/components/WishlistButton";

export default function WishlistPage() {
  const [plans,   setPlans]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("wishlists")
        .select("*, plans(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setPlans(data?.map((w) => w.plans).filter(Boolean) || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading wishlist...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">❤️ My Wishlist</h1>
          <p className="text-gray-500 text-sm mt-1">
            {plans.length} plan{plans.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <Link href="/browse"
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
          Browse More Plans →
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
          <p className="text-6xl mb-4">🤍</p>
          <p className="text-xl font-semibold text-gray-600 mb-2">No saved plans yet</p>
          <p className="text-gray-400 text-sm mb-6">
            Click the ❤️ button on any plan to save it here
          </p>
          <Link href="/browse"
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition">
            Browse Plans →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan) => {
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

                  {/* Wishlist button */}
                  <div className="absolute top-2 right-2">
                    <WishlistButton planId={plan.id} size="sm" />
                  </div>

                  {/* 3D badge */}
                  {plan.model_3d_url && (
                    <span className="absolute bottom-2 right-2 bg-purple-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
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
                    {plan.plot_size   && <p>📐 {plan.plot_size}</p>}
                    {plan.floors      && <p>🏢 {plan.floors}</p>}
                    {plan.bedrooms    && <p>🛏️ {plan.bedrooms} BHK</p>}
                    {plan.bathrooms   && <p>🚿 {plan.bathrooms} Bath</p>}
                    {plan.road_facing && <p>🧭 {plan.road_facing}</p>}
                    {plan.built_up_area && <p>📏 {plan.built_up_area}</p>}
                  </div>

                  {/* Feature badges */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {plan.is_vastu_compliant && <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded text-xs">🔶 Vastu</span>}
                    {plan.is_green_building  && <span className="bg-green-50 text-green-600 px-1.5 py-0.5 rounded text-xs">♻️ Green</span>}
                    {plan.is_solar_ready     && <span className="bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded text-xs">☀️ Solar</span>}
                    {plan.has_swimming_pool  && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-xs">🏊 Pool</span>}
                    {plan.modification_available && <span className="bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded text-xs">🔧 Modifiable</span>}
                  </div>

                  {/* Price + CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-500 font-bold text-lg">
                        ₹{displayPrice?.toLocaleString()}
                      </p>
                      {plan.premium_price && (
                        <p className="text-purple-500 text-xs">
                          Premium: ₹{plan.premium_price?.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/plan/${plan.id}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-semibold transition">
                        View
                      </Link>
                      <Link href={`/buy/${plan.id}`}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition">
                        Buy →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
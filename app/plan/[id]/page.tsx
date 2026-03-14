import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReviewSection from "@/app/components/ReviewSection";
import ImageViewer from "@/app/components/ImageViewer";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ModelViewerClient from "@/app/components/ModelViewerClient";

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: plan } = await supabase
    .from("plans")
    .select("*")
    .eq("id", id)
    .single();

  if (!plan) notFound();

  let architect = null;
  if (plan.architect_id) {
    const { data: architectData } = await supabase
      .from("users")
      .select("id, name, profile_photo_url, designer_type, city, experience, coa_number, is_coa_verified")
      .eq("id", plan.architect_id)
      .single();
    architect = architectData;
  }

  const features = [
    { key: "is_vastu_compliant", label: "Vastu Compliant", icon: "🔶" },
    { key: "has_pooja_room",     label: "Pooja Room",      icon: "🛕" },
    { key: "has_balcony",        label: "Balcony",         icon: "🌿" },
    { key: "has_servant_room",   label: "Servant Room",    icon: "🛏️" },
    { key: "has_study_room",     label: "Study Room",      icon: "📚" },
    { key: "has_terrace",        label: "Terrace",         icon: "🏗️" },
    { key: "has_garden",         label: "Garden",          icon: "🌳" },
    { key: "is_green_building",  label: "Green Building",  icon: "♻️" },
    { key: "is_solar_ready",     label: "Solar Ready",     icon: "☀️" },
    { key: "has_home_theatre",   label: "Home Theatre",    icon: "🎬" },
    { key: "has_gym",            label: "Gym",             icon: "🏋️" },
    { key: "has_swimming_pool",  label: "Swimming Pool",   icon: "🏊" },
    { key: "has_water_body",     label: "Water Body",      icon: "💧" },
    { key: "has_car_garage",     label: "Car Garage",      icon: "🚗" },
  ].filter((f) => plan[f.key]);

  const hasExterior   = !!(plan.exterior_render_url || plan.image_url);
  const hasFloorPlan  = !!plan.floor_plan_pdf_url;
  const hasElevations = !!(plan.elevation_north_url || plan.elevation_south_url);
  const hasStaircase  = !!plan.staircase_section_url;
  const hasDoorWindow = !!plan.door_window_pdf_url;
  const hasCad        = !!(plan.dwg_url || plan.dxf_url);
  const has3dModel    = !!plan.model_3d_url;

  const basicFiles = [
    { label: "3D Exterior Render",     available: hasExterior   },
    { label: "Floor Plans PDF",        available: hasFloorPlan  },
    { label: "4 Side Elevations",      available: hasElevations },
    { label: "Staircase Sections",     available: hasStaircase  },
    { label: "Door & Window Schedule", available: hasDoorWindow },
  ];

  const premiumFiles = [
    { label: "CAD File (DWG or DXF)", available: hasCad     },
    { label: "3D Model Viewer",       available: has3dModel },
  ];

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/browse" className="text-teal-600 hover:underline text-sm mb-6 inline-block">
          ← Back to all plans
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Left — Image + 3D Viewer */}
          <div>
            {hasExterior ? (
              <ImageViewer
                src={plan.exterior_render_url || plan.image_url}
                alt={plan.title}
                className="w-full h-80 object-cover rounded-2xl shadow-md"
                caption="Click to view full size"
              />
            ) : (
              <div className="w-full h-80 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl flex items-center justify-center mb-3">
                <span className="text-6xl">🏠</span>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-xs text-yellow-700 flex items-center gap-2 mt-3">
              <span>🔒</span>
              <span>Preview images are watermarked. Full quality files available after purchase.</span>
            </div>

            {/* 3D Model Viewer */}
            {has3dModel && (
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-gray-800 text-sm">🏠 3D Model Viewer</h3>
                  <span className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full font-semibold">Premium</span>
                </div>
                <ModelViewerClient url={plan.model_3d_url} />
              </div>
            )}
          </div>

          {/* Right — Details */}
          <div>
            <div className="mb-4">
              {plan.plan_code && (
                <p className="text-xs text-teal-600 font-semibold mb-1">Plan ID: {plan.plan_code}</p>
              )}
              <h1 className="text-2xl font-bold text-gray-800 leading-tight">{plan.title}</h1>
              {plan.category && (
                <span className="inline-block mt-2 bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {plan.category}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="mb-5">
              {plan.basic_price || plan.premium_price ? (
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Basic Package</p>
                    <p className="text-2xl font-bold text-orange-500">
                      ₹{(plan.basic_price || plan.price)?.toLocaleString()}
                    </p>
                  </div>
                  {plan.premium_price && (
                    <div className="border-l border-gray-200 pl-4">
                      <p className="text-xs text-gray-500">Premium Package</p>
                      <p className="text-2xl font-bold text-purple-600">
                        ₹{plan.premium_price?.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-3xl font-bold text-orange-500">₹{plan.price?.toLocaleString()}</p>
              )}
              <p className="text-xs text-green-600 mt-1">✅ Architect Verified · Instant download after purchase</p>
            </div>

            {plan.description && (
              <p className="text-gray-600 text-sm mb-5 leading-relaxed">{plan.description}</p>
            )}

            <Link href={`/buy/${plan.id}`}
              className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-4 rounded-xl font-bold text-lg transition mb-3">
              Buy Plan →
            </Link>
            <p className="text-center text-xs text-gray-400 mb-5">
              🔒 Secure purchase · No refunds on digital products
            </p>

            {/* Modification */}
            {plan.modification_available ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
                <p className="font-semibold text-green-700 text-sm mb-1">✅ Modification Available</p>
                {plan.consultation_fee && (
                  <p className="text-xs text-gray-600">
                    Consultation fee: <strong>₹{plan.consultation_fee}</strong>/session
                    {plan.consultation_type && ` · ${plan.consultation_type}`}
                  </p>
                )}
                {plan.turnaround_time && (
                  <p className="text-xs text-gray-500 mt-1">⏱️ Turnaround: {plan.turnaround_time}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">* Consultation available after purchase through NakshaKart only</p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
                <p className="text-sm text-gray-500">❌ Modification not available for this plan</p>
              </div>
            )}

            {/* Specs */}
            <h2 className="font-bold text-gray-800 text-lg mb-3">Plan Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
              {[
                { icon: "📐", label: "Plot Size",  value: plan.plot_size     },
                { icon: "🛏️", label: "Bedrooms",   value: plan.bedrooms      },
                { icon: "🚿", label: "Bathrooms",  value: plan.bathrooms     },
                { icon: "🏢", label: "Floors",     value: plan.floors        },
                { icon: "🚗", label: "Parking",    value: plan.parking       },
                { icon: "📏", label: "Built-up",   value: plan.built_up_area },
                { icon: "🧭", label: "Facing",     value: plan.road_facing   },
                { icon: "⬛", label: "Plot Shape", value: plan.plot_shape    },
              ].filter((s) => s.value).map((spec) => (
                <div key={spec.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                  <p className="text-xl mb-1">{spec.icon}</p>
                  <p className="text-xs text-gray-500">{spec.label}</p>
                  <p className="text-sm font-semibold text-gray-800">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="mb-5">
                <h2 className="font-bold text-gray-800 text-lg mb-3">Special Features</h2>
                <div className="flex flex-wrap gap-2">
                  {features.map((f) => (
                    <span key={f.key} className="bg-teal-50 border border-teal-200 text-teal-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                      {f.icon} {f.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Files Included */}
            <div className="mb-5 space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-blue-700 text-sm">📦 Basic Package Files</p>
                  <span className="text-orange-600 font-bold text-sm">
                    ₹{(plan.basic_price || plan.price)?.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {basicFiles.map((file) => (
                    <div key={file.label} className={`flex items-center gap-1.5 text-xs ${
                      file.available ? "text-gray-700" : "text-gray-300"
                    }`}>
                      <span>{file.available ? "✅" : "⬜"}</span>
                      <span>{file.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {plan.premium_price && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-purple-700 text-sm">⭐ Premium Package Files</p>
                      <span className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full font-semibold">Basic +</span>
                    </div>
                    <span className="text-purple-600 font-bold text-sm">₹{plan.premium_price?.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {premiumFiles.map((file) => (
                      <div key={file.label} className={`flex items-center gap-1.5 text-xs ${
                        file.available ? "text-purple-700" : "text-gray-300"
                      }`}>
                        <span>{file.available ? "✅" : "⬜"}</span>
                        <span>{file.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {plan.architect_notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
                <p className="font-semibold text-blue-700 text-sm mb-1">📝 Architect Notes</p>
                <p className="text-xs text-gray-600 leading-relaxed">{plan.architect_notes}</p>
              </div>
            )}

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-xs text-red-700">
              <p className="font-semibold mb-1">⚖️ Legal Disclaimer</p>
              <p>NakshaKart is a marketplace platform. We are not responsible for municipal approval, construction quality, or outcomes. Plans are for reference only. Please verify with a local licensed engineer before construction.</p>
            </div>
          </div>
        </div>

        {/* Architect Info */}
        {architect && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-8">
            <h2 className="font-bold text-gray-800 text-lg mb-4">👤 About the Designer</h2>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-600 text-xl overflow-hidden flex-shrink-0">
                {architect.profile_photo_url ? (
                  <img src={architect.profile_photo_url} className="w-full h-full object-cover" alt={architect.name} />
                ) : (
                  architect.name?.[0]?.toUpperCase() || "A"
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-800">{architect.name}</p>
                  {architect.is_coa_verified && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">✅ CoA Verified</span>
                  )}
                  {architect.designer_type && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{architect.designer_type}</span>
                  )}
                </div>
                {architect.city && <p className="text-xs text-gray-500 mt-0.5">📍 {architect.city}</p>}
                {architect.experience && <p className="text-xs text-gray-500">🏆 {architect.experience} years experience</p>}
                <Link href={`/architect-profile/${architect.id}`}
                  className="text-teal-600 hover:underline text-xs font-semibold mt-2 inline-block">
                  View Full Profile →
                </Link>
              </div>
            </div>
          </div>
        )}

        <div id="reviews" className="mt-8">
          <ReviewSection planId={id} />
        </div>
      </div>
      <Footer />
    </>
  );
}
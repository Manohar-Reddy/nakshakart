"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";

const SectionHeader = ({ num, title }: { num: string; title: string }) => (
  <div className="flex items-center gap-3 mb-5 mt-8">
    <span className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{num}</span>
    <h2 className="text-lg font-bold text-gray-800">{title}</h2>
  </div>
);

const inputCls = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
  </div>
);

const FileUploadBox = ({ label, accept, file, existingUrl, onChange }: {
  label: string; accept: string; file: File | null;
  existingUrl?: string | null; onChange: (f: File | null) => void
}) => (
  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-teal-400 transition">
    <input type="file" accept={accept} onChange={(e) => onChange(e.target.files?.[0] || null)} className="hidden" id={`file-${label}`} />
    <label htmlFor={`file-${label}`} className="cursor-pointer block">
      {file ? (
        <div>
          <p className="text-green-600 font-semibold text-sm">✅ {file.name}</p>
          <p className="text-xs text-gray-400 mt-1">Click to change</p>
        </div>
      ) : existingUrl ? (
        <div>
          <p className="text-teal-600 font-semibold text-sm">✅ File already uploaded</p>
          <a href={existingUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-teal-500 underline mt-1 block"
            onClick={(e) => e.stopPropagation()}>
            View current file →
          </a>
          <p className="text-xs text-gray-400 mt-1">Click to replace</p>
        </div>
      ) : (
        <div>
          <p className="text-2xl mb-1">📎</p>
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <p className="text-xs text-gray-400 mt-1">{accept.replace(/\./g, "").toUpperCase()}</p>
        </div>
      )}
    </label>
  </div>
);

export default function EditPlan() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [plan, setPlan] = useState<any>(null);

  const [exteriorFile, setExteriorFile] = useState<File | null>(null);
  const [floorPlanPdf, setFloorPlanPdf] = useState<File | null>(null);
  const [elevationPdf, setElevationPdf] = useState<File | null>(null);
  const [sectionPdf, setSectionPdf] = useState<File | null>(null);
  const [doorWindowPdf, setDoorWindowPdf] = useState<File | null>(null);
  const [cadFile, setCadFile] = useState<File | null>(null);
  const [model3dFile, setModel3dFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: "", description: "", category: "Independent House", architect_notes: "",
    plot_size: "", plot_area: "", road_facing: "North", plot_shape: "Rectangle",
    floors: "", bedrooms: "", bathrooms: "", parking: "", built_up_area: "",
    basic_price: "", premium_price: "",
    modification_available: false,
    consultation_fee: "", consultation_type: "Online", turnaround_time: "",
    is_vastu_compliant: false, has_pooja_room: false, has_balcony: false,
    has_servant_room: false, has_study_room: false, has_terrace: false,
    has_garden: false, has_parking: false, is_green_building: false, is_solar_ready: false,
    has_home_theatre: false, has_gym: false, has_swimming_pool: false,
    has_water_body: false, has_car_garage: false,
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: plan } = await supabase
        .from("plans").select("*").eq("id", id).eq("architect_id", user.id).single();
      if (!plan) { router.push("/architect/my-plans"); return; }
      if (plan.status === "approved") { router.push("/architect/my-plans"); return; }
      setPlan(plan);
      setForm({
        title: plan.title || "",
        description: plan.description || "",
        category: plan.category || "Independent House",
        architect_notes: plan.architect_notes || "",
        plot_size: plan.plot_size?.replace(/\s*(ft|m|mm)$/i, "") || "",
        plot_area: plan.plot_area || "",
        road_facing: plan.road_facing || "North",
        plot_shape: plan.plot_shape || "Rectangle",
        floors: plan.floors || "",
        bedrooms: plan.bedrooms || "",
        bathrooms: plan.bathrooms || "",
        parking: plan.parking || "",
        built_up_area: plan.built_up_area?.replace(/\s*sq(ft|m|mm)$/i, "") || "",
        basic_price: plan.basic_price || plan.price || "",
        premium_price: plan.premium_price || "",
        modification_available: plan.modification_available || false,
        consultation_fee: plan.consultation_fee || "",
        consultation_type: plan.consultation_type || "Online",
        turnaround_time: plan.turnaround_time || "",
        is_vastu_compliant: plan.is_vastu_compliant || false,
        has_pooja_room: plan.has_pooja_room || false,
        has_balcony: plan.has_balcony || false,
        has_servant_room: plan.has_servant_room || false,
        has_study_room: plan.has_study_room || false,
        has_terrace: plan.has_terrace || false,
        has_garden: plan.has_garden || false,
        has_parking: plan.has_parking || false,
        is_green_building: plan.is_green_building || false,
        is_solar_ready: plan.is_solar_ready || false,
        has_home_theatre: plan.has_home_theatre || false,
        has_gym: plan.has_gym || false,
        has_swimming_pool: plan.has_swimming_pool || false,
        has_water_body: plan.has_water_body || false,
        has_car_garage: plan.has_car_garage || false,
      });
      setLoading(false);
    };
    load();
  }, [id]);

  const uploadFile = async (file: File, folder: string, userId: string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("plan-images").upload(path, file);
    if (error) { console.error("Upload failed:", error.message); return ""; }
    return supabase.storage.from("plan-images").getPublicUrl(path).data.publicUrl;
  };

  const handleSave = async () => {
    if (!form.title || !form.basic_price) return alert("Please fill title and basic price");
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const unit = plan.measurement_unit || "ft";

    setUploadStatus("Uploading files...");
    const exterior_render_url   = exteriorFile  ? await uploadFile(exteriorFile,  "renders", user.id) : plan.exterior_render_url;
    const floor_plan_pdf_url    = floorPlanPdf  ? await uploadFile(floorPlanPdf,  "pdfs",    user.id) : plan.floor_plan_pdf_url;
    const elevation_pdf_url     = elevationPdf  ? await uploadFile(elevationPdf,  "pdfs",    user.id) : plan.elevation_north_url;
    const staircase_section_url = sectionPdf    ? await uploadFile(sectionPdf,    "pdfs",    user.id) : plan.staircase_section_url;
    const door_window_pdf_url   = doorWindowPdf ? await uploadFile(doorWindowPdf, "pdfs",    user.id) : plan.door_window_pdf_url;
    const dwg_url               = cadFile && cadFile.name.toLowerCase().endsWith(".dwg") ? await uploadFile(cadFile, "cad", user.id) : plan.dwg_url;
    const dxf_url               = cadFile && cadFile.name.toLowerCase().endsWith(".dxf") ? await uploadFile(cadFile, "cad", user.id) : plan.dxf_url;
    const model_3d_url          = model3dFile   ? await uploadFile(model3dFile,   "models",  user.id) : plan.model_3d_url;

    setUploadStatus("Saving changes...");
    const { error } = await supabase.from("plans").update({
      title: form.title, description: form.description, category: form.category,
      architect_notes: form.architect_notes,
      plot_size: form.plot_size ? `${form.plot_size} ${unit}` : null,
      road_facing: form.road_facing, plot_shape: form.plot_shape,
      floors: form.floors || null, bedrooms: form.bedrooms || null,
      bathrooms: form.bathrooms || null, parking: form.parking || null,
      built_up_area: form.built_up_area ? `${form.built_up_area} sq${unit}` : null,
      basic_price: parseFloat(String(form.basic_price)),
      premium_price: form.premium_price ? parseFloat(String(form.premium_price)) : null,
      price: parseFloat(String(form.basic_price)),
      modification_available: form.modification_available,
      consultation_fee: form.modification_available && form.consultation_fee ? parseFloat(String(form.consultation_fee)) : null,
      consultation_type: form.modification_available ? form.consultation_type : null,
      turnaround_time: form.modification_available ? form.turnaround_time : null,
      image_url: exterior_render_url, exterior_render_url,
      floor_plan_pdf_url,
      elevation_north_url: elevation_pdf_url, elevation_south_url: elevation_pdf_url,
      elevation_east_url: elevation_pdf_url,  elevation_west_url: elevation_pdf_url,
      staircase_section_url, door_window_pdf_url,
      dwg_url, dxf_url, model_3d_url,
      status: "pending", rejection_reason: null,
      is_vastu_compliant: form.is_vastu_compliant, has_pooja_room: form.has_pooja_room,
      has_balcony: form.has_balcony, has_servant_room: form.has_servant_room,
      has_study_room: form.has_study_room, has_terrace: form.has_terrace,
      has_garden: form.has_garden, is_green_building: form.is_green_building,
      is_solar_ready: form.is_solar_ready, has_home_theatre: form.has_home_theatre,
      has_gym: form.has_gym, has_swimming_pool: form.has_swimming_pool,
      has_water_body: form.has_water_body, has_car_garage: form.has_car_garage,
    }).eq("id", id);

    setSaving(false);
    setUploadStatus("");
    if (error) { alert("Error: " + error.message); return; }
    alert("✅ Plan updated and resubmitted for review!");
    router.push("/architect/my-plans");
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading plan...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <button onClick={() => router.back()} className="text-teal-600 hover:underline text-sm mb-2 block">← Back</button>
        <h1 className="text-2xl font-bold text-gray-800">✏️ Edit Plan</h1>
        <p className="text-gray-500 text-sm mt-1">
          {plan?.plan_code && <span className="text-teal-600 font-semibold">{plan.plan_code} · </span>}
          Update your plan details and files. Saving will resubmit for admin review.
        </p>
        {plan?.status === "rejected" && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-3">
            <p className="text-sm font-bold text-red-700 mb-1">❌ This plan was rejected</p>
            {plan.rejection_reason && (
              <p className="text-sm text-red-600">Reason: <strong>{plan.rejection_reason}</strong></p>
            )}
            <p className="text-xs text-red-500 mt-1">Please fix the issues above and resubmit.</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

        <SectionHeader num="1" title="Basic Plan Information" />
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Plan Title *">
              <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Modern 3BHK House Plan 30x40" autoComplete="off" className={inputCls} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Short Description">
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                rows={3} placeholder="Describe the plan..." className={inputCls} />
            </Field>
          </div>
          <Field label="Building Type">
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
              {["Independent House","Duplex House","Villa","Apartment Building","Farmhouse","Row House","Commercial Building","Mixed Use Building","Rental House","PG / Hostel"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <div className="col-span-2">
            <Field label="Architect Notes">
              <textarea value={form.architect_notes} onChange={(e) => set("architect_notes", e.target.value)}
                rows={2} placeholder="Any special notes for buyer..." className={inputCls} />
            </Field>
          </div>
        </div>

        <SectionHeader num="2" title="Plot Details" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Plot Size">
            <input type="text" value={form.plot_size} onChange={(e) => set("plot_size", e.target.value)}
              placeholder="e.g. 30x40" autoComplete="off" className={inputCls} />
          </Field>
          <Field label="Plot Area (sqft)">
            <input type="text" value={form.plot_area} onChange={(e) => set("plot_area", e.target.value)}
              placeholder="e.g. 1200" autoComplete="off" className={inputCls} />
          </Field>
          <Field label="Road Facing">
            <select value={form.road_facing} onChange={(e) => set("road_facing", e.target.value)} className={inputCls}>
              {["North","South","East","West","North-East","North-West","South-East","South-West","Corner Plot"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Plot Shape">
            <select value={form.plot_shape} onChange={(e) => set("plot_shape", e.target.value)} className={inputCls}>
              {["Rectangle","Square","Irregular","Corner","L-Shape","T-Shape"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <SectionHeader num="3" title="Building Specifications" />
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Number of Floors">
              <input type="text" value={form.floors} onChange={(e) => set("floors", e.target.value)}
                placeholder="e.g. G+1, Stilt+G+2" autoComplete="off" className={inputCls} />
            </Field>
          </div>
          <Field label="Bedrooms">
            <input type="text" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)}
              placeholder="e.g. 3" autoComplete="off" className={inputCls} />
          </Field>
          <Field label="Bathrooms">
            <input type="text" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)}
              placeholder="e.g. 3" autoComplete="off" className={inputCls} />
          </Field>
          <Field label="Parking">
            <input type="text" value={form.parking} onChange={(e) => set("parking", e.target.value)}
              placeholder="e.g. 2 Car Parking" autoComplete="off" className={inputCls} />
          </Field>
          <Field label="Built-up Area (sqft)">
            <input type="text" value={form.built_up_area} onChange={(e) => set("built_up_area", e.target.value)}
              placeholder="e.g. 1800" autoComplete="off" className={inputCls} />
          </Field>
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Special Features</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: "is_vastu_compliant", label: "🔶 Vastu Compliant" },
              { key: "has_pooja_room",     label: "🛕 Pooja Room"       },
              { key: "has_balcony",        label: "🌿 Balcony"          },
              { key: "has_servant_room",   label: "🛏️ Servant Room"     },
              { key: "has_study_room",     label: "📚 Study Room"       },
              { key: "has_terrace",        label: "🏗️ Terrace"          },
              { key: "has_garden",         label: "🌳 Garden"           },
              { key: "is_green_building",  label: "♻️ Green Building"   },
              { key: "is_solar_ready",     label: "☀️ Solar Ready"      },
              { key: "has_home_theatre",   label: "🎬 Home Theatre"     },
              { key: "has_gym",            label: "🏋️ Gym"              },
              { key: "has_swimming_pool",  label: "🏊 Swimming Pool"    },
              { key: "has_water_body",     label: "💧 Water Body"       },
              { key: "has_car_garage",     label: "🚗 Car Garage"       },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-teal-50 hover:border-teal-300 transition">
                <input type="checkbox" checked={(form as any)[key]} onChange={(e) => set(key, e.target.checked)} className="accent-teal-600" />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <SectionHeader num="4" title="Plan Pricing" />
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="font-bold text-blue-700 text-sm mb-1">📦 Basic Package Price *</p>
            <p className="text-xs text-gray-500 mb-3">3D Render + Floor Plans + Elevations + Sections + Door & Window</p>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 font-semibold">₹</span>
              <input type="text" inputMode="decimal" value={form.basic_price}
                onChange={(e) => set("basic_price", e.target.value)}
                placeholder="e.g. 1499" autoComplete="off" className={`${inputCls} pl-7`} />
            </div>
            {form.basic_price && !isNaN(parseFloat(String(form.basic_price))) && (
              <p className="text-xs text-blue-600 mt-2">Your earnings: <strong>₹{Math.round(parseFloat(String(form.basic_price)) * 0.8).toLocaleString()}</strong></p>
            )}
          </div>
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
            <p className="font-bold text-purple-700 text-sm mb-1">⭐ Premium Package Price</p>
            <p className="text-xs text-gray-500 mb-3">Basic + CAD File + 3D Model Viewer</p>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 font-semibold">₹</span>
              <input type="text" inputMode="decimal" value={form.premium_price}
                onChange={(e) => set("premium_price", e.target.value)}
                placeholder="e.g. 2499 (optional)" autoComplete="off" className={`${inputCls} pl-7`} />
            </div>
            {form.premium_price && !isNaN(parseFloat(String(form.premium_price))) && (
              <p className="text-xs text-purple-600 mt-2">Your earnings: <strong>₹{Math.round(parseFloat(String(form.premium_price)) * 0.8).toLocaleString()}</strong></p>
            )}
          </div>
        </div>

        <SectionHeader num="5" title="Modification / Consultation" />
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800 text-sm">Allow Modification Requests?</p>
              <p className="text-xs text-gray-500 mt-0.5">Customers can request plan modifications after purchase</p>
            </div>
            <button type="button" onClick={() => set("modification_available", !form.modification_available)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${form.modification_available ? "bg-teal-500" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${form.modification_available ? "translate-x-7" : "translate-x-0"}`} />
            </button>
          </div>
          {form.modification_available && (
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
              <Field label="Consultation Fee (₹)">
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-semibold">₹</span>
                  <input type="text" value={form.consultation_fee} onChange={(e) => set("consultation_fee", e.target.value)}
                    placeholder="e.g. 500" autoComplete="off" className={`${inputCls} pl-7`} />
                </div>
              </Field>
              <Field label="Consultation Type">
                <select value={form.consultation_type} onChange={(e) => set("consultation_type", e.target.value)} className={inputCls}>
                  {["Online","In-Person","Both"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <div className="col-span-2">
                <Field label="Turnaround Time">
                  <input type="text" value={form.turnaround_time} onChange={(e) => set("turnaround_time", e.target.value)}
                    placeholder="e.g. 3-5 working days" autoComplete="off" className={inputCls} />
                </Field>
              </div>
            </div>
          )}
        </div>

        <SectionHeader num="6" title="3D Exterior Render / Preview Image" />
        <p className="text-xs text-gray-500 mb-4">Main image shown to customers. JPG, PNG, WEBP.</p>
        <div className="grid grid-cols-2 gap-4">
          <FileUploadBox label="Exterior Render / 3D View" accept=".jpg,.jpeg,.png,.webp"
            file={exteriorFile} existingUrl={plan?.exterior_render_url || plan?.image_url} onChange={setExteriorFile} />
        </div>

        <SectionHeader num="7" title="2D Drawings — Basic Package" />
        <p className="text-xs text-gray-500 mb-4">Included in Basic package purchase.</p>
        <div className="grid grid-cols-2 gap-4">
          <FileUploadBox label="Floor Plans (PDF)" accept=".pdf"
            file={floorPlanPdf} existingUrl={plan?.floor_plan_pdf_url} onChange={setFloorPlanPdf} />
          <FileUploadBox label="All 4 Elevations (PDF)" accept=".pdf"
            file={elevationPdf} existingUrl={plan?.elevation_north_url} onChange={setElevationPdf} />
          <FileUploadBox label="Staircase / Section Drawings (PDF)" accept=".pdf"
            file={sectionPdf} existingUrl={plan?.staircase_section_url} onChange={setSectionPdf} />
          <FileUploadBox label="Door & Window Schedule (PDF)" accept=".pdf"
            file={doorWindowPdf} existingUrl={plan?.door_window_pdf_url} onChange={setDoorWindowPdf} />
        </div>

        <SectionHeader num="8" title="CAD File — Premium Package" />
        <p className="text-xs text-gray-500 mb-4">DWG or DXF file. Included in Premium package.</p>
        <div className="grid grid-cols-2 gap-4">
          <FileUploadBox label="CAD File (DWG or DXF)" accept=".dwg,.dxf"
            file={cadFile} existingUrl={plan?.dwg_url || plan?.dxf_url} onChange={setCadFile} />
        </div>

        <SectionHeader num="9" title="3D Model Viewer — Premium Package" />
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-purple-800 mb-1">🏠 Three.js Built-in 3D Viewer</p>
          <p className="text-xs text-purple-600">Customers can rotate, zoom & pan the 3D model directly in NakshaKart — no software needed!</p>
          <p className="text-xs text-purple-500 mt-2">
            Supported formats: <strong>OBJ, FBX, GLB, STL</strong><br/>
            ArchiCAD: File → Save As → OBJ or GLB
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FileUploadBox label="3D Model File (OBJ, FBX, GLB, STL)" accept=".obj,.fbx,.glb,.gltf,.stl"
            file={model3dFile} existingUrl={plan?.model_3d_url} onChange={setModel3dFile} />
        </div>

        <div className="mt-8">
          {uploadStatus && (
            <div className="mb-4 bg-teal-50 border border-teal-200 rounded-lg px-4 py-3 text-sm text-teal-700 font-medium flex items-center gap-2">
              <span className="animate-spin">⏳</span> {uploadStatus}
            </div>
          )}
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg transition">
            {saving ? "Saving & Uploading..." : "💾 Save & Resubmit for Review"}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">Saving will resubmit this plan for admin approval</p>
        </div>
      </div>
    </div>
  );
}
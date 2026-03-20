"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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

const FileUploadBox = ({ label, accept, file, onChange }: {
  label: string; accept: string; file: File | null; onChange: (f: File | null) => void
}) => (
  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-teal-400 transition">
    <input type="file" accept={accept} onChange={(e) => onChange(e.target.files?.[0] || null)} className="hidden" id={`file-${label}`} />
    <label htmlFor={`file-${label}`} className="cursor-pointer block">
      {file ? (
        <div>
          <p className="text-green-600 font-semibold text-sm">✅ {file.name}</p>
          <p className="text-xs text-gray-400 mt-1">Click to change</p>
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

const unitOptions = ["ft", "m", "mm"];

const getPlatformFee = (floors: string): number => {
  if (!floors) return 99;
  const f = floors.toLowerCase().trim();
  if (f === "g" || f === "ground") return 99;
  if (f.includes("g+1"))           return 149;
  if (f.includes("g+2"))           return 199;
  if (f.includes("g+3"))           return 299;
  return 499;
};

const getFloorLabel = (floors: string): string => {
  if (!floors) return "Ground Floor only";
  const f = floors.toLowerCase().trim();
  if (f === "g" || f === "ground") return "Ground Floor only";
  if (f.includes("g+1"))           return "G+1 (2 floors)";
  if (f.includes("g+2"))           return "G+2 (3 floors)";
  if (f.includes("g+3"))           return "G+3 (4 floors)";
  return "G+4 and above";
};

const DRAWING_CHECKS = [
  { key: "check_room_labels",  label: "All rooms are labeled on floor plan (Bedroom, Hall, Kitchen, etc.)" },
  { key: "check_dimensions",   label: "Dimensions are shown on all drawings"                               },
  { key: "check_north",        label: "North direction is marked on floor plan"                            },
  { key: "check_scale",        label: "Scale is mentioned on drawings (e.g. 1:100)"                        },
  { key: "check_elevations",   label: "All 4 elevations (North, South, East, West) are included"           },
  { key: "check_legible",      label: "All drawings are clear and legible (not blurry or low quality)"     },
  { key: "check_site_match",   label: "Site dimensions on drawing match the plot size entered above"       },
  { key: "check_original",     label: "These are my original drawings — not copied from another architect" },
];

export default function UploadPlan() {
  const router = useRouter();
  const [loading,      setLoading]      = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [unit,         setUnit]         = useState("ft");

  const [agreed, setAgreed] = useState({
    creator: false, display: false, copyright: false, terms: false,
  });

  const [drawingChecks, setDrawingChecks] = useState({
    check_room_labels: false, check_dimensions: false, check_north: false,
    check_scale: false, check_elevations: false, check_legible: false,
    check_site_match: false, check_original: false,
  });

  const [exteriorFile,  setExteriorFile]  = useState<File | null>(null);
  const [floorPlanPdf,  setFloorPlanPdf]  = useState<File | null>(null);
  const [elevationPdf,  setElevationPdf]  = useState<File | null>(null);
  const [sectionPdf,    setSectionPdf]    = useState<File | null>(null);
  const [doorWindowPdf, setDoorWindowPdf] = useState<File | null>(null);
  const [cadFile,       setCadFile]       = useState<File | null>(null);
  const [model3dFile,   setModel3dFile]   = useState<File | null>(null);

  const [form, setForm] = useState({
    title: "", description: "", category: "Independent House", architect_notes: "",
    plot_width: "", plot_depth: "", plot_area: "",
    road_facing: "North", plot_shape: "Rectangle",
    floors: "", bedrooms: "", bathrooms: "", parking: "",
    built_up_area: "", basic_price: "", premium_price: "",
    modification_available: false,
    consultation_fee: "", consultation_type: "Online", turnaround_time: "",
    is_vastu_compliant: false, has_pooja_room: false, has_balcony: false,
    has_servant_room: false, has_study_room: false, has_terrace: false,
    has_garden: false, has_parking: false, is_green_building: false,
    is_solar_ready: false, has_home_theatre: false, has_gym: false,
    has_swimming_pool: false, has_water_body: false, has_car_garage: false,
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleDimension = (key: "plot_width" | "plot_depth", val: string) => {
    set(key, val);
    const w = key === "plot_width" ? parseFloat(val) : parseFloat(form.plot_width);
    const d = key === "plot_depth" ? parseFloat(val) : parseFloat(form.plot_depth);
    if (!isNaN(w) && !isNaN(d)) set("plot_area", (w * d).toFixed(0));
  };

  const platformFee = getPlatformFee(form.floors);
  const plotSize    = form.plot_width && form.plot_depth ? `${form.plot_width}x${form.plot_depth}` : "";
  const checksCompleted = Object.values(drawingChecks).filter(Boolean).length;
  const allChecked      = checksCompleted === DRAWING_CHECKS.length;

  const uploadFile = async (file: File, folder: string, userId: string): Promise<string> => {
    const ext  = file.name.split(".").pop();
    const path = `${folder}/${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("plan-images").upload(path, file);
    if (error) { console.error(`Upload failed [${folder}]:`, error.message); return ""; }
    return supabase.storage.from("plan-images").getPublicUrl(path).data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!form.title || !form.basic_price)     return alert("Please fill title and basic price");
    if (!form.plot_width || !form.plot_depth)  return alert("Please enter plot width and depth");
    if (!form.floors)                          return alert("Please select number of floors");
    if (!allChecked)                           return alert(`Please complete all ${DRAWING_CHECKS.length} drawing quality checks (${checksCompleted}/${DRAWING_CHECKS.length} done)`);
    if (!Object.values(agreed).every(Boolean)) return alert("Please agree to all terms before submitting");

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    setUploadStatus("Uploading exterior render...");
    const exterior_render_url   = exteriorFile  ? await uploadFile(exteriorFile,  "renders", user.id) : null;
    setUploadStatus("Uploading floor plans...");
    const floor_plan_pdf_url    = floorPlanPdf  ? await uploadFile(floorPlanPdf,  "pdfs",    user.id) : null;
    setUploadStatus("Uploading elevations...");
    const elevation_pdf_url     = elevationPdf  ? await uploadFile(elevationPdf,  "pdfs",    user.id) : null;
    setUploadStatus("Uploading section drawings...");
    const staircase_section_url = sectionPdf    ? await uploadFile(sectionPdf,    "pdfs",    user.id) : null;
    setUploadStatus("Uploading door & window schedule...");
    const door_window_pdf_url   = doorWindowPdf ? await uploadFile(doorWindowPdf, "pdfs",    user.id) : null;
    setUploadStatus("Uploading CAD file...");
    const dwg_url = cadFile && cadFile.name.toLowerCase().endsWith(".dwg") ? await uploadFile(cadFile, "cad", user.id) : null;
    const dxf_url = cadFile && cadFile.name.toLowerCase().endsWith(".dxf") ? await uploadFile(cadFile, "cad", user.id) : null;
    setUploadStatus("Uploading 3D model...");
    const model_3d_url = model3dFile ? await uploadFile(model3dFile, "models", user.id) : null;
    setUploadStatus("Saving plan to database...");

    const fee = getPlatformFee(form.floors);

    const { error } = await supabase.from("plans").insert({
      title:           form.title,
      description:     form.description,
      category:        form.category,
      architect_notes: form.architect_notes,
      plot_size:       plotSize ? `${plotSize} ${unit}` : null,
      plot_width:      form.plot_width  ? parseFloat(form.plot_width)  : null,
      plot_depth:      form.plot_depth  ? parseFloat(form.plot_depth)  : null,
      plot_area:       form.plot_area   ? parseFloat(form.plot_area)   : null,
      plot_unit:       unit,
      road_facing:     form.road_facing,
      plot_shape:      form.plot_shape,
      floors:          form.floors    || null,
      bedrooms:        form.bedrooms  || null,
      bathrooms:       form.bathrooms || null,
      parking:         form.parking   || null,
      built_up_area:   form.built_up_area ? `${form.built_up_area} sq${unit}` : null,
      basic_price:     parseFloat(form.basic_price),
      premium_price:   form.premium_price ? parseFloat(form.premium_price) : null,
      price:           parseFloat(form.basic_price),
      platform_fee:    fee,
      drawing_checklist: drawingChecks,
      modification_available: form.modification_available,
      consultation_fee:   form.modification_available && form.consultation_fee ? parseFloat(form.consultation_fee) : null,
      consultation_type:  form.modification_available ? form.consultation_type : null,
      turnaround_time:    form.modification_available ? form.turnaround_time   : null,
      image_url:          exterior_render_url,
      exterior_render_url,
      floor_plan_pdf_url,
      elevation_north_url: elevation_pdf_url,
      elevation_south_url: elevation_pdf_url,
      elevation_east_url:  elevation_pdf_url,
      elevation_west_url:  elevation_pdf_url,
      staircase_section_url,
      door_window_pdf_url,
      dwg_url, dxf_url, model_3d_url,
      architect_id:    user.id,
      status:          "pending",
      measurement_unit: unit,
      is_vastu_compliant: form.is_vastu_compliant,
      has_pooja_room:     form.has_pooja_room,
      has_balcony:        form.has_balcony,
      has_servant_room:   form.has_servant_room,
      has_study_room:     form.has_study_room,
      has_terrace:        form.has_terrace,
      has_garden:         form.has_garden,
      is_green_building:  form.is_green_building,
      is_solar_ready:     form.is_solar_ready,
      has_home_theatre:   form.has_home_theatre,
      has_gym:            form.has_gym,
      has_swimming_pool:  form.has_swimming_pool,
      has_water_body:     form.has_water_body,
      has_car_garage:     form.has_car_garage,
    });

    setLoading(false);
    setUploadStatus("");
    if (error) { alert("Error saving plan: " + error.message); return; }
    alert("✅ Plan submitted for review! Admin will approve shortly.");
    router.push("/architect/my-plans");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">📤 Upload New Plan</h1>
        <p className="text-gray-500 text-sm mt-1">Fill all details carefully. Admin will review before publishing.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

        {/* UNIT SELECTOR */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 mb-6">
          <p className="text-sm font-bold text-orange-700 mb-3">📐 Select Measurement Unit</p>
          <div className="flex gap-3">
            {unitOptions.map((u) => (
              <button key={u} type="button" onClick={() => setUnit(u)}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm border-2 transition ${
                  unit === u ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-gray-300 text-gray-600 hover:border-orange-300"
                }`}>
                {u === "ft" ? "Feet (ft)" : u === "m" ? "Metres (m)" : "Millimetres (mm)"}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 1 */}
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

        {/* SECTION 2 */}
        <SectionHeader num="2" title={`Plot Dimensions (in ${unit})`} />
        <div className="grid grid-cols-2 gap-4">
          <Field label={`Plot Width * (${unit})`}>
            <div className="relative">
              <input type="number" value={form.plot_width}
                onChange={(e) => handleDimension("plot_width", e.target.value)}
                placeholder={unit === "ft" ? "e.g. 30" : "e.g. 9"} className={`${inputCls} pr-10`} />
              <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-semibold">{unit}</span>
            </div>
          </Field>
          <Field label={`Plot Depth * (${unit})`}>
            <div className="relative">
              <input type="number" value={form.plot_depth}
                onChange={(e) => handleDimension("plot_depth", e.target.value)}
                placeholder={unit === "ft" ? "e.g. 40" : "e.g. 12"} className={`${inputCls} pr-10`} />
              <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-semibold">{unit}</span>
            </div>
          </Field>
          <Field label={`Plot Area (sq${unit}) — auto calculated`}>
            <div className="relative">
              <input type="number" value={form.plot_area}
                onChange={(e) => set("plot_area", e.target.value)}
                placeholder="Auto calculated" className={`${inputCls} pr-14 bg-gray-50`} />
              <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-semibold">sq{unit}</span>
            </div>
          </Field>
          {plotSize && (
            <div className="flex items-center">
              <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 w-full">
                <p className="text-xs text-teal-500 font-medium">Plot Size</p>
                <p className="text-lg font-bold text-teal-700">{plotSize} {unit}</p>
              </div>
            </div>
          )}
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

        {/* SECTION 3 */}
        <SectionHeader num="3" title="Building Specifications" />
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Number of Floors *">
              <select value={form.floors} onChange={(e) => set("floors", e.target.value)} className={inputCls}>
                <option value="">Select floors</option>
                <option value="G">G (Ground only)</option>
                <option value="G+1">G+1 (2 floors)</option>
                <option value="G+2">G+2 (3 floors)</option>
                <option value="G+3">G+3 (4 floors)</option>
                <option value="G+4">G+4 (5 floors)</option>
                <option value="G+5">G+5 (6 floors)</option>
                <option value="Stilt+G+1">Stilt+G+1</option>
                <option value="Stilt+G+2">Stilt+G+2</option>
                <option value="Basement+G+1">Basement+G+1</option>
                <option value="Duplex">Duplex</option>
                <option value="Villa">Villa</option>
              </select>
            </Field>
            {form.floors && (
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-500 font-medium">Platform Fee</p>
                  <p className="text-sm text-blue-700">{getFloorLabel(form.floors)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-700">₹{platformFee}</p>
                  <p className="text-xs text-blue-400">one-time to go live</p>
                </div>
              </div>
            )}
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
          <Field label={`Built-up Area (sq${unit})`}>
            <div className="relative">
              <input type="text" value={form.built_up_area}
                onChange={(e) => set("built_up_area", e.target.value)}
                placeholder="e.g. 1800" autoComplete="off" className={`${inputCls} pr-14`} />
              <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-semibold">sq{unit}</span>
            </div>
          </Field>
        </div>

        {/* Special Features */}
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

        {/* SECTION 4 */}
        <SectionHeader num="4" title="Plan Pricing" />
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-xs text-orange-700 font-semibold">
            ℹ️ NakshaKart charges 20% commission on every sale. You receive 80%.
          </p>
        </div>
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
            {form.basic_price && !isNaN(parseFloat(form.basic_price)) && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-blue-600">Your earnings: <strong>₹{Math.round(parseFloat(form.basic_price) * 0.8).toLocaleString()}</strong></p>
                <p className="text-xs text-orange-500">NakshaKart: <strong>₹{Math.round(parseFloat(form.basic_price) * 0.2).toLocaleString()}</strong></p>
              </div>
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
            {form.premium_price && !isNaN(parseFloat(form.premium_price)) && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-purple-600">Your earnings: <strong>₹{Math.round(parseFloat(form.premium_price) * 0.8).toLocaleString()}</strong></p>
                <p className="text-xs text-orange-500">NakshaKart: <strong>₹{Math.round(parseFloat(form.premium_price) * 0.2).toLocaleString()}</strong></p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5 */}
        <SectionHeader num="5" title="Modification / Consultation" />
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800 text-sm">Allow Modification Requests?</p>
              <p className="text-xs text-gray-500 mt-0.5">Customers can request modifications after purchase</p>
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
                  <input type="text" value={form.consultation_fee}
                    onChange={(e) => set("consultation_fee", e.target.value)}
                    placeholder="e.g. 500" className={`${inputCls} pl-7`} />
                </div>
              </Field>
              <Field label="Consultation Type">
                <select value={form.consultation_type} onChange={(e) => set("consultation_type", e.target.value)} className={inputCls}>
                  {["Online","In-Person","Both"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <div className="col-span-2">
                <Field label="Turnaround Time">
                  <input type="text" value={form.turnaround_time}
                    onChange={(e) => set("turnaround_time", e.target.value)}
                    placeholder="e.g. 3-5 working days" className={inputCls} />
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 6 */}
        <SectionHeader num="6" title="Preview Image" />
        <p className="text-xs text-gray-500 mb-4">Main image shown to buyers. JPG, PNG, WEBP.</p>
        <div className="grid grid-cols-2 gap-4">
          <FileUploadBox label="Exterior Render / 3D View" accept=".jpg,.jpeg,.png,.webp" file={exteriorFile} onChange={setExteriorFile} />
        </div>

        {/* SECTION 7 */}
        <SectionHeader num="7" title="2D Drawings — Basic Package" />
        <p className="text-xs text-gray-500 mb-4">Included in Basic package purchase.</p>
        <div className="grid grid-cols-2 gap-4">
          <FileUploadBox label="Floor Plans (PDF)"                  accept=".pdf" file={floorPlanPdf}  onChange={setFloorPlanPdf}  />
          <FileUploadBox label="All 4 Elevations (PDF)"             accept=".pdf" file={elevationPdf}  onChange={setElevationPdf}  />
          <FileUploadBox label="Staircase / Section Drawings (PDF)" accept=".pdf" file={sectionPdf}    onChange={setSectionPdf}    />
          <FileUploadBox label="Door & Window Schedule (PDF)"       accept=".pdf" file={doorWindowPdf} onChange={setDoorWindowPdf} />
        </div>

        {/* SECTION 8 */}
        <SectionHeader num="8" title="CAD File — Premium Package" />
        <p className="text-xs text-gray-500 mb-4">DWG or DXF file. Included in Premium package.</p>
        <div className="grid grid-cols-2 gap-4">
          <FileUploadBox label="CAD File (DWG or DXF)" accept=".dwg,.dxf" file={cadFile} onChange={setCadFile} />
        </div>

        {/* SECTION 9 */}
        <SectionHeader num="9" title="3D Model Viewer — Premium Package" />
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-purple-800 mb-1">🏠 Interactive 3D Viewer</p>
          <p className="text-xs text-purple-600">Customers can rotate, zoom, pan and paint colors!</p>
          <p className="text-xs text-purple-500 mt-2">Supported: <strong>GLB</strong> recommended</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FileUploadBox label="3D Model File (GLB recommended)" accept=".obj,.fbx,.glb,.gltf,.stl" file={model3dFile} onChange={setModel3dFile} />
        </div>

        {/* SECTION 10 — DRAWING CHECKLIST */}
        <SectionHeader num="10" title="Drawing Quality Checklist" />
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-5 mb-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-yellow-800">⚠️ Mandatory Quality Checklist</p>
              <p className="text-xs text-yellow-700 mt-0.5">Admin verifies these before approving. Incomplete drawings will be rejected.</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              allChecked ? "bg-green-100 text-green-700" : "bg-yellow-200 text-yellow-800"
            }`}>
              {checksCompleted}/{DRAWING_CHECKS.length} ✓
            </span>
          </div>
          <div className="space-y-2">
            {DRAWING_CHECKS.map(({ key, label }) => (
              <label key={key} className={`flex items-start gap-3 cursor-pointer rounded-lg px-4 py-3 border transition ${
                (drawingChecks as any)[key]
                  ? "bg-green-50 border-green-300"
                  : "bg-white border-yellow-200 hover:bg-yellow-50"
              }`}>
                <input type="checkbox"
                  checked={(drawingChecks as any)[key]}
                  onChange={(e) => setDrawingChecks((p) => ({ ...p, [key]: e.target.checked }))}
                  className="accent-green-600 mt-0.5 w-4 h-4 flex-shrink-0" />
                <span className={`text-sm ${(drawingChecks as any)[key] ? "text-green-700 font-medium" : "text-gray-700"}`}>
                  {(drawingChecks as any)[key] ? "✅" : "⬜"} {label}
                </span>
              </label>
            ))}
          </div>
          {!allChecked && (
            <p className="text-xs text-yellow-700 mt-3 text-center">
              ⚠️ Complete all {DRAWING_CHECKS.length} checks to submit your plan
            </p>
          )}
          {allChecked && (
            <p className="text-xs text-green-700 mt-3 text-center font-semibold">
              ✅ All quality checks passed! You can now submit your plan.
            </p>
          )}
        </div>

        {/* Platform Fee Summary */}
        {form.floors && (
          <div className="mt-6 bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-200 rounded-2xl p-5">
            <h3 className="font-bold text-teal-800 mb-3">💳 Platform Fee Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Plan type</span>
                <span className="font-semibold">{getFloorLabel(form.floors)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">One-time platform fee</span>
                <span className="font-bold text-teal-700">₹{platformFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Commission per sale</span>
                <span className="font-semibold text-orange-600">20%</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 11 — TERMS */}
        <SectionHeader num="11" title="Terms & Agreement" />
        <div className="space-y-3">
          {[
            { key: "creator",   label: "I confirm that I am the original creator of this design."                                    },
            { key: "display",   label: "I agree that NakshaKart can display preview images."                                         },
            { key: "copyright", label: "I confirm this plan does not violate any copyright."                                         },
            { key: "terms",     label: "I agree to NakshaKart Architect Terms including 20% commission on all sales."                },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={(agreed as any)[key]}
                onChange={(e) => setAgreed((p) => ({ ...p, [key]: e.target.checked }))}
                className="accent-teal-600 mt-0.5 w-4 h-4" />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>

        {/* Submit */}
        <div className="mt-8">
          {uploadStatus && (
            <div className="mb-4 bg-teal-50 border border-teal-200 rounded-lg px-4 py-3 text-sm text-teal-700 font-medium flex items-center gap-2">
              <span className="animate-spin">⏳</span> {uploadStatus}
            </div>
          )}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg transition">
            {loading ? "Uploading & Submitting..." : "📤 Submit Plan for Review"}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            Plan will be <strong>Pending</strong> until admin approves.
            {form.floors && ` Platform fee ₹${platformFee} after approval.`}
          </p>
        </div>
      </div>
    </div>
  );
}
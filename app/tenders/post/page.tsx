"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const inputCls = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

const PROFESSIONS = [
  { key: "Architect",             icon: "🏠", label: "Architect"              },
  { key: "Civil Contractor",      icon: "🏗️", label: "Civil Contractor"       },
  { key: "Interior Designer",     icon: "🪑", label: "Interior Designer"      },
  { key: "Structural Engineer",   icon: "⚙️", label: "Structural Engineer"    },
  { key: "Geo Technical Services",icon: "🌍", label: "Geo Technical Services" },
];

const TENDER_TYPES = [
  "House Plan Design",
  "Interior Design",
  "Structural Design",
  "Full Construction",
  "Renovation / Remodeling",
  "Geo Technical Survey",
  "Other",
];

export default function PostTenderPage() {
  const router  = useRouter();
  const [step,      setStep]      = useState<1 | 2 | 3>(1);
  const [loading,   setLoading]   = useState(false);
  const [agreed,    setAgreed]    = useState(false);
  const [tenderId,  setTenderId]  = useState<string | null>(null);

  const [form, setForm] = useState({
    title:             "",
    description:       "",
    tender_type:       "House Plan Design",
    profession_needed: [] as string[],
    city:              "",
    location:          "",
    budget_min:        "",
    budget_max:        "",
    plot_width:        "",
    plot_depth:        "",
    plot_area:         "",
    plot_unit:         "ft",
    plot_shape:        "Rectangle",
    road_facing:       "North",
    floors_needed:     "",
    bedrooms_needed:   "",
    timeline:          "",
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const toggleProfession = (key: string) => {
    setForm((p) => ({
      ...p,
      profession_needed: p.profession_needed.includes(key)
        ? p.profession_needed.filter((k) => k !== key)
        : [...p.profession_needed, key],
    }));
  };

  const handleDimension = (key: "plot_width" | "plot_depth", val: string) => {
    set(key, val);
    const w = key === "plot_width"  ? parseFloat(val) : parseFloat(form.plot_width);
    const d = key === "plot_depth"  ? parseFloat(val) : parseFloat(form.plot_depth);
    if (!isNaN(w) && !isNaN(d)) set("plot_area", (w * d).toFixed(0));
  };

  const handleSaveDraft = async () => {
    if (!form.title)                       return alert("Please enter a title");
    if (!form.tender_type)                 return alert("Please select tender type");
    if (form.profession_needed.length === 0) return alert("Please select at least one profession");
    if (!agreed)                           return alert("Please accept the disclaimer");

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data, error } = await supabase.from("tenders").insert({
      customer_id:           user.id,
      title:                 form.title,
      description:           form.description,
      tender_type:           form.tender_type,
      profession_needed:     form.profession_needed,
      city:                  form.city || null,
      location:              form.location || null,
      budget_min:            form.budget_min ? parseFloat(form.budget_min) : null,
      budget_max:            form.budget_max ? parseFloat(form.budget_max) : null,
      plot_width:            form.plot_width  ? parseFloat(form.plot_width)  : null,
      plot_depth:            form.plot_depth  ? parseFloat(form.plot_depth)  : null,
      plot_area:             form.plot_area   ? parseFloat(form.plot_area)   : null,
      plot_unit:             form.plot_unit,
      plot_shape:            form.plot_shape  || null,
      road_facing:           form.road_facing || null,
      floors_needed:         form.floors_needed  || null,
      bedrooms_needed:       form.bedrooms_needed || null,
      timeline:              form.timeline    || null,
      status:                "draft",
      disclaimer_accepted:   true,
      disclaimer_accepted_at: new Date().toISOString(),
    }).select().single();

    setLoading(false);
    if (error) { alert("Error: " + error.message); return; }
    setTenderId(data.id);
    setStep(3);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">📋 Post a Tender</h1>
        <p className="text-gray-500 text-sm mt-1">
          Connect with architects, contractors and other professionals
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { n: 1, label: "Disclaimer"    },
          { n: 2, label: "Tender Details"},
          { n: 3, label: "Pay & Publish" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s.n ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {step > s.n ? "✓" : s.n}
            </div>
            <span className={`text-sm font-medium ${step >= s.n ? "text-teal-700" : "text-gray-400"}`}>
              {s.label}
            </span>
            {i < 2 && <div className={`w-8 h-0.5 ${step > s.n ? "bg-teal-600" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Disclaimer ── */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">⚖️</span>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Legal Disclaimer</h2>
              <p className="text-xs text-gray-500">Please read carefully before posting</p>
            </div>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 mb-5">
            <p className="text-sm font-bold text-red-700 mb-3">
              ⚠️ IMPORTANT — Please Read Before Proceeding
            </p>
            <div className="space-y-2 text-sm text-red-700">
              <p>1. <strong>NakshaKart is a technology platform only.</strong> We facilitate connections between customers and construction professionals. We are NOT a construction company.</p>
              <p>2. <strong>NakshaKart is NOT responsible</strong> for project execution, quality of work, timelines, or any disputes arising from projects.</p>
              <p>3. <strong>NakshaKart is NOT a party</strong> to any agreement, contract, or transaction between you and any professional.</p>
              <p>4. <strong>All project negotiations, contracts, and payments</strong> happen directly between you and the professional. NakshaKart has no role in this.</p>
              <p>5. <strong>NakshaKart does NOT verify</strong> the credentials, licenses, or quality of work of professionals listed on this platform.</p>
              <p>6. <strong>Posting fee of ₹200 is non-refundable</strong> once paid, regardless of whether you receive bids or select a professional.</p>
              <p>7. <strong>You are solely responsible</strong> for verifying professional credentials, checking references, and making informed decisions.</p>
              <p>8. <strong>NakshaKart will not mediate</strong> any disputes between customers and professionals.</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5">
            <p className="text-xs text-yellow-800 font-semibold mb-1">📋 What NakshaKart provides:</p>
            <div className="space-y-1 text-xs text-yellow-700">
              <p>✅ A platform to post your project requirement</p>
              <p>✅ Visibility to registered professionals in your area</p>
              <p>✅ A messaging system to communicate with professionals</p>
              <p>✅ A bidding system to compare quotes</p>
              <p>❌ NakshaKart does NOT guarantee project completion</p>
              <p>❌ NakshaKart does NOT handle project payments</p>
              <p>❌ NakshaKart does NOT resolve disputes</p>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer bg-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:border-teal-300 transition">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              className="accent-teal-600 w-5 h-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700 font-medium">
              I have read and understood the disclaimer. I agree that NakshaKart is only a platform and is not responsible for any project-related issues, disputes, or outcomes. I accept these terms and wish to proceed.
            </span>
          </label>

          <button onClick={() => { if (!agreed) { alert("Please accept the disclaimer to proceed"); return; } setStep(2); }}
            className="w-full mt-5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold transition">
            I Agree — Continue to Post Tender →
          </button>
        </div>
      )}

      {/* ── STEP 2: Tender Details ── */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">

          {/* Basic Info */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4">📋 Tender Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tender Title *</label>
                <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Need Architect for 30x40 House Plan in Bangalore"
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                  rows={4} placeholder="Describe your project in detail — what you need, any special requirements..."
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tender Type *</label>
                <select value={form.tender_type} onChange={(e) => set("tender_type", e.target.value)} className={inputCls}>
                  {TENDER_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Professions needed */}
          <div>
            <h3 className="font-bold text-gray-800 mb-2">👥 Professions Required *</h3>
            <p className="text-xs text-gray-500 mb-3">Select all that apply — professionals of these types will see your tender</p>
            <div className="grid grid-cols-2 gap-3">
              {PROFESSIONS.map(({ key, icon, label }) => (
                <label key={key} className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer transition ${
                  form.profession_needed.includes(key)
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-200 hover:border-teal-300"
                }`}>
                  <input type="checkbox"
                    checked={form.profession_needed.includes(key)}
                    onChange={() => toggleProfession(key)}
                    className="accent-teal-600 w-4 h-4" />
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">📍 Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input type="text" value={form.city} onChange={(e) => set("city", e.target.value)}
                  placeholder="e.g. Bangalore" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area / Locality</label>
                <input type="text" value={form.location} onChange={(e) => set("location", e.target.value)}
                  placeholder="e.g. Whitefield" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Plot Details */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">📐 Plot Details (optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Unit</label>
                <select value={form.plot_unit} onChange={(e) => set("plot_unit", e.target.value)} className={inputCls}>
                  <option value="ft">Feet (ft)</option>
                  <option value="m">Metres (m)</option>
                </select>
              </div>
              <div />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plot Width ({form.plot_unit})</label>
                <input type="number" value={form.plot_width}
                  onChange={(e) => handleDimension("plot_width", e.target.value)}
                  placeholder="e.g. 30" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plot Depth ({form.plot_unit})</label>
                <input type="number" value={form.plot_depth}
                  onChange={(e) => handleDimension("plot_depth", e.target.value)}
                  placeholder="e.g. 40" className={inputCls} />
              </div>
              {form.plot_area && (
                <div className="col-span-2">
                  <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-2 flex items-center justify-between">
                    <span className="text-sm text-teal-600">Plot Area</span>
                    <span className="font-bold text-teal-700">{form.plot_area} sq{form.plot_unit}</span>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plot Shape</label>
                <select value={form.plot_shape} onChange={(e) => set("plot_shape", e.target.value)} className={inputCls}>
                  {["Rectangle","Square","Irregular","Corner","L-Shape","T-Shape"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Road Facing</label>
                <select value={form.road_facing} onChange={(e) => set("road_facing", e.target.value)} className={inputCls}>
                  {["North","South","East","West","North-East","North-West","South-East","South-West","Corner Plot"].map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Project Requirements */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">🏗️ Project Requirements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floors Needed</label>
                <select value={form.floors_needed} onChange={(e) => set("floors_needed", e.target.value)} className={inputCls}>
                  <option value="">Select</option>
                  {["G","G+1","G+2","G+3","G+4","Duplex","Villa"].map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms Needed</label>
                <select value={form.bedrooms_needed} onChange={(e) => set("bedrooms_needed", e.target.value)} className={inputCls}>
                  <option value="">Select</option>
                  {["1 BHK","2 BHK","3 BHK","4 BHK","5 BHK","6+ BHK"].map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                <select value={form.timeline} onChange={(e) => set("timeline", e.target.value)} className={inputCls}>
                  <option value="">Select</option>
                  {["Urgent (1 week)","2-4 weeks","1-2 months","3-6 months","Flexible"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Budget */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">💰 Budget Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Budget (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                  <input type="number" value={form.budget_min} onChange={(e) => set("budget_min", e.target.value)}
                    placeholder="e.g. 50000" className={`${inputCls} pl-7`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Budget (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                  <input type="number" value={form.budget_max} onChange={(e) => set("budget_max", e.target.value)}
                    placeholder="e.g. 200000" className={`${inputCls} pl-7`} />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(1)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition">
              ← Back
            </button>
            <button onClick={handleSaveDraft} disabled={loading}
              className="flex-2 flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold transition">
              {loading ? "Saving..." : "Continue to Payment →"}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Pay & Publish ── */}
      {step === 3 && tenderId && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Tender Saved!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Pay ₹200 posting fee to publish your tender and start receiving bids from professionals.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-bold text-blue-700 mb-2">📋 What happens next:</p>
            <div className="space-y-1.5 text-xs text-blue-600">
              <p>✅ Your tender goes live immediately after payment</p>
              <p>✅ Professionals pay ₹10 each to submit a bid</p>
              <p>✅ You receive all bids in your dashboard</p>
              <p>✅ You shortlist and chat with professionals</p>
              <p>✅ Tender stays live for 30 days</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6 text-xs text-yellow-700">
            ⚠️ Posting fee of ₹200 is non-refundable once paid
          </div>

          <a href={`/tenders/pay-posting-fee/${tenderId}`}
            className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg transition mb-3">
            💳 Pay ₹200 & Publish Tender →
          </a>
          <a href="/tenders/my-tenders"
            className="block text-center text-gray-400 hover:text-gray-600 text-sm transition">
            Save as draft — pay later
          </a>
        </div>
      )}
    </div>
  );
}
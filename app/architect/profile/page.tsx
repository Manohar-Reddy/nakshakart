"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const inputCls = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

const softwareOptions = [
  "AutoCAD", "SketchUp", "Revit", "3ds Max", "Lumion",
  "V-Ray", "ArchiCAD", "Blender", "Photoshop", "CorelDRAW",
  "STAAD Pro", "ETABS", "Navisworks", "Rhino", "Other"
];

const designerTypes = [
  "Licensed Architect", "Civil Engineer", "Interior Designer",
  "3D Designer", "Draftsman",
];

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-5 mt-8 border-b border-gray-100 pb-3">
    <h2 className="text-lg font-bold text-gray-800">{title}</h2>
    {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
  </div>
);

const Field = ({ label, children, optional }: { label: string; children: React.ReactNode; optional?: boolean }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {optional && <span className="text-gray-400 font-normal">(optional)</span>}
    </label>
    {children}
  </div>
);

export default function ArchitectProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");
  const [sampleWorkFiles, setSampleWorkFiles] = useState<File[]>([]);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    state: "",
    country: "India",
    bio: "",
    designer_type: "Licensed Architect",
    years_experience: "",
    specialization: "",
    education: "",
    college: "",
    graduation_year: "",
    software_skills: [] as string[],
    portfolio_url: "",
    behance_url: "",
    linkedin_url: "",
    instagram_url: "",
    coa_number: "",
    profile_photo_url: "",
    sample_work_urls: [] as string[],
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const toggleSkill = (skill: string) => {
    setForm((p) => ({
      ...p,
      software_skills: p.software_skills.includes(skill)
        ? p.software_skills.filter((s) => s !== skill)
        : [...p.software_skills, skill],
    }));
  };

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
      if (data) {
        setForm({
          name: data.name || user.user_metadata?.full_name || "",
          phone: data.phone || user.user_metadata?.phone || "",
          city: data.city || user.user_metadata?.city || "",
          state: data.state || user.user_metadata?.state || "",
          country: data.country || "India",
          bio: data.bio || "",
          designer_type: data.designer_type || user.user_metadata?.designer_type || "Licensed Architect",
          years_experience: data.experience || "",
          specialization: data.specialization || "",
          education: data.education || "",
          college: data.college || "",
          graduation_year: data.graduation_year || "",
          software_skills: data.software_skills || [],
          portfolio_url: data.portfolio_url || "",
          behance_url: data.behance_url || "",
          linkedin_url: data.linkedin_url || "",
          instagram_url: data.instagram_url || "",
          coa_number: data.coa_number || "",
          profile_photo_url: data.profile_photo_url || "",
          sample_work_urls: data.sample_work_urls || [],
        });
        if (data.profile_photo_url) setProfilePhotoPreview(data.profile_photo_url);
      }
      setLoading(false);
    };
    load();
  }, []);

  // Profile completion %
  const completionFields = [
    form.name, form.phone, form.city, form.bio,
    form.designer_type, form.years_experience,
    form.education, form.software_skills.length > 0 ? "yes" : "",
    form.profile_photo_url || profilePhotoFile ? "yes" : "",
    form.sample_work_urls.length > 0 || sampleWorkFiles.length > 0 ? "yes" : "",
  ];
  const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePhotoFile(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
  };

  const handleSampleWorks = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSampleWorkFiles((prev) => [...prev, ...files].slice(0, 5));
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    let profile_photo_url = form.profile_photo_url;
    let sample_work_urls = [...form.sample_work_urls];

    // Upload profile photo
    if (profilePhotoFile) {
      const ext = profilePhotoFile.name.split(".").pop();
      const path = `profiles/${user.id}/photo.${ext}`;
      await supabase.storage.from("plan-images").upload(path, profilePhotoFile, { upsert: true });
      const { data } = supabase.storage.from("plan-images").getPublicUrl(path);
      profile_photo_url = data.publicUrl;
    }

    // Upload sample works
    for (const file of sampleWorkFiles) {
      const ext = file.name.split(".").pop();
      const path = `profiles/${user.id}/samples/${Date.now()}.${ext}`;
      await supabase.storage.from("plan-images").upload(path, file);
      const { data } = supabase.storage.from("plan-images").getPublicUrl(path);
      sample_work_urls.push(data.publicUrl);
    }

    sample_work_urls = sample_work_urls.slice(0, 5);

    await supabase.from("users").upsert({
      id: user.id,
      name: form.name,
      phone: form.phone,
      city: form.city,
      state: form.state,
      country: form.country,
      bio: form.bio,
      designer_type: form.designer_type,
      experience: form.years_experience,
      specialization: form.specialization,
      education: form.education,
      college: form.college,
      graduation_year: form.graduation_year,
      software_skills: form.software_skills,
      portfolio_url: form.portfolio_url,
      behance_url: form.behance_url,
      linkedin_url: form.linkedin_url,
      instagram_url: form.instagram_url,
      coa_number: form.coa_number,
      profile_photo_url,
      sample_work_urls,
    });

    setForm((p) => ({ ...p, profile_photo_url, sample_work_urls }));
    setSampleWorkFiles([]);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">👤 Profile Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Complete your profile to build trust with customers</p>
        </div>
        {form.coa_number && (
          <span className="bg-green-100 text-green-700 border border-green-300 px-3 py-1 rounded-full text-sm font-semibold">
            ✅ CoA Registered
          </span>
        )}
      </div>

      {/* Profile Completion Banner */}
      <div className={`rounded-xl p-5 mb-6 border-2 ${
        completion === 100 ? "bg-green-50 border-green-300" :
        completion >= 70 ? "bg-teal-50 border-teal-300" :
        "bg-yellow-50 border-yellow-300"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold text-gray-800">Profile Completion</p>
          <p className="font-bold text-lg">{completion}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              completion === 100 ? "bg-green-500" :
              completion >= 70 ? "bg-teal-500" : "bg-yellow-500"
            }`}
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {completion === 100 ? "🎉 Profile complete! Customers can fully trust your work." :
           completion >= 70 ? "Almost there! Complete your profile to get more customers." :
           "⚠️ Incomplete profile gets fewer customers. Please fill all details."}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

        {/* SECTION 1 - Profile Photo */}
        <SectionHeader title="Profile Photo" />
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-teal-100 flex items-center justify-center border-2 border-teal-300 flex-shrink-0">
            {profilePhotoPreview ? (
              <img src={profilePhotoPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-teal-600">
                {form.name ? form.name[0].toUpperCase() : "A"}
              </span>
            )}
          </div>
          <div>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
            <label htmlFor="photo-upload"
              className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
              📷 Upload Photo
            </label>
            <p className="text-xs text-gray-400 mt-2">JPG, PNG. Max 2MB. Square photo recommended.</p>
          </div>
        </div>

        {/* SECTION 2 - Basic Info */}
        <SectionHeader title="Basic Information" />
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Full Name">
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="Your full name" autoComplete="off" className={inputCls} />
            </Field>
          </div>
          <Field label="Phone Number">
            <input type="text" inputMode="numeric" value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+91 98765 43210" autoComplete="off" className={inputCls} />
          </Field>
          <Field label="City">
            <input type="text" value={form.city} onChange={(e) => set("city", e.target.value)}
              placeholder="e.g. Hyderabad" autoComplete="off" className={inputCls} />
          </Field>
          <Field label="State">
            <input type="text" value={form.state} onChange={(e) => set("state", e.target.value)}
              placeholder="e.g. Telangana" autoComplete="off" className={inputCls} />
          </Field>
          <Field label="Country">
            <input type="text" value={form.country} onChange={(e) => set("country", e.target.value)}
              placeholder="India" autoComplete="off" className={inputCls} />
          </Field>
          <div className="col-span-2">
            <Field label="Bio / About Yourself">
              <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)}
                rows={3} placeholder="Tell customers about your experience, style and expertise..."
                className={inputCls} />
            </Field>
          </div>
        </div>

        {/* SECTION 3 - Professional Details */}
        <SectionHeader title="Professional Details" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="I am a">
            <select value={form.designer_type} onChange={(e) => set("designer_type", e.target.value)} className={inputCls}>
              {designerTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Years of Experience">
            <input type="text" inputMode="numeric" value={form.years_experience}
              onChange={(e) => set("years_experience", e.target.value)}
              placeholder="e.g. 5" autoComplete="off" className={inputCls} />
          </Field>
          <div className="col-span-2">
            <Field label="Specialization" optional>
              <input type="text" value={form.specialization}
                onChange={(e) => set("specialization", e.target.value)}
                placeholder="e.g. Residential villas, Commercial buildings..."
                autoComplete="off" className={inputCls} />
            </Field>
          </div>
        </div>

        {/* SECTION 4 - Education */}
        <SectionHeader title="Education" subtitle="Help customers understand your qualifications" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Highest Qualification">
            <select value={form.education} onChange={(e) => set("education", e.target.value)} className={inputCls}>
              <option value="">Select qualification</option>
              {["B.Arch", "M.Arch", "B.Tech Civil", "M.Tech Civil", "Diploma in Civil",
                "Diploma in Architecture", "B.Des (Interior)", "M.Des (Interior)",
                "Self-taught", "Certification Course", "Other"].map((q) => (
                <option key={q}>{q}</option>
              ))}
            </select>
          </Field>
          <Field label="College / University" optional>
            <input type="text" value={form.college} onChange={(e) => set("college", e.target.value)}
              placeholder="e.g. JNTU Hyderabad" autoComplete="off" className={inputCls} />
          </Field>
          <Field label="Year of Graduation" optional>
            <input type="text" inputMode="numeric" value={form.graduation_year}
              onChange={(e) => set("graduation_year", e.target.value)}
              placeholder="e.g. 2018" autoComplete="off" className={inputCls} />
          </Field>
        </div>

        {/* SECTION 5 - Software Skills */}
        <SectionHeader title="Software Skills" subtitle="Select all software you use" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {softwareOptions.map((skill) => (
            <label key={skill} className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer transition ${
              form.software_skills.includes(skill)
                ? "bg-teal-50 border-teal-400 text-teal-700"
                : "bg-gray-50 border-gray-200 hover:border-teal-300"
            }`}>
              <input type="checkbox" checked={form.software_skills.includes(skill)}
                onChange={() => toggleSkill(skill)} className="accent-teal-600" />
              <span className="text-sm font-medium">{skill}</span>
            </label>
          ))}
        </div>

        {/* SECTION 6 - Portfolio Links */}
        <SectionHeader title="Portfolio & Social Links" subtitle="Help customers find your work online" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Portfolio Website" optional>
            <input type="text" value={form.portfolio_url}
              onChange={(e) => set("portfolio_url", e.target.value)}
              placeholder="https://yourwebsite.com" autoComplete="off" className={inputCls} />
          </Field>
          <Field label="Behance Profile" optional>
            <input type="text" value={form.behance_url}
              onChange={(e) => set("behance_url", e.target.value)}
              placeholder="https://behance.net/yourname" autoComplete="off" className={inputCls} />
          </Field>
          <Field label="LinkedIn Profile" optional>
            <input type="text" value={form.linkedin_url}
              onChange={(e) => set("linkedin_url", e.target.value)}
              placeholder="https://linkedin.com/in/yourname" autoComplete="off" className={inputCls} />
          </Field>
          <Field label="Instagram Profile" optional>
            <input type="text" value={form.instagram_url}
              onChange={(e) => set("instagram_url", e.target.value)}
              placeholder="https://instagram.com/yourname" autoComplete="off" className={inputCls} />
          </Field>
        </div>

        {/* SECTION 7 - CoA Number */}
        <SectionHeader title="Council of Architecture Registration" subtitle="Optional — adds a verified badge to your profile" />
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="CoA Registration Number" optional>
              <input type="text" value={form.coa_number}
                onChange={(e) => set("coa_number", e.target.value)}
                placeholder="e.g. CA/2015/12345" autoComplete="off" className={inputCls} />
            </Field>
            <p className="text-xs text-gray-400 mt-1">
              ✅ Adding your CoA number shows a verified badge on your public profile. Admin will verify manually.
            </p>
          </div>
        </div>

        {/* SECTION 8 - Sample Works */}
        <SectionHeader title="Sample Work" subtitle="Upload 3-5 of your best projects to attract customers" />

        {/* Existing sample works */}
        {form.sample_work_urls.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {form.sample_work_urls.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt={`Sample ${i + 1}`} className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                <button onClick={() => set("sample_work_urls", form.sample_work_urls.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New uploads preview */}
        {sampleWorkFiles.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {sampleWorkFiles.map((file, i) => (
              <div key={i} className="relative">
                <img src={URL.createObjectURL(file)} alt={`New ${i + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-teal-300" />
                <span className="absolute top-1 left-1 bg-teal-600 text-white text-xs px-1 rounded">New</span>
                <button onClick={() => setSampleWorkFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {(form.sample_work_urls.length + sampleWorkFiles.length) < 5 && (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-teal-400 transition">
            <input type="file" accept="image/*" multiple onChange={handleSampleWorks}
              className="hidden" id="sample-upload" />
            <label htmlFor="sample-upload" className="cursor-pointer">
              <p className="text-3xl mb-2">🖼️</p>
              <p className="text-sm text-gray-600 font-medium">Click to upload sample work images</p>
              <p className="text-xs text-gray-400 mt-1">
                {5 - form.sample_work_urls.length - sampleWorkFiles.length} more can be added · JPG, PNG
              </p>
            </label>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8">
          {success && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 text-center font-semibold">
              ✅ Profile saved successfully!
            </div>
          )}
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg transition">
            {saving ? "Saving..." : "💾 Save Profile"}
          </button>
        </div>

      </div>
    </div>
  );
}
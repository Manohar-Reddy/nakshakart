"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PROFESSIONS = [
  { key: "Architect",              icon: "🏠", label: "Architect",              desc: "Licensed architect / house plan designer"    },
  { key: "Civil Contractor",       icon: "🏗️", label: "Civil Contractor",       desc: "Building construction & execution"           },
  { key: "Interior Designer",      icon: "🪑", label: "Interior Designer",       desc: "Interior spaces & décor"                    },
  { key: "Structural Engineer",    icon: "⚙️", label: "Structural Engineer",     desc: "Structural design & analysis"               },
  { key: "Geo Technical Services", icon: "🌍", label: "Geo Technical Services",  desc: "Soil testing & geo technical surveys"       },
  { key: "3D Designer",            icon: "🎨", label: "3D Designer",             desc: "3D visualization & rendering"               },
  { key: "Draftsman",              icon: "📐", label: "Draftsman / CAD Designer", desc: "Technical drawings & CAD work"             },
];

const inputCls = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

export default function Signup() {
  const router  = useRouter();
  const [role,    setRole]    = useState<"customer" | "professional">("customer");
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const [form, setForm] = useState({
    name:            "",
    email:           "",
    password:        "",
    confirmPassword: "",
    phone:           "",
    profession:      "",
    city:            "",
    state:           "",
    experience:      "",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleNext = () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill all fields"); return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match"); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters"); return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    if (role === "professional") {
      if (!form.profession) { setError("Please select your profession"); return; }
      if (!form.phone || !form.city || !form.state) {
        setError("Please fill all fields"); return;
      }
    }
    setLoading(true);
    setError("");

    // Architect can upload plans, others can only bid on tenders
    const dbRole = form.profession === "Architect" ? "architect" : role === "professional" ? "architect" : "customer";

    const { data, error: signupError } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options: {
        data: {
          full_name:   form.name,
          role:        dbRole,
          profession:  form.profession || null,
          phone:       form.phone,
          city:        form.city,
          state:       form.state,
          experience:  form.experience || null,
          account_status: "active",
        },
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("users").upsert({
        id:         data.user.id,
        name:       form.name,
        email:      form.email,
        role:       dbRole,
        profession: form.profession || null,
        phone:      form.phone,
        city:       form.city,
        state:      form.state,
        experience: form.experience ? parseInt(form.experience) : null,
        account_status: "active",
      });
    }

    setLoading(false);

    if (role === "professional" && form.profession === "Architect") {
      alert("✅ Account created! You can now upload house plans and bid on tenders.");
      router.push("/architect/dashboard");
    } else if (role === "professional") {
      alert("✅ Account created! You can now browse and bid on project tenders.");
      router.push("/tenders");
    } else {
      router.push("/browse");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">
            <span className="text-teal-600">Naksha</span>
            <span className="text-orange-500">Kart</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Create your account</p>
        </div>

        {/* Role Selector */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => { setRole("customer"); setStep(1); setForm((p) => ({ ...p, profession: "" })); }}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition ${
              role === "customer"
                ? "bg-teal-600 border-teal-600 text-white"
                : "bg-white border-gray-200 text-gray-600 hover:border-teal-400"
            }`}>
            🏠 I'm a Customer
          </button>
          <button onClick={() => { setRole("professional"); setStep(1); }}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition ${
              role === "professional"
                ? "bg-teal-600 border-teal-600 text-white"
                : "bg-white border-gray-200 text-gray-600 hover:border-teal-400"
            }`}>
            👷 I'm a Professional
          </button>
        </div>

        {/* Role description */}
        {role === "customer" && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 mb-5 text-xs text-teal-700">
            🏠 As a customer you can browse & buy house plans, post project tenders, save to wishlist and leave reviews.
          </div>
        )}
        {role === "professional" && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 text-xs text-blue-700">
            👷 As a professional you can bid on project tenders posted by customers.
            {" "}<strong>Architects</strong> can also upload and sell house plans.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {/* ── STEP 1 — Basic Info ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="Your full name" autoComplete="off" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                placeholder="your@email.com" autoComplete="off" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
                placeholder="Min 6 characters" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <input type="password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)}
                placeholder="Repeat password" className={inputCls} />
            </div>

            {role === "customer" ? (
              <button onClick={handleSubmit} disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-bold transition">
                {loading ? "Creating Account..." : "Create Account →"}
              </button>
            ) : (
              <button onClick={handleNext}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold transition">
                Next → Professional Details
              </button>
            )}
          </div>
        )}

        {/* ── STEP 2 — Professional Details ── */}
        {step === 2 && role === "professional" && (
          <div className="space-y-4">

            {/* Profession selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Profession *</label>
              <div className="space-y-2">
                {PROFESSIONS.map(({ key, icon, label, desc }) => (
                  <label key={key} className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer transition ${
                    form.profession === key
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-teal-300"
                  }`}>
                    <input type="radio" name="profession" value={key}
                      checked={form.profession === key}
                      onChange={() => set("profession", key)}
                      className="accent-teal-600 flex-shrink-0" />
                    <span className="text-xl">{icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Architect special note */}
            {form.profession === "Architect" && (
              <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-xs text-teal-700">
                🏠 As an Architect you can upload and sell house plans + bid on tenders.
                NakshaKart charges 20% commission on plan sales.
              </div>
            )}

            {/* Other professions note */}
            {form.profession && form.profession !== "Architect" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700">
                💼 As a {form.profession} you can browse and bid on project tenders posted by customers.
                Pay ₹10 per bid to connect with customers.
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input type="text" inputMode="numeric" value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91 98765 43210" autoComplete="off" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input type="text" value={form.city} onChange={(e) => set("city", e.target.value)}
                  placeholder="e.g. Hyderabad" autoComplete="off" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input type="text" value={form.state} onChange={(e) => set("state", e.target.value)}
                  placeholder="e.g. Telangana" autoComplete="off" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input type="number" value={form.experience} onChange={(e) => set("experience", e.target.value)}
                placeholder="e.g. 5" className={inputCls} />
            </div>

            {/* Terms */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-xs text-gray-600">
              <p className="font-semibold mb-1">📋 By creating an account you agree:</p>
              <p>• NakshaKart is a platform only — not responsible for project outcomes</p>
              {form.profession === "Architect" && <>
                <p>• NakshaKart keeps 20% commission on all plan sales</p>
                <p>• Platform fee per plan based on floors (₹99–₹499)</p>
              </>}
              <p>• Bid fee of ₹10 per tender is non-refundable</p>
              <p>• All project dealings are directly between you and the customer</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition">
                ← Back
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-bold transition">
                {loading ? "Creating..." : "Create Account ✓"}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
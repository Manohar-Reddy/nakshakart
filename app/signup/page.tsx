"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const designerTypes = [
  "Licensed Architect",
  "Civil Engineer",
  "Interior Designer",
  "3D Designer",
  "Draftsman",
];

const inputCls = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

export default function Signup() {
  const router = useRouter();
  const [role, setRole] = useState<"customer" | "architect">("customer");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    designer_type: "Licensed Architect",
    city: "",
    state: "",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleNext = () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill all fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    if (role === "architect") {
      if (!form.phone || !form.city || !form.state) {
        setError("Please fill all fields");
        return;
      }
    }
    setLoading(true);
    setError("");

    const needsApproval = role === "architect" &&
      (form.designer_type === "3D Designer" || form.designer_type === "Draftsman");

    const { data, error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
          role,
          phone: form.phone,
          designer_type: form.designer_type,
          city: form.city,
          state: form.state,
          account_status: needsApproval ? "pending" : "active",
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
        id: data.user.id,
        name: form.name,
        email: form.email,
        role,
        phone: form.phone,
        designer_type: form.designer_type,
        city: form.city,
        state: form.state,
        account_status: needsApproval ? "pending" : "active",
      });
    }

    setLoading(false);

    if (needsApproval) {
      alert("✅ Account created! Since you registered as a " + form.designer_type + ", your account needs admin approval. You'll be notified once approved.");
      router.push("/login");
    } else if (role === "architect") {
      alert("✅ Account created! Please complete your profile to start uploading plans.");
      router.push("/architect/dashboard");
    } else {
      router.push("/browse");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            <span className="text-teal-600">Naksha</span>
            <span className="text-orange-500">Kart</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Create your account</p>
        </div>

        {/* Role Selector */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => { setRole("customer"); setStep(1); }}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition ${
              role === "customer"
                ? "bg-teal-600 border-teal-600 text-white"
                : "bg-white border-gray-200 text-gray-600 hover:border-teal-400"
            }`}>
            🏠 I'm a Customer
          </button>
          <button onClick={() => { setRole("architect"); setStep(1); }}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition ${
              role === "architect"
                ? "bg-teal-600 border-teal-600 text-white"
                : "bg-white border-gray-200 text-gray-600 hover:border-teal-400"
            }`}>
            📐 I'm a Designer
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {/* STEP 1 - Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="Your full name" autoComplete="off" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                placeholder="your@email.com" autoComplete="off" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
                placeholder="Min 6 characters" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
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

        {/* STEP 2 - Architect Professional Details */}
        {step === 2 && role === "architect" && (
          <div className="space-y-4">
            <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3 text-sm text-teal-700 mb-2">
              📐 Tell us about your professional background
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">I am a *</label>
              <select value={form.designer_type} onChange={(e) => set("designer_type", e.target.value)} className={inputCls}>
                {designerTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            {(form.designer_type === "3D Designer" || form.designer_type === "Draftsman") && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
                ⚠️ As a <strong>{form.designer_type}</strong>, your account will require admin approval before you can upload plans. You'll need to upload sample works in your profile after signup.
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

            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-xs text-gray-600">
              <p className="font-semibold mb-1">📋 By creating an account you agree:</p>
              <p>• Not to solicit customers outside NakshaKart for plans listed on this platform</p>
              <p>• NakshaKart keeps 20% commission on all sales</p>
              <p>• ₹100 platform fee per plan after admin approval</p>
              <p>• Plans must be original work — no copyright violations</p>
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
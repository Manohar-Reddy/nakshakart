"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-teal-700 mb-2">Check your email!</h2>
          <p className="text-gray-500 mb-6">
            We sent a verification link to <strong>{email}</strong>. Please verify your account to continue.
          </p>
          <Link
            href="/login"
            className="block w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition text-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.png" alt="NakshaKart" width={80} height={80} />
          <h1 className="text-2xl font-bold text-teal-700 mt-2">
            Naksha<span className="text-orange-500">Kart</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Create your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={`py-3 rounded-xl text-sm font-semibold border-2 transition ${
              role === "customer"
                ? "border-teal-600 bg-teal-50 text-teal-700"
                : "border-gray-200 text-gray-500"
            }`}
          >
            👤 I am a Customer
          </button>
          <button
            type="button"
            onClick={() => setRole("architect")}
            className={`py-3 rounded-xl text-sm font-semibold border-2 transition ${
              role === "architect"
                ? "border-orange-500 bg-orange-50 text-orange-600"
                : "border-gray-200 text-gray-500"
            }`}
          >
            🏗️ I am an Architect
          </button>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
          </div>

          <div className="flex items-start gap-2 text-sm text-gray-600">
            <input type="checkbox" required className="mt-1" />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-teal-600 hover:underline">Terms & Conditions</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-teal-600 hover:underline">Privacy Policy</Link>
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-orange-500 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
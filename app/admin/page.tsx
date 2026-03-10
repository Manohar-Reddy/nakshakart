"use client";
import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const role = data.user?.user_metadata?.role;
    if (role !== "admin" && role !== "superadmin") {
      setError("You are not authorized to access the admin panel.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-700">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white rounded-xl p-2 mb-3">
            <Image src="/logo.png" alt="NakshaKart" width={70} height={70} />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Naksha<span className="text-orange-400">Kart</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
          <div className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full mt-2 font-semibold">
            🔐 Restricted Access
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm border border-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nakshakart.com"
              required
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 mt-2"
          >
            {loading ? "Verifying..." : "Login to Admin Panel"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          This area is restricted to authorized administrators only.
        </p>
      </div>
    </div>
  );
}
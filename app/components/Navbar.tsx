"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>("");
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setRole(user.user_metadata?.role || "customer");
      }
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setRole(session.user.user_metadata?.role || "customer");
      } else {
        setUser(null);
        setRole("");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/browse?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const getDashboardLink = () => {
    if (role === "admin" || role === "superadmin") return "/admin/dashboard";
    if (role === "architect") return "/architect/dashboard";
    return "/my-purchases";
  };

  return (
    <nav className="bg-white shadow-sm border-b-4 border-orange-500">
      <div className="px-8 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <Image src="/logo.png" alt="NakshaKart Logo" width={45} height={45} />
          <div>
            <h1 className="text-xl font-bold text-teal-700">
              Naksha<span className="text-orange-500">Kart</span>
            </h1>
            <p className="text-xs text-orange-400">BLUEPRINTS TO REALITY</p>
          </div>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-lg">
          <div className="flex items-center border-2 border-teal-500 rounded-full overflow-hidden bg-white">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search house plans... e.g. 3BHK, 30x40"
              className="flex-1 px-4 py-2 text-sm focus:outline-none bg-white text-gray-800 min-w-0"
            />
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 text-sm font-medium transition flex-shrink-0"
            >
              🔍
            </button>
          </div>
        </form>

        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <>
              <span className="text-sm text-gray-600">
                👋 {user.user_metadata?.full_name?.split(" ")[0] || "User"}
              </span>
              {role === "customer" && (
                <Link
                  href="/my-purchases"
                  className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 px-3 py-1.5 rounded-full text-sm font-medium transition"
                >
                  My Purchases
                </Link>
              )}
              <Link
                href={getDashboardLink()}
                className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 px-3 py-1.5 rounded-full text-sm font-medium transition"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-full text-sm font-medium transition">
                Login
              </Link>
              <Link href="/signup" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-full text-sm font-medium transition">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="px-8 py-2 flex items-center gap-3 border-t border-gray-100">
        <Link href="/" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition">
          Home
        </Link>
        <Link href="/browse" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition">
          Browse Plans
        </Link>
        <Link href="/calculator" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition">
          🧱 Calculator
        </Link>
        <Link href="/about" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition">
          About Us
        </Link>
        <Link href="/contact" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition">
          Contact Us
        </Link>
      </div>
    </nav>
  );
}
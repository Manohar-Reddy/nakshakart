"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const PROFESSIONS = [
  { key: "Architect",              icon: "🏠" },
  { key: "Civil Contractor",       icon: "🏗️" },
  { key: "Interior Designer",      icon: "🪑" },
  { key: "Structural Engineer",    icon: "⚙️" },
  { key: "Geo Technical Services", icon: "🌍" },
];

export default function TendersPage() {
  const [tenders,    setTenders]    = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [user,       setUser]       = useState<any>(null);
  const [userRole,   setUserRole]   = useState<string>("");
  const [filter,     setFilter]     = useState("all");
  const [search,     setSearch]     = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setUserRole(user.user_metadata?.role || "customer");
      }

      const { data } = await supabase
        .from("tenders")
        .select("*, users:customer_id(name, city)")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      setTenders(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = tenders.filter((t) => {
    const matchSearch = !search.trim() ||
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.city?.toLowerCase().includes(search.toLowerCase()) ||
      t.tender_type?.toLowerCase().includes(search.toLowerCase());

    const matchFilter = filter === "all" ||
      t.profession_needed?.includes(filter);

    return matchSearch && matchFilter;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading tenders...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 Project Tenders</h1>
          <p className="text-gray-500 text-sm mt-1">
            {tenders.length} open tenders · Connect with customers directly
          </p>
        </div>
        <div className="flex gap-3">
          {(userRole === "customer" || !user) && (
            <Link href="/tenders/post"
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition">
              + Post a Tender
            </Link>
          )}
          {user && (
            <Link href="/tenders/my-tenders"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold text-sm transition">
              My Tenders
            </Link>
          )}
        </div>
      </div>

      {/* Disclaimer banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-2">
        <span className="text-yellow-500 flex-shrink-0">⚠️</span>
        <p className="text-xs text-yellow-700">
          <strong>Disclaimer:</strong> NakshaKart is a platform only. We are not responsible for project execution, quality, payments, or disputes between customers and professionals. All project dealings are directly between the two parties.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search by title, city, project type..."
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border-2 ${
              filter === "all" ? "bg-teal-600 border-teal-600 text-white" : "bg-white border-gray-200 text-gray-600"
            }`}>
            All ({tenders.length})
          </button>
          {PROFESSIONS.map(({ key, icon }) => (
            <button key={key} onClick={() => setFilter(filter === key ? "all" : key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border-2 ${
                filter === key ? "bg-teal-600 border-teal-600 text-white" : "bg-white border-gray-200 text-gray-600"
              }`}>
              {icon} {key}
            </button>
          ))}
        </div>
      </div>

      {/* Tenders Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg font-semibold text-gray-600">No tenders found</p>
          <p className="text-gray-400 text-sm mt-2 mb-6">Be the first to post a project requirement</p>
          <Link href="/tenders/post"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition">
            Post a Tender →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((tender) => {
            const daysLeft = Math.max(0, Math.floor(
              (new Date(tender.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            ));
            return (
              <div key={tender.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition group">

                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1">
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                      {tender.tender_type}
                    </span>
                    <h3 className="font-bold text-gray-800 mt-1 text-base line-clamp-2 group-hover:text-teal-700 transition">
                      {tender.title}
                    </h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${
                    daysLeft <= 5 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                  }`}>
                    ⏳ {daysLeft}d left
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                  {tender.city           && <p>📍 {tender.city}{tender.location ? `, ${tender.location}` : ""}</p>}
                  {tender.floors_needed  && <p>🏢 {tender.floors_needed}</p>}
                  {tender.bedrooms_needed && <p>🛏️ {tender.bedrooms_needed}</p>}
                  {tender.timeline       && <p>⏱️ {tender.timeline}</p>}
                  {tender.plot_width && tender.plot_depth && (
                    <p>📐 {tender.plot_width}×{tender.plot_depth} {tender.plot_unit}</p>
                  )}
                  {tender.plot_shape     && <p>⬛ {tender.plot_shape}</p>}
                </div>

                {/* Budget */}
                {(tender.budget_min || tender.budget_max) && (
                  <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-1.5 mb-3">
                    <p className="text-xs text-green-700 font-semibold">
                      💰 Budget: ₹{tender.budget_min?.toLocaleString() || "—"} – ₹{tender.budget_max?.toLocaleString() || "—"}
                    </p>
                  </div>
                )}

                {/* Professions */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tender.profession_needed?.map((p: string) => {
                    const prof = PROFESSIONS.find((pr) => pr.key === p);
                    return (
                      <span key={p} className="bg-teal-50 border border-teal-200 text-teal-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {prof?.icon} {p}
                      </span>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Posted by {tender.users?.name || "Customer"} ·{" "}
                    {new Date(tender.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short"
                    })}
                  </p>
                  <Link href={`/tenders/${tender.id}`}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition">
                    View & Bid →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
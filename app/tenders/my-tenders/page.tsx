"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyTendersPage() {
  const [tenders,   setTenders]   = useState<any[]>([]);
  const [myBids,    setMyBids]    = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<"posted" | "bids">("posted");
  const [userRole,  setUserRole]  = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const role = user.user_metadata?.role || "customer";
      setUserRole(role);

      // Customer's posted tenders
      const { data: tenderData } = await supabase
        .from("tenders")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      setTenders(tenderData || []);

      // Professional's submitted bids
      const { data: bidsData } = await supabase
        .from("tender_bids")
        .select("*, tenders(*)")
        .eq("professional_id", user.id)
        .order("created_at", { ascending: false });

      setMyBids(bidsData || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 My Tenders</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your tenders and bids</p>
        </div>
        <div className="flex gap-3">
          <Link href="/tenders"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold transition">
            Browse Tenders
          </Link>
          <Link href="/tenders/post"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition">
            + Post Tender
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button onClick={() => setActiveTab("posted")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === "posted"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}>
          📋 Posted Tenders ({tenders.length})
        </button>
        <button onClick={() => setActiveTab("bids")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === "bids"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}>
          💼 My Bids ({myBids.length})
        </button>
      </div>

      {/* Posted Tenders */}
      {activeTab === "posted" && (
        <div className="space-y-4">
          {tenders.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-semibold text-gray-600">No tenders posted yet</p>
              <Link href="/tenders/post"
                className="mt-4 inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition">
                Post Your First Tender →
              </Link>
            </div>
          ) : (
            tenders.map((tender) => {
              const daysLeft = Math.max(0, Math.floor(
                (new Date(tender.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              ));
              return (
                <div key={tender.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          tender.status === "open"    ? "bg-green-100 text-green-700"  :
                          tender.status === "awarded" ? "bg-blue-100 text-blue-700"   :
                          tender.status === "draft"   ? "bg-gray-100 text-gray-600"   :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {tender.status === "open"    ? "🟢 Open"     :
                           tender.status === "awarded" ? "🏆 Awarded"  :
                           tender.status === "draft"   ? "📝 Draft"    : tender.status}
                        </span>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                          {tender.tender_type}
                        </span>
                        {tender.status === "open" && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            daysLeft <= 5 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                          }`}>
                            ⏳ {daysLeft} days left
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-800">{tender.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {tender.city && `📍 ${tender.city}`}
                        {tender.budget_max && ` · 💰 up to ₹${tender.budget_max?.toLocaleString()}`}
                        {` · 📅 ${new Date(tender.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {tender.status === "draft" && (
                        <Link href={`/tenders/pay-posting-fee/${tender.id}`}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition text-center">
                          💳 Pay ₹200 to Publish
                        </Link>
                      )}
                      <Link href={`/tenders/${tender.id}`}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition text-center">
                        View Bids →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* My Bids */}
      {activeTab === "bids" && (
        <div className="space-y-4">
          {myBids.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
              <p className="text-4xl mb-3">💼</p>
              <p className="font-semibold text-gray-600">No bids submitted yet</p>
              <Link href="/tenders"
                className="mt-4 inline-block bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition">
                Browse Tenders →
              </Link>
            </div>
          ) : (
            myBids.map((bid) => (
              <div key={bid.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{bid.tenders?.title || "—"}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {bid.tenders?.tender_type} · {bid.tenders?.city || "—"}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        bid.status === "selected" ? "bg-green-100 text-green-700" :
                        bid.status === "pending"  ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {bid.status === "selected" ? "🏆 Selected!" :
                         bid.status === "pending"  ? "⏳ Pending"   : bid.status}
                      </span>
                      {!bid.platform_fee_paid && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                          💳 Fee not paid
                        </span>
                      )}
                      {bid.quote_amount && (
                        <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                          💰 ₹{bid.quote_amount?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!bid.platform_fee_paid && (
                      <Link href={`/tenders/pay-bid-fee/${bid.id}`}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition">
                        Pay ₹10 →
                      </Link>
                    )}
                    <Link href={`/tenders/${bid.tender_id}`}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition">
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
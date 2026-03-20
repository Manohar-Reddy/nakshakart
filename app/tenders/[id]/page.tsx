"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const PROFESSIONS = [
  { key: "Architect",              icon: "🏠" },
  { key: "Civil Contractor",       icon: "🏗️" },
  { key: "Interior Designer",      icon: "🪑" },
  { key: "Structural Engineer",    icon: "⚙️" },
  { key: "Geo Technical Services", icon: "🌍" },
];

export default function TenderDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const tenderId = params.id as string;

  const [tender,      setTender]      = useState<any>(null);
  const [bids,        setBids]        = useState<any[]>([]);
  const [user,        setUser]        = useState<any>(null);
  const [userRole,    setUserRole]    = useState<string>("");
  const [loading,     setLoading]     = useState(true);
  const [myBid,       setMyBid]       = useState<any>(null);
  const [isOwner,     setIsOwner]     = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setUserRole(user.user_metadata?.role || "customer");
      }

      const { data: tenderData } = await supabase
        .from("tenders")
        .select("*, users:customer_id(id, name, city)")
        .eq("id", tenderId)
        .single();

      if (!tenderData) { router.push("/tenders"); return; }
      setTender(tenderData);
      setIsOwner(user?.id === tenderData.customer_id);

      // Load bids
      const { data: bidsData } = await supabase
        .from("tender_bids")
        .select("*, users:professional_id(name, city, profession, experience)")
        .eq("tender_id", tenderId)
        .eq("platform_fee_paid", true)
        .order("created_at", { ascending: false });

      setBids(bidsData || []);

      if (user) {
        const myBid = bidsData?.find((b) => b.professional_id === user.id);
        setMyBid(myBid || null);
      }

      setLoading(false);
    };
    load();
  }, [tenderId]);

  const handleSelectBid = async (bidId: string, professionalId: string) => {
    if (!confirm("Select this professional for your project? They will be notified via message.")) return;

    await supabase.from("tenders").update({
      status:         "awarded",
      selected_bid_id: bidId,
    }).eq("id", tenderId);

    await supabase.from("tender_bids").update({ status: "selected" }).eq("id", bidId);

    // Notify selected professional
    await supabase.from("notifications").insert({
      user_id: professionalId,
      title:   "🎉 Your bid was selected!",
      message: `The customer has selected your bid for "${tender.title}". Check your messages to proceed.`,
      type:    "bid_selected",
    });

    // Open chat
    router.push(`/messages/tender-${tenderId}-${user.id}-${professionalId}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading tender...</p>
    </div>
  );

  if (!tender) return null;

  const daysLeft = Math.max(0, Math.floor(
    (new Date(tender.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  ));

  const canBid = user &&
    userRole !== "customer" &&
    !isOwner &&
    !myBid &&
    tender.status === "open";

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <Link href="/tenders" className="text-teal-600 hover:underline text-sm mb-6 inline-block">
        ← Back to Tenders
      </Link>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-2">
        <span className="text-yellow-500 flex-shrink-0 text-sm">⚠️</span>
        <p className="text-xs text-yellow-700">
          <strong>Disclaimer:</strong> NakshaKart is a platform only and is NOT responsible for project execution, quality, payments, or disputes. All dealings are directly between the customer and professional.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left — Tender Details ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                  {tender.tender_type}
                </span>
                <h1 className="text-xl font-bold text-gray-800 mt-2">{tender.title}</h1>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-bold flex-shrink-0 ${
                tender.status === "open"    ? "bg-green-100 text-green-700"  :
                tender.status === "awarded" ? "bg-blue-100 text-blue-700"   :
                "bg-gray-100 text-gray-600"
              }`}>
                {tender.status === "open" ? "🟢 Open" : tender.status === "awarded" ? "🏆 Awarded" : tender.status}
              </span>
            </div>

            {tender.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{tender.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
              {tender.city           && <p>📍 {tender.city}{tender.location ? `, ${tender.location}` : ""}</p>}
              {tender.timeline       && <p>⏱️ {tender.timeline}</p>}
              {tender.floors_needed  && <p>🏢 {tender.floors_needed}</p>}
              {tender.bedrooms_needed && <p>🛏️ {tender.bedrooms_needed}</p>}
              {tender.plot_width && tender.plot_depth && (
                <p>📐 {tender.plot_width}×{tender.plot_depth} {tender.plot_unit}</p>
              )}
              {tender.plot_shape     && <p>⬛ {tender.plot_shape}</p>}
              {tender.road_facing    && <p>🧭 {tender.road_facing}</p>}
              <p>📅 Posted {new Date(tender.created_at).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric"
              })}</p>
              <p>⏳ {daysLeft} days left</p>
            </div>

            {(tender.budget_min || tender.budget_max) && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mt-4">
                <p className="text-sm font-bold text-green-700">
                  💰 Budget: ₹{tender.budget_min?.toLocaleString() || "—"} – ₹{tender.budget_max?.toLocaleString() || "—"}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 mt-4">
              {tender.profession_needed?.map((p: string) => {
                const prof = PROFESSIONS.find((pr) => pr.key === p);
                return (
                  <span key={p} className="bg-teal-50 border border-teal-200 text-teal-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {prof?.icon} {p}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Bids */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="font-bold text-gray-800 mb-4">
              📬 Bids Received ({bids.length})
            </h2>

            {bids.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-sm">No bids yet — be the first to bid!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bids.map((bid) => (
                  <div key={bid.id} className={`border-2 rounded-xl p-4 ${
                    bid.status === "selected"
                      ? "border-green-400 bg-green-50"
                      : "border-gray-200"
                  }`}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center font-bold text-teal-600 flex-shrink-0">
                          {bid.users?.name?.[0]?.toUpperCase() || "P"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{bid.users?.name || "Professional"}</p>
                          <p className="text-xs text-gray-500">
                            {bid.profession} · {bid.users?.city || "—"}
                            {bid.users?.experience && ` · ${bid.users.experience} yrs exp`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {bid.quote_amount && (
                          <p className="font-bold text-orange-600">₹{bid.quote_amount?.toLocaleString()}</p>
                        )}
                        {bid.timeline && (
                          <p className="text-xs text-gray-500">⏱️ {bid.timeline}</p>
                        )}
                        {bid.status === "selected" && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                            🏆 Selected
                          </span>
                        )}
                      </div>
                    </div>

                    {bid.message && (
                      <p className="text-sm text-gray-600 mt-3 leading-relaxed bg-gray-50 rounded-lg p-3">
                        "{bid.message}"
                      </p>
                    )}

                    {/* Owner actions */}
                    {isOwner && tender.status === "open" && bid.status !== "selected" && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleSelectBid(bid.id, bid.professional_id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition">
                          🏆 Select This Professional
                        </button>
                        <Link
                          href={`/messages/tender-${tenderId}-${user?.id}-${bid.professional_id}`}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition">
                          💬 Chat
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right — Actions ── */}
        <div className="space-y-4">

          {/* My bid status */}
          {myBid && (
            <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl p-4 text-center">
              <p className="text-2xl mb-2">✅</p>
              <p className="font-bold text-teal-700 text-sm">You have bid on this tender</p>
              <p className="text-xs text-gray-500 mt-1">
                Quote: {myBid.quote_amount ? `₹${myBid.quote_amount?.toLocaleString()}` : "—"}
              </p>
              <p className="text-xs text-gray-500">Status: {myBid.status}</p>
            </div>
          )}

          {/* Bid button for professionals */}
          {!isOwner && !myBid && user && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <h3 className="font-bold text-gray-800 mb-2 text-sm">💼 Submit a Bid</h3>
              {tender.status !== "open" ? (
                <p className="text-xs text-gray-500">This tender is no longer accepting bids.</p>
              ) : (
                <>
                  <p className="text-xs text-gray-500 mb-3">
                    Pay ₹10 platform fee to submit your bid and connect with this customer.
                  </p>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 mb-3">
                    <p className="text-xs text-orange-700 font-semibold">💳 Bid fee: ₹10 (non-refundable)</p>
                  </div>
                  <Link href={`/tenders/bid/${tenderId}`}
                    className="block w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold text-sm text-center transition">
                    Submit Bid — ₹10 →
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Not logged in */}
          {!user && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
              <p className="text-sm text-gray-600 mb-3">Login to submit a bid</p>
              <Link href="/login"
                className="block w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-bold text-sm transition">
                Login →
              </Link>
            </div>
          )}

          {/* Customer info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h3 className="font-bold text-gray-700 text-xs mb-2">👤 Posted By</h3>
            <p className="font-semibold text-gray-800 text-sm">{tender.users?.name || "Customer"}</p>
            {tender.users?.city && <p className="text-xs text-gray-500">📍 {tender.users.city}</p>}
            <p className="text-xs text-gray-400 mt-1">
              {new Date(tender.created_at).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric"
              })}
            </p>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <p className="text-xs text-yellow-700 font-semibold mb-1">⚠️ Disclaimer</p>
            <p className="text-xs text-yellow-600">
              NakshaKart is NOT responsible for project execution, quality, or disputes. All dealings are directly between customer and professional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
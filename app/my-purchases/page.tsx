"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUser(user);

      const { data } = await supabase
        .from("purchases")
        .select("*, plans(id, title, plot_size, bedrooms, floors, price)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setPurchases(data || []);
      setLoading(false);
    };
    fetchPurchases();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl mb-4">🔒</p>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Please Login</h2>
            <p className="text-gray-500 mb-6">You need to login to view your purchases.</p>
            <Link href="/login" className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition">
              Login
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">My Purchases</h2>
          <p className="text-gray-500 mb-8">All house plans you have purchased</p>

          {purchases.length > 0 ? (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-teal-50 rounded-xl p-4 text-3xl">🏠</div>
                      <div>
                        <h3 className="font-bold text-gray-800">{purchase.plans?.title}</h3>
                        <div className="flex gap-3 text-gray-500 text-xs mt-1">
                          <span>📐 {purchase.plans?.plot_size}</span>
                          <span>🛏️ {purchase.plans?.bedrooms} Beds</span>
                          <span>🏢 {purchase.plans?.floors} Floors</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">
                          Purchased on {new Date(purchase.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-500 font-bold text-lg">₹{purchase.amount}</p>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {purchase.status}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
                    <p className="text-gray-400 text-sm">✅ Plan files will be sent to your email</p>
                    <Link href={`/plan/${purchase.plans?.id}`} className="text-teal-600 hover:underline text-sm font-medium">
                      View Plan →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <p className="text-4xl mb-4">🛒</p>
              <p className="text-gray-500 mb-4">You haven't purchased any plans yet.</p>
              <Link href="/browse" className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition">
                Browse Plans
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
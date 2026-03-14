"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Earnings() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSales: 0, totalEarnings: 0, pendingEarnings: 0 });
  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get architect's plans
      const { data: plans } = await supabase
        .from("plans")
        .select("id, title, price, plot_size")
        .eq("architect_id", user.id);

      if (!plans || plans.length === 0) { setLoading(false); return; }

      const planIds = plans.map((p) => p.id);
      const planMap = Object.fromEntries(plans.map((p) => [p.id, p]));

      // Get purchases
      const { data: purchaseData } = await supabase
        .from("purchases")
        .select("*, users:user_id(name, email)")
        .in("plan_id", planIds)
        .order("created_at", { ascending: false });

      if (purchaseData) {
        const completed = purchaseData.filter((p) => p.status === "completed");
        const totalEarnings = completed.reduce((sum, p) => sum + (p.amount * 0.8), 0);

        setPurchases(purchaseData.map((p) => ({
          ...p,
          plan: planMap[p.plan_id],
        })));

        setStats({
          totalSales: completed.length,
          totalEarnings: Math.round(totalEarnings),
          pendingEarnings: 0,
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading earnings...</div>;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">💰 Earnings</h1>
        <p className="text-gray-500 text-sm mt-1">Track your plan sales and earnings</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-6 text-center">
          <p className="text-4xl mb-2">🛒</p>
          <p className="text-3xl font-bold text-teal-700">{stats.totalSales}</p>
          <p className="text-sm text-gray-600 mt-1 font-medium">Total Plan Sales</p>
        </div>
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
          <p className="text-4xl mb-2">💰</p>
          <p className="text-3xl font-bold text-green-700">₹{stats.totalEarnings.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1 font-medium">Total Earnings (80%)</p>
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
          <p className="text-4xl mb-2">📊</p>
          <p className="text-3xl font-bold text-blue-700">
            ₹{stats.totalSales > 0 ? Math.round(stats.totalEarnings / stats.totalSales).toLocaleString() : 0}
          </p>
          <p className="text-sm text-gray-600 mt-1 font-medium">Avg. Earning per Sale</p>
        </div>
      </div>

      {/* Commission Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <span className="text-2xl">ℹ️</span>
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-1">Commission Structure</p>
          <p>NakshaKart charges <strong>20% platform fee</strong> on each sale. You receive <strong>80% of the plan price</strong> for every purchase.</p>
        </div>
      </div>

      {/* Purchases Table */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Sales</h2>

        {purchases.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-16 text-center text-gray-400">
            <p className="text-5xl mb-4">📭</p>
            <p className="font-semibold text-lg">No sales yet</p>
            <p className="text-sm mt-2">Once customers buy your plans, sales will appear here</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Buyer</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Plan Purchased</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Sale Price</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Your Earning</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{purchase.users?.name || "Customer"}</p>
                      <p className="text-xs text-gray-400">{purchase.users?.email || ""}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{purchase.plan?.title || "Plan"}</p>
                      <p className="text-xs text-gray-400">{purchase.plan?.plot_size}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      ₹{purchase.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-teal-700">
                      ₹{Math.round(purchase.amount * 0.8).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(purchase.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        purchase.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {purchase.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
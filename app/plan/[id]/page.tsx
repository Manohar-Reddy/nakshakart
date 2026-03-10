import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { data: plan, error } = await supabase
    .from("plans")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !plan) {
    return <p className="p-8 text-red-500">Plan not found.</p>;
  }

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-teal-600 hover:underline text-sm mb-6 block">
            ← Back to all plans
          </Link>

          {/* Plan Header */}
          <div className="bg-gradient-to-br from-teal-700 to-teal-500 text-white rounded-2xl p-8 mb-6 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h1 className="text-3xl font-bold mb-2">{plan.title}</h1>
            <p className="text-teal-200">Professional Architectural House Plan</p>
          </div>

          {/* Plan Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-2xl mb-1">📐</p>
              <p className="text-xs text-gray-500">Plot Size</p>
              <p className="font-bold text-gray-800">{plan.plot_size}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-2xl mb-1">🛏️</p>
              <p className="text-xs text-gray-500">Bedrooms</p>
              <p className="font-bold text-gray-800">{plan.bedrooms}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-2xl mb-1">🏢</p>
              <p className="text-xs text-gray-500">Floors</p>
              <p className="font-bold text-gray-800">{plan.floors}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-2xl mb-1">💰</p>
              <p className="text-xs text-gray-500">Price</p>
              <p className="font-bold text-orange-500">₹{plan.price}</p>
            </div>
          </div>

          {/* Description */}
          {plan.description && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <h2 className="font-bold text-gray-800 mb-3">About this Plan</h2>
              <p className="text-gray-600 leading-relaxed">{plan.description}</p>
            </div>
          )}

          {/* Buy Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-500 text-sm">Plan Price</p>
                <p className="text-3xl font-bold text-orange-500">₹{plan.price}</p>
              </div>
              <div className="text-right">
                <p className="text-green-600 text-sm font-medium">✅ Architect Verified</p>
                <p className="text-gray-400 text-xs">Instant download after purchase</p>
              </div>
            </div>
            <Link
              href={`/buy/${plan.id}`}
              className="block text-center bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg"
            >
              Buy Plan ₹{plan.price}
            </Link>
            <p className="text-center text-gray-400 text-xs mt-3">
              🔒 Secure purchase · Money back guarantee
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

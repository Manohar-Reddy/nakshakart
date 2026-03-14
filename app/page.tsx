import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default async function HomePage() {
  const { data: plans, error } = await supabase
    .from("plans")
    .select("*")
    .eq("status", "approved");

  if (error) {
    return <p className="p-8 text-red-500">Failed to load plans.</p>;
  }

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">

        {/* Hero Section */}
        <section className="relative text-white overflow-hidden min-h-[500px] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&auto=format&fit=crop&q=80')" }}
          ></div>
          <div className="absolute inset-0 bg-teal-900 opacity-70"></div>
          <div className="relative z-10 text-center px-8 max-w-4xl mx-auto">
            <p className="text-orange-400 font-semibold text-sm uppercase tracking-widest mb-3">India's #1 House Plan Marketplace</p>
            <h1 className="text-5xl font-extrabold mb-4 leading-tight drop-shadow-lg">
              Find Your Dream <span className="text-orange-400">Home Plan</span>
            </h1>
            <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
              Browse architect designed house plans tailored for every budget and plot size
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/browse" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full shadow-lg transition text-sm">
                Browse All Plans →
              </Link>
              <Link href="/signup" className="bg-white text-teal-700 hover:bg-teal-50 font-bold px-8 py-3 rounded-full shadow-lg transition text-sm">
                Join as Architect
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-white shadow-sm py-5 px-8 border-b border-gray-100">
          <div className="max-w-6xl mx-auto flex justify-around text-center">
            <div>
              <p className="text-2xl font-bold text-teal-700">500+</p>
              <p className="text-xs text-gray-500">Happy Customers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-700">50+</p>
              <p className="text-xs text-gray-500">Architects</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-700">{plans.length}+</p>
              <p className="text-xs text-gray-500">House Plans</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-700">4.8★</p>
              <p className="text-xs text-gray-500">Average Rating</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-700">100%</p>
              <p className="text-xs text-gray-500">Verified Plans</p>
            </div>
          </div>
        </section>

        {/* Featured Plans */}
        <section className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Featured Plans</h2>
              <p className="text-gray-500 text-sm">Hand picked by our team</p>
            </div>
            <Link href="/browse" className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition">
              View All Plans →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
                {plan.image_url ? (
                  <img src={plan.image_url} alt={plan.title} className="w-full h-36 object-cover group-hover:scale-105 transition duration-300" />
                ) : (
                  <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-6 text-center group-hover:from-teal-100 transition-all duration-300">
                    <span className="text-4xl">🏠</span>
                  </div>
                )}
                <div className="p-4">
                  {plan.category && <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full text-xs font-medium">{plan.category}</span>}
                  <h2 className="text-sm font-bold text-gray-800 mb-2 leading-tight mt-1">{plan.title}</h2>
                  <div className="space-y-1 text-gray-500 text-xs mb-3">
                    <p>📐 {plan.plot_size}</p>
                    <p>🛏️ {plan.bedrooms} Bedrooms</p>
                    <p>🏢 {plan.floors} Floors</p>
                    {plan.is_vastu_compliant && <p>🕉️ Vastu Compliant</p>}
                  </div>
                  <p className="text-orange-500 font-bold text-lg mb-3">₹{plan.price}</p>
                  <Link href={`/plan/${plan.id}`} className="block text-center bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition text-xs font-semibold">
                    View Plan →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Browse by Category */}
        <section className="max-w-7xl mx-auto px-6 pb-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Browse by Category</h2>
            <p className="text-gray-500 text-sm">Find plans that match your needs</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Independent House",   emoji: "🏠", color: "bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700"     },
              { name: "Villa",               emoji: "🏛️", color: "bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700" },
              { name: "Duplex House",        emoji: "🏘️", color: "bg-green-50 border-green-200 hover:bg-green-100 text-green-700"   },
              { name: "Apartment Building",  emoji: "🏢", color: "bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700" },
              { name: "Farmhouse",           emoji: "🏡", color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-yellow-700" },
              { name: "Row House",           emoji: "🏘️", color: "bg-pink-50 border-pink-200 hover:bg-pink-100 text-pink-700"       },
              { name: "Rental House",        emoji: "🔐", color: "bg-teal-50 border-teal-200 hover:bg-teal-100 text-teal-700"       },
              { name: "Commercial Building", emoji: "🏬", color: "bg-red-50 border-red-200 hover:bg-red-100 text-red-700"           },
            ].map((cat) => (
              <Link key={cat.name} href={`/browse?category=${encodeURIComponent(cat.name)}`}
                className={`border-2 ${cat.color} rounded-xl p-4 text-center transition shadow-sm hover:shadow-md`}>
                <p className="text-3xl mb-2">{cat.emoji}</p>
                <p className="font-semibold text-sm">{cat.name}</p>
              </Link>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <Link href={`/browse?category=${encodeURIComponent("PG / Hostel")}`}
              className="border-2 bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-xl p-4 text-center transition shadow-sm hover:shadow-md w-48">
              <p className="text-3xl mb-2">🏣</p>
              <p className="font-semibold text-sm">PG / Hostel</p>
            </Link>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white py-12 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Why Choose NakshaKart?</h2>
              <p className="text-gray-500 text-sm mt-1">The smartest way to get your house plan</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4">
                <p className="text-4xl mb-3">✅</p>
                <h3 className="font-bold text-gray-800 mb-1">Verified Plans</h3>
                <p className="text-gray-500 text-xs">Every plan is reviewed by our expert team before listing</p>
              </div>
              <div className="p-4">
                <p className="text-4xl mb-3">💰</p>
                <h3 className="font-bold text-gray-800 mb-1">Affordable Price</h3>
                <p className="text-gray-500 text-xs">Plans starting from just ₹499. Save lakhs on architect fees</p>
              </div>
              <div className="p-4">
                <p className="text-4xl mb-3">⚡</p>
                <h3 className="font-bold text-gray-800 mb-1">Instant Download</h3>
                <p className="text-gray-500 text-xs">Get your plan immediately after purchase. No waiting</p>
              </div>
              <div className="p-4">
                <p className="text-4xl mb-3">🕉️</p>
                <h3 className="font-bold text-gray-800 mb-1">Vastu Compliant</h3>
                <p className="text-gray-500 text-xs">Filter and find Vastu compliant plans for your home</p>
              </div>
            </div>
          </div>
        </section>

        {/* Join as Architect Banner */}
        <section className="bg-gradient-to-r from-teal-700 to-teal-600 text-white py-10 px-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Are you an Architect or Civil Engineer?</h2>
          <p className="text-teal-200 mb-6">Join NakshaKart and sell your house plans to thousands of customers across India</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/signup" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full shadow-lg transition">
              Join as Architect →
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
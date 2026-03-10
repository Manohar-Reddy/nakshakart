import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default async function HomePage() {
  const { data: plans, error } = await supabase
    .from("plans")
    .select("*");

  if (error) {
    return <p className="p-8 text-red-500">Failed to load plans.</p>;
  }

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-teal-700 via-teal-600 to-teal-500 text-white py-16 px-8 text-center overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-20 -translate-y-20"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-20 translate-y-20"></div>
          <h1 className="text-5xl font-extrabold mb-4">
            Find Your Dream <span className="text-orange-400">Home Plan</span>
          </h1>
          <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
            Browse hundreds of architect designed house plans tailored for every budget and plot size
          </p>
          <div className="flex justify-center gap-4">
            <span className="bg-white text-teal-700 font-bold px-6 py-3 rounded-full shadow-lg text-sm">
              🏠 {plans.length} Plans Available
            </span>
            <span className="bg-orange-500 text-white font-bold px-6 py-3 rounded-full shadow-lg text-sm">
              ✅ Architect Verified
            </span>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-white shadow-sm py-4 px-8">
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
          </div>
        </section>

        {/* Plans Grid */}
        <section className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">All Plans</h2>
            <span className="text-sm text-gray-500">{plans.length} plans found</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group"
              >
                <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-4 text-center group-hover:from-teal-100 transition-all duration-300">
                  <span className="text-4xl">🏠</span>
                </div>
                <div className="p-4">
                  <h2 className="text-sm font-bold text-gray-800 mb-2 leading-tight">
                    {plan.title}
                  </h2>
                  <div className="space-y-1 text-gray-500 text-xs mb-3">
                    <p>📐 {plan.plot_size}</p>
                    <p>🛏️ {plan.bedrooms} Bedrooms</p>
                    <p>🏢 {plan.floors} Floors</p>
                  </div>
                  <p className="text-orange-500 font-bold text-lg mb-3">
                    ₹{plan.price}
                  </p>
                  <Link
                    href={`/plan/${plan.id}`}
                    className="block text-center bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition text-xs font-semibold"
                  >
                    View Plan →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Banner */}
        <section className="bg-gradient-to-r from-teal-700 to-teal-600 text-white py-10 px-8 text-center mt-8">
          <h2 className="text-2xl font-bold mb-2">Are you an Architect?</h2>
          <p className="text-teal-200 mb-6">Join NakshaKart and sell your house plans to thousands of customers</p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full shadow-lg transition">
            Join as Architect →
          </button>
        </section>

      </main>
      <Footer />
    </>
  );
}
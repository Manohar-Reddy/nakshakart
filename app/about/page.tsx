import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">

        {/* Hero */}
        <section className="bg-gradient-to-br from-teal-700 to-teal-500 text-white py-16 px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">About NakshaKart</h1>
          <p className="text-teal-100 text-lg max-w-2xl mx-auto">
            India's trusted marketplace for architectural house plans. Connecting architects with homebuilders since 2024.
          </p>
        </section>

        {/* Mission */}
        <section className="max-w-5xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                NakshaKart was created with a simple mission — to make professional architectural house plans accessible and affordable for every Indian family building their dream home.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                We believe that every family deserves a well-designed home. By connecting talented architects with homebuilders across India, we make it easy to find the perfect house plan at an affordable price.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our platform empowers architects to monetize their designs while helping customers save time and money on architectural consultations.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-teal-50 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-teal-700 mb-1">500+</p>
                <p className="text-gray-500 text-sm">Happy Customers</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-orange-500 mb-1">50+</p>
                <p className="text-gray-500 text-sm">Architects</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-blue-600 mb-1">100+</p>
                <p className="text-gray-500 text-sm">House Plans</p>
              </div>
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-green-600 mb-1">4.8★</p>
                <p className="text-gray-500 text-sm">Average Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-white py-12 px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  🔍
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Browse Plans</h3>
                <p className="text-gray-500 text-sm">Search and filter hundreds of architect-designed house plans by size, bedrooms, floors and budget.</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  💳
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Purchase Securely</h3>
                <p className="text-gray-500 text-sm">Buy your chosen plan securely online. All transactions are protected and encrypted.</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  📥
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Download & Build</h3>
                <p className="text-gray-500 text-sm">Download your plan files instantly and start building your dream home with professional architectural drawings.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="max-w-5xl mx-auto px-8 py-12">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Why Choose NakshaKart?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex gap-4">
              <div className="text-3xl">✅</div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Verified Architects</h3>
                <p className="text-gray-500 text-sm">All architects on our platform are verified professionals with proven expertise.</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex gap-4">
              <div className="text-3xl">💰</div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Affordable Prices</h3>
                <p className="text-gray-500 text-sm">Get professional house plans at a fraction of the cost of hiring a private architect.</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex gap-4">
              <div className="text-3xl">🔒</div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Secure Transactions</h3>
                <p className="text-gray-500 text-sm">All payments are processed securely with full encryption and buyer protection.</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex gap-4">
              <div className="text-3xl">📞</div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Dedicated Support</h3>
                <p className="text-gray-500 text-sm">Our support team is available Monday to Saturday to help you with any questions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-teal-700 to-teal-600 text-white py-12 px-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to Find Your Dream Home Plan?</h2>
          <p className="text-teal-200 mb-6">Browse hundreds of professional house plans today</p>
          <div className="flex justify-center gap-4">
            <Link href="/browse" className="bg-white text-teal-700 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition">
              Browse Plans
            </Link>
            <Link href="/signup" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full shadow-lg transition">
              Join as Architect
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">
        <section className="bg-gradient-to-br from-teal-700 to-teal-500 text-white py-10 px-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
          <p className="text-teal-100">Last updated: March 2026</p>
        </section>

        <section className="max-w-4xl mx-auto px-8 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using NakshaKart, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">2. Use of Platform</h2>
              <p className="text-gray-600 leading-relaxed">
                NakshaKart is a marketplace for architectural house plans. Users may browse, purchase, and download house plans. Architects may upload and sell their designs through our platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">3. Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed">
                All house plans available on NakshaKart are the intellectual property of their respective architects. Purchasing a plan grants you a personal, non-transferable license to use the plan for construction purposes only. You may not resell, redistribute, or share purchased plans.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">4. For Architects</h2>
              <p className="text-gray-600 leading-relaxed">
                Architects uploading plans to NakshaKart confirm that they own the rights to the designs they submit. Uploaded designs must not violate any copyright laws. NakshaKart reserves the right to remove any plans that violate our policies. A platform commission will be deducted from each sale.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">5. Payments and Refunds</h2>
              <p className="text-gray-600 leading-relaxed">
                All payments are processed securely. Once a plan has been downloaded, refunds will not be issued unless the plan files are found to be defective or significantly different from the description. Refund requests must be submitted within 7 days of purchase.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">6. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                NakshaKart is not responsible for any construction decisions made based on purchased plans. We recommend consulting a licensed architect or engineer before beginning construction. NakshaKart is not liable for any damages arising from the use of plans purchased on our platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">7. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                NakshaKart reserves the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">8. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                For any questions regarding these terms, please contact us at support@nakshakart.com or call us at +91 98765 43210.
              </p>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
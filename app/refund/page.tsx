import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function RefundPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">
        <section className="bg-gradient-to-br from-teal-700 to-teal-500 text-white py-10 px-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Refund Policy</h1>
          <p className="text-teal-100">Last updated: March 2026</p>
        </section>

        <section className="max-w-4xl mx-auto px-8 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-teal-700 text-sm">
              ℹ️ We want you to be completely satisfied with your purchase. Please read our refund policy carefully before making a purchase.
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">1. Eligibility for Refund</h2>
              <p className="text-gray-600 leading-relaxed">
                Refund requests are eligible within 7 days of purchase if the plan files are found to be defective, corrupted, or significantly different from the description provided on the listing page.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">2. Non-Refundable Cases</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                Refunds will NOT be issued in the following cases:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm">
                <li>The plan has already been downloaded and used for construction</li>
                <li>Change of mind after purchase</li>
                <li>The plan does not match personal preferences</li>
                <li>Refund request submitted after 7 days of purchase</li>
                <li>Plans purchased during promotional or discounted offers</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">3. How to Request a Refund</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                To request a refund, please follow these steps:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm">
                <li>Email us at support@nakshakart.com within 7 days of purchase</li>
                <li>Include your order ID and the reason for the refund request</li>
                <li>Attach screenshots or evidence of the issue if applicable</li>
                <li>Our team will review your request within 2-3 business days</li>
              </ol>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">4. Refund Processing</h2>
              <p className="text-gray-600 leading-relaxed">
                Once your refund request is approved, the amount will be credited back to your original payment method within 5-7 business days. The exact timing may vary depending on your bank or payment provider.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">5. Partial Refunds</h2>
              <p className="text-gray-600 leading-relaxed">
                In some cases, a partial refund may be issued at our discretion. This may apply when only some files in the plan package are found to be defective or incomplete.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">6. Architect Responsibility</h2>
              <p className="text-gray-600 leading-relaxed">
                If a refund is issued due to a defect in the plan uploaded by an architect, the refund amount will be deducted from the architect's earnings. Architects are responsible for ensuring the quality and accuracy of their uploaded plans.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">7. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                For any refund related queries, please contact us at support@nakshakart.com or call us at +91 98765 43210. Our support team is available Monday to Saturday, 9 AM to 6 PM.
              </p>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

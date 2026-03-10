import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">
        <section className="bg-gradient-to-br from-teal-700 to-teal-500 text-white py-10 px-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-teal-100">Last updated: March 2026</p>
        </section>

        <section className="max-w-4xl mx-auto px-8 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">1. Information We Collect</h2>
              <p className="text-gray-600 leading-relaxed">
                We collect information you provide when registering, including your name, email address, phone number, and role (customer or architect). We also collect usage data such as plans viewed and purchased.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">2. How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed">
                We use your information to provide and improve our services, process payments, send order confirmations, and communicate important updates about your account. We do not sell your personal information to third parties.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">3. Data Security</h2>
              <p className="text-gray-600 leading-relaxed">
                We take data security seriously. Your data is stored securely using Supabase with industry-standard encryption. Passwords are never stored in plain text. We use secure HTTPS connections for all data transmission.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">4. Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                NakshaKart uses cookies to maintain your login session and improve your browsing experience. You can disable cookies in your browser settings, but this may affect the functionality of the platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">5. Third Party Services</h2>
              <p className="text-gray-600 leading-relaxed">
                We use trusted third-party services including Supabase for database and authentication, and payment processors for secure transactions. These services have their own privacy policies and we encourage you to review them.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">6. Your Rights</h2>
              <p className="text-gray-600 leading-relaxed">
                You have the right to access, update, or delete your personal information at any time. To request deletion of your account and data, please contact us at support@nakshakart.com.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">7. Children's Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                NakshaKart is not intended for use by children under the age of 18. We do not knowingly collect personal information from children.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">8. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                For any privacy related questions or concerns, please contact us at support@nakshakart.com or call us at +91 98765 43210.
              </p>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

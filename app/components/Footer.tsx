import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6 px-8">
      <div className="max-w-6xl mx-auto">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Logo & About */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white rounded-xl p-1">
                <Image
                  src="/logo.png"
                  alt="NakshaKart Logo"
                  width={50}
                  height={50}
                />
              </div>
              <div>
                <p className="text-lg font-bold">
                  Naksha<span className="text-orange-400">Kart</span>
                </p>
                <p className="text-[10px] text-orange-400 tracking-widest uppercase">
                  blueprints to reality
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              India's trusted marketplace for architectural house plans. Find your perfect home design today.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-orange-400 font-semibold mb-4 uppercase text-sm tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              <li><Link href="/" className="hover:text-white transition">Browse Plans</Link></li>
              <li><Link href="/" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="/" className="hover:text-white transition">Contact Us</Link></li>
            </ul>
          </div>

          {/* For Architects */}
          <div>
            <h3 className="text-orange-400 font-semibold mb-4 uppercase text-sm tracking-wide">
              For Architects
            </h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/" className="hover:text-white transition">Join as Architect</Link></li>
              <li><Link href="/" className="hover:text-white transition">Upload Plans</Link></li>
              <li><Link href="/" className="hover:text-white transition">Architect Dashboard</Link></li>
              <li><Link href="/" className="hover:text-white transition">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-orange-400 font-semibold mb-4 uppercase text-sm tracking-wide">
              Contact Us
            </h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>📧 support@nakshakart.com</li>
              <li>📞 +91 98765 43210</li>
              <li>📍 Hyderabad, India</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2025 NakshaKart. All rights reserved.
          </p>
          <div className="flex gap-4 text-gray-500 text-sm">
            <Link href="/" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/" className="hover:text-white transition">Terms of Service</Link>
            <Link href="/" className="hover:text-white transition">Refund Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
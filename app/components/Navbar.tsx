import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="bg-white px-8 py-4 flex items-center justify-between shadow-sm border-b-4 border-orange-500">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="NakshaKart Logo" width={50} height={50} />
        <div>
          <h1 className="text-xl font-bold text-teal-700">
            Naksha<span className="text-orange-500">Kart</span>
          </h1>
          <p className="text-xs text-orange-400">BLUEPRINTS TO REALITY</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition">
          Home
        </Link>
        <Link href="/browse" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition">
          Browse Plans
        </Link>
        <Link href="/contact" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition">
          Contact Us
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/login" className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-full text-sm font-medium transition">
          Login
        </Link>
        <Link href="/signup" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-full text-sm font-medium transition">
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
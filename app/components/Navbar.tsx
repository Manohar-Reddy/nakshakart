import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="bg-white px-8 py-3 flex items-center justify-between shadow-md border-b-4 border-orange-500">
      {/* Logo + Tagline */}
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="NakshaKart Logo"
          width={65}
          height={65}
          priority
        />
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-teal-700">
            Naksha<span className="text-orange-500">Kart</span>
          </span>
          <span className="text-[10px] text-orange-400 tracking-widest uppercase font-medium">
            blueprints to reality
          </span>
        </div>
      </Link>

      {/* Nav Buttons */}
      <div className="flex gap-3 items-center">
        <Link
          href="/"
          className="px-5 py-2 rounded-full text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition shadow"
        >
          Home
        </Link>
        <Link
          href="/"
          className="px-5 py-2 rounded-full text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition shadow"
        >
          Browse Plans
        </Link>
        <Link
          href="/"
          className="px-5 py-2 rounded-full text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition shadow"
        >
          Contact Us
        </Link>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Auth Buttons */}
        <Link
          href="/login"
          className="px-5 py-2 rounded-full text-sm font-semibold border-2 border-teal-600 text-teal-600 hover:bg-teal-50 transition"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="px-5 py-2 rounded-full text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 transition shadow"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
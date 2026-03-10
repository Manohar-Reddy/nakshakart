"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function UploadPlanPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [plotSize, setPlotSize] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [floors, setFloors] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [parking, setParking] = useState("yes");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.from("plans").insert({
      title,
      description,
      plot_size: plotSize,
      bedrooms: parseInt(bedrooms),
      floors,
      price: parseInt(price),
      status: "pending",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-teal-700 mb-2">Plan Submitted!</h2>
          <p className="text-gray-500 mb-6">Your plan has been submitted for admin review. It will go live once approved.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/architect/dashboard" className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition">
              Go to Dashboard
            </Link>
            <button
              onClick={() => setSuccess(false)}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Upload Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white px-8 py-4 flex items-center justify-between shadow-md border-b-4 border-teal-600">
        <div>
          <h1 className="text-xl font-bold text-teal-700">
            Naksha<span className="text-orange-500">Kart</span>
          </h1>
          <p className="text-xs text-gray-400">Architect Panel</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/architect/dashboard" className="text-gray-600 hover:text-teal-600 text-sm">Dashboard</Link>
          <Link href="/architect/my-plans" className="text-gray-600 hover:text-teal-600 text-sm">My Plans</Link>
          <Link href="/architect/upload-plan" className="text-teal-600 font-semibold text-sm">Upload Plan</Link>
          <Link href="/" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition">
            View Website
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-8 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload New Plan</h2>
        <p className="text-gray-500 mb-8">Fill in the details below. Your plan will be reviewed by admin before going live.</p>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern 3BHK House Plan"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the house plan in detail..."
              required
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plot Size</label>
              <input
                type="text"
                value={plotSize}
                onChange={(e) => setPlotSize(e.target.value)}
                placeholder="e.g. 30x40"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Floors</label>
              <input
                type="text"
                value={floors}
                onChange={(e) => setFloors(e.target.value)}
                placeholder="e.g. 2"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                placeholder="e.g. 3"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <input
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                placeholder="e.g. 2"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parking</label>
              <select
                value={parking}
                onChange={(e) => setParking(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 1500"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-sm text-teal-700">
            ℹ️ Your plan will be reviewed by our admin team before it goes live on the marketplace.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Plan for Review"}
          </button>
        </form>
      </main>
    </div>
  );
}
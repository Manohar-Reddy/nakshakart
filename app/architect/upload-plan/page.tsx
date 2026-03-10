"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function UploadPlanPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [plotSize, setPlotSize] = useState("");
  const [plotShape, setPlotShape] = useState("");
  const [roadFacing, setRoadFacing] = useState("");
  const [roadWidth, setRoadWidth] = useState("");
  const [builtUpArea, setBuiltUpArea] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [floors, setFloors] = useState("");
  const [parking, setParking] = useState("");
  const [setbackFront, setSetbackFront] = useState("");
  const [setbackRear, setSetbackRear] = useState("");
  const [setbackLeft, setSetbackLeft] = useState("");
  const [setbackRight, setSetbackRight] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Extra Rooms
  const [hasBalcony, setHasBalcony] = useState(false);
  const [hasPoojaRoom, setHasPoojaRoom] = useState(false);
  const [hasServantRoom, setHasServantRoom] = useState(false);
  const [hasStudyRoom, setHasStudyRoom] = useState(false);
  const [hasHomeTheatre, setHasHomeTheatre] = useState(false);
  const [hasGym, setHasGym] = useState(false);
  const [hasStoreRoom, setHasStoreRoom] = useState(false);

  // Outdoor Features
  const [hasTerrace, setHasTerrace] = useState(false);
  const [hasGarden, setHasGarden] = useState(false);
  const [hasSwimmingPool, setHasSwimmingPool] = useState(false);
  const [hasOpenCourtyard, setHasOpenCourtyard] = useState(false);

  // Special Features
  const [isVastuCompliant, setIsVastuCompliant] = useState(false);
  const [isGreenBuilding, setIsGreenBuilding] = useState(false);
  const [isSolarReady, setIsSolarReady] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (parseInt(price) < 499 || parseInt(price) > 9999) {
      setError("Price must be between ₹499 and ₹9999");
      setLoading(false);
      return;
    }

    let image_url = "";
    if (image) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("plan-images")
        .upload(fileName, image);
      if (uploadError) {
        setError("Image upload failed: " + uploadError.message);
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("plan-images").getPublicUrl(fileName);
      image_url = urlData.publicUrl;
    }

    const { error } = await supabase.from("plans").insert({
      title, description, category,
      plot_size: plotSize, plot_shape: plotShape,
      road_facing: roadFacing, road_width: roadWidth,
      built_up_area: builtUpArea,
      bedrooms: parseInt(bedrooms), bathrooms: parseInt(bathrooms),
      floors, parking,
      setback_front: setbackFront, setback_rear: setbackRear,
      setback_left: setbackLeft, setback_right: setbackRight,
      has_balcony: hasBalcony, has_pooja_room: hasPoojaRoom,
      has_servant_room: hasServantRoom, has_study_room: hasStudyRoom,
      has_home_theatre: hasHomeTheatre, has_gym: hasGym,
      has_store_room: hasStoreRoom,
      has_terrace: hasTerrace, has_garden: hasGarden,
      has_swimming_pool: hasSwimmingPool, has_open_courtyard: hasOpenCourtyard,
      is_vastu_compliant: isVastuCompliant, is_green_building: isGreenBuilding,
      is_solar_ready: isSolarReady,
      price: parseInt(price), status: "pending", image_url,
    });

    if (error) { setError(error.message); setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
  };

  const CheckBox = ({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={value} onChange={onChange} className="w-4 h-4 accent-teal-600" />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-teal-700 mb-2">Plan Submitted!</h2>
          <p className="text-gray-500 mb-6">Your plan has been submitted for admin review.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/architect/dashboard" className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition">Go to Dashboard</Link>
            <button onClick={() => setSuccess(false)} className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition">Upload Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white px-8 py-4 flex items-center justify-between shadow-md border-b-4 border-teal-600">
        <div>
          <h1 className="text-xl font-bold text-teal-700">Naksha<span className="text-orange-500">Kart</span></h1>
          <p className="text-xs text-gray-400">Architect Panel</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/architect/dashboard" className="text-gray-600 hover:text-teal-600 text-sm">Dashboard</Link>
          <Link href="/architect/my-plans" className="text-gray-600 hover:text-teal-600 text-sm">My Plans</Link>
          <Link href="/architect/upload-plan" className="text-teal-600 font-semibold text-sm">Upload Plan</Link>
          <Link href="/" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition">View Website</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-8 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload New Plan</h2>
        <p className="text-gray-500 mb-8">Fill in all details. Your plan will be reviewed before going live.</p>

        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan Preview Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-teal-500 transition">
              {imagePreview ? (
                <div>
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-3" />
                  <button type="button" onClick={() => { setImage(null); setImagePreview(""); }} className="text-red-500 text-sm hover:underline">Remove Image</button>
                </div>
              ) : (
                <div>
                  <p className="text-4xl mb-2">🏠</p>
                  <p className="text-gray-500 text-sm mb-3">Upload a preview image of your house plan</p>
                  <label className="bg-teal-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-teal-700 transition text-sm">
                    Choose Image
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-700 mb-4">📋 Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Modern 3BHK Villa for 40x60 Plot" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the house plan in detail..." required rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Building Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select category</option>
                  <option value="Independent House">Independent House</option>
                  <option value="Duplex House">Duplex House</option>
                  <option value="Villa">Villa</option>
                  <option value="Apartment Building">Apartment Building</option>
                  <option value="Farmhouse">Farmhouse</option>
                  <option value="Row House">Row House</option>
                  <option value="Commercial Building">Commercial Building</option>
                  <option value="Mixed Use Building">Mixed Use Building</option>
                  <option value="Rental House">Rental House</option>
                  <option value="PG / Hostel">PG / Hostel</option>
                </select>
              </div>
            </div>
          </div>

          {/* Plot Details */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-700 mb-4">📐 Plot Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plot Size</label>
                <input type="text" value={plotSize} onChange={(e) => setPlotSize(e.target.value)} placeholder="e.g. 30x40" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plot Shape</label>
                <select value={plotShape} onChange={(e) => setPlotShape(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select shape</option>
                  <option value="Rectangle">Rectangle</option>
                  <option value="Square">Square</option>
                  <option value="Irregular">Irregular</option>
                  <option value="Corner Plot">Corner Plot</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Road Facing</label>
                <select value={roadFacing} onChange={(e) => setRoadFacing(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select direction</option>
                  <option value="North Facing">North Facing</option>
                  <option value="South Facing">South Facing</option>
                  <option value="East Facing">East Facing</option>
                  <option value="West Facing">West Facing</option>
                  <option value="Corner Plot">Corner Plot</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Road Width</label>
                <select value={roadWidth} onChange={(e) => setRoadWidth(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select width</option>
                  <option value="20 ft road">20 ft road</option>
                  <option value="30 ft road">30 ft road</option>
                  <option value="40 ft road">40 ft road</option>
                  <option value="60 ft road">60 ft road</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Built-up Area</label>
                <input type="text" value={builtUpArea} onChange={(e) => setBuiltUpArea(e.target.value)} placeholder="e.g. 1800 sq ft" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
          </div>

          {/* Building Specs */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-700 mb-4">🏠 Building Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="e.g. 3" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="e.g. 2" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Floors</label>
                <input type="text" value={floors} onChange={(e) => setFloors(e.target.value)} placeholder="e.g. Ground + 1" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parking</label>
                <select value={parking} onChange={(e) => setParking(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select parking</option>
                  <option value="No Parking">No Parking</option>
                  <option value="1 Car Parking">1 Car Parking</option>
                  <option value="2 Car Parking">2 Car Parking</option>
                  <option value="Basement Parking">Basement Parking</option>
                  <option value="Stilt Floor Parking">Stilt Floor Parking</option>
                </select>
              </div>
            </div>
          </div>

          {/* Extra Rooms */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-700 mb-4">🚪 Extra Rooms</h3>
            <div className="grid grid-cols-2 gap-3">
              <CheckBox label="🪟 Balcony" value={hasBalcony} onChange={() => setHasBalcony(!hasBalcony)} />
              <CheckBox label="🙏 Pooja Room" value={hasPoojaRoom} onChange={() => setHasPoojaRoom(!hasPoojaRoom)} />
              <CheckBox label="🧹 Servant Room" value={hasServantRoom} onChange={() => setHasServantRoom(!hasServantRoom)} />
              <CheckBox label="📚 Study Room" value={hasStudyRoom} onChange={() => setHasStudyRoom(!hasStudyRoom)} />
              <CheckBox label="🎬 Home Theatre" value={hasHomeTheatre} onChange={() => setHasHomeTheatre(!hasHomeTheatre)} />
              <CheckBox label="🏋️ Gym / Fitness Room" value={hasGym} onChange={() => setHasGym(!hasGym)} />
              <CheckBox label="📦 Store Room" value={hasStoreRoom} onChange={() => setHasStoreRoom(!hasStoreRoom)} />
            </div>
          </div>

          {/* Outdoor Features */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-700 mb-4">🌿 Outdoor Features</h3>
            <div className="grid grid-cols-2 gap-3">
              <CheckBox label="🏠 Terrace" value={hasTerrace} onChange={() => setHasTerrace(!hasTerrace)} />
              <CheckBox label="🌱 Garden / Lawn" value={hasGarden} onChange={() => setHasGarden(!hasGarden)} />
              <CheckBox label="🏊 Swimming Pool" value={hasSwimmingPool} onChange={() => setHasSwimmingPool(!hasSwimmingPool)} />
              <CheckBox label="🏛️ Open Courtyard" value={hasOpenCourtyard} onChange={() => setHasOpenCourtyard(!hasOpenCourtyard)} />
            </div>
          </div>

          {/* Special Features */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-700 mb-4">⭐ Special Features</h3>
            <div className="grid grid-cols-2 gap-3">
              <CheckBox label="🕉️ Vastu Compliant" value={isVastuCompliant} onChange={() => setIsVastuCompliant(!isVastuCompliant)} />
              <CheckBox label="🌿 Green Building" value={isGreenBuilding} onChange={() => setIsGreenBuilding(!isGreenBuilding)} />
              <CheckBox label="☀️ Solar Ready" value={isSolarReady} onChange={() => setIsSolarReady(!isSolarReady)} />
            </div>
          </div>

          {/* Setbacks */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-700 mb-1">📏 Setbacks</h3>
            <p className="text-gray-400 text-xs mb-4">Distance from building to plot boundary on each side</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Front Setback</label>
                <input type="text" value={setbackFront} onChange={(e) => setSetbackFront(e.target.value)} placeholder="e.g. 3 ft" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rear Setback</label>
                <input type="text" value={setbackRear} onChange={(e) => setSetbackRear(e.target.value)} placeholder="e.g. 3 ft" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Left Setback</label>
                <input type="text" value={setbackLeft} onChange={(e) => setSetbackLeft(e.target.value)} placeholder="e.g. 2 ft" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Right Setback</label>
                <input type="text" value={setbackRight} onChange={(e) => setSetbackRight(e.target.value)} placeholder="e.g. 2 ft" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-700 mb-4">💰 Pricing</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Price (₹)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 1500" min="499" max="9999" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-400">Minimum: ₹499</span>
                <span className="text-gray-400">Maximum: ₹9999</span>
              </div>
              {price && parseInt(price) >= 499 && parseInt(price) <= 9999 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3 text-sm">
                  <p className="text-green-700">💰 Your earnings: <span className="font-bold">₹{Math.round(parseInt(price) * 0.8)}</span> per sale</p>
                  <p className="text-gray-400 text-xs">Platform fee: ₹{Math.round(parseInt(price) * 0.2)}</p>
                </div>
              )}
              {price && (parseInt(price) < 499 || parseInt(price) > 9999) && (
                <p className="text-red-500 text-xs mt-1">⚠️ Price must be between ₹499 and ₹9999</p>
              )}
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-sm text-teal-700">
            ℹ️ Your plan will be reviewed by our admin team before it goes live on the marketplace.
          </div>

          <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50">
            {loading ? "Submitting..." : "Submit Plan for Review"}
          </button>
        </form>
      </main>
    </div>
  );
}
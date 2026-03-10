"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Props {
  planId: string;
  reviews: Review[];
}

export default function ReviewSection({ planId, reviews: initialReviews }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { setError("Please select a rating"); return; }
    if (!comment.trim()) { setError("Please write a comment"); return; }

    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Please login to submit a review"); setLoading(false); return; }

    // Check if user already reviewed
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("plan_id", planId)
      .eq("user_id", user.id)
      .single();

    if (existing) { setError("You have already reviewed this plan"); setLoading(false); return; }

    const { data: userData } = await supabase
      .from("users")
      .select("name")
      .eq("id", user.id)
      .single();

    const { data: newReview, error: insertError } = await supabase
      .from("reviews")
      .insert({
        plan_id: planId,
        user_id: user.id,
        user_name: userData?.name || "Anonymous",
        rating,
        comment,
      })
      .select()
      .single();

    if (insertError) { setError(insertError.message); setLoading(false); return; }

    setReviews([newReview, ...reviews]);
    setRating(0);
    setComment("");
    setSuccess(true);
    setLoading(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-800 text-lg">⭐ Ratings & Reviews</h3>
        {avgRating && (
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-yellow-500">{avgRating}</span>
            <div>
              <div className="flex">
                {[1,2,3,4,5].map((star) => (
                  <span key={star} className={`text-lg ${star <= Math.round(parseFloat(avgRating)) ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                ))}
              </div>
              <p className="text-xs text-gray-500">{reviews.length} reviews</p>
            </div>
          </div>
        )}
      </div>

      {/* Write Review */}
      <div className="bg-gray-50 rounded-xl p-5 mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Write a Review</h4>

        {/* Star Selector */}
        <div className="flex gap-1 mb-3">
          {[1,2,3,4,5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className={`text-3xl transition ${star <= (hoveredRating || rating) ? "text-yellow-400" : "text-gray-300"}`}
            >
              ★
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-500 self-center">
              {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : "Excellent"}
            </span>
          )}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this plan..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3"
        />

        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
        {success && <p className="text-green-500 text-xs mb-2">✅ Review submitted successfully!</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition text-sm font-semibold disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {review.user_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">{review.user_name}</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString("en-IN")}</span>
              </div>
              <div className="flex ml-10 mb-1">
                {[1,2,3,4,5].map((star) => (
                  <span key={star} className={`text-sm ${star <= review.rating ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                ))}
              </div>
              <p className="text-gray-600 text-sm ml-10">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-4xl mb-2">💬</p>
          <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
        </div>
      )}
    </div>
  );
}
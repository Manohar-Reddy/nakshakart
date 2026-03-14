"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReviewSection({ planId }: { planId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Load reviews
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("*")
        .eq("plan_id", planId)
        .order("created_at", { ascending: false });

      setReviews(reviewData || []);

      // Check user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);

        // Check if purchased
        const { data: purchase } = await supabase
          .from("purchases")
          .select("id")
          .eq("user_id", user.id)
          .eq("plan_id", planId)
          .single();

        setHasPurchased(!!purchase);

        // Check if already reviewed
        const alreadyReviewed = (reviewData || []).some((r) => r.user_id === user.id);
        setHasReviewed(alreadyReviewed);
      }
      setLoading(false);
    };
    load();
  }, [planId]);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setSubmitting(true);

    const { error } = await supabase.from("reviews").insert({
      plan_id: planId,
      user_id: user.id,
      user_name: user.user_metadata?.full_name || "Customer",
      rating,
      comment,
    });

    if (!error) {
      const newReview = {
        plan_id: planId,
        user_id: user.id,
        user_name: user.user_metadata?.full_name || "Customer",
        rating,
        comment,
        created_at: new Date().toISOString(),
      };
      setReviews((prev) => [newReview, ...prev]);
      setHasReviewed(true);
      setRating(0);
      setComment("");
    }
    setSubmitting(false);
  };

  const average = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return <div className="text-gray-400 text-sm">Loading reviews...</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Customer Reviews</h2>
        {average && (
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-lg">★</span>
            <span className="font-bold text-gray-800">{average}</span>
            <span className="text-gray-400 text-sm">({reviews.length} reviews)</span>
          </div>
        )}
      </div>

      {/* Write Review - only if purchased and not reviewed */}
      {user && hasPurchased && !hasReviewed && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Write a Review</h3>

          {/* Star Rating */}
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)}
                className={`text-3xl transition ${s <= rating ? "text-yellow-400" : "text-gray-200 hover:text-yellow-300"}`}>
                ★
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this plan..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3"
          />

          <button onClick={handleSubmit} disabled={submitting || rating === 0}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition">
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-400">
          <p className="text-3xl mb-2">⭐</p>
          <p className="font-medium">No reviews yet</p>
          <p className="text-sm mt-1">Be the first to review this plan after purchasing</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-600 text-sm">
                    {review.user_name?.[0]?.toUpperCase() || "C"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{review.user_name || "Customer"}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={`text-lg ${s <= review.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
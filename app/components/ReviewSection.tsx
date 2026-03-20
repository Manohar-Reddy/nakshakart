"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReviewSection({ planId }: { planId: string }) {
  const [reviews,      setReviews]      = useState<any[]>([]);
  const [user,         setUser]         = useState<any>(null);
  const [rating,       setRating]       = useState(0);
  const [hoverRating,  setHoverRating]  = useState(0);
  const [comment,      setComment]      = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasReviewed,  setHasReviewed]  = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [filterRating, setFilterRating] = useState(0);
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [editComment,  setEditComment]  = useState("");
  const [editRating,   setEditRating]   = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("*")
        .eq("plan_id", planId)
        .order("created_at", { ascending: false });

      setReviews(reviewData || []);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);

        const { data: purchase } = await supabase
          .from("purchases")
          .select("id")
          .eq("user_id", user.id)
          .eq("plan_id", planId)
          .single();

        setHasPurchased(!!purchase);
        setHasReviewed((reviewData || []).some((r) => r.user_id === user.id));
      }
      setLoading(false);
    };
    load();
  }, [planId]);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setSubmitting(true);

    const { data, error } = await supabase.from("reviews").insert({
      plan_id:   planId,
      user_id:   user.id,
      user_name: user.user_metadata?.full_name || "Customer",
      rating,
      comment,
    }).select().single();

    if (!error && data) {
      setReviews((prev) => [data, ...prev]);
      setHasReviewed(true);
      setRating(0);
      setComment("");
    }
    setSubmitting(false);
  };

  const handleEdit = async (reviewId: string) => {
    await supabase.from("reviews").update({
      rating:  editRating,
      comment: editComment,
    }).eq("id", reviewId);

    setReviews((prev) => prev.map((r) =>
      r.id === reviewId ? { ...r, rating: editRating, comment: editComment } : r
    ));
    setEditingId(null);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Delete your review?")) return;
    await supabase.from("reviews").delete().eq("id", reviewId);
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    setHasReviewed(false);
  };

  const average = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count:  reviews.filter((rev) => rev.rating === r).length,
  }));

  const filteredReviews = filterRating === 0
    ? reviews
    : reviews.filter((r) => r.rating === filterRating);

  const StarDisplay = ({ value, size = "text-lg" }: { value: number; size?: string }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`${size} ${s <= value ? "text-yellow-400" : "text-gray-200"}`}>★</span>
      ))}
    </div>
  );

  if (loading) return <div className="text-gray-400 text-sm py-4">Loading reviews...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <h2 className="text-xl font-bold text-gray-800">⭐ Customer Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-full">
            <span className="text-yellow-400 text-lg">★</span>
            <span className="font-bold text-gray-800">{average.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
          </div>
        )}
      </div>

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <div className="flex gap-6 flex-wrap">

            {/* Big average */}
            <div className="text-center flex-shrink-0">
              <p className="text-5xl font-bold text-gray-800">{average.toFixed(1)}</p>
              <StarDisplay value={Math.round(average)} size="text-xl" />
              <p className="text-xs text-gray-400 mt-1">{reviews.length} reviews</p>
            </div>

            {/* Bar chart */}
            <div className="flex-1 min-w-[200px] space-y-1.5">
              {ratingCounts.map(({ rating: r, count }) => (
                <button key={r}
                  onClick={() => setFilterRating(filterRating === r ? 0 : r)}
                  className={`w-full flex items-center gap-2 group hover:opacity-80 transition ${
                    filterRating === r ? "opacity-100" : "opacity-90"
                  }`}>
                  <span className="text-xs text-gray-500 w-4 text-right">{r}</span>
                  <span className="text-yellow-400 text-xs">★</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-2 rounded-full transition-all ${
                      filterRating === r ? "bg-yellow-500" : "bg-yellow-300"
                    }`}
                      style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : "0%" }} />
                  </div>
                  <span className="text-xs text-gray-400 w-4">{count}</span>
                </button>
              ))}
            </div>
          </div>

          {filterRating > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500">
                Showing {filterRating}★ reviews ({filteredReviews.length})
              </span>
              <button onClick={() => setFilterRating(0)}
                className="text-xs text-teal-600 hover:underline">
                Clear filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* Write Review */}
      {user && hasPurchased && !hasReviewed && (
        <div className="bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-teal-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-1">✍️ Write a Review</h3>
          <p className="text-xs text-gray-500 mb-4">Share your experience to help other buyers</p>

          {/* Star selector */}
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                className={`text-4xl transition-transform hover:scale-110 ${
                  s <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-200"
                }`}>
                ★
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-gray-600 self-center font-medium">
                {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : "Excellent"}
              </span>
            )}
          </div>

          <textarea value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience — Was the plan detailed? Easy to understand? Did it meet your expectations?"
            rows={4}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3 bg-white resize-none" />

          <div className="flex items-center gap-3">
            <button onClick={handleSubmit} disabled={submitting || rating === 0}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition">
              {submitting ? "Submitting..." : "⭐ Submit Review"}
            </button>
            {rating === 0 && (
              <p className="text-xs text-gray-400">Please select a star rating</p>
            )}
          </div>
        </div>
      )}

      {/* Must purchase notice */}
      {user && !hasPurchased && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6 text-sm text-gray-500 flex items-center gap-2">
          🔒 Purchase this plan to leave a review
        </div>
      )}

      {/* Not logged in */}
      {!user && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6 text-sm text-gray-500 flex items-center gap-2">
          🔒 <a href="/login" className="text-teal-600 hover:underline font-medium">Login</a> and purchase to leave a review
        </div>
      )}

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-400">
          <p className="text-3xl mb-2">⭐</p>
          <p className="font-medium">
            {filterRating > 0 ? `No ${filterRating}★ reviews yet` : "No reviews yet"}
          </p>
          <p className="text-sm mt-1">Be the first to review this plan after purchasing</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id || review.created_at}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition">

              {editingId === review.id ? (
                /* Edit Mode */
                <div>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setEditRating(s)}
                        className={`text-3xl transition ${s <= editRating ? "text-yellow-400" : "text-gray-200"}`}>
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea value={editComment} onChange={(e) => setEditComment(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3 resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(review.id)}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-xs font-semibold transition">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Display Mode */
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-600">
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
                    <div className="flex items-center gap-2">
                      <StarDisplay value={review.rating} />
                      {/* Edit/Delete for own reviews */}
                      {user?.id === review.user_id && (
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => {
                              setEditingId(review.id);
                              setEditComment(review.comment || "");
                              setEditRating(review.rating);
                            }}
                            className="text-xs text-gray-400 hover:text-teal-600 transition px-1">
                            ✏️
                          </button>
                          <button onClick={() => handleDelete(review.id)}
                            className="text-xs text-gray-400 hover:text-red-500 transition px-1">
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                  )}

                  {/* Verified Purchase badge */}
                  <div className="mt-3">
                    <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                      ✅ Verified Purchase
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
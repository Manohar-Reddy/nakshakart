"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ArchitectReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    five: 0,
    four: 0,
    three: 0,
    two: 0,
    one: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get architect's plans
      const { data: plans } = await supabase
        .from("plans")
        .select("id, title")
        .eq("architect_id", user.id);

      if (!plans || plans.length === 0) {
        setLoading(false);
        return;
      }

      const planIds = plans.map((p) => p.id);
      const planMap = Object.fromEntries(plans.map((p) => [p.id, p]));

      // Get reviews
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("*")
        .in("plan_id", planIds)
        .order("created_at", { ascending: false });

      if (reviewData && reviewData.length > 0) {
        const enriched = reviewData.map((r) => ({
          ...r,
          plan: planMap[r.plan_id],
        }));

        const total = reviewData.length;
        const average = reviewData.reduce((sum, r) => sum + r.rating, 0) / total;

        setStats({
          total,
          average: Math.round(average * 10) / 10,
          five: reviewData.filter((r) => r.rating === 5).length,
          four: reviewData.filter((r) => r.rating === 4).length,
          three: reviewData.filter((r) => r.rating === 3).length,
          two: reviewData.filter((r) => r.rating === 2).length,
          one: reviewData.filter((r) => r.rating === 1).length,
        });

        setReviews(enriched);
      }
      setLoading(false);
    };
    load();
  }, []);

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`text-lg ${s <= rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
      ))}
    </div>
  );

  const RatingBar = ({ label, count, total }: { label: string; count: number; total: number }) => (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-8">{label}★</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
        <div
          className="bg-yellow-400 h-2.5 rounded-full transition-all"
          style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
        />
      </div>
      <span className="text-sm text-gray-500 w-6 text-right">{count}</span>
    </div>
  );

  if (loading) return <div className="p-10 text-center text-gray-500">Loading reviews...</div>;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">⭐ Reviews & Ratings</h1>
        <p className="text-gray-500 text-sm mt-1">See what customers say about your plans</p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center text-gray-400">
          <p className="text-5xl mb-4">⭐</p>
          <p className="font-semibold text-lg">No reviews yet</p>
          <p className="text-sm mt-2">Once customers review your plans, they'll appear here</p>
          <Link href="/architect/upload-plan"
            className="mt-4 inline-block bg-teal-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-teal-700 transition">
            Upload a Plan →
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Overall Rating */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <p className="text-6xl font-bold text-gray-800">{stats.average}</p>
              <div className="flex justify-center my-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={`text-2xl ${s <= Math.round(stats.average) ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-500 text-sm">{stats.total} total reviews</p>
            </div>

            {/* Rating Breakdown */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
              <RatingBar label="5" count={stats.five} total={stats.total} />
              <RatingBar label="4" count={stats.four} total={stats.total} />
              <RatingBar label="3" count={stats.three} total={stats.total} />
              <RatingBar label="2" count={stats.two} total={stats.total} />
              <RatingBar label="1" count={stats.one} total={stats.total} />
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-600">
                      {review.user_name?.[0]?.toUpperCase() || "C"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{review.user_name || "Customer"}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                  <StarDisplay rating={review.rating} />
                </div>

                {review.comment && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>
                )}

                {review.plan && (
                  <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500">
                    Plan: <Link href={`/plan/${review.plan_id}`}
                      className="text-teal-600 hover:underline font-medium">
                      {review.plan.title}
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
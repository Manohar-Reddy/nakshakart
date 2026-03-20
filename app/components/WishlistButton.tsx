"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  planId: string;
  size?: "sm" | "md" | "lg";
}

export default function WishlistButton({ planId, size = "md" }: Props) {
  const [wishlisted, setWishlisted] = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [user,       setUser]       = useState<any>(null);
  const [animating,  setAnimating]  = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUser(user);

      const { data } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("plan_id", planId)
        .single();

      setWishlisted(!!data);
      setLoading(false);
    };
    check();
  }, [planId]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    if (wishlisted) {
      await supabase.from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("plan_id", planId);
      setWishlisted(false);
    } else {
      await supabase.from("wishlists")
        .insert({ user_id: user.id, plan_id: planId });
      setWishlisted(true);
    }
  };

  const sizeClass =
    size === "sm" ? "w-7 h-7 text-sm"  :
    size === "lg" ? "w-11 h-11 text-xl" :
    "w-9 h-9 text-base";

  if (loading) return (
    <div className={`${sizeClass} rounded-full bg-gray-100 animate-pulse`} />
  );

  return (
    <button
      onClick={toggle}
      title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={`${sizeClass} rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
        wishlisted
          ? "bg-red-500 hover:bg-red-600 text-white"
          : "bg-white hover:bg-red-50 text-gray-400 hover:text-red-400 border border-gray-200"
      } ${animating ? "scale-125" : "scale-100"}`}>
      {wishlisted ? "❤️" : "🤍"}
    </button>
  );
}
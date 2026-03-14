"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function RejectPlan() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      await supabase.from("plans").update({ status: "rejected" }).eq("id", id);
      router.push("/admin/plans");
    };
    run();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Rejecting plan...
    </div>
  );
}
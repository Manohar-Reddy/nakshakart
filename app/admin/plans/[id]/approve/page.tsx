"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function ApprovePlan() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      await supabase.from("plans").update({ status: "approved" }).eq("id", id);
      router.push("/admin/plans");
    };
    run();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Approving plan...
    </div>
  );
}
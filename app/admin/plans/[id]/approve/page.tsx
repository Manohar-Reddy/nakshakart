import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApprovePlan({ params }: PageProps) {
  const { id } = await params;

  await supabase
    .from("plans")
    .update({ status: "approved" })
    .eq("id", id);

  redirect("/admin/plans");
}
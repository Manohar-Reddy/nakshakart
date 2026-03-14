"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ArchitectMessages() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);

      // Get all messages where user is sender or receiver
      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!messages) { setLoading(false); return; }

      // Group by conversation_id
      const convMap: Record<string, any> = {};
      for (const msg of messages) {
        if (!convMap[msg.conversation_id]) {
          convMap[msg.conversation_id] = {
            conversation_id: msg.conversation_id,
            last_message: msg.message,
            last_time: msg.created_at,
            other_id: msg.sender_id === user.id ? msg.receiver_id : msg.sender_id,
            plan_id: msg.plan_id,
            unread: 0,
          };
        }
        if (!msg.is_read && msg.receiver_id === user.id) {
          convMap[msg.conversation_id].unread++;
        }
      }

      // Get other user names
      const convList = Object.values(convMap);
      const otherIds = [...new Set(convList.map((c) => c.other_id))];

      const { data: users } = await supabase
        .from("users")
        .select("id, name, profile_photo_url")
        .in("id", otherIds);

      const userMap = Object.fromEntries((users || []).map((u) => [u.id, u]));

      // Get plan titles
      const planIds = [...new Set(convList.map((c) => c.plan_id).filter(Boolean))];
      let planMap: Record<string, any> = {};
      if (planIds.length > 0) {
        const { data: plans } = await supabase
          .from("plans")
          .select("id, title")
          .in("id", planIds);
        planMap = Object.fromEntries((plans || []).map((p) => [p.id, p]));
      }

      const enriched = convList.map((c) => ({
        ...c,
        other_user: userMap[c.other_id] || { name: "User", profile_photo_url: null },
        plan: planMap[c.plan_id] || null,
      }));

      setConversations(enriched);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading messages...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">💬 Messages</h1>
        <p className="text-gray-500 text-sm mt-1">Conversations with customers and admin</p>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center text-gray-400">
          <p className="text-5xl mb-4">💬</p>
          <p className="font-semibold text-lg">No messages yet</p>
          <p className="text-sm mt-2">Messages from customers will appear here after they purchase your plans</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {conversations.map((conv, i) => (
            <Link key={conv.conversation_id}
              href={`/messages/${conv.conversation_id}`}
              className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition ${
                i < conversations.length - 1 ? "border-b border-gray-100" : ""
              }`}>
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-600 flex-shrink-0 overflow-hidden">
                {conv.other_user.profile_photo_url ? (
                  <img src={conv.other_user.profile_photo_url} className="w-full h-full object-cover" />
                ) : (
                  conv.other_user.name?.[0]?.toUpperCase() || "U"
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-800">{conv.other_user.name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(conv.last_time).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short"
                    })}
                  </p>
                </div>
                {conv.plan && (
                  <p className="text-xs text-teal-600 mb-0.5">Re: {conv.plan.title}</p>
                )}
                <p className="text-sm text-gray-500 truncate">{conv.last_message}</p>
              </div>

              {/* Unread badge */}
              {conv.unread > 0 && (
                <span className="bg-teal-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                  {conv.unread}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
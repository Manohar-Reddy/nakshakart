"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function ConversationPage() {
  const { conversationId } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setCurrentUser(user);

      // Parse other user ID from conversation ID formats:
      // "admin-{architectId}" or "plan-{planId}-buyer-{buyerId}-architect-{archId}"
      const convStr = Array.isArray(conversationId) ? conversationId[0] : conversationId as string;
      let otherUserId: string | null = null;

      if (convStr.startsWith("admin-")) {
        // admin-{architectId}
        otherUserId = convStr.replace("admin-", "");
      } else {
        // Try to get from existing messages
        const { data: msgs } = await supabase
          .from("messages")
          .select("sender_id, receiver_id")
          .eq("conversation_id", convStr)
          .limit(1)
          .single();
        if (msgs) {
          otherUserId = msgs.sender_id === user.id ? msgs.receiver_id : msgs.sender_id;
        }
      }

      // Fetch other user details
      if (otherUserId) {
        const { data: otherData } = await supabase
          .from("users")
          .select("id, name, profile_photo_url, designer_type, role")
          .eq("id", otherUserId)
          .single();
        setOtherUser(otherData);
      }

      // Load messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convStr)
        .order("created_at", { ascending: true });

      if (msgs) {
        setMessages(msgs);

        // Mark as read
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", convStr)
          .eq("receiver_id", user.id);

        // Get plan if exists
        if (msgs.length > 0 && msgs[0].plan_id) {
          const { data: planData } = await supabase
            .from("plans")
            .select("id, title, plan_code, image_url, exterior_render_url")
            .eq("id", msgs[0].plan_id)
            .single();
          setPlan(planData);
        }
      }

      setLoading(false);
    };
    load();
  }, [conversationId]);

  // Real-time subscription
  useEffect(() => {
    const convStr = Array.isArray(conversationId) ? conversationId[0] : conversationId as string;
    const channel = supabase
      .channel(`conversation-${convStr}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${convStr}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser || !otherUser) return;
    setSending(true);
    const convStr = Array.isArray(conversationId) ? conversationId[0] : conversationId as string;

    await supabase.from("messages").insert({
      conversation_id: convStr,
      sender_id: currentUser.id,
      receiver_id: otherUser.id,
      plan_id: plan?.id || null,
      message: newMessage.trim(),
    });

    setNewMessage("");
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Loading conversation...
    </div>
  );

  const planThumb = plan?.exterior_render_url || plan?.image_url;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-800 transition text-lg">
          ←
        </button>

        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-600 overflow-hidden flex-shrink-0">
          {otherUser?.profile_photo_url ? (
            <img src={otherUser.profile_photo_url} className="w-full h-full object-cover" alt={otherUser.name} />
          ) : (
            <span>{otherUser?.name?.[0]?.toUpperCase() || "U"}</span>
          )}
        </div>

        <div className="flex-1">
          <p className="font-bold text-gray-800">{otherUser?.name || "Loading..."}</p>
          <p className="text-xs text-gray-400">
            {otherUser?.designer_type || otherUser?.role || ""}
          </p>
        </div>

        {/* Plan reference */}
        {plan && (
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-1.5 text-xs text-teal-700 hidden md:flex items-center gap-2">
            {planThumb && (
              <img src={planThumb} className="w-8 h-8 rounded object-cover" alt={plan.title} />
            )}
            <div>
              <p className="font-semibold">{plan.title}</p>
              {plan.plan_code && <p className="text-teal-500">{plan.plan_code}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-w-3xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-20">
            <p className="text-5xl mb-4">💬</p>
            <p className="font-semibold text-gray-500">No messages yet</p>
            <p className="text-sm mt-1">Start the conversation with {otherUser?.name || "the architect"}!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? "bg-teal-600 text-white rounded-br-sm"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                }`}>
                  {msg.message}
                </div>
                <p className="text-xs text-gray-400 px-1">
                  {new Date(msg.created_at).toLocaleTimeString("en-IN", {
                    hour: "2-digit", minute: "2-digit"
                  })}
                  {isMe && <span className="ml-1">{msg.is_read ? " ✓✓" : " ✓"}</span>}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 sticky bottom-0 shadow-md">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${otherUser?.name || ""}... (Enter to send)`}
            rows={1}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
          <button onClick={handleSend} disabled={sending || !newMessage.trim()}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white px-5 py-3 rounded-xl font-semibold transition">
            {sending ? "..." : "Send →"}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          🔒 All communication through NakshaKart is recorded for your protection
        </p>
      </div>
    </div>
  );
}
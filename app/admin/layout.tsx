"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const role = user.user_metadata?.role;
      if (role !== "admin") { router.push("/login"); return; }
      setUser(user);

      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("is_read", false);
      setUnreadCount(count || 0);
    };
    load();
  }, []);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("admin-unread")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `receiver_id=eq.${user.id}`,
      }, () => {
        setUnreadCount((prev) => prev + 1);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { href: "/admin/dashboard",  icon: "📊", label: "Dashboard"     },
    { href: "/admin/plans",      icon: "📋", label: "Plans"         },
    { href: "/admin/users",      icon: "👥", label: "Users"         },
    { href: "/admin/purchases",  icon: "🛒", label: "Purchases"     },
    { href: "/admin/messages",   icon: "💬", label: "Messages", badge: unreadCount },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full z-20">

        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-700">
          <span className="text-teal-400 font-bold text-lg">Naksha</span>
          <span className="text-orange-400 font-bold text-lg">Kart</span>
          <p className="text-gray-400 text-xs mt-0.5">Admin Panel</p>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-4 py-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center font-bold text-white flex-shrink-0">
                {user.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-white">Admin</p>
                <p className="text-gray-400 text-xs truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition mb-1 ${
                  isActive
                    ? "bg-teal-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}>
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-red-900 hover:text-red-300 transition">
            <span className="text-lg">🚪</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
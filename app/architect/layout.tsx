"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function ArchitectLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const role = user.user_metadata?.role;
      if (role !== "architect") { router.push("/login"); return; }
      setUser(user);

      // Get unread message count
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("is_read", false);
      setUnreadCount(count || 0);
    };
    load();
  }, []);

  // Realtime unread count
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("unread-messages")
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
    { href: "/architect/dashboard",    icon: "🏠", label: "Dashboard"          },
    { href: "/architect/upload-plan",  icon: "📤", label: "Upload New Plan"    },
    { href: "/architect/my-plans",     icon: "📁", label: "My Plans"           },
    { href: "/architect/earnings",     icon: "💰", label: "Earnings"           },
    { href: "/architect/reviews",      icon: "⭐", label: "Reviews & Ratings"  },
    { href: "/architect/messages",     icon: "💬", label: "Messages", badge: unreadCount },
    { href: "/architect/profile",      icon: "👤", label: "Profile Settings"   },
    { href: "/terms",                  icon: "📜", label: "Terms & Policies"   },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-16" : "w-64"} bg-gray-900 text-white flex flex-col transition-all duration-300 fixed h-full z-20`}>

        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700">
          {!collapsed && (
            <div>
              <span className="text-teal-400 font-bold text-lg">Naksha</span>
              <span className="text-orange-400 font-bold text-lg">Kart</span>
              <p className="text-gray-400 text-xs mt-0.5">Architect Panel</p>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white transition p-1 rounded">
            {collapsed ? "▶" : "◀"}
          </button>
        </div>

        {/* User Info */}
        {!collapsed && user && (
          <div className="px-4 py-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center font-bold text-white flex-shrink-0">
                {user.user_metadata?.full_name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{user.user_metadata?.full_name}</p>
                <p className="text-gray-400 text-xs truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition mb-1 relative ${
                  isActive
                    ? "bg-teal-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}>
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                )}
                {item.badge && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
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
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-red-900 hover:text-red-300 transition ${
              collapsed ? "justify-center" : ""
            }`}>
            <span className="text-lg">🚪</span>
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${collapsed ? "ml-16" : "ml-64"} transition-all duration-300 min-h-screen`}>
        {children}
      </main>
    </div>
  );
}
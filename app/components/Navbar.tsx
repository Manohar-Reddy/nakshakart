"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user,          setUser]          = useState<any>(null);
  const [role,          setRole]          = useState<string>("");
  const [search,        setSearch]        = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs,    setShowNotifs]    = useState(false);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const router   = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setRole(user.user_metadata?.role || "customer");
        loadNotifications(user.id);
      }
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setRole(session.user.user_metadata?.role || "customer");
        loadNotifications(session.user.id);
      } else {
        setUser(null);
        setRole("");
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Close notif dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const loadNotifications = async (userId: string) => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const markOneRead = async (notifId: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", notifId);
    setNotifications((prev) => prev.map((n) => n.id === notifId ? { ...n, is_read: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleNotifClick = async (notif: any) => {
    if (!notif.is_read) await markOneRead(notif.id);
    setShowNotifs(false);
    if (notif.plan_id) {
      if (notif.type === "plan_approved" || notif.type === "plan_rejected") {
        router.push(`/architect/my-plans`);
      } else if (notif.type === "plan_live") {
        router.push(`/architect/my-plans`);
      } else if (notif.type === "new_sale") {
        router.push(`/architect/earnings`);
      } else {
        router.push(`/plan/${notif.plan_id}`);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/browse?search=${encodeURIComponent(search.trim())}`);
  };

  const getDashboardLink = () => {
    if (role === "admin" || role === "superadmin") return "/admin/dashboard";
    if (role === "architect") return "/architect/dashboard";
    return "/my-purchases";
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60)   return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <nav className="bg-white shadow-sm border-b-4 border-orange-500">
      <div className="px-8 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <Image src="/logo.png" alt="NakshaKart Logo" width={45} height={45} />
          <div>
            <h1 className="text-xl font-bold text-teal-700">
              Naksha<span className="text-orange-500">Kart</span>
            </h1>
            <p className="text-xs text-orange-400">BLUEPRINTS TO REALITY</p>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg">
          <div className="flex items-center border-2 border-teal-500 rounded-full overflow-hidden bg-white">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search house plans... e.g. 3BHK, 30x40"
              className="flex-1 px-4 py-2 text-sm focus:outline-none bg-white text-gray-800 min-w-0" />
            <button type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 text-sm font-medium transition flex-shrink-0">
              🔍
            </button>
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <>
              <span className="text-sm text-gray-600 hidden md:block">
                👋 {user.user_metadata?.full_name?.split(" ")[0] || "User"}
              </span>

              {/* 🔔 Notifications Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs && unreadCount > 0) {} }}
                  className="relative p-2 rounded-full hover:bg-gray-100 transition">
                  <span className="text-xl">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {showNotifs && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="font-bold text-gray-800 text-sm">
                        🔔 Notifications
                        {unreadCount > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </p>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead}
                          className="text-xs text-teal-600 hover:underline font-medium">
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-400">
                          <p className="text-3xl mb-2">🔔</p>
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <button key={notif.id}
                            onClick={() => handleNotifClick(notif)}
                            className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${
                              !notif.is_read ? "bg-blue-50" : "bg-white"
                            }`}>
                            <div className="flex items-start gap-2">
                              <span className="text-lg flex-shrink-0 mt-0.5">
                                {notif.type === "plan_approved" ? "🎉" :
                                 notif.type === "plan_rejected" ? "❌" :
                                 notif.type === "plan_live"     ? "🟢" :
                                 notif.type === "new_sale"      ? "💰" :
                                 "🔔"}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold text-gray-800 ${!notif.is_read ? "font-bold" : ""}`}>
                                  {notif.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                  {notif.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {timeAgo(notif.created_at)}
                                </p>
                              </div>
                              {!notif.is_read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center">
                        <p className="text-xs text-gray-400">
                          {notifications.length} notifications
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {role === "customer" && (
                <>
                  <Link href="/wishlist"
                    className="border-2 border-red-400 text-red-400 hover:bg-red-50 px-3 py-1.5 rounded-full text-sm font-medium transition">
                    ❤️ Wishlist
                  </Link>
                  <Link href="/my-purchases"
                    className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 px-3 py-1.5 rounded-full text-sm font-medium transition">
                    My Purchases
                  </Link>
                </>
              )}
              <Link href={getDashboardLink()}
                className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 px-3 py-1.5 rounded-full text-sm font-medium transition">
                Dashboard
              </Link>
              <button onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium transition">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login"
                className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-full text-sm font-medium transition">
                Login
              </Link>
              <Link href="/signup"
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-full text-sm font-medium transition">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="px-8 py-2 flex items-center gap-3 border-t border-gray-100">
        <Link href="/"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition">
          Home
        </Link>
        <Link href="/browse"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition">
          Browse Plans
        </Link>
        <Link href="/calculator"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition">
          🧱 Calculator
        </Link>
        <Link href="/about"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition">
          About Us
        </Link>
        <Link href="/contact"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition">
          Contact Us
        </Link>
      </div>
    </nav>
  );
}
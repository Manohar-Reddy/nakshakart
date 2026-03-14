"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);

      const { data } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
      setUsers(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleMessage = (architectId: string) => {
    if (!currentUser) return;
    const convId = `admin-${currentUser.id}-architect-${architectId}`;
    router.push(`/messages/${convId}`);
  };

  const handleApprove = async (userId: string) => {
    await supabase
      .from("users")
      .update({ account_status: "active" })
      .eq("id", userId);
    setUsers((prev) => prev.map((u) =>
      u.id === userId ? { ...u, account_status: "active" } : u
    ));
  };

  const handleReject = async (userId: string) => {
    await supabase
      .from("users")
      .update({ account_status: "rejected" })
      .eq("id", userId);
    setUsers((prev) => prev.map((u) =>
      u.id === userId ? { ...u, account_status: "rejected" } : u
    ));
  };

  const filtered = filter === "all"
    ? users
    : users.filter((u) => u.role === filter);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading users...</div>;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">👥 Users</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} total users</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "all",       label: "All Users",   count: users.length },
          { key: "customer",  label: "👤 Customers", count: users.filter((u) => u.role === "customer").length },
          { key: "architect", label: "📐 Architects", count: users.filter((u) => u.role === "architect").length },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border-2 ${
              filter === tab.key
                ? "bg-teal-600 border-teal-600 text-white"
                : "bg-white border-gray-200 text-gray-600 hover:border-teal-400"
            }`}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Pending Approval Banner */}
      {users.filter((u) => u.account_status === "pending").length > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-yellow-800">
              {users.filter((u) => u.account_status === "pending").length} accounts pending approval
            </p>
            <p className="text-xs text-yellow-700">3D Designers and Draftsmen need manual approval</p>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">User</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Role</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Type</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Location</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Joined</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-600 flex-shrink-0 overflow-hidden">
                      {user.profile_photo_url ? (
                        <img src={user.profile_photo_url} className="w-full h-full object-cover" />
                      ) : (
                        user.name?.[0]?.toUpperCase() || "U"
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.role === "architect"
                      ? "bg-blue-100 text-blue-700"
                      : user.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {user.designer_type || "-"}
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {user.city ? `${user.city}, ${user.state || ""}` : "-"}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.account_status === "active" || !user.account_status
                      ? "bg-green-100 text-green-700"
                      : user.account_status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {user.account_status || "active"}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {new Date(user.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {/* Approve/Reject for pending */}
                    {user.account_status === "pending" && (
                      <>
                        <button onClick={() => handleApprove(user.id)}
                          className="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded text-xs font-semibold transition">
                          ✅ Approve
                        </button>
                        <button onClick={() => handleReject(user.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs font-semibold transition">
                          ❌ Reject
                        </button>
                      </>
                    )}
                    {/* Message button for architects */}
                    {user.role === "architect" && (
                      <button onClick={() => handleMessage(user.id)}
                        className="bg-teal-100 hover:bg-teal-200 text-teal-700 px-2 py-1 rounded text-xs font-semibold transition">
                        💬 Message
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-10 text-center text-gray-400">
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function AdminUsersPage() {
  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-8 py-4 flex items-center justify-between border-b border-gray-700">
        <h1 className="text-xl font-bold">
          Naksha<span className="text-orange-400">Kart</span>
          <span className="text-gray-400 text-sm font-normal ml-2">Admin Panel</span>
        </h1>
        <div className="flex gap-4 items-center">
          <Link href="/admin/dashboard" className="text-gray-300 hover:text-white text-sm">Dashboard</Link>
          <Link href="/admin/plans" className="text-gray-300 hover:text-white text-sm">Plans</Link>
          <Link href="/admin/users" className="text-orange-400 text-sm font-semibold">Users</Link>
          <Link href="/" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition">
            View Website
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Manage Users</h2>
            <p className="text-gray-400 mt-1">View and manage all registered users</p>
          </div>
          <div className="flex gap-3">
            <span className="bg-teal-900 text-teal-300 px-3 py-1 rounded-full text-sm">
              {users?.filter(u => u.role === "customer").length || 0} Customers
            </span>
            <span className="bg-orange-900 text-orange-300 px-3 py-1 rounded-full text-sm">
              {users?.filter(u => u.role === "architect").length || 0} Architects
            </span>
          </div>
        </div>

        {users && users.length > 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-300">Name</th>
                  <th className="px-6 py-4 text-left text-gray-300">Email</th>
                  <th className="px-6 py-4 text-left text-gray-300">Role</th>
                  <th className="px-6 py-4 text-left text-gray-300">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-700">
                    <td className="px-6 py-4 text-white font-medium">{user.name || "N/A"}</td>
                    <td className="px-6 py-4 text-gray-300">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === "architect"
                          ? "bg-orange-900 text-orange-300"
                          : user.role === "admin"
                          ? "bg-purple-900 text-purple-300"
                          : "bg-teal-900 text-teal-300"
                      }`}>
                        {user.role || "customer"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <p className="text-4xl mb-4">👥</p>
            <p className="text-gray-400">No users registered yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
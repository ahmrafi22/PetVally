"use client"

import { useEffect, useState } from "react"
import { Users, PawPrint, UserCheck, ShoppingBag } from "lucide-react"
import StatCard from "../_components/stat-card"

type DashboardStats = {
  userCount: number
  availablePetsCount: number
  caregiverCount: number
  petOrdersCount: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const token = localStorage.getItem("adminToken")

        // Fetch dashboard stats
        const statsResponse = await fetch("/api/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!statsResponse.ok) {
          throw new Error("Failed to fetch dashboard statistics")
        }

        const statsData = await statsResponse.json()
        setStats(statsData.stats)

        // Fetch users
        const usersResponse = await fetch("/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users")
        }

        const usersData = await usersResponse.json()
        setUsers(usersData.users)
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err)
        setError(err.message || "An error occurred while fetching dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-red-600">Error loading dashboard</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Users"
            value={stats.userCount}
            icon={<Users className="h-8 w-8 text-blue-500" />}
            description="Registered users"
            color="blue"
          />
          <StatCard
            title="Available Pets"
            value={stats.availablePetsCount}
            icon={<PawPrint className="h-8 w-8 text-green-500" />}
            description="Pets for adoption"
            color="green"
          />
          <StatCard
            title="Caregivers"
            value={stats.caregiverCount}
            icon={<UserCheck className="h-8 w-8 text-purple-500" />}
            description="Registered caregivers"
            color="purple"
          />
          <StatCard
            title="Pet Adoptions"
            value={stats.petOrdersCount}
            icon={<ShoppingBag className="h-8 w-8 text-amber-500" />}
            description="Completed adoptions"
            color="amber"
          />
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b">
          <h2 className="text-lg font-medium text-gray-900">Registered Users</h2>
          <p className="mt-1 text-sm text-gray-500">A list of all the users registered on the platform.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {[user.city, user.country].filter(Boolean).join(", ") || "Not specified"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


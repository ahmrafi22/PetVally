"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell,  Calendar, Info, Cat, PackageCheck, PackageX, MapPinPlus, MessageSquare, HeartPulse, HeartHandshake, MapPinnedIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import type { Notification } from "@/types"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const token = localStorage.getItem("userToken")

        const response = await fetch("/api/users/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch notifications")
        }

        const data = await response.json()
        setNotifications(data.notifications)

        // Mark all notifications as read
        await fetch("/api/users/notifications", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } catch (err: any) {
        console.error("Error fetching notifications:", err)
        setError(err.message || "An error occurred while fetching notifications")
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [router])

  // Function to get icon based on notification type  "" : "",
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NEW_PET":
        return <Cat className="h-8 w-8 text-blue-500" />
      case "APPOINTMENT":
        return <Calendar className="h-5 w-5 text-purple-500" />
      case "ORDER_COMPLETED":
        return <PackageCheck className="h-8 w-8 text-purple-500" />
      case "ORDER_CANCELLED":
        return <PackageX className="h-8 w-8 text-purple-500" />
      case "NEW_DONATION_POST":
        return <MapPinPlus className="h-8 w-8 text-green-500" />
      case "NEW_MISSING_POST":
          return <MapPinnedIcon className="h-8 w-8 text-green-500" />
      case "NEW_COMMENT":
          return <MessageSquare className="h-8 w-8 text-green-700" />
      case "NEW_ADOPTION_APPLICATION":
        return <HeartPulse className="h-8 w-8 text-red-500" />
      case "ADOPTION_ACCEPTED":
        return <HeartHandshake className="h-8 w-8 text-pink-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
        
    }
  }

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "MMM d, yyyy 'at' h:mm a")
  }

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className=" p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-600">No notifications yet</h2>
          <p className="text-gray-500 mt-2">We&apos;ll notify you when there&apos;s something new.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start p-4 rounded-lg ${notification.read ? "bg-gray-50" : "bg-blue-50"}`}
            >
              <div className="flex-shrink-0 mr-4">{getNotificationIcon(notification.type)}</div>
              <div className="flex-1">
                <p className="text-gray-800">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(notification.createdAt)}</p>
              </div>
              {!notification.read && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

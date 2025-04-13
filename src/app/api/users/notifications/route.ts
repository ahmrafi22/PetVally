import { type NextRequest, NextResponse } from "next/server"
import { getUserNotifications, markAllNotificationsAsRead } from "@/controllers/notifications"
import { verifyJwtToken } from "@/lib/auth"

// Get notifications for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization")

    // Check if the authorization header exists and is in the correct format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized: Missing or invalid token" }, { status: 401 })
    }

    // Extract the token
    const token = authHeader.split(" ")[1]

    // Verify the token
    const payload = await verifyJwtToken(token)

    if (!payload || payload.role !== "user") {
      return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 })
    }

    // Get the user ID from the payload
    const userId = payload.id as string

    // Get the notifications
    const notifications = await getUserNotifications(userId)

    // Return the notifications
    return NextResponse.json(
      {
        message: "Notifications retrieved successfully",
        notifications,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error retrieving notifications:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

// Mark all notifications as read
export async function PUT(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization")

    // Check if the authorization header exists and is in the correct format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized: Missing or invalid token" }, { status: 401 })
    }

    // Extract the token
    const token = authHeader.split(" ")[1]

    // Verify the token
    const payload = await verifyJwtToken(token)

    if (!payload || payload.role !== "user") {
      return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 })
    }

    // Get the user ID from the payload
    const userId = payload.id as string

    // Mark all notifications as read
    await markAllNotificationsAsRead(userId)

    // Return success
    return NextResponse.json(
      {
        message: "All notifications marked as read",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error marking notifications as read:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

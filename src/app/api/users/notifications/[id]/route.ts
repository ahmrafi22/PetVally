import { type NextRequest, NextResponse } from "next/server"
import { markNotificationAsRead } from "@/controllers/notifications"
import { verifyJwtToken } from "@/lib/auth"

// Mark a notification as read
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Get the notification ID from the URL params
    const id = params.id

    // Mark the notification as read
    await markNotificationAsRead(id)

    // Return success
    return NextResponse.json(
      {
        message: "Notification marked as read",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

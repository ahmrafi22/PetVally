import { type NextRequest, NextResponse } from "next/server"
import { getUnreadNotificationCount } from "@/controllers/notifications"
import { verifyJwtToken } from "@/lib/auth"

// Get unread notification count for the authenticated user
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

    // Get the unread notification count
    const count = await getUnreadNotificationCount(userId)

    // Return the count
    return NextResponse.json(
      {
        message: "Unread notification count retrieved successfully",
        count,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error retrieving unread notification count:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

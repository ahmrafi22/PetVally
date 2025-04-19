import { type NextRequest, NextResponse } from "next/server"
import { getUserMeetings } from "@/controllers/donation-post-data"
import { verifyJwtToken } from "@/lib/auth"

// Get user's meetings
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

    // Get the user's meetings
    const meetings = await getUserMeetings(userId)

    // Return the meetings
    return NextResponse.json(
      {
        message: "Meetings retrieved successfully",
        meetings,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error retrieving meetings:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

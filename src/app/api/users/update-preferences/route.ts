import { type NextRequest, NextResponse } from "next/server"
import { updateUserPreferences } from "@/controllers/user-data"
import { verifyJwtToken } from "@/lib/auth"

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

    // Get the request body
    const body = await request.json()
    const { id, dailyAvailability, hasOutdoorSpace, hasChildren, hasAllergies, experienceLevel } = body

    if (!id) {
      return NextResponse.json({ message: "Bad Request: Missing user ID" }, { status: 400 })
    }

    // Ensure the user is updating their own preferences
    if (payload.id !== id) {
      return NextResponse.json({ message: "Forbidden: You can only update your own preferences" }, { status: 403 })
    }

    // Update the user preferences
    const updatedUser = await updateUserPreferences(id, {
      dailyAvailability: dailyAvailability ? Number.parseInt(dailyAvailability) : undefined,
      hasOutdoorSpace,
      hasChildren,
      hasAllergies,
      experienceLevel: experienceLevel ? Number.parseInt(experienceLevel) : undefined,
    })

    // Return the updated user data
    return NextResponse.json(
      {
        message: "User preferences updated successfully",
        user: updatedUser,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating user preferences:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}


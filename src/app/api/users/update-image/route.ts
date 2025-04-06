import { type NextRequest, NextResponse } from "next/server"
import { updateUserProfileImage } from "@/controllers/userData"
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
    const { id, imageBase64 } = body

    if (!id || !imageBase64) {
      return NextResponse.json({ message: "Bad Request: Missing user ID or image data" }, { status: 400 })
    }

    // Ensure the user is updating their own image
    if (payload.id !== id) {
      return NextResponse.json({ message: "Forbidden: You can only update your own profile image" }, { status: 403 })
    }

    // Update the user profile image
    const updatedUser = await updateUserProfileImage(id, imageBase64)

    // Return the updated user data
    return NextResponse.json(
      {
        message: "User profile image updated successfully",
        user: updatedUser,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating user profile image:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}


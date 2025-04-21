import { type NextRequest, NextResponse } from "next/server"
import { getUserById } from "@/controllers/user-data"
import { verifyJwtToken } from "@/lib/auth"

// Controller function to handle user data requests
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

    // Get the user ID from the query parameters
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ message: "Bad Request: Missing user ID" }, { status: 400 })
    }

    // Get the user data
    const userData = await getUserById(id)

    if (!userData) {
      return NextResponse.json({ message: "Not Found: User not found" }, { status: 404 })
    }

    // Return the user data
    return NextResponse.json(
      {
        message: "User data retrieved successfully",
        user: userData,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error retrieving user data:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}


import { type NextRequest, NextResponse } from "next/server"
import { getAvailablePets } from "@/lib/controllers/petshop"
import { verifyJwtToken } from "@/lib/auth"

// Get all available pets
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

    // Get all available pets
    const pets = await getAvailablePets()

    // Return the pets
    return NextResponse.json(
      {
        message: "Pets retrieved successfully",
        pets,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error retrieving pets:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}


import { type NextRequest, NextResponse } from "next/server"
import { getPetById } from "@/controllers/petshop"
import { verifyJwtToken } from "@/lib/auth"

// Get pet by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization")

    const awaitedParams = await params

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

    // Get the pet ID from the URL params
    const id = awaitedParams.id

    // Get the pet by ID
    const pet = await getPetById(id)

    if (!pet) {
      return NextResponse.json({ message: "Pet not found" }, { status: 404 })
    }

    // Return the pet
    return NextResponse.json(
      {
        message: "Pet retrieved successfully",
        pet,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error retrieving pet:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}


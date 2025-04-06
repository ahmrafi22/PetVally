import { type NextRequest, NextResponse } from "next/server"
import { createPetOrder } from "@/controllers/petshop"
import { verifyJwtToken } from "@/lib/auth"

// Create a pet order
export async function POST(request: NextRequest) {
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
    const { petId } = body

    if (!petId) {
      return NextResponse.json({ message: "Bad Request: Missing pet ID" }, { status: 400 })
    }

    // Create the pet order
    const order = await createPetOrder(payload.id as string, petId)

    // Return the order
    return NextResponse.json(
      {
        message: "Pet order created successfully",
        order,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating pet order:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}


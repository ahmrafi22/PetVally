import { type NextRequest, NextResponse } from "next/server"
import { deletePet } from "@/controllers/admin-data"
import { verifyJwtToken } from "@/lib/auth"

// Delete a pet
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 })
    }

    // Get the pet ID from the URL params
    const id = awaitedParams.id

    // Delete the pet
    await deletePet(id)

    // Return success response
    return NextResponse.json(
      {
        message: "Pet deleted successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error deleting pet:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}


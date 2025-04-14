import { type NextRequest, NextResponse } from "next/server"
import { deleteProduct } from "@/controllers/admin"
import { verifyJwtToken } from "@/lib/auth"

// Delete a product
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 })
    }

    // Get the product ID from the URL params

    const awaitedParams = await params
    const id = awaitedParams.id

    // Delete the product
    await deleteProduct(id)

    // Return success response
    return NextResponse.json(
      {
        message: "Product deleted successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

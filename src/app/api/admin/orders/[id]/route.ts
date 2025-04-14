import { type NextRequest, NextResponse } from "next/server"
import { updateOrderStatus } from "@/controllers/admin"
import { verifyJwtToken } from "@/lib/auth"

// Update order status
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }>  }) {
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

    // Get the order ID from the URL params
    const awaitedParams = await params
    const id = awaitedParams.id

    // Get the request body
    const body = await request.json()
    const { status } = body

    // Validate status
    if (!status || !["COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ message: "Invalid status. Must be COMPLETED or CANCELLED" }, { status: 400 })
    }

    // Update the order status
    const updatedOrder = await updateOrderStatus(id, status)

    // Return the updated order
    return NextResponse.json(
      {
        message: `Order ${status === "COMPLETED" ? "approved" : "cancelled"} successfully`,
        order: updatedOrder,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

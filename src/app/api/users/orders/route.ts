import { type NextRequest, NextResponse } from "next/server"
import { createOrderFromCart, getUserOrders } from "@/controllers/order-data"
import { verifyJwtToken } from "@/lib/auth"

// Create order from cart
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

    // Get the user ID from the payload
    const userId = payload.id as string

    // Get the request body
    const body = await request.json()
    const { shippingInfo } = body

    if (!shippingInfo) {
      return NextResponse.json({ message: "Bad Request: Missing shipping information" }, { status: 400 })
    }

    // Create order from cart
    const order = await createOrderFromCart(userId, shippingInfo)

    // Return success
    return NextResponse.json(
      {
        message: "Order created successfully",
        order,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating order:", error)
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Get user's orders
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

    // Get the user's orders
    const orders = await getUserOrders(userId)

    // Return the orders
    return NextResponse.json(
      {
        message: "Orders retrieved successfully",
        orders,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error retrieving orders:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { updateCartItemQuantity, removeCartItem } from "@/controllers/cart-data"
import { verifyJwtToken } from "@/lib/auth"

// Update cart item quantity
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

    // Get the user ID from the payload
    const userId = payload.id as string

    // Get the request body
    const body = await request.json()
    const { cartItemId, quantity } = body

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json({ message: "Bad Request: Missing or invalid parameters" }, { status: 400 })
    }

    // Update cart item quantity
    const result = await updateCartItemQuantity(userId, cartItemId, quantity)

    // Return success
    return NextResponse.json(
      {
        message: result.removed ? "Item removed from cart" : "Cart item quantity updated successfully",
        ...result,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error updating cart item quantity:", error)
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Remove item from cart
export async function DELETE(request: NextRequest) {
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

    // Get the cart item ID from the URL params
    const { searchParams } = new URL(request.url)
    const cartItemId = searchParams.get("id")

    if (!cartItemId) {
      return NextResponse.json({ message: "Bad Request: Missing cart item ID" }, { status: 400 })
    }

    // Remove item from cart
    await removeCartItem(userId, cartItemId)

    // Return success
    return NextResponse.json(
      {
        message: "Item removed from cart successfully",
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error removing cart item:", error)
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
  }
}

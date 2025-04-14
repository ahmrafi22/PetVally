import { type NextRequest, NextResponse } from "next/server"
import { getUserCart, addToCart } from "@/controllers/cart-data"
import { verifyJwtToken } from "@/lib/auth"

// Get user's cart
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

    // Get the user's cart
    const cart = await getUserCart(userId)

    // Return the cart
    return NextResponse.json(
      {
        message: "Cart retrieved successfully",
        cart,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error retrieving cart:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

// Add product to cart
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
    const { productId, quantity } = body

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ message: "Bad Request: Missing or invalid parameters" }, { status: 400 })
    }

    // Add product to cart
    await addToCart(userId, productId, quantity)

    // Return success
    return NextResponse.json(
      {
        message: "Product added to cart successfully",
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error adding product to cart:", error)
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
  }
}

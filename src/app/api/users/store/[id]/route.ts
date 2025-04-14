import { type NextRequest, NextResponse } from "next/server"
import { getProductById } from "@/controllers/storedata"
import { verifyJwtToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const awitedparams = await params
    // Get the product ID from the URL params
    const id = awitedparams.id

    // Get the product by ID
    const product = await getProductById(id)

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Return the product
    return NextResponse.json(
      {
        message: "Product retrieved successfully",
        product,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error retrieving product:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

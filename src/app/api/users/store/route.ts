import { type NextRequest, NextResponse } from "next/server"
import { getAllProducts, getProductsByCategory, getFeaturedProducts } from "@/controllers/store-data"
import { verifyJwtToken } from "@/lib/auth"

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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")

    let products

    if (featured === "true") {
      // Get featured products
      products = await getFeaturedProducts(10) 
    } else if (category) {
      // Get products by category
      products = await getProductsByCategory(category)
    } else {
      // Get all products
      products = await getAllProducts()
    }

    // Return the products
    return NextResponse.json(
      {
        message: "Products retrieved successfully",
        products,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error retrieving products:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

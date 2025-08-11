import { type NextRequest, NextResponse } from "next/server"
import { getAllProducts, getProductsByCategory, getFeaturedProducts } from "@/controllers/store-data"


export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization")

    // Check if the authorization header exists and is in the correct format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized: Missing or invalid token" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")

    let products

    if (featured === "true") {
      products = await getFeaturedProducts(10) 
    } else if (category) {
      products = await getProductsByCategory(category)
    } else {
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

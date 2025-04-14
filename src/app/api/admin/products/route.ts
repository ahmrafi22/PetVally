import { type NextRequest, NextResponse } from "next/server"
import { getAllProducts, createProduct } from "@/controllers/admin"
import { verifyJwtToken } from "@/lib/auth"

// Get all products
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

    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 })
    }

    // Get all products
    const products = await getAllProducts()

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

// Create a new product
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

    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 })
    }

    // Get the request body
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["name", "description", "price", "stock", "category", "imageBase64"]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Validate category
    if (!["food", "toy", "medicine"].includes(body.category)) {
      return NextResponse.json({ message: "Invalid category. Must be food, toy, or medicine" }, { status: 400 })
    }

    // Create the product
    const product = await createProduct(body)

    // Return the product
    return NextResponse.json(
      {
        message: "Product created successfully",
        product,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

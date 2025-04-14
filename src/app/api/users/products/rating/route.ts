import { type NextRequest, NextResponse } from "next/server"
import { getUserProductRating, createProductRating, updateProductRating } from "@/controllers/productrating-data"
import { verifyJwtToken } from "@/lib/auth"

// Get user's rating for a specific product
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

    // Get the product ID from the query parameters
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ message: "Bad Request: Missing product ID" }, { status: 400 })
    }

    // Get the user's rating for the product
    const rating = await getUserProductRating(userId, productId)

    // Return the rating
    return NextResponse.json(
      {
        message: rating ? "Rating retrieved successfully" : "No rating found",
        rating,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error retrieving product rating:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

// Create a new product rating
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
    const { productId, rating, comment } = body

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Bad Request: Invalid parameters" }, { status: 400 })
    }

    // Create the product rating
    const newRating = await createProductRating(userId, productId, rating, comment)

    // Return the new rating
    return NextResponse.json(
      {
        message: "Rating created successfully",
        rating: newRating,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating product rating:", error)
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Update an existing product rating
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
    const { ratingId, rating, comment } = body

    if (!ratingId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Bad Request: Invalid parameters" }, { status: 400 })
    }

    // Update the product rating
    const updatedRating = await updateProductRating(userId, ratingId, rating, comment)

    // Return the updated rating
    return NextResponse.json(
      {
        message: "Rating updated successfully",
        rating: updatedRating,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error updating product rating:", error)
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
  }
}

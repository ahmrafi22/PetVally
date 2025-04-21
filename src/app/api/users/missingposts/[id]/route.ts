import { type NextRequest, NextResponse } from "next/server"
import {
  getMissingPostById,
  updateMissingPost,
  deleteMissingPost,
  hasUserUpvotedMissingPost,
  updateMissingPostStatus
} from "@/controllers/missing-post-data";
import { verifyJwtToken } from "@/lib/auth"

// Get missing post by ID
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

    // Get the user ID from the payload
    const userId = payload.id as string

    // Get the post ID from the URL params
    const awaitedParams = await params
    const id = awaitedParams.id

    // Get the post
    const post = await getMissingPostById(id)

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    // Check if user has upvoted this post
    const hasUpvoted = await hasUserUpvotedMissingPost(userId, id)

    // Return the post with upvote status
    return NextResponse.json(
      {
        message: "Post retrieved successfully",
        post,
        hasUpvoted,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error retrieving missing post:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

// Update missing post
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Get the post ID from the URL params
    const awaitedParams = await params
    const id = awaitedParams.id

    // Get the request body
    const body = await request.json()
    const { title, description, imageBase64, country, city, area, species, breed, age } = body

    // Update the post
    const updatedPost = await updateMissingPost(userId, id, {
      title,
      description,
      imageBase64,
      country,
      city,
      area,
      species,
      breed,
      age,
    })

    // Return the updated post
    return NextResponse.json(
      {
        message: "Post updated successfully",
        post: updatedPost,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error updating missing post:", error)
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Delete missing post
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

    if (!payload || payload.role !== "user") {
      return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 })
    }

    // Get the user ID from the payload
    const userId = payload.id as string

    // Get the post ID from the URL params
    const awaitedParams = await params
    const id = awaitedParams.id

    // Delete the post
    await deleteMissingPost(userId, id)

    // Return success
    return NextResponse.json(
      {
        message: "Post deleted successfully",
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error deleting missing post:", error)
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Check if user has upvoted the post
export async function HEAD(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Get the post ID from the URL params
    const awaitedParams = await params
    const id = awaitedParams.id

    // Check if user has upvoted this post
    const hasUpvoted = await hasUserUpvotedMissingPost(userId, id)

    // Return the upvote status
    return NextResponse.json({ hasUpvoted }, { status: 200 })
  } catch (error) {
    console.error("Error checking upvote status:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

// Update missing post status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Get the post ID from the URL params
    const awaitedParams = await params
    const id = awaitedParams.id

    // Get the request body
    const body = await request.json()
    const { status } = body

    // Validate status
    if (!status || (status !== "FOUND" && status !== "NOT_FOUND")) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 })
    }

    // Update the post status
    const updatedPost = await updateMissingPostStatus(userId, id, status)

    // Return the updated post
    return NextResponse.json(
      {
        message: "Post status updated successfully",
        post: updatedPost,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error updating missing post status:", error)
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
  }
}
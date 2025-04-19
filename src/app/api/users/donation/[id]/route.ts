import { type NextRequest, NextResponse } from "next/server"
import {
  getDonationPostById,
  updateDonationPost,
  deleteDonationPost,
  hasUserUpvoted,
} from "@/controllers/donation-post-data"
import { verifyJwtToken } from "@/lib/auth"

// Get donation post by ID
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
    const post = await getDonationPostById(id)

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    // Check if user has upvoted this post
    const hasUpvoted = await hasUserUpvoted(userId, id)

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
    console.error("Error retrieving donation post:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

// Update donation post
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

    // Update the post
    const updatedPost = await updateDonationPost(userId, id, body)

    // Return the updated post
    return NextResponse.json(
      {
        message: "Post updated successfully",
        post: updatedPost,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error updating donation post:", error)
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Delete donation post
export async function DELETE(request: NextRequest, { params }: {params: Promise<{ id: string }> }) {
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
    await deleteDonationPost(userId, id)

    // Return success
    return NextResponse.json(
      {
        message: "Post deleted successfully",
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error deleting donation post:", error)
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
  }
}

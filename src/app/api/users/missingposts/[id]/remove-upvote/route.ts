import { type NextRequest, NextResponse } from "next/server"
import { removeUpvoteFromMissingPost } from "@/controllers/missing-post-data"
import { verifyJwtToken } from "@/lib/auth"

// Remove upvote from a post
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Remove upvote from the post
    await removeUpvoteFromMissingPost(userId, id)

    // Return success
    return NextResponse.json(
      {
        message: "Upvote removed successfully",
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error removing upvote:", error)
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
  }
}

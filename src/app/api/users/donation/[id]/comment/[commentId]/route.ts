import { type NextRequest, NextResponse } from "next/server"
import { deleteComment } from "@/controllers/donation-post-data"
import { verifyJwtToken } from "@/lib/auth"

// Delete a comment
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; commentId: string }> }) {
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

    // Get the comment ID from the URL params
    const awaitedParams = await params
    const commentId = awaitedParams.commentId

    // Delete the comment
    await deleteComment(userId, commentId)

    // Return success
    return NextResponse.json(
      {
        message: "Comment deleted successfully",
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
  }
}

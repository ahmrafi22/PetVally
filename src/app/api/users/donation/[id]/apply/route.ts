import { type NextRequest, NextResponse } from "next/server"
import { submitAdoptionForm } from "@/controllers/donation-post-data"
import { verifyJwtToken } from "@/lib/auth"

// Submit adoption form
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

    // Get the request body
    const body = await request.json()
    const { description, meetingSchedule } = body

    if (!description || !description.trim() || !meetingSchedule) {
      return NextResponse.json({ message: "Description and meeting schedule are required" }, { status: 400 })
    }

    // Submit adoption form
    const form = await submitAdoptionForm(userId, id, {
      description,
      meetingSchedule: new Date(meetingSchedule),
    })

    // Return the form
    return NextResponse.json(
      {
        message: "Adoption form submitted successfully",
        form,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error submitting adoption form:", error)
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
  }
}

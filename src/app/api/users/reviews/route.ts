import { type NextRequest, NextResponse } from "next/server"
import { createReview, getReviewsByCaregiverId } from "@/controllers/reviews"

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const caregiverId = searchParams.get("caregiverId")

    if (!caregiverId) {
      return NextResponse.json({ error: "Caregiver ID is required" }, { status: 400 })
    }

    // Get reviews by caregiver ID
    const reviews = await getReviewsByCaregiverId(caregiverId)

    return NextResponse.json({ reviews })
  } catch (error: any) {
    console.error("Error in GET /api/users/reviews:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const data = await request.json()

    // Create review
    const review = await createReview(data)

    return NextResponse.json({ review }, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/users/reviews:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

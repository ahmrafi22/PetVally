import { type NextRequest, NextResponse } from "next/server"
import { updateCaregiverProfile } from "@/controllers/caregiverData"
import { verifyJwtToken } from "@/lib/auth"

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

    if (!payload || payload.role !== "caregiver") {
      return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 })
    }

    // Get the request body
    const body = await request.json()
    const { id, name, country, city, area, bio, hourlyRate } = body

    if (!id) {
      return NextResponse.json({ message: "Bad Request: Missing caregiver ID" }, { status: 400 })
    }

    // Ensure the caregiver is updating their own profile
    if (payload.id !== id) {
      return NextResponse.json({ message: "Forbidden: You can only update your own profile" }, { status: 403 })
    }

    // Update the caregiver profile
    const updatedCaregiver = await updateCaregiverProfile(id, {
      name,
      country,
      city,
      area,
      bio,
      hourlyRate: hourlyRate ? Number.parseFloat(hourlyRate) : undefined,
    })

    // Return the updated caregiver data
    return NextResponse.json(
      {
        message: "Caregiver profile updated successfully",
        caregiver: updatedCaregiver,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating caregiver profile:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}


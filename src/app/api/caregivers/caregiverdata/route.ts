import { type NextRequest, NextResponse } from "next/server"
import { getCaregiverById } from "@/controllers/caregiver-data"
import { verifyJwtToken } from "@/lib/auth"

// Controller function to handle caregiver data requests
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

    if (!payload || payload.role !== "caregiver") {
      return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 })
    }

    // Get the caregiver ID from the query parameters
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ message: "Bad Request: Missing caregiver ID" }, { status: 400 })
    }

    // Get the caregiver data
    const caregiverData = await getCaregiverById(id)

    if (!caregiverData) {
      return NextResponse.json({ message: "Not Found: Caregiver not found" }, { status: 404 })
    }

    // Return the caregiver data
    return NextResponse.json(
      {
        message: "Caregiver data retrieved successfully",
        caregiver: caregiverData,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error retrieving caregiver data:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}


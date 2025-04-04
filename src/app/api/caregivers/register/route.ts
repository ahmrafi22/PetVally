import { type NextRequest, NextResponse } from "next/server"
import { createCaregiver, getCaregiverByEmail } from "@/lib/data"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if caregiver already exists
    const existingCaregiver = await getCaregiverByEmail(email)
    if (existingCaregiver) {
      return NextResponse.json({ message: "Caregiver with this email already exists" }, { status: 409 })
    }

    // Create new caregiver
    const caregiver = await createCaregiver({ name, email, password })

    return NextResponse.json({ message: "Caregiver registered successfully", caregiver }, { status: 201 })
  } catch (error) {
    console.error("Error registering caregiver:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}


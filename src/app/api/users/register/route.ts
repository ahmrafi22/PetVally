import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/data"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    // Create new user
    const user = await createUser({ name, email, password })

    return NextResponse.json({ message: "User registered successfully", user }, { status: 201 })
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}


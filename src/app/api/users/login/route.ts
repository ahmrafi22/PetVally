import { type NextRequest, NextResponse } from "next/server"
import { verifyUserCredentials } from "@/lib/data"
import { setUserCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Verify credentials
    const user = await verifyUserCredentials(email, password)
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Set cookie and get token
    const token = await setUserCookie(user)

    // Set token in response header for Postman testing
    const response = NextResponse.json(
      {
        message: "Login successful",
        user,
        token, // Return token for Postman testing
      },
      { status: 200 },
    )

    response.headers.set("Authorization", `Bearer ${token}`)

    return response
  } catch (error) {
    console.error("Error logging in user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}


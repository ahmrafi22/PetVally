import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminCredentials, generateAdminToken } from "@/controllers/admin-data"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Verify credentials
    const admin = await verifyAdminCredentials(username, password)
    if (!admin) {
      return NextResponse.json({ message: "Invalid username or password" }, { status: 401 })
    }

    // Generate token
    const token = await generateAdminToken(admin)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set({
      name: "admin-token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
    })

    // Return success response with token for client-side storage
    return NextResponse.json(
      {
        message: "Login successful",
        admin,
        token, // Return token for client-side storage
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error logging in admin:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}


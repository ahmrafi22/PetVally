import { type NextRequest, NextResponse } from "next/server"
import { getDashboardStats } from "@/controllers/admin"
import { verifyJwtToken } from "@/lib/auth"

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

    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 })
    }

    // Get dashboard stats
    const stats = await getDashboardStats()

    // Return the stats
    return NextResponse.json(
      {
        message: "Dashboard stats retrieved successfully",
        stats,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error retrieving dashboard stats:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}


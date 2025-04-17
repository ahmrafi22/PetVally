import { type NextRequest, NextResponse } from "next/server"
import { getRecommendedPets } from "@/controllers/petshop"
import { verifyJwtToken } from "@/lib/auth"


export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization")

   
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized: Missing or invalid token" }, { status: 401 })
    }

    
    const token = authHeader.split(" ")[1]

    // Verify the token
    const payload = await verifyJwtToken(token) as { id: string; role: string }

    if (!payload || payload.role !== "user") {
      return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 })
    }

    // Get recommended pets for the user
    const recommendations = await getRecommendedPets(payload.id)


    return NextResponse.json(
      {
        message: "Pet recommendations retrieved successfully",
        recommendations,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error retrieving pet recommendations:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}


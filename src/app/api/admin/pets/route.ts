import { type NextRequest, NextResponse } from "next/server"
import { getAllPets, createPet } from "@/controllers/admin"
import { verifyJwtToken } from "@/lib/auth"

// Get all pets
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

    // Get all pets
    const pets = await getAllPets()

    // Return the pets
    return NextResponse.json(
      {
        message: "Pets retrieved successfully",
        pets,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error retrieving pets:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

// Create a new pet
export async function POST(request: NextRequest) {
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

    // Get the request body
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      "name",
      "breed",
      "age",
      "price",
      "bio",
      "description",
      "energyLevel",
      "spaceRequired",
      "maintenance",
      "imageBase64",
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Create the pet
    const pet = await createPet(body)

    // Return the pet
    return NextResponse.json(
      {
        message: "Pet created successfully",
        pet,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating pet:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}


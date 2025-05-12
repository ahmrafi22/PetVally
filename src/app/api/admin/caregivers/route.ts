import { type NextRequest, NextResponse } from "next/server"
import { getAllCaregivers } from "@/controllers/admin-data"

export async function GET(request: NextRequest) {
  try {
    const caregivers = await getAllCaregivers()
    return NextResponse.json({ caregivers })
  } catch (error) {
    console.error("Error fetching caregivers:", error)
    return NextResponse.json({ error: "Failed to fetch caregivers" }, { status: 500 })
  }
}

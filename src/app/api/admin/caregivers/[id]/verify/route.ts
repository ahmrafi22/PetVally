import { type NextRequest, NextResponse } from "next/server"
import { updateCaregiverVerificationStatus } from "@/controllers/admin-data"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { verified } = await request.json()

    const caregiver = await updateCaregiverVerificationStatus(id, verified)

    return NextResponse.json({ caregiver })
  } catch (error) {
    console.error("Error updating caregiver verification status:", error)
    return NextResponse.json({ error: "Failed to update caregiver verification status" }, { status: 500 })
  }
}

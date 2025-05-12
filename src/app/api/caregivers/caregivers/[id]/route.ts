import { type NextRequest, NextResponse } from "next/server"
import { getCaregiverProfileForUsers } from "@/controllers/caregiver-profile"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedparams = await params 
    const caregiverId =  awaitedparams.id
    const profileData = await getCaregiverProfileForUsers(caregiverId)

    if ("error" in profileData) {
      return NextResponse.json({ error: profileData.error }, { status: 404 })
    }

    return NextResponse.json(profileData)
  } catch (error) {
    console.error("Error fetching caregiver profile:", error)
    return NextResponse.json({ error: "Failed to fetch caregiver profile" }, { status: 500 })
  }
}

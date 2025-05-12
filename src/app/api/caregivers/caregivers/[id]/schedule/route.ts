import { type NextRequest, NextResponse } from "next/server"
import { getCaregiverSchedule } from "@/controllers/caregiver-profile"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedparams = await params 
    const caregiverId = awaitedparams.id
    const scheduleData = await getCaregiverSchedule(caregiverId)

    if ("error" in scheduleData) {
      return NextResponse.json({ error: scheduleData.error }, { status: 404 })
    }

    return NextResponse.json(scheduleData)
  } catch (error) {
    console.error("Error fetching caregiver schedule:", error)
    return NextResponse.json({ error: "Failed to fetch caregiver schedule" }, { status: 500 })
  }
}

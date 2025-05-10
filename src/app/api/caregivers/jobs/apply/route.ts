import { type NextRequest, NextResponse } from "next/server"
import { createJobApplication } from "@/controllers/job-applications"

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const data = await request.json()

    // Create job application
    const application = await createJobApplication(data)

    return NextResponse.json({ application }, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/caregivers/jobs/apply:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

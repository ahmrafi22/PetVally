import { type NextRequest, NextResponse } from "next/server"
import { getJobPostsForCaregiver, getCaregiverAppliedJobs } from "@/controllers/job-posts"
import { verifyCaregiverAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Get caregiver ID from auth token
    const caregiverId = await verifyCaregiverAuth(request)
    if (typeof caregiverId !== "string" || !caregiverId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const appliedOnly = searchParams.get("appliedOnly") === "true"

    // Get job posts
    let result
    if (appliedOnly) {
      result = await getCaregiverAppliedJobs(caregiverId)
      return NextResponse.json({ applications: result })
    } else {
      result = await getJobPostsForCaregiver(caregiverId)
      return NextResponse.json(result)
    }
  } catch (error: any) {
    console.error("Error in GET /api/caregivers/jobs:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
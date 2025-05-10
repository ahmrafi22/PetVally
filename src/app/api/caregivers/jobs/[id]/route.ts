import { type NextRequest, NextResponse } from "next/server"
import { getJobPostById } from "@/controllers/job-posts"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let awaitedParams   ;
  try {
    // Get job post by ID
    awaitedParams = await params
    const jobPost = await getJobPostById(awaitedParams.id)
    if (!jobPost) {
      return NextResponse.json({ error: "Job post not found" }, { status: 404 })
    }

    return NextResponse.json({ jobPost })
  } catch (error: any) {
    console.error(`Error in GET /api/caregivers/jobs/${awaitedParams?.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

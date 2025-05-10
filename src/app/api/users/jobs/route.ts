import { type NextRequest, NextResponse } from "next/server"
import { createJobPost, getAllJobPosts, getJobPostsByUser } from "@/controllers/job-posts"

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const userOnly = searchParams.get("userOnly") === "true"
    const userId = searchParams.get("userId") as string

    // Get job posts
    let jobPosts
    if (userOnly) {
      jobPosts = await getJobPostsByUser(userId)
    } else {
      jobPosts = await getAllJobPosts()
    }

    return NextResponse.json({ jobPosts })
  } catch (error: any) {
    console.error("Error in GET /api/users/jobs:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const data = await request.json()

    // Create job post
    const jobPost = await createJobPost(data)

    return NextResponse.json({ jobPost }, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/users/jobs:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

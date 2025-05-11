import { type NextRequest, NextResponse } from "next/server"
import {
  getJobPostById,
  updateJobPostStatus,
  selectCaregiverForJob,
  endJob,
  deleteJobPost,
} from "@/controllers/job-posts"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const awaitedParamas = await params
  try {
    // Get job post by ID

    const jobPost = await getJobPostById(awaitedParamas.id)
    if (!jobPost) {
      return NextResponse.json({ error: "Job post not found" }, { status: 404 })
    }

    return NextResponse.json({ jobPost })
  } catch (error: any) {
    console.error(`Error in GET /api/users/jobs/${awaitedParamas.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const awaitedParamas = await params
  try {
    // Get request body
    const data = await request.json()
    const { action, caregiverId, userId } = data

    // Get job post to verify ownership
    const jobPost = await getJobPostById(awaitedParamas.id)
    if (!jobPost) {
      return NextResponse.json({ error: "Job post not found" }, { status: 404 })
    }

    if (jobPost.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized: You don't own this job post" }, { status: 403 })
    }

    let result

    // Perform action based on request
    switch (action) {
      case "select_caregiver":
        result = await selectCaregiverForJob(awaitedParamas.id, caregiverId)
        // Removed notification creation for caregiver
        break
      case "end_job":
        result = await endJob(awaitedParamas.id)
        // Removed notification creation for caregiver
        break
      case "cancel_job":
        result = await updateJobPostStatus(awaitedParamas.id, "CLOSED")
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error(`Error in PUT /api/users/jobs/${awaitedParamas.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const awaitedParamas = await params
  try {
    const { userId } = await request.json()

    // Get job post to verify ownership
    const jobPost = await getJobPostById(awaitedParamas.id)
    if (!jobPost) {
      return NextResponse.json({ error: "Job post not found" }, { status: 404 })
    }

    if (jobPost.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized: You don't own this job post" }, { status: 403 })
    }

    // Only allow deletion if job is OPEN and has no selected caregiver
    if (jobPost.status !== "OPEN" || jobPost.selectedCaregiver) {
      return NextResponse.json(
        {
          error: "Cannot delete job: Job is not open or has a selected caregiver",
        },
        { status: 400 },
      )
    }

    // Delete job post
    await deleteJobPost(awaitedParamas.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`Error in DELETE /api/users/jobs/${awaitedParamas.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

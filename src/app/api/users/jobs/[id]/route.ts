import { type NextRequest, NextResponse } from "next/server"
import {
  getJobPostById,
  updateJobPostStatus,
  selectCaregiverForJob,
  endJob,
  deleteJobPost,
} from "@/controllers/job-posts"
import { createNotification } from "@/controllers/notifications"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get job post by ID
    const awaitedParams = await params
    const jobPost = await getJobPostById(awaitedParams.id)
    if (!jobPost) {
      return NextResponse.json({ error: "Job post not found" }, { status: 404 })
    }

    return NextResponse.json({ jobPost })
  } catch (error: any) {
    console.error(`Error in GET /api/users/jobs/${(await params).id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get request body
    const data = await request.json()
    const { action, caregiverId, userId } = data

    // Get job post to verify ownership
    const jobPost = await getJobPostById(params.id)
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
        result = await selectCaregiverForJob(params.id, caregiverId)
        // Notify caregiver
        await createNotification(caregiverId, "JOB_SELECTED", `You have been selected for the job: ${jobPost.title}`)
        break
      case "end_job":
        result = await endJob(params.id)
        // Notify caregiver
        if (jobPost.selectedCaregiver) {
          await createNotification(
            jobPost.selectedCaregiver.id,
            "JOB_COMPLETED",
            `The job "${jobPost.title}" has been marked as completed`,
          )
        }
        break
      case "cancel_job":
        result = await updateJobPostStatus(params.id, "CLOSED")
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error(`Error in PUT /api/users/jobs/${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await request.json()

    // Get job post to verify ownership
    const jobPost = await getJobPostById(params.id)
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
    await deleteJobPost(params.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`Error in DELETE /api/users/jobs/${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

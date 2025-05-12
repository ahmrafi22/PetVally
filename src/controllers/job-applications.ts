import { prisma } from "@/lib/prisma"
import { createNotification } from "./notifications"

// Create a new job application
export async function createJobApplication(data: any) {
  try {
    // Check if caregiver has already applied to this job
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobPostId: data.jobPostId,
        caregiverId: data.caregiverId,
      },
    })

    if (existingApplication) {
      throw new Error("You have already applied to this job")
    }

    // Get job post to check if it's still open
    const jobPost = await prisma.jobPost.findUnique({
      where: {
        id: data.jobPostId,
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!jobPost) {
      throw new Error("Job post not found")
    }

    if (jobPost.status !== "OPEN") {
      throw new Error("This job is no longer accepting applications")
    }

    // Create job application
    const application = await prisma.jobApplication.create({
      data: {
        proposal: data.proposal,
        requestedAmount: data.requestedAmount,
        jobPostId: data.jobPostId,
        caregiverId: data.caregiverId,
      },
      include: {
        caregiver: {
          select: {
            name: true,
          },
        },
        jobPost: {
          select: {
            title: true,
          },
        },
      },
    })

    // Create notification for job poster
    await createNotification(
      jobPost.user.id,
      "JOB_APPLICATION",
      `${application.caregiver.name} has applied to your job: ${application.jobPost.title}`,
    )

    return application
  } catch (error) {
    console.error("Error creating job application:", error)
    throw error
  }
}

// Get job application by ID
export async function getJobApplicationById(id: string) {
  try {
    const application = await prisma.jobApplication.findUnique({
      where: {
        id,
      },
      include: {
        caregiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        jobPost: {
          select: {
            id: true,
            title: true,
            userId: true,
          },
        },
      },
    })

    return application
  } catch (error) {
    console.error("Error getting job application by ID:", error)
    throw error
  }
}

// Update job application status
export async function updateJobApplicationStatus(id: string, status: string) {
  try {
    const application = await prisma.jobApplication.update({
      where: {
        id,
      },
      data: {
        status,
      },
      include: {
        caregiver: {
          select: {
            id: true,
            name: true,
          },
        },
        jobPost: {
          select: {
            title: true,
          },
        },
      },
    })

    return application
  } catch (error) {
    console.error("Error updating job application status:", error)
    throw error
  }
}

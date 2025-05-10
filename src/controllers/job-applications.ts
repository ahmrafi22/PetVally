import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { createNotification } from "./notifications"

// Create a new job application
export async function createJobApplication(data: any) {
  try {
    // Convert string values to appropriate types
    const requestedAmount = Number.parseFloat(data.requestedAmount)

    // Check if caregiver has already applied for this job
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        caregiverId: data.caregiverId,
        jobPostId: data.jobPostId,
      },
    })

    if (existingApplication) {
      throw new Error("You have already applied for this job")
    }

    // Create job application
    const application = await prisma.jobApplication.create({
      data: {
        proposal: data.proposal,
        requestedAmount: new Prisma.Decimal(requestedAmount),
        caregiverId: data.caregiverId,
        jobPostId: data.jobPostId,
      },
      include: {
        caregiver: {
          select: {
            id: true,
            name: true,
          },
        },
        jobPost: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    })

    // Notify job poster
    await createNotification(
      application.jobPost.user.id,
      "NEW_APPLICATION",
      `${application.caregiver.name} has applied for your job: ${application.jobPost.title}`,
    )

    return application
  } catch (error) {
    console.error("Error creating job application:", error)
    throw error
  }
}

// Get job applications by job post ID
export async function getJobApplicationsByJobPostId(jobPostId: string) {
  try {
    const applications = await prisma.jobApplication.findMany({
      where: {
        jobPostId,
      },
      include: {
        caregiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return applications
  } catch (error) {
    console.error("Error getting job applications by job post ID:", error)
    throw error
  }
}

// Get job applications by caregiver ID
export async function getJobApplicationsByCaregiverId(caregiverId: string) {
  try {
    const applications = await prisma.jobApplication.findMany({
      where: {
        caregiverId,
      },
      include: {
        jobPost: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return applications
  } catch (error) {
    console.error("Error getting job applications by caregiver ID:", error)
    throw error
  }
}

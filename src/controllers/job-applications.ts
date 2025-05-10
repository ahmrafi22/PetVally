import { prisma } from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"
import { createNotification } from "./notifications"

// Create job application
export async function createJobApplication(data: any) {
  try {
    // Check if caregiver has already applied to this job
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        caregiverId: data.caregiverId,
        jobPostId: data.jobPostId,
      },
    })

    if (existingApplication) {
      throw new Error("You have already applied to this job")
    }

    // Create the application
    const application = await prisma.jobApplication.create({
      data: {
        proposal: data.proposal,
        requestedAmount: new Decimal(data.requestedAmount),
        caregiverId: data.caregiverId,
        jobPostId: data.jobPostId,
      },
      include: {
        jobPost: {
          include: {
            user: true,
          },
        },
        caregiver: true,
      },
    })

    // Create notification for job poster
    await createNotification(
      application.jobPost.userId,
      "JOB_APPLICATION",
      `${application.caregiver.name} has applied for your job: ${application.jobPost.title}`,
    )

    return application
  } catch (error) {
    console.error("Error creating job application:", error)
    throw error
  }
}

// Get job applications by job post ID
export async function getJobApplicationsByJobId(jobPostId: string) {
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
            image: true,
            hourlyRate: true,
            reviews: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc", // First applied first
      },
    })

    // Calculate average rating for each caregiver
    return applications.map((app) => {
      const reviews = app.caregiver.reviews || []
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

      return {
        ...app,
        requestedAmount: app.requestedAmount ? Number(app.requestedAmount) : 0,
        caregiver: {
          ...app.caregiver,
          hourlyRate: app.caregiver.hourlyRate ? Number(app.caregiver.hourlyRate) : 0,
          averageRating,
        },
      }
    })
  } catch (error) {
    console.error("Error getting job applications by job ID:", error)
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
        caregiver: true,
        jobPost: true,
      },
    })

    if (!application) return null

    // Convert Decimal to number for JSON serialization
    return {
      ...application,
      requestedAmount: application.requestedAmount ? Number(application.requestedAmount) : 0,
      caregiver: {
        ...application.caregiver,
        hourlyRate: application.caregiver.hourlyRate ? Number(application.caregiver.hourlyRate) : 0,
        totalEarnings: application.caregiver.totalEarnings ? Number(application.caregiver.totalEarnings) : 0,
      },
      jobPost: {
        ...application.jobPost,
        priceRangeLow: application.jobPost.priceRangeLow ? Number(application.jobPost.priceRangeLow) : 0,
        priceRangeHigh: application.jobPost.priceRangeHigh ? Number(application.jobPost.priceRangeHigh) : 0,
      },
    }
  } catch (error) {
    console.error("Error getting job application by ID:", error)
    throw error
  }
}

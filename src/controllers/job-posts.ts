import { prisma } from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"

// Get all job posts
export async function getAllJobPosts() {
  try {
    const jobPosts = await prisma.jobPost.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        applications: {
          select: {
            id: true,
          },
        },
        selectedCaregiver: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Convert Decimal to number for JSON serialization
    return jobPosts.map((post) => ({
      ...post,
      priceRangeLow: post.priceRangeLow ? Number(post.priceRangeLow) : 0,
      priceRangeHigh: post.priceRangeHigh ? Number(post.priceRangeHigh) : 0,
      applicationCount: post.applications.length,
    }))
  } catch (error) {
    console.error("Error getting all job posts:", error)
    throw error
  }
}

// Get job posts by location
export async function getJobPostsByLocation(city: string, area: string) {
  try {
    const jobPosts = await prisma.jobPost.findMany({
      where: {
        city,
        area,
        status: "OPEN", // Only show open jobs
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        applications: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Convert Decimal to number for JSON serialization
    return jobPosts.map((post) => ({
      ...post,
      priceRangeLow: post.priceRangeLow ? Number(post.priceRangeLow) : 0,
      priceRangeHigh: post.priceRangeHigh ? Number(post.priceRangeHigh) : 0,
      applicationCount: post.applications.length,
    }))
  } catch (error) {
    console.error("Error getting job posts by location:", error)
    throw error
  }
}

// Get job posts by user
export async function getJobPostsByUser(userId: string) {
  try {
    const jobPosts = await prisma.jobPost.findMany({
      where: {
        userId,
      },
      include: {
        applications: {
          include: {
            caregiver: {
              select: {
                id: true,
                name: true,
                image: true,
                hourlyRate: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc", // First applied first
          },
        },
        selectedCaregiver: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Convert Decimal to number for JSON serialization
    return jobPosts.map((post) => ({
      ...post,
      priceRangeLow: post.priceRangeLow ? Number(post.priceRangeLow) : 0,
      priceRangeHigh: post.priceRangeHigh ? Number(post.priceRangeHigh) : 0,
      applications: post.applications.map((app) => ({
        ...app,
        requestedAmount: app.requestedAmount ? Number(app.requestedAmount) : 0,
        caregiver: {
          ...app.caregiver,
          hourlyRate: app.caregiver.hourlyRate ? Number(app.caregiver.hourlyRate) : 0,
        },
      })),
    }))
  } catch (error) {
    console.error("Error getting job posts by user:", error)
    throw error
  }
}

// Get job post by ID
export async function getJobPostById(id: string) {
  try {
    const jobPost = await prisma.jobPost.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        applications: {
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
        },
        selectedCaregiver: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            reviews: {
              select: {
                rating: true,
                comment: true,
                user: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
                createdAt: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    })

    if (!jobPost) return null

    // Calculate average rating for each caregiver
    const applications = jobPost.applications.map((app) => {
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

    // Calculate average rating for selected caregiver if exists
    let selectedCaregiver = null
    if (jobPost.selectedCaregiver) {
      const reviews = jobPost.selectedCaregiver.reviews || []
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

      selectedCaregiver = {
        ...jobPost.selectedCaregiver,
        averageRating,
        reviews: jobPost.selectedCaregiver.reviews.map((review) => ({
          ...review,
          createdAt: review.createdAt.toISOString(),
        })),
      }
    }

    // Convert Decimal to number for JSON serialization
    return {
      ...jobPost,
      priceRangeLow: jobPost.priceRangeLow ? Number(jobPost.priceRangeLow) : 0,
      priceRangeHigh: jobPost.priceRangeHigh ? Number(jobPost.priceRangeHigh) : 0,
      startDate: jobPost.startDate.toISOString(),
      endDate: jobPost.endDate.toISOString(),
      createdAt: jobPost.createdAt.toISOString(),
      applications,
      selectedCaregiver,
    }
  } catch (error) {
    console.error("Error getting job post by ID:", error)
    throw error
  }
}

// Create job post
export async function createJobPost(data: any) {
  try {
    const jobPost = await prisma.jobPost.create({
      data: {
        title: data.title,
        description: data.description,
        tags: data.tags,
        country: data.country,
        city: data.city,
        area: data.area,
        priceRangeLow: new Decimal(data.priceRangeLow),
        priceRangeHigh: new Decimal(data.priceRangeHigh),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        userId: data.userId,
      },
    })

    return jobPost
  } catch (error) {
    console.error("Error creating job post:", error)
    throw error
  }
}

// Update job post status
export async function updateJobPostStatus(id: string, status: string) {
  try {
    const jobPost = await prisma.jobPost.update({
      where: {
        id,
      },
      data: {
        status,
      },
    })

    return jobPost
  } catch (error) {
    console.error("Error updating job post status:", error)
    throw error
  }
}

// Select caregiver for job
export async function selectCaregiverForJob(jobId: string, caregiverId: string) {
  try {
    // Update job post with selected caregiver
    const jobPost = await prisma.jobPost.update({
      where: {
        id: jobId,
      },
      data: {
        selectedCaregiverId: caregiverId,
        status: "ONGOING",
      },
      include: {
        selectedCaregiver: true,
      },
    })

    // Update the application status
    await prisma.jobApplication.updateMany({
      where: {
        jobPostId: jobId,
        caregiverId,
      },
      data: {
        status: "ACCEPTED",
      },
    })

    // Reject all other applications
    await prisma.jobApplication.updateMany({
      where: {
        jobPostId: jobId,
        caregiverId: {
          not: caregiverId,
        },
      },
      data: {
        status: "REJECTED",
      },
    })

    return jobPost
  } catch (error) {
    console.error("Error selecting caregiver for job:", error)
    throw error
  }
}

// End job and add payment to caregiver
export async function endJob(jobId: string) {
  try {
    // Get the job post with selected caregiver
    const jobPost = await prisma.jobPost.findUnique({
      where: {
        id: jobId,
      },
      include: {
        selectedCaregiver: true,
        applications: {
          where: {
            status: "ACCEPTED",
          },
        },
      },
    })

    if (!jobPost || !jobPost.selectedCaregiver || jobPost.applications.length === 0) {
      throw new Error("Job post not found or no caregiver selected")
    }

    // Get the accepted application to find the requested amount
    const acceptedApplication = jobPost.applications[0]
    const paymentAmount = acceptedApplication.requestedAmount

    // Update caregiver's total earnings
    await prisma.caregiver.update({
      where: {
        id: jobPost.selectedCaregiverId!,
      },
      data: {
        totalEarnings: {
          increment: paymentAmount,
        },
      },
    })

    // Update job post status
    const updatedJobPost = await prisma.jobPost.update({
      where: {
        id: jobId,
      },
      data: {
        status: "CLOSED",
      },
    })

    return updatedJobPost
  } catch (error) {
    console.error("Error ending job:", error)
    throw error
  }
}

// Delete job post
export async function deleteJobPost(id: string) {
  try {
    // First delete all applications for this job
    await prisma.jobApplication.deleteMany({
      where: {
        jobPostId: id,
      },
    })

    // Then delete the job post
    const jobPost = await prisma.jobPost.delete({
      where: {
        id,
      },
    })

    return jobPost
  } catch (error) {
    console.error("Error deleting job post:", error)
    throw error
  }
}

// Get job posts for caregiver
export async function getJobPostsForCaregiver(caregiverId: string) {
  try {
    // Get caregiver's location
    const caregiver = await prisma.caregiver.findUnique({
      where: {
        id: caregiverId,
      },
      select: {
        city: true,
        area: true,
      },
    })

    if (!caregiver) {
      throw new Error("Caregiver not found")
    }

    // Get applications by this caregiver
    const applications = await prisma.jobApplication.findMany({
      where: {
        caregiverId,
      },
      select: {
        jobPostId: true,
      },
    })

    const appliedJobIds = applications.map((app) => app.jobPostId)

    // Get local jobs (same city and area) that are open and not applied to
    const localJobs = await prisma.jobPost.findMany({
      where: {
        city: caregiver.city || "",
        area: caregiver.area || "",
        status: "OPEN",
        id: {
          notIn: appliedJobIds,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        applications: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get all other open jobs not applied to
    const otherJobs = await prisma.jobPost.findMany({
      where: {
        status: "OPEN",
        id: {
          notIn: appliedJobIds,
        },
        OR: [
          {
            city: {
              not: caregiver.city || "",
            },
          },
          {
            area: {
              not: caregiver.area|| "",
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        applications: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Convert Decimal to number for JSON serialization
    const formatJobs = (jobs: any[]) =>
      jobs.map((job) => ({
        ...job,
        priceRangeLow: job.priceRangeLow ? Number(job.priceRangeLow) : 0,
        priceRangeHigh: job.priceRangeHigh ? Number(job.priceRangeHigh) : 0,
        applicationCount: job.applications.length,
      }))

    return {
      localJobs: formatJobs(localJobs),
      otherJobs: formatJobs(otherJobs),
    }
  } catch (error) {
    console.error("Error getting job posts for caregiver:", error)
    throw error
  }
}

// Get caregiver's applied jobs
export async function getCaregiverAppliedJobs(caregiverId: string) {
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
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Convert Decimal to number for JSON serialization
    return applications.map((app) => ({
      ...app,
      requestedAmount: app.requestedAmount ? Number(app.requestedAmount) : 0,
      jobPost: {
        ...app.jobPost,
        priceRangeLow: app.jobPost.priceRangeLow ? Number(app.jobPost.priceRangeLow) : 0,
        priceRangeHigh: app.jobPost.priceRangeHigh ? Number(app.jobPost.priceRangeHigh) : 0,
      },
    }))
  } catch (error) {
    console.error("Error getting caregiver's applied jobs:", error)
    throw error
  }
}

import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

// Create a new job post
export async function createJobPost(data: any) {
  try {
    // Convert string values to appropriate types
    const priceRangeLow = Number.parseFloat(data.priceRangeLow)
    const priceRangeHigh = Number.parseFloat(data.priceRangeHigh)
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)

    // Create job post
    const jobPost = await prisma.jobPost.create({
      data: {
        title: data.title,
        description: data.description,
        tags: data.tags,
        country: data.country,
        city: data.city,
        area: data.area,
        priceRangeLow: new Prisma.Decimal(priceRangeLow),
        priceRangeHigh: new Prisma.Decimal(priceRangeHigh),
        startDate,
        endDate,
        userId: data.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return jobPost
  } catch (error) {
    console.error("Error creating job post:", error)
    throw error
  }
}

// Get all job posts
export async function getAllJobPosts() {
  try {
    const jobPosts = await prisma.jobPost.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        applications: {
          select: {
            id: true,
            createdAt: true,
          },
        },
        selectedCaregiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return jobPosts
  } catch (error) {
    console.error("Error getting all job posts:", error)
    throw error
  }
}

// Get job posts by user ID
export async function getJobPostsByUser(userId: string) {
  try {
    const jobPosts = await prisma.jobPost.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        applications: {
          select: {
            id: true,
            createdAt: true,
          },
        },
        selectedCaregiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return jobPosts
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
            email: true,
          },
        },
        applications: {
          include: {
            caregiver: {
              select: {
                id: true,
                name: true,
                email: true,
                city: true,
                area: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        selectedCaregiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return jobPost
  } catch (error) {
    console.error("Error getting job post by ID:", error)
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
    const jobPost = await prisma.jobPost.update({
      where: {
        id: jobId,
      },
      data: {
        selectedCaregiverId: caregiverId,
        status: "ONGOING",
      },
    })

    return jobPost
  } catch (error) {
    console.error("Error selecting caregiver for job:", error)
    throw error
  }
}

// End job
export async function endJob(jobId: string) {
  try {
    const jobPost = await prisma.jobPost.update({
      where: {
        id: jobId,
      },
      data: {
        status: "CLOSED",
      },
    })

    return jobPost
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

// Get job posts for caregiver (matching city and area)
export async function getJobPostsForCaregiver(caregiverId: string) {
  try {
    // Get caregiver details
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

    // Get matching job posts
    const matchingJobs = await prisma.jobPost.findMany({
      where: {
        city: caregiver.city || "",
        area: caregiver.area || "",
        status: "OPEN",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        applications: {
          where: {
            caregiverId,
          },
        },
      },
    })

    // Get all other open jobs
    const otherJobs = await prisma.jobPost.findMany({
      where: {
        status: "OPEN",
        NOT: {
          AND: [
            caregiver.city ? { city: caregiver.city } : undefined,
            caregiver.area ? { area: caregiver.area } : undefined,
          ].filter(Boolean) as Prisma.JobPostWhereInput[],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        applications: {
          where: {
            caregiverId,
          },
        },
      },
    })

    return {
      matchingJobs,
      otherJobs,
    }
  } catch (error) {
    console.error("Error getting job posts for caregiver:", error)
    throw error
  }
}

// Get caregiver applied jobs
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
              },
            },
            selectedCaregiver: {
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
    console.error("Error getting caregiver applied jobs:", error)
    throw error
  }
}

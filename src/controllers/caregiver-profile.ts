import { prisma } from "@/lib/prisma"

// Get caregiver profile with reviews and job history
export async function getCaregiverProfileForUsers(caregiverId: string) {
  try {
    const caregiver = await prisma.caregiver.findUnique({
      where: { id: caregiverId },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        hourlyRate: true,
        totalEarnings: true,
        country: true,
        city: true,
        area: true,
        verified: true,
        createdAt: true,
      },
    })

    if (!caregiver) {
      return { error: "Caregiver not found" }
    }

    // Get reviews for this caregiver
    const reviews = await prisma.review.findMany({
      where: { caregiverId },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate average rating
    const averageRating =
      reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

    // Get completed jobs for this caregiver
    const completedJobs = await prisma.jobApplication.findMany({
      where: {
        caregiverId,
        status: { in: ["ACCEPTED", "COMPLETED"] },
        jobPost: {
          status: "CLOSED",
          selectedCaregiverId: caregiverId, 
        },
      },
      select: {
        id: true,
        requestedAmount: true,
        createdAt: true,
        status: true,
        jobPost: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            status: true,
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
      orderBy: { createdAt: "desc" },
    })

    return {
      caregiver,
      reviews,
      averageRating,
      completedJobs,
    }
  } catch (error) {
    console.error("Error getting caregiver profile:", error)
    return { error: "Failed to get caregiver profile" }
  }
}

// Get caregiver schedule 
export async function getCaregiverSchedule(caregiverId: string) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all accepted applications 
    const applications = await prisma.jobApplication.findMany({
      where: {
        caregiverId,
        status: "ACCEPTED",
        jobPost: {
          OR: [{ status: "OPEN" }, { status: "ONGOING" }, { status: "CLOSED" }],
          selectedCaregiverId: caregiverId, 
        },
      },
      select: {
        id: true,
        status: true,
        requestedAmount: true,
        jobPost: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            status: true,
            city: true,
            area: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // Transform the data for calendar view
    // Assign a consistent color to each job based on its ID
    const colors = ["teal", "pink", "purple", "blue"]
    const colorMap = new Map()
    let colorIndex = 0

    const jobs = applications.map((app) => {
      // Ensure each job uses the same color consistently
      if (!colorMap.has(app.jobPost.id)) {
        colorMap.set(app.jobPost.id, colors[colorIndex % colors.length])
        colorIndex++
      }
      
      const color = colorMap.get(app.jobPost.id)

      return {
        id: app.jobPost.id,
        title: app.jobPost.title,
        startDate: app.jobPost.startDate,
        endDate: app.jobPost.endDate,
        description: app.jobPost.description,
        location: `${app.jobPost.area ? `${app.jobPost.area}, ` : ''}${app.jobPost.city || 'Not specified'}`,
        status: app.jobPost.status,
        amount: app.requestedAmount,
        client: app.jobPost.user.name,
        time: "Full day", 
        color: color,
      }
    })

    return { jobs }
  } catch (error) {
    console.error("Error getting caregiver schedule:", error)
    return { error: "Failed to get caregiver schedule" }
  }
}
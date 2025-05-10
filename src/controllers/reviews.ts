import { prisma } from "@/lib/prisma"

// Create a new review
export async function createReview(data: any) {
  try {
    // Check if user has already reviewed this caregiver
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: data.userId,
        caregiverId: data.caregiverId,
      },
    })

    if (existingReview) {
      // Update existing review
      const review = await prisma.review.update({
        where: {
          id: existingReview.id,
        },
        data: {
          rating: data.rating,
          comment: data.comment,
        },
      })

      return review
    }

    // Create new review
    const review = await prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        userId: data.userId,
        caregiverId: data.caregiverId,
      },
    })

    return review
  } catch (error) {
    console.error("Error creating review:", error)
    throw error
  }
}

// Get reviews by caregiver ID
export async function getReviewsByCaregiverId(caregiverId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        caregiverId,
      },
      include: {
        user: {
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

    return reviews
  } catch (error) {
    console.error("Error getting reviews by caregiver ID:", error)
    throw error
  }
}

// Get average rating by caregiver ID
export async function getAverageRatingByCaregiverId(caregiverId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        caregiverId,
      },
      select: {
        rating: true,
      },
    })

    if (reviews.length === 0) {
      return 0
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length

    return averageRating
  } catch (error) {
    console.error("Error getting average rating by caregiver ID:", error)
    throw error
  }
}

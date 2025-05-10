import { prisma } from "@/lib/prisma"
import { createNotification } from "./notifications"

// Create review
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
      throw new Error("You have already reviewed this caregiver")
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        userId: data.userId,
        caregiverId: data.caregiverId,
      },
      include: {
        user: true,
        caregiver: true,
      },
    })

    // Create notification for caregiver
    await createNotification(
      data.caregiverId,
      "NEW_REVIEW",
      `${review.user.name} has left you a ${data.rating}-star review`,
    )

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

// Get average rating for caregiver
export async function getAverageRatingForCaregiver(caregiverId: string) {
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
    return totalRating / reviews.length
  } catch (error) {
    console.error("Error getting average rating for caregiver:", error)
    throw error
  }
}

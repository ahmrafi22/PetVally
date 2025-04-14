import prisma from "@/lib/prisma"

// Get user's rating for a specific product
export async function getUserProductRating(userId: string, productId: string) {
    try {
      const rating = await prisma.productRating.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      })
  
      return rating
    } catch (error) {
      console.error("Error getting user product rating:", error)
      throw error
    }
  }
  
  // Create a new product rating
  export async function createProductRating(userId: string, productId: string, rating: number, comment: string | null) {
    try {
      // Check if user has purchased the product
      const userOrders = await prisma.order.findMany({
        where: {
          userId,
          items: {
            some: {
              productId,
            },
          },
        },
      })
  
      if (userOrders.length === 0) {
        throw new Error("You can only rate products you have purchased")
      }
  
      // Check if user has already rated this product
      const existingRating = await prisma.productRating.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      })
  
      if (existingRating) {
        throw new Error("You have already rated this product. Please update your existing rating.")
      }
  
      // Create the rating
      const newRating = await prisma.productRating.create({
        data: {
          userId,
          productId,
          rating,
          comment,
        },
      })
  
      return newRating
    } catch (error) {
      console.error("Error creating product rating:", error)
      throw error
    }
  }
  
  // Update an existing product rating
  export async function updateProductRating(userId: string, ratingId: string, rating: number, comment: string | null) {
    try {
      // Check if the rating exists and belongs to the user
      const existingRating = await prisma.productRating.findUnique({
        where: {
          id: ratingId,
        },
      })
  
      if (!existingRating) {
        throw new Error("Rating not found")
      }
  
      if (existingRating.userId !== userId) {
        throw new Error("You can only update your own ratings")
      }
  
      // Update the rating
      const updatedRating = await prisma.productRating.update({
        where: {
          id: ratingId,
        },
        data: {
          rating,
          comment,
        },
      })
  
      return updatedRating
    } catch (error) {
      console.error("Error updating product rating:", error)
      throw error
    }
  }
  
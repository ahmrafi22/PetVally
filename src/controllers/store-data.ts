import { prisma } from "@/lib/prisma"

// Get all products
export async function getAllProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        ratings: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Calculate average rating for each product
    const productsWithAvgRating = products.map((product) => {
      const ratings = product.ratings || []
      const avgRating = ratings.length > 0 ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length : 0

      return {
        ...product,
        price: Number(product.price), // Convert Decimal to number for JSON serialization
        avgRating: Number.parseFloat(avgRating.toFixed(1)),
        ratingCount: ratings.length,
      }
    })

    return productsWithAvgRating
  } catch (error) {
    console.error("Error getting all products:", error)
    throw error
  }
}

// Get products by category
export async function getProductsByCategory(category: string) {
  try {
    const products = await prisma.product.findMany({
      where: {
        category,
      },
      include: {
        ratings: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Calculate average rating for each product
    const productsWithAvgRating = products.map((product) => {
      const ratings = product.ratings || []
      const avgRating = ratings.length > 0 ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length : 0

      return {
        ...product,
        price: Number(product.price), // Convert Decimal to number for JSON serialization
        avgRating: Number.parseFloat(avgRating.toFixed(1)),
        ratingCount: ratings.length,
      }
    })

    return productsWithAvgRating
  } catch (error) {
    console.error(`Error getting products by category ${category}:`, error)
    throw error
  }
}

// Get featured products (top rated)
export async function getFeaturedProducts(limit = 10) {
  try {
    // Get all products with their ratings
    const products = await prisma.product.findMany({
      include: {
        ratings: true,
      },
    })

    // Calculate average rating for each product
    const productsWithAvgRating = products.map((product) => {
      const ratings = product.ratings || []
      const avgRating = ratings.length > 0 ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length : 0

      return {
        ...product,
        price: Number(product.price), // Convert Decimal to number for JSON serialization
        avgRating,
        ratingCount: ratings.length,
      }
    })

    // Sort by average rating (highest first) and then by number of ratings
    const sortedProducts = productsWithAvgRating.sort((a, b) => {
      if (b.avgRating !== a.avgRating) {
        return b.avgRating - a.avgRating
      }
      return b.ratingCount - a.ratingCount
    })

    // Return the top N products
    return sortedProducts.slice(0, limit).map((product) => ({
      ...product,
      avgRating: Number.parseFloat(product.avgRating.toFixed(1)),
    }))
  } catch (error) {
    console.error("Error getting featured products:", error)
    throw error
  }
}

// Get product by ID
export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        ratings: {
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
        },
      },
    })

    if (!product) return null

    // Calculate average rating
    const ratings = product.ratings || []
    const avgRating = ratings.length > 0 ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length : 0

    return {
      ...product,
      price: Number(product.price), // Convert Decimal to number for JSON serialization
      avgRating: Number.parseFloat(avgRating.toFixed(1)),
      ratingCount: ratings.length,
    }
  } catch (error) {
    console.error("Error getting product by ID:", error)
    throw error
  }
}






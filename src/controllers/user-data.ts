import { prisma } from "@/lib/prisma"
import { uploadImage, deleteImage } from "@/lib/utils/cloudinary"
import type { UserProfile, UserPreferences } from "@/types"

// Get user by ID
export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        image: true,
        country: true,
        city: true,
        area: true,
        dailyAvailability: true,
        hasOutdoorSpace: true,
        hasChildren: true,
        hasAllergies: true,
        experienceLevel: true,
        createdAt: true,
        updatedAt: true,
        petOrders: {
          include: {
            pet: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        notifications: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!user) return null

    // Convert Decimal to number for JSON serialization in pet orders
    return {
      ...user,
      petOrders: user.petOrders.map((order) => ({
        ...order,
        pet: order.pet
          ? {
              ...order.pet,
              price: Number(order.pet.price),
            }
          : undefined,
      })),
    }
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

// Update user profile
export async function updateUserProfile(id: string, data: Partial<UserProfile>) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        image: true,
        country: true,
        city: true,
        area: true,
        dailyAvailability: true,
        hasOutdoorSpace: true,
        hasChildren: true,
        hasAllergies: true,
        experienceLevel: true,
        createdAt: true,
        updatedAt: true,
        petOrders: {
          include: {
            pet: true,
          },
        },
      },
    })

    // Convert Decimal to number for JSON serialization in pet orders
    return {
      ...updatedUser,
      petOrders: updatedUser.petOrders.map((order) => ({
        ...order,
        pet: order.pet
          ? {
              ...order.pet,
              price: Number(order.pet.price),
            }
          : undefined,
      })),
    }
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Update user preferences
export async function updateUserPreferences(id: string, data: Partial<UserPreferences>) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        image: true,
        country: true,
        city: true,
        area: true,
        dailyAvailability: true,
        hasOutdoorSpace: true,
        hasChildren: true,
        hasAllergies: true,
        experienceLevel: true,
        createdAt: true,
        updatedAt: true,
        petOrders: {
          include: {
            pet: true,
          },
        },
      },
    })

    // Convert Decimal to number for JSON serialization in pet orders
    return {
      ...updatedUser,
      petOrders: updatedUser.petOrders.map((order) => ({
        ...order,
        pet: order.pet
          ? {
              ...order.pet,
              price: Number(order.pet.price),
            }
          : undefined,
      })),
    }
  } catch (error) {
    console.error("Error updating user preferences:", error)
    throw error
  }
}

// Update user profile image
export async function updateUserProfileImage(id: string, imageBase64: string) {
  try {
    // Get the current user to check if they already have an image
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { image: true },
    })

    // If user has an existing image, delete it from Cloudinary
    if (currentUser?.image) {
      await deleteImage(currentUser.image)
    }

    // Upload new image to Cloudinary
    const uploadResponse = await uploadImage(imageBase64, "user_profiles")

    // Update user with new image URL
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        image: uploadResponse.secure_url,
      },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        image: true,
        country: true,
        city: true,
        area: true,
        dailyAvailability: true,
        hasOutdoorSpace: true,
        hasChildren: true,
        hasAllergies: true,
        experienceLevel: true,
        createdAt: true,
        updatedAt: true,
        petOrders: {
          include: {
            pet: true,
          },
        },
      },
    })

    // Convert Decimal to number for JSON serialization in pet orders
    return {
      ...updatedUser,
      petOrders: updatedUser.petOrders.map((order) => ({
        ...order,
        pet: order.pet
          ? {
              ...order.pet,
              price: Number(order.pet.price),
            }
          : undefined,
      })),
    }
  } catch (error) {
    console.error("Error updating user profile image:", error)
    throw error
  }
}

import { prisma } from "@/lib/prisma"
import { compare } from "bcrypt"
import { signJwtToken } from "@/lib/auth"
import { uploadImage, deleteImage } from "@/lib/utils/cloudinary"

// Verify admin credentials
export async function verifyAdminCredentials(username: string, password: string) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { username },
    })

    if (!admin) {
      return null
    }

    const passwordValid = await compare(password, admin.password)

    if (!passwordValid) {
      return null
    }

    // Return admin without password
    const { password: _, ...adminWithoutPassword } = admin
    return adminWithoutPassword
  } catch (error) {
    console.error("Error verifying admin credentials:", error)
    return null
  }
}

// Generate admin JWT token
export async function generateAdminToken(admin: any) {
  try {
    const token = await signJwtToken({
      ...admin,
      role: "admin",
    })

    return token
  } catch (error) {
    console.error("Error generating admin token:", error)
    throw error
  }
}

// Get dashboard statistics
export async function getDashboardStats() {
  try {
    // Get total users count
    const userCount = await prisma.user.count()

    // Get available pets count
    const availablePetsCount = await prisma.pet.count({
      where: {
        isAvailable: true,
      },
    })

    // Get total caregivers count
    const caregiverCount = await prisma.caregiver.count()

    // Get total pet orders count
    const petOrdersCount = await prisma.petOrder.count()

    return {
      userCount,
      availablePetsCount,
      caregiverCount,
      petOrdersCount,
    }
  } catch (error) {
    console.error("Error getting dashboard stats:", error)
    throw error
  }
}

// Get all users with basic info
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        country: true,
        city: true,
        area: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return users
  } catch (error) {
    console.error("Error getting all users:", error)
    throw error
  }
}

// Get all pets
export async function getAllPets(onlyAvailable = false) {
  try {
    const whereClause = onlyAvailable
      ? {
          isAvailable: true,
          orders: {
            none: {}, 
          },
        }
      : {}

    const pets = await prisma.pet.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        orders: {
          select: {
            id: true,
          },
        },
      },
    })

    // Convert Decimal to number for JSON serialization and remove orders from response
    return pets.map((pet) => ({
      ...pet,
      price: Number(pet.price),
      orders: undefined,
    }))
  } catch (error) {
    console.error("Error getting all pets:", error)
    throw error
  }
}

// Create a new pet
export async function createPet(data: any) {
  try {
    // Upload image to Cloudinary
    const uploadResponse = await uploadImage(data.imageBase64, "pets")

    // Create pet in database
    const pet = await prisma.pet.create({
      data: {
        name: data.name,
        breed: data.breed,
        age: data.age,
        price: data.price,
        images: uploadResponse.secure_url,
        bio: data.bio,
        description: data.description,
        energyLevel: data.energyLevel,
        spaceRequired: data.spaceRequired,
        maintenance: data.maintenance,
        childFriendly: data.childFriendly,
        allergySafe: data.allergySafe,
        neutered: data.neutered,
        vaccinated: data.vaccinated,
        tags: data.tags || [],
      },
    })

    // Create notifications for all users
    try {
      // Import the function here to avoid circular dependencies
      const { createNotificationForAllUsers } = require("./notifications")
      await createNotificationForAllUsers(
        "NEW_PET",
        `A new pet named ${pet.name} (${pet.breed}) is now available for adoption!`,
      )
    } catch (notificationError) {
      console.error("Error creating notifications:", notificationError)
      // Don't throw the error, as we still want to return the pet
    }

    // Convert Decimal to number for JSON serialization
    return {
      ...pet,
      price: Number(pet.price),
    }
  } catch (error) {
    console.error("Error creating pet:", error)
    throw error
  }
}

// Delete a pet
export async function deletePet(id: string) {
  try {
    // Get the pet to get the image URL
    const pet = await prisma.pet.findUnique({
      where: { id },
    })

    if (!pet) {
      throw new Error("Pet not found")
    }

    // Check if pet has orders
    const petOrders = await prisma.petOrder.findMany({
      where: { petId: id },
    })

    if (petOrders.length > 0) {
      throw new Error("Cannot delete pet with existing orders")
    }

    // Delete the image from Cloudinary
    if (pet.images) {
      await deleteImage(pet.images)
    }

    // Delete the pet from the database
    await prisma.pet.delete({
      where: { id },
    })

    return true
  } catch (error) {
    console.error("Error deleting pet:", error)
    throw error
  }
}

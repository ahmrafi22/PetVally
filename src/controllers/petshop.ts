import { prisma } from "@/lib/prisma"
import type { User, Pet } from "@/types"

// Get all available pets
export async function getAvailablePets() {
  try {
    const pets = await prisma.pet.findMany({
      where: {
        isAvailable: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Convert Decimal to number for JSON serialization
    return pets.map((pet) => ({
      ...pet,
      price: Number(pet.price),
    }))
  } catch (error) {
    console.error("Error getting available pets:", error)
    throw error
  }
}

// Get pet by ID
export async function getPetById(id: string) {
  try {
    const pet = await prisma.pet.findUnique({
      where: { id },
    })

    if (!pet) return null

    // Convert Decimal to number for JSON serialization
    return {
      ...pet,
      price: Number(pet.price),
    }
  } catch (error) {
    console.error("Error getting pet by ID:", error)
    throw error
  }
}

// Create pet order
export async function createPetOrder(userId: string, petId: string) {
  try {
    // Start a transaction to ensure both operations succeed or fail together
    return await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.petOrder.create({
        data: {
          userId,
          petId,
        },
        include: {
          pet: true,
        },
      })

      // Update the pet availability
      await tx.pet.update({
        where: { id: petId },
        data: { isAvailable: false },
      })

      // Convert Decimal to number for JSON serialization
      return {
        ...order,
        pet: order.pet
          ? {
              ...order.pet,
              price: Number(order.pet.price),
            }
          : undefined,
      }
    })
  } catch (error) {
    console.error("Error creating pet order:", error)
    throw error
  }
}

// Get user's pet orders
export async function getUserPetOrders(userId: string) {
  try {
    const orders = await prisma.petOrder.findMany({
      where: { userId },
      include: {
        pet: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Convert Decimal to number for JSON serialization
    return orders.map((order) => ({
      ...order,
      pet: order.pet
        ? {
            ...order.pet,
            price: Number(order.pet.price),
          }
        : undefined,
    }))
  } catch (error) {
    console.error("Error getting user pet orders:", error)
    throw error
  }
}

// Get recommended pets for a user
export async function getRecommendedPets(userId: string) {
  try {
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        dailyAvailability: true,
        hasOutdoorSpace: true,
        hasChildren: true,
        hasAllergies: true,
        experienceLevel: true,
      },
    })

    if (!user) {
      throw new Error("User not found")
    }

    // Get all available pets
    const availablePets = await prisma.pet.findMany({
      where: {
        isAvailable: true,
      },
    })

    // Calculate compatibility score for each available pets 
    const scoredPets = availablePets.map((pet) => {
      const appPet = {
        ...pet,
        price: Number(pet.price),
        createdAt: pet.createdAt.toISOString(), 
      }

      const score = calculateCompatibilityScore(user, appPet)
      return {
        ...appPet,
        compatibilityScore: score,
      }
    })

    // Sort pets by compatibility score (highest first)
    scoredPets.sort((a, b) => b.compatibilityScore - a.compatibilityScore)

    return {
      recommendedPets: scoredPets.slice(0, 3), // Top 3 recommendations
      allPets: scoredPets, // All pets with scores
    }
  } catch (error) {
    console.error("Error getting recommended pets:", error)
    throw error
  }
}

// Update the calculateCompatibilityScore function to include neutered and vaccinated status:

function calculateCompatibilityScore(
  user: Pick<User, "dailyAvailability" | "hasOutdoorSpace" | "hasChildren" | "hasAllergies" | "experienceLevel">,
  pet: Pet,
): number {
  let score = 0
  const maxScore = 100

  // 1. Daily Availability vs Energy Level and Maintenance (25 points)
  // Higher energy pets need more time commitment
  const availabilityScore = 25 - Math.abs(user.dailyAvailability * 3 - (pet.energyLevel + pet.maintenance)) * 2.5
  score += Math.max(0, availabilityScore)

  // 2. Outdoor Space vs Space Required (15 points)
  if (user.hasOutdoorSpace) {
    // If user has outdoor space, they can accommodate pets needing more space
    score += 15
  } else {
    // If no outdoor space, penalize pets that need more space
    score += 15 - pet.spaceRequired * 3
  }

  // 3. Children Compatibility (15 points)
  if (user.hasChildren && !pet.childFriendly) {
    // Major penalty if user has children but pet isn't child-friendly
    score -= 15
  } else if (user.hasChildren && pet.childFriendly) {
    // Bonus if both match
    score += 15
  } else {
    // Neutral if user doesn't have children
    score += 10
  }

  // 4. Allergy Considerations (15 points)
  if (user.hasAllergies && !pet.allergySafe) {
    // Major penalty if user has allergies but pet isn't allergy-safe
    score -= 15
  } else if (user.hasAllergies && pet.allergySafe) {
    // Bonus if pet is allergy-safe and user has allergies
    score += 15
  } else {
    // Neutral if user doesn't have allergies
    score += 10
  }

  // 5. Experience Level vs Maintenance (15 points)
  const experienceScore = 15 - Math.abs(user.experienceLevel - pet.maintenance) * 3
  score += Math.max(0, experienceScore)

  // 6. Health Considerations (15 points)
  // Neutered and vaccinated pets are generally preferred
  if (pet.neutered) score += 7.5
  if (pet.vaccinated) score += 7.5

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(maxScore, score))
}

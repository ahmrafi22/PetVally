import { prisma } from "../prisma"

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


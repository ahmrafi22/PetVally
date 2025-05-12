import { prisma } from "@/lib/prisma"
import { compare } from "bcrypt"
import { signJwtToken } from "@/lib/auth"
import { uploadImage, deleteImage } from "@/lib/utils/cloudinary"
import { createNotificationForAllUsers, createNotification } from "@/controllers/notifications"

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

    // Get total products count
    const totalProducts = await prisma.product.count()

    // Get total orders count
    const totalOrders = await prisma.order.count()

    // Get total earnings
    const orders = await prisma.order.findMany({
      where: {
        status: "COMPLETED",
      },
      select: {
        totalPrice: true,
      },
    })

    const totalEarnings = orders.reduce((sum, order) => sum + Number(order.totalPrice), 0)

    return {
      userCount,
      availablePetsCount,
      caregiverCount,
      petOrdersCount,
      totalProducts,
      totalOrders,
      totalEarnings,
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
            none: {}, // No orders means the pet hasn't been adopted
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
      await createNotificationForAllUsers(
        "NEW_PET",
        `A new pet named ${pet.name} (${pet.breed}) is now available for adoption!`,
      )
    } catch (notificationError) {
      console.error("Error creating notifications:", notificationError) 
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

// Get all products
export async function getAllProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    // Convert Decimal to number for JSON serialization
    return products.map((product) => ({
      ...product,
      price: Number(product.price),
    }))
  } catch (error) {
    console.error("Error getting all products:", error)
    throw error
  }
}

// Create a new product
export async function createProduct(data: any) {
  try {
    // Upload image to Cloudinary
    const uploadResponse = await uploadImage(data.imageBase64, "products")

    // Create product in database
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        image: uploadResponse.secure_url,
        category: data.category,
      },
    })

    // Convert Decimal to number for JSON serialization
    return {
      ...product,
      price: Number(product.price),
    }
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

// Delete a product
export async function deleteProduct(id: string) {
  try {
    // Get the product to get the image URL
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      throw new Error("Product not found")
    }

    // Check if product has order items
    const orderItems = await prisma.orderItem.findMany({
      where: { productId: id },
    })

    if (orderItems.length > 0) {
      throw new Error("Cannot delete product with existing orders")
    }

    // Delete the image from Cloudinary
    if (product.image) {
      await deleteImage(product.image)
    }

    // Delete cart items with this product
    await prisma.cartItem.deleteMany({
      where: { productId: id },
    })

    // Delete product ratings
    await prisma.productRating.deleteMany({
      where: { productId: id },
    })

    // Delete the product from the database
    await prisma.product.delete({
      where: { id },
    })

    return true
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

// Update a product
export async function updateProduct(id: string, data: any) {
  try {
    // Get the current product
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      throw new Error("Product not found")
    }

    // Prepare update data
    const updateData: any = {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      category: data.category,
    }

    // If a new image is provided, upload it and update the image URL
    if (data.imageBase64 && data.imageBase64 !== product.image) {
      // Upload new image to Cloudinary
      const uploadResponse = await uploadImage(data.imageBase64, "products")
      updateData.image = uploadResponse.secure_url

      // Delete the old image from Cloudinary
      if (product.image) {
        await deleteImage(product.image)
      }
    }

    // Update the product in the database
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    })

    // Convert Decimal to number for JSON serialization
    return {
      ...updatedProduct,
      price: Number(updatedProduct.price),
    }
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

// Get all orders with user and product details
export async function getAllOrders() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Convert Decimal to number for JSON serialization
    return orders.map((order) => ({
      ...order,
      totalPrice: Number(order.totalPrice),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    }))
  } catch (error) {
    console.error("Error getting all orders:", error)
    throw error
  }
}

// Update order status
export async function updateOrderStatus(id: string, status: "COMPLETED" | "CANCELLED") {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // If order is cancelled, restore product stock
    if (status === "CANCELLED") {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        })
      }
    }

    // Create notification for the user
    try {
      await createNotification(
        order.userId,
        status === "COMPLETED" ? "ORDER_COMPLETED" : "ORDER_CANCELLED",
        `Your order #${order.id.substring(0, 8)} has been ${status === "COMPLETED" ? "approved" : "cancelled"}.`,
      )
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError)
    }

    // Convert Decimal to number for JSON serialization
    return {
      ...order,
      totalPrice: Number(order.totalPrice),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
        product: {
          ...item.product,
          price: Number(item.product.price),
        },
      })),
    }
  } catch (error) {
    console.error("Error updating order status:", error)
    throw error
  }
}

// Update caregiver verification status
export async function updateCaregiverVerificationStatus(id: string, isVerified: boolean) {
  try {
    const updatedCaregiver = await prisma.caregiver.update({
      where: { id },
      data: { verified: isVerified },
      select: {
        id: true,
        name: true,
        email: true,
        verified: true,
      },
    })

    return updatedCaregiver
  } catch (error) {
    console.error("Error updating caregiver verification status:", error)
    throw error
  }
}

// Get all caregivers with basic info
export async function getAllCaregivers() {
  try {
    const caregivers = await prisma.caregiver.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        country: true,
        city: true,
        area: true,
        bio: true,
        verified: true,
        hourlyRate: true,
        totalEarnings: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Convert Decimal to number for JSON serialization
    return caregivers.map((caregiver) => ({
      ...caregiver,
      hourlyRate: Number(caregiver.hourlyRate),
      totalEarnings: Number(caregiver.totalEarnings),
    }))
  } catch (error) {
    console.error("Error getting all caregivers:", error)
    throw error
  }
}
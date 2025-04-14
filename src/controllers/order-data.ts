// Create order from cart

import prisma from "@/lib/prisma"

export async function createOrderFromCart(
    userId: string,
    shippingInfo: {
      name: string
      address: string
      city: string
      state: string
      zip: string
      country: string
    },
  ) {
    try {
      // Get user's cart with items
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })
  
      if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty")
      }
  
      // Calculate total price
      const totalPrice = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
  
      // Start a transaction
      const order = await prisma.$transaction(async (prisma) => {
        // Create order
        const newOrder = await prisma.order.create({
          data: {
            userId,
            totalPrice,
            status: "PENDING",
            shippingName: shippingInfo.name,
            shippingAddress: shippingInfo.address,
            shippingCity: shippingInfo.city,
            shippingState: shippingInfo.state,
            shippingZip: shippingInfo.zip,
            shippingCountry: shippingInfo.country,
            items: {
              create: cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
              })),
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        })
  
        // Update product stock
        for (const item of cart.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        }
  
        // Clear the cart
        await prisma.cartItem.deleteMany({
          where: {
            cartId: cart.id,
          },
        })
  
        return newOrder
      })
  
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
      console.error("Error creating order from cart:", error)
      throw error
    }
  }
  
  // Get user's orders
  export async function getUserOrders(userId: string) {
    try {
      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
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
          product: {
            ...item.product,
            price: Number(item.product.price),
          },
        })),
      }))
    } catch (error) {
      console.error("Error getting user orders:", error)
      throw error
    }
  }
import { prisma } from "@/lib/prisma"

// Add product to cart
export async function addToCart(userId: string, productId: string, quantity: number) {
  try {
    // Check if product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw new Error("Product not found")
    }

    if (product.stock < quantity) {
      throw new Error("Not enough stock available")
    }

    // Get or create user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
        },
        include: { items: true },
      })
    }

    // Check if product already in cart
    const existingItem = cart.items.find((item) => item.productId === productId)

    if (existingItem) {
      // Update quantity if product already in cart
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      })
    } else {
      // Add new cart item if product not in cart
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error adding product to cart:", error)
    throw error
  }
}

// Get user's cart with items
export async function getUserCart(userId: string) {
  try {
    // Get user's cart with items and product details
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

    if (!cart) {
      // Create a new cart if user doesn't have one
      return {
        id: "",
        userId,
        items: [],
        totalPrice: 0,
      }
    }

    // Calculate total price and convert Decimal to number for JSON serialization
    const cartWithPrices = {
      ...cart,
      items: cart.items.map((item) => ({
        ...item,
        product: {
          ...item.product,
          price: Number(item.product.price),
        },
        totalPrice: Number(item.product.price) * item.quantity,
      })),
      totalPrice: cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0),
    }

    return cartWithPrices
  } catch (error) {
    console.error("Error getting user cart:", error)
    throw error
  }
}


// Update cart item quantity
export async function updateCartItemQuantity(userId: string, cartItemId: string, quantity: number) {
    try {
      // Verify the cart item belongs to the user
      const cartItem = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
        include: {
          cart: true,
          product: true,
        },
      })
  
      if (!cartItem) {
        throw new Error("Cart item not found")
      }
  
      if (cartItem.cart.userId !== userId) {
        throw new Error("Unauthorized: Cart item does not belong to user")
      }
  
      // Check if product has enough stock
      if (cartItem.product.stock < quantity) {
        throw new Error("Not enough stock available")
      }
  
      if (quantity <= 0) {
        // Remove item from cart if quantity is 0 or negative
        await prisma.cartItem.delete({
          where: { id: cartItemId },
        })
        return { success: true, removed: true }
      } else {
        // Update quantity
        await prisma.cartItem.update({
          where: { id: cartItemId },
          data: {
            quantity,
          },
        })
        return { success: true, removed: false }
      }
    } catch (error) {
      console.error("Error updating cart item quantity:", error)
      throw error
    }
  }
  
  // Remove item from cart
  export async function removeCartItem(userId: string, cartItemId: string) {
    try {
      // Verify the cart item belongs to the user
      const cartItem = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
        include: {
          cart: true,
        },
      })
  
      if (!cartItem) {
        throw new Error("Cart item not found")
      }
  
      if (cartItem.cart.userId !== userId) {
        throw new Error("Unauthorized: Cart item does not belong to user")
      }
  
      // Delete the cart item
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      })
  
      return { success: true }
    } catch (error) {
      console.error("Error removing cart item:", error)
      throw error
    }
  }
  
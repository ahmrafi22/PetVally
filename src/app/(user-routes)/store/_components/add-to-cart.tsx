"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { toast } from "sonner"

type AddToCartButtonProps = {
  productId: string
  className?: string
  disabled?: boolean
}

export function AddToCartButton({
  productId,
  className = "",
  disabled = false
}: AddToCartButtonProps) {
  const { addToCart, loading } = useCartStore()

  const handleAddToCart = async () => {
    try {
      await addToCart(productId, 1)
      toast.success("Added to cart")
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart")
    }
  }

  return (
    <Button
      className={className}
      onClick={handleAddToCart}
      disabled={disabled || loading}
      size="sm"
    >
      <Plus className="mr-2 h-4 w-4" />
      Add to Cart
    </Button>
  )
}
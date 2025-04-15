"use client"

import React, { useState } from 'react';
import { ShoppingCart} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";

type AddToCartButtonProps = {
  productId: string;
  className?: string;
  disabled?: boolean;
}

export function AddToCartButton({
  productId,
  className = "",
  disabled = false
}: AddToCartButtonProps) {
  const { addToCart, loading } = useCartStore();
  const [isHovered, setIsHovered] = useState(false);
  
  // The parent component will handle showing if item is in cart via className
  const isInCart = className.includes("bg-green-600") || className.includes("bg-green-700");
  
  const handleAddToCart = async () => {
    try {
      await addToCart(productId, 1);
      toast.success("Added to cart");
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    }
  };

  return (
    <button 
      className={`w-36 h-10 rounded-sm border-none flex items-center justify-center 
        cursor-pointer transition-all duration-500 overflow-hidden shadow-md relative 
        hover:scale-100 active:scale-95 ${isInCart ? 'bg-green-500' : 'bg-sky-400'} ${className}`}
      onClick={handleAddToCart}
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`absolute -left-12 w-8 h-8 bg-transparent rounded-full 
          flex items-center justify-center overflow-hidden z-10 transition-all duration-500
          ${isHovered ? 'translate-x-14' : ''}`}
      >
        <ShoppingCart size={16} className={`${isInCart ? "text-white" : "text-gray-900"} fill-current`} />
      </div>
      
      <p 
        className={`h-full w-fit flex items-center justify-center z-10 
          transition-all duration-500 text-base font-semibold
          ${isHovered ? 'translate-x-2' : ''} 
          ${isInCart ? 'text-white' : 'text-gray-900'}`}
      >
        {isInCart ? "In Cart" : "Add to Cart"}
      </p>
      
    </button>
  );
}
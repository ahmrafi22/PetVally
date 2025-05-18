"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
  ShoppingCart,
  Calendar,
  User,
  ChevronLeft,
  PlusCircle,
  MinusCircle,
  Tag,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useCartStore } from "@/stores/cart-store";
import { Badge } from "@/components/ui/badge";


import type { Product } from "@/types";
import Image from "next/image";

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, cart, loading: cartLoading, fetchCart } = useCartStore();
  const id = params.id as string;

  // Check if product is already in cart
  const existingCartItem = cart?.items.find((item) => item.product.id === id);
  const itemInCartQuantity = existingCartItem?.quantity || 0;

  // Initialize cart data on component mount
  useEffect(() => {
    fetchCart().catch(console.error);
  }, [fetchCart]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          router.push("/userlogin");
          return;
        }

        const response = await fetch(`/api/users/store/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          throw new Error(
            errorData.message || "Failed to fetch product details"
          );
        }

        const data = await response.json();
        setProduct(data.product);
      } catch (err: any) {
        console.error("Error fetching product details:", err);
        setError(
          err.message || "An error occurred while fetching product details"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id, router]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart(product.id, quantity);
      toast.success(
        `Added ${quantity} ${quantity === 1 ? "item" : "items"} to cart!`,
        {
          duration: 3000,
        }
      );
    } catch (err: any) {
      console.error("Error adding product to cart:", err);
      toast.error(err.message || "Failed to add product to cart");
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Function to render star ratings
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Function to calculate potential stock warning message
  const getStockMessage = () => {
    if (!product) return null;

    if (product.stock === 0) {
      return { type: "error", message: "Out of stock" };
    } else if (product.stock <= 5) {
      return {
        type: "warning",
        message: `Only ${product.stock} left in stock - order soon!`,
      };
    } else {
      return {
        type: "success",
        message: `In Stock: ${product.stock} available`,
      };
    }
  };

  const stockMessage = getStockMessage();

  // Calculate cart item count
  const cartItemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Image Skeleton */}
            <Skeleton className="h-96 md:h-full w-full" />

            {/* Product Details Skeleton */}
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-8 w-24" />
              </div>

              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-24" />

              <Skeleton className="h-8 w-32" />

              <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-20 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-32 w-full" />
              </div>

              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-red-600">
            Error loading product details
          </h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <Button onClick={() => router.push("/shop")} className="mt-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Return to Shop
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-red-600">
            Product not found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            The requested product could not be found.
          </p>
          <Button onClick={() => router.push("/shop")} className="mt-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Return to Shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-blue-50 rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="relative">
            <div className="h-96 md:h-full bg-gray-100 relative overflow-hidden">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-contain object-center"
              />
            </div>
            <Badge
              className="absolute top-4 left-4 capitalize"
              variant="secondary"
            >
              <Tag className="h-3 w-3 mr-1" /> {product.category}
            </Badge>
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6 md:p-8 flex flex-col h-full">
            <div className="space-y-6 flex-grow">
              <div>
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {product.name}
                  </h1>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-5 w-5 text-gray-500" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center mt-2">
                  {renderStars(product.avgRating)}
                  <span className="ml-2 text-gray-600">
                    {product.avgRating > 0
                      ? `${product.avgRating.toFixed(1)} stars`
                      : "No ratings yet"}
                    {product.ratingCount > 0 &&
                      ` (${product.ratingCount} reviews)`}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ${product.price.toFixed(2)}
                </div>
                {stockMessage && (
                  <div
                    className={`text-${
                      stockMessage.type === "error"
                        ? "red"
                        : stockMessage.type === "warning"
                        ? "amber"
                        : "green"
                    }-600`}
                  >
                    {stockMessage.message}
                  </div>
                )}
                {itemInCartQuantity > 0 && (
                  <div className="text-blue-600 mt-1">
                    You already have {itemInCartQuantity} of this item in your
                    cart
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">About this item</h2>
                <p className="text-gray-700">{product.description}</p>
              </div>

              {product.stock > 0 && (
                <div className="flex flex-col space-y-6 mt-auto">
                  <div>
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Quantity
                    </label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        className="p-2 rounded-l border border-r-0 border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <MinusCircle className="h-5 w-5 text-gray-600" />
                      </button>
                      <div className="px-2 py-1.5 w-16 text-center border-t border-b border-gray-300 bg-white">
                        {quantity}
                      </div>
                      <button
                        type="button"
                        onClick={incrementQuantity}
                        disabled={quantity >= product.stock}
                        className="p-2 rounded-r border border-l-0 border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <PlusCircle className="h-5 w-5 text-gray-600" />
                      </button>
                      <span className="ml-3 text-sm text-gray-500">
                        {product.stock} available
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    className="w-full py-6 text-lg"
                    disabled={product.stock === 0 || cartLoading}
                  >
                    {cartLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin mr-2">⟳</span>
                        Adding to Cart...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart - ${(product.price * quantity).toFixed(2)}
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="p-6 md:p-8 border-t mt-6">
          <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>

          {product.ratings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">
                No reviews yet. Be the first to review this product!
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    {renderStars(product.avgRating)}
                    <span className="ml-2 font-medium">
                      {product.avgRating.toFixed(1)} out of 5
                    </span>
                  </div>
                  <span className="text-gray-500">
                    Based on {product.ratingCount}{" "}
                    {product.ratingCount === 1 ? "review" : "reviews"}
                  </span>
                </div>
              </div>

              <div className="divide-y">
                {product.ratings.map((rating) => (
                  <div key={rating.id} className="py-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3 flex items-center justify-center">
                          {rating.user.image ? (
                            <Image
                              src={rating.user.image}
                              alt={rating.user.name}
                              width={40}
                              height={40}
                              className="object-cover rounded-full"
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            <User className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{rating.user.name}</p>
                          <div className="flex items-center mt-1">
                            {renderStars(rating.rating)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(rating.createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                    {rating.comment && (
                      <div className="mt-3 ml-13 bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700">{rating.comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

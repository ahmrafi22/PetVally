"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import Image from "next/image";

export default function CartPage() {
  const router = useRouter();
  const { cart, loading, error, fetchCart, updateItemQuantity, removeItem } =
    useCartStore();

  // Track which items are being updated
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (
    cartItemId: string,
    newQuantity: number
  ) => {
    try {
      setUpdatingItems((prev) => ({ ...prev, [cartItemId]: true }));
      await updateItemQuantity(cartItemId, newQuantity);
      if (newQuantity === 0) {
        toast.success("Item removed from cart");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update quantity");
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [cartItemId]: false }));
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      setUpdatingItems((prev) => ({ ...prev, [cartItemId]: true }));
      await removeItem(cartItemId);
      toast.success("Item removed from cart");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove item");
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [cartItemId]: false }));
    }
  };

  const proceedToCheckout = () => {
    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    router.push("/cart/checkout");
  };

  if (loading && !cart) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex border-b pb-4">
              <Skeleton className="h-24 w-24 rounded mr-4" />
              <div className="flex-1">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="flex justify-between items-end">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
        <Button onClick={() => router.push("/store")}>Return to Store</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <ShoppingCart className="mr-2 h-6 w-6" />
        Shopping Cart
      </h1>

      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-600">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mt-2 mb-6">
            Looks like you haven&apos;t added any products to your cart yet.
          </p>
          <Link href="/store">
            <Button>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row border-b pb-4"
                >
                  <div className="h-24 w-24 bg-gray-200 rounded overflow-hidden mb-4 sm:mb-0 sm:mr-4 flex-shrink-0">
                    <Image
                      src={item.product.image || "/placeholder.svg"}
                      alt={item.product.name}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover rounded-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-gray-500 text-sm mb-2">
                      ${item.product.price.toFixed(2)} each
                    </p>

                    <div className="flex flex-wrap justify-between items-end gap-4">
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-r-none"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={
                            updatingItems[item.id] || item.quantity <= 1
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="h-8 px-4 flex items-center justify-center border-y">
                          {updatingItems[item.id] ? (
                            <span className="animate-pulse">...</span>
                          ) : (
                            item.quantity
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-l-none"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={
                            updatingItems[item.id] ||
                            item.quantity >= item.product.stock
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-semibold">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={updatingItems[item.id]}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>
                    Subtotal (
                    {cart.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                    items)
                  </span>
                  <span>${cart.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total</span>
                <span>${cart.totalPrice.toFixed(2)}</span>
              </div>

              <Button className="w-full" size="lg" onClick={proceedToCheckout}>
                Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="mt-4">
                <Link href="/store">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

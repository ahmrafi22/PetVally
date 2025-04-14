import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
  };
};

type Cart = {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
};

type CartState = {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateItemQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => void;
};

export const useCartStore = create(
  immer<CartState>((set, get) => ({
    cart: null,
    loading: false,
    error: null,
    
    fetchCart: async () => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem('userToken');
        if (!token) throw new Error('No authentication token found');
        
        const response = await fetch('/api/users/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!response.ok) throw new Error('Failed to fetch cart');
        
        const data = await response.json();
        set({ cart: data.cart });
      } catch (error: any) {
        set({ error: error.message });
      } finally {
        set({ loading: false });
      }
    },
    
    addToCart: async (productId, quantity) => {
      try {
        set({ loading: true, error: null });
        const token = localStorage.getItem('userToken');
        if (!token) throw new Error('No authentication token found');
        
        // Optimistic update
        set((state) => {
          if (!state.cart) return;
          
          const existingItem = state.cart.items.find((item: CartItem) => item.product.id === productId);
          
          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            // In a real app, you'd have the product data already or fetch it
            state.cart.items.push({
              id: `temp-${Date.now()}`,
              quantity,
              product: {
                id: productId,
                name: 'Loading...',
                price: 0,
                image: '',
                stock: 0,
              },
            });
          }
          
          // Recalculate total
          state.cart.totalPrice = state.cart.items.reduce(
            (sum: number, item: CartItem) => sum + (item.product.price * item.quantity), 0
          );
        });
        
        // Server update
        const response = await fetch('/api/users/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, quantity }),
        });
        
        if (!response.ok) throw new Error('Failed to add to cart');
        
        // Refresh from server to get accurate data
        await get().fetchCart();
      } catch (error: any) {
        set({ error: error.message });
        // Revert optimistic update on error
        await get().fetchCart();
      } finally {
        set({ loading: false });
      }
    },
    
    updateItemQuantity: async (cartItemId, quantity) => {
      try {
        set({ loading: true, error: null });
        const token = localStorage.getItem('userToken');
        if (!token) throw new Error('No authentication token found');
        
        // Optimistic update
        set((state) => {
          if (!state.cart) return;
          
          const item = state.cart.items.find((item: CartItem) => item.id === cartItemId);
          if (!item) return;
          
          if (quantity <= 0) {
            state.cart.items = state.cart.items.filter((item: CartItem)=> item.id !== cartItemId);
          } else {
            item.quantity = quantity;
          }
          
          // Recalculate total
          state.cart.totalPrice = state.cart.items.reduce(
            (sum: number, item: CartItem) => sum + (item.product.price * item.quantity), 0
          );
        });
        
        // Server update
        const response = await fetch('/api/users/cart/item', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cartItemId, quantity }),
        });
        
        if (!response.ok) throw new Error('Failed to update quantity');
        
        // Refresh from server
        await get().fetchCart();
      } catch (error: any) {
        set({ error: error.message });
        await get().fetchCart();
      } finally {
        set({ loading: false });
      }
    },
    
    removeItem: async (cartItemId) => {
      try {
        set({ loading: true, error: null });
        const token = localStorage.getItem('userToken');
        if (!token) throw new Error('No authentication token found');
        
        // Optimistic update
        set((state) => {
          if (!state.cart) return;
          state.cart.items = state.cart.items.filter((item: CartItem)=> item.id !== cartItemId);
          state.cart.totalPrice = state.cart.items.reduce(
            (sum: number, item: CartItem) => sum + (item.product.price * item.quantity), 0
          );
        });
        
        // Server update
        const response = await fetch(`/api/users/cart/item?id=${cartItemId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!response.ok) throw new Error('Failed to remove item');
        
        // Refresh from server
        await get().fetchCart();
      } catch (error: any) {
        set({ error: error.message });
        await get().fetchCart();
      } finally {
        set({ loading: false });
      }
    },
    
    clearCart: () => set({ cart: null, error: null }),
  }))
);
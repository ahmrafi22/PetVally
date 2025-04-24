import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, PetOrder } from '@/types';

interface UserPreferences {
  dailyAvailability: number;
  experienceLevel: number;
  hasOutdoorSpace: boolean;
  hasChildren: boolean;
  hasAllergies: boolean;
}

interface UserState {
  userData: {
    id: string | null;
    name: string;
    email: string;
    image: string | null;
    city: string | null;
    area: string | null;
    country: string | null;
    age: number | null;
    createdAt: string;
    experienceLevel: number;
    dailyAvailability: number;
    hasOutdoorSpace: boolean;
    hasChildren: boolean;
    hasAllergies: boolean;
    petOrders: PetOrder[] | null;
  };
  isLoading: boolean;
  error: string | null;
  fetchUserData: () => Promise<void>;
  clearUserData: () => void;
  updateUserProfile: (updatedUser: Partial<User>) => Promise<void>;
  updateUserPreferences: (preferences: UserPreferences) => Promise<void>;
  updateUserImage: (imageUrl: string) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userData: {
        id: null,
        name: '',
        email: '',
        image: null,
        city: '',
        area: '',
        country: '',
        age: null,
        createdAt: new Date().toISOString(),
        experienceLevel: 1,
        dailyAvailability: 1,
        hasOutdoorSpace: false,
        hasChildren: false,
        hasAllergies: false,
        petOrders: null,
      },
      isLoading: false,
      error: null,
      
      fetchUserData: async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
        
        const token = localStorage.getItem("userToken");
        if (!token) return;
        
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/users/userdata?id=${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            set({
              userData: {
                id: userId,
                name: data.user.name || '',
                email: data.user.email || '',
                image: data.user.image || null,
                city: data.user.city && data.user.city.trim() !== '' ? data.user.city.trim() : '',
                area: data.user.area && data.user.area.trim() !== '' ? data.user.area.trim() : '',
                country: data.user.country || '',
                age: data.user.age || null,
                createdAt: data.user.createdAt || new Date().toISOString(),
                experienceLevel: data.user.experienceLevel || 1,
                dailyAvailability: data.user.dailyAvailability || 1,
                hasOutdoorSpace: data.user.hasOutdoorSpace || false,
                hasChildren: data.user.hasChildren || false,
                hasAllergies: data.user.hasAllergies || false,
                petOrders: data.user.petOrders || null,
              },
              isLoading: false,
            });
          } else {
            set({ 
              error: 'Failed to fetch user data',
              isLoading: false 
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          set({ 
            error: 'Error fetching user data',
            isLoading: false 
          });
        }
      },
      
      clearUserData: () => {
        set({
          userData: {
            id: null,
            name: '',
            email: '',
            image: null,
            city: '',
            area: '',
            country: '',
            age: null,
            createdAt: new Date().toISOString(),
            experienceLevel: 1,
            dailyAvailability: 1,
            hasOutdoorSpace: false,
            hasChildren: false,
            hasAllergies: false,
            petOrders: null,
          },
          error: null,
        });
      },

      updateUserProfile: async (updatedUser: Partial<User>) => {
        const userId = get().userData.id;
        const token = localStorage.getItem("userToken");
        
        if (!userId || !token) return;
        
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/users/update-profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id: userId, ...updatedUser }),
          });
          
          if (response.ok) {
            const data = await response.json();
            // Update the store with the complete user data from response
            set(state => ({
              userData: {
                ...state.userData,
                ...data.user,
              },
              isLoading: false,
              error: null
            }));
            return data.user;
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update user profile');
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      
      updateUserPreferences: async (preferences: UserPreferences) => {
        const userId = get().userData.id;
        const token = localStorage.getItem("userToken");
        
        if (!userId || !token) return;
        
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/users/update-preferences`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id: userId, ...preferences }),
          });
          
          if (response.ok) {
            const data = await response.json();
            // Update the store with the complete user data from response
            set(state => ({
              userData: {
                ...state.userData,
                ...data.user,
              },
              isLoading: false,
              error: null
            }));
            return data.user;
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update preferences');
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      
      updateUserImage: async (imageUrl: string) => {
        const userId = get().userData.id;
        const token = localStorage.getItem("userToken");
        
        if (!userId || !token) return;
        
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/users/update-image`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId, imageUrl }),
          });
          
          if (response.ok) {
            set(state => ({
              userData: {
                ...state.userData,
                image: imageUrl,
              },
              isLoading: false,
              error: null // Explicitly set error to null on success
            }));
          } else {
            const errorData = await response.json().catch(() => ({ message: 'Failed to update profile image' }));
            set({ 
              error: errorData.message || 'Failed to update profile image',
              isLoading: false 
            });
          }
        } catch (error) {
          console.error("Error updating profile image:", error);
          set({ 
            error: 'Error updating profile image',
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'user-storage', 
      partialize: (state) => ({ userData: state.userData }),
    }
  )
);
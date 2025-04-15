import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  userData: {
    id: string | null;
    name: string;
    image: string;
  };
  isLoading: boolean;
  error: string | null;
  fetchUserData: () => Promise<void>;
  clearUserData: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userData: {
        id: null,
        name: '',
        image: '',
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
                name: data.user.name,
                image: data.user.image,
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
            image: '',
          },
          error: null,
        });
      },
    }),
    {
      name: 'user-storage', // name of the item in localStorage
      partialize: (state) => ({ userData: state.userData }), // only save userData to localStorage
    }
  )
);
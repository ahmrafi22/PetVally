import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Caregiver } from '@/types';

interface CaregiverState {
  caregiverData: {
    id: string | null;
    name: string;
    email: string;
    image: string | null;
    country: string | null;
    city: string | null;
    area: string | null;
    bio: string;
    phone: string;
    verified: boolean;
    hourlyRate: number;
    totalEarnings: number;
    createdAt: string;
    updatedAt: string;
  };
  isLoading: boolean;
  error: string | null;
  fetchCaregiverData: () => Promise<void>;
  clearCaregiverData: () => void;
  updateCaregiverProfile: (updatedCaregiver: Partial<Caregiver>) => Promise<void>;
  updateCaregiverImage: (imageUrl: string) => Promise<void>;
}

export const useCaregiverStore = create<CaregiverState>()(
  persist(
    (set, get) => ({
      caregiverData: {
        id: null,
        name: '',
        email: '',
        image: null,
        country: null,
        city: null,
        area: null,
        bio: '',
        phone: '',
        verified: false,
        hourlyRate: 0,
        totalEarnings: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isLoading: false,
      error: null,
      
      fetchCaregiverData: async () => {
        const caregiverId = localStorage.getItem("caregiverId");
        if (!caregiverId) return;
        
        const token = localStorage.getItem("caregiverToken");
        if (!token) return;
        
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/caregivers/caregiverdata?id=${caregiverId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            set({
              caregiverData: {
                id: caregiverId,
                name: data.caregiver.name || '',
                email: data.caregiver.email || '',
                phone: data.caregiver.phone || '',
                image: data.caregiver.image || null,
                country: data.caregiver.country || null,
                city: data.caregiver.city || null,
                area: data.caregiver.area || null,
                bio: data.caregiver.bio || '',
                verified: data.caregiver.verified || false,
                hourlyRate: data.caregiver.hourlyRate || 0,
                totalEarnings: data.caregiver.totalEarnings || 0,
                createdAt: data.caregiver.createdAt || new Date().toISOString(),
                updatedAt: data.caregiver.updatedAt || new Date().toISOString(),
              },
              isLoading: false,
            });
          } else {
            set({ 
              error: 'Failed to fetch caregiver data',
              isLoading: false 
            });
          }
        } catch (error) {
          console.error("Error fetching caregiver data:", error);
          set({ 
            error: 'Error fetching caregiver data',
            isLoading: false 
          });
        }
      },
      
      clearCaregiverData: () => {
        set({
          caregiverData: {
            id: null,
            name: '',
            email: '',
            image: null,
            country: null,
            city: null,
            area: null,
            bio: '',
            phone: '',
            verified: false,
            hourlyRate: 0,
            totalEarnings: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          error: null,
        });
      },

      updateCaregiverProfile: async (updatedCaregiver: Partial<Caregiver>) => {
        const caregiverId = get().caregiverData.id;
        const token = localStorage.getItem("caregiverToken");
        
        if (!caregiverId || !token) return;
        
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/caregivers/update-profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id: caregiverId, ...updatedCaregiver }),
          });
          
          if (response.ok) {
            const data = await response.json();

            set(state => ({
              caregiverData: {
                ...state.caregiverData,
                ...data.caregiver,
              },
              isLoading: false,
              error: null
            }));
            return data.caregiver;
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update caregiver profile');
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      
      updateCaregiverImage: async (imageUrl: string) => {
        const caregiverId = get().caregiverData.id;
        const token = localStorage.getItem("caregiverToken");
        
        if (!caregiverId || !token) return;
        
        try {
          set({ isLoading: true, error: null });
          
          set(state => ({
            caregiverData: {
              ...state.caregiverData,
              image: imageUrl,
              updatedAt: new Date().toISOString(),
            },
            isLoading: false,
            error: null
          }));
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
      name: 'caregiver-storage', 
      partialize: (state) => ({ caregiverData: state.caregiverData }),
    }
  )
);
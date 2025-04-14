import { create } from 'zustand';

type NotificationStore = {
  count: number;
  lastUpdated: Date | null;
  setCount: (count: number) => void;
  fetchCount: () => Promise<void>;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  count: 0,
  lastUpdated: null,
  setCount: (count) => set({ count, lastUpdated: new Date() }),
  fetchCount: async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      const response = await fetch("/api/users/notifications/count", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        set({ count: data.count, lastUpdated: new Date() });
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  },
}));
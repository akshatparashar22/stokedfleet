import { create } from 'zustand';

export interface AlertData {
  id: string;
  vehicleId: string;
  type: string;
  message: string;
  severity: string;
  acknowledged: boolean;
  createdAt: string;
}

interface AlertState {
  alerts: AlertData[];
  historyAlerts: AlertData[];
  unreadCount: number;
  loading: boolean;
  historyLoading: boolean;
  fetchAlerts: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  acknowledgeAlert: (id: string) => Promise<void>;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  historyAlerts: [],
  unreadCount: 0,
  loading: false,
  historyLoading: false,
  fetchAlerts: async () => {
    try {
      const res = await fetch('/api/v1/alerts?tab=active');
      if (res.ok) {
        const data = await res.json();
        const alerts = data.data || [];
        set({ alerts, unreadCount: alerts.length, loading: false });
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
      set({ loading: false });
    }
  },
  fetchHistory: async () => {
    set({ historyLoading: true });
    try {
      const res = await fetch('/api/v1/alerts?tab=history');
      if (res.ok) {
        const data = await res.json();
        set({ historyAlerts: data.data || [], historyLoading: false });
      }
    } catch (err) {
      console.error('Failed to fetch alert history:', err);
      set({ historyLoading: false });
    }
  },
  acknowledgeAlert: async (id: string) => {
    try {
      const res = await fetch(`/api/v1/alerts/${id}/acknowledge`, { method: 'PATCH' });
      if (res.ok) {
        const alertToMove = get().alerts.find(a => a.id === id);
        const newAlerts = get().alerts.filter(a => a.id !== id);
        
        const newHistory = alertToMove 
          ? [{ ...alertToMove, acknowledged: true }, ...get().historyAlerts]
          : get().historyAlerts;

        set({ 
          alerts: newAlerts, 
          unreadCount: newAlerts.length,
          historyAlerts: newHistory
        });
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  }
}));

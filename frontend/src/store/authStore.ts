import { create } from 'zustand';
import WebSocketService from '../services/websocketService';
import PollerService from '../services/pollerService';

export interface UserSettings {
  theme: string;
  pollingInterval: number;
  autoRefreshAnalytics: boolean;
  autoRefreshAlerts: boolean;
  liveData: boolean;
  widgets?: any;
}

export interface User {
  id: string;
  username: string;
  role: string;
  settings?: UserSettings;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

const applyTheme = (themeStr: string) => {
  if (themeStr === 'DARK' || (themeStr === 'SYSTEM' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('theme', themeStr.toLowerCase());
};

const startServices = (userData: User) => {
  if (userData.settings?.liveData ?? true) {
    WebSocketService.getInstance().connect();
  }
  
  if (userData.settings?.pollingInterval) {
    PollerService.getInstance().start(userData.settings.pollingInterval);
  } else {
    PollerService.getInstance().start();
  }
  
  if (userData.settings?.theme) {
    applyTheme(userData.settings.theme);
  }
};

const stopServices = () => {
  WebSocketService.getInstance().disconnect();
  PollerService.getInstance().stop();
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  login: (userData: User) => {
    set({ user: userData });
    startServices(userData);
  },

  logout: async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    set({ user: null });
    stopServices();
  },

  checkAuth: async () => {
    try {
      const response = await fetch('/api/v1/auth/me', {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (response.ok) {
        const data = await response.json();
        set({ user: data });
        startServices(data);
      } else {
        set({ user: null });
        stopServices();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      set({ user: null });
      stopServices();
    } finally {
      set({ loading: false });
    }
  },

  updateSettings: async (newSettings: Partial<UserSettings>) => {
    try {
      const response = await fetch('/api/v1/auth/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (response.ok) {
        const data = await response.json();
        const currentUser = get().user;
        if (!currentUser) return;
        
        const updatedUser = { ...currentUser, settings: { ...currentUser.settings, ...data.settings } as UserSettings };
        set({ user: updatedUser });
        
        // Update poller service if interval changed
        if (newSettings.pollingInterval) {
          PollerService.getInstance().updateInterval(newSettings.pollingInterval);
        }
        
        // Handle websocket changes
        if (newSettings.liveData !== undefined) {
          if (newSettings.liveData) {
            WebSocketService.getInstance().connect();
          } else {
            WebSocketService.getInstance().disconnect();
          }
        }

        // Apply theme if changed
        if (newSettings.theme) {
          applyTheme(newSettings.theme);
        }
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }
}));

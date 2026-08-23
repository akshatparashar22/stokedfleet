import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Activity, BarChart2, Bell, Settings as SettingsIcon, LogOut, Sun, Moon, Info } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import PollerService from '../services/pollerService'
import { useAlertStore } from '../store/alertStore'

export function Sidebar() {
  const navigate = useNavigate()
  const { user, logout, updateSettings } = useAuthStore()
  const { unreadCount, fetchAlerts } = useAlertStore()

  useEffect(() => {
    fetchAlerts();
    if (user?.settings?.autoRefreshAlerts) {
      const unsubscribe = PollerService.getInstance().subscribe(fetchAlerts);
      return () => unsubscribe();
    }
  }, [user?.settings?.autoRefreshAlerts, fetchAlerts]);

  const toggleTheme = async () => {
    const isDark = document.documentElement.classList.toggle('dark')
    const newTheme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    
    if (user) {
      updateSettings({ theme: isDark ? 'DARK' : 'LIGHT' }).catch(console.error);
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Alerts', path: '/alerts', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
    { name: 'About', path: '/about', icon: Info },
  ]

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col justify-between shrink-0 sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 p-6 border-b border-border">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 drop-shadow-sm" />
          <h2 className="text-2xl font-heading text-brand-flame tracking-widest mt-1">
            STOKED<span className="text-brand-core">FLEET</span>
          </h2>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center justify-between p-3 rounded-xl transition-all font-bold text-sm ${
                  isActive 
                    ? 'bg-brand-core/10 text-brand-core border border-brand-core/20' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                {item.name}
              </div>
              {item.badge !== undefined && (
                <span className="bg-brand-flame text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center justify-center min-w-[20px]">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border flex flex-col gap-2">
        {/* Theme Toggle inside Sidebar */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm text-muted-foreground hover:bg-muted hover:text-foreground w-full text-left"
        >
          <div className="relative w-5 h-5">
            <Sun className="hidden dark:block w-5 h-5 absolute inset-0" />
            <Moon className="block dark:hidden w-5 h-5 absolute inset-0" />
          </div>
          <span className="hidden dark:inline">Light Mode</span>
          <span className="inline dark:hidden">Dark Mode</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm text-brand-flame hover:bg-brand-flame/10 w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}

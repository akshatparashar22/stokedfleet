import { useState } from 'react';
import { Settings as SettingsIcon, Save, Activity, Clock, BarChart2, Bell, Shield, Lock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Settings() {
  const { user, updateSettings } = useAuthStore();
  
  // Local state for the form, initialized from the context
  const [pollingInterval, setPollingInterval] = useState(user?.settings?.pollingInterval || 5000);
  const [autoRefreshAnalytics, setAutoRefreshAnalytics] = useState(user?.settings?.autoRefreshAnalytics ?? true);
  const [autoRefreshAlerts, setAutoRefreshAlerts] = useState(user?.settings?.autoRefreshAlerts ?? true);
  const [liveData, setLiveData] = useState(user?.settings?.liveData ?? true);
  const [theme, setTheme] = useState(user?.settings?.theme || 'SYSTEM');
  const [showMap, setShowMap] = useState(user?.settings?.widgets?.dashboard?.showMap ?? true);
  
  // Analytics Widgets
  const [showOverall, setShowOverall] = useState(user?.settings?.widgets?.analytics?.showOverall ?? true);
  const [showTable, setShowTable] = useState(user?.settings?.widgets?.analytics?.showTable ?? true);
  const [showTrends, setShowTrends] = useState(user?.settings?.widgets?.analytics?.showTrends ?? true);
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Local state for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    
    setPwdSaving(true);
    setPwdMessage(null);
    
    try {
      const res = await fetch('/api/v1/auth/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      
      setPwdMessage({ text: 'Password updated successfully.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdMessage({ text: err instanceof Error ? err.message : 'Failed to update password.', type: 'error' });
    } finally {
      setPwdSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    try {
      await updateSettings({
        pollingInterval,
        autoRefreshAnalytics,
        autoRefreshAlerts,
        liveData,
        theme,
        widgets: { 
          dashboard: { showMap },
          analytics: { showOverall, showTable, showTrends }
        }
      });

      // Apply the theme immediately
      if (theme === 'DARK' || (theme === 'SYSTEM' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme.toLowerCase());

      setMessage({ text: 'Settings updated successfully.', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to update settings.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 w-full max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-5xl font-heading text-brand-void mb-2 uppercase flex items-center gap-4">
          <SettingsIcon className="w-10 h-10" />
          Settings
        </h1>
        <p className="text-muted-foreground font-body">Manage your dashboard preferences and session configurations.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg font-body border flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-brand-flame/10 text-brand-flame border-brand-flame/20'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden font-body">
        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-core" />
              Polling & Refresh
            </h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex justify-between">
                  Polling Interval (ms)
                  <span className="text-brand-core">{pollingInterval} ms</span>
                </label>
                <input 
                  type="range" 
                  min="1000" 
                  max="15000" 
                  step="1000"
                  value={pollingInterval}
                  onChange={(e) => setPollingInterval(parseInt(e.target.value))}
                  className="w-full accent-brand-core"
                />
                <p className="text-xs text-muted-foreground">
                  How often the dashboard fetches updated historical data.
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={autoRefreshAnalytics}
                      onChange={(e) => setAutoRefreshAnalytics(e.target.checked)}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${autoRefreshAnalytics ? 'bg-brand-core' : 'bg-muted'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${autoRefreshAnalytics ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                      <BarChart2 className="w-4 h-4" /> Auto-Refresh Analytics
                    </span>
                    <span className="text-xs text-muted-foreground">Automatically update charts when new data arrives.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={autoRefreshAlerts}
                      onChange={(e) => setAutoRefreshAlerts(e.target.checked)}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${autoRefreshAlerts ? 'bg-brand-core' : 'bg-muted'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${autoRefreshAlerts ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                      <Bell className="w-4 h-4" /> Auto-Refresh Alerts
                    </span>
                    <span className="text-xs text-muted-foreground">Automatically refresh the alerts list.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={liveData}
                      onChange={(e) => setLiveData(e.target.checked)}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${liveData ? 'bg-brand-core' : 'bg-muted'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${liveData ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                      <Activity className="w-4 h-4" /> Live Data Stream
                    </span>
                    <span className="text-xs text-muted-foreground">Subscribe to real-time telemetry via WebSockets.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-core" />
              Dashboard Widgets
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={showMap}
                    onChange={(e) => setShowMap(e.target.checked)}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${showMap ? 'bg-brand-core' : 'bg-muted'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showMap ? 'transform translate-x-4' : ''}`}></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                    Show Live Map
                  </span>
                  <span className="text-xs text-muted-foreground">Display the live telemetry map on the dashboard.</span>
                </div>
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-brand-core" />
              Analytics Widgets
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={showOverall}
                    onChange={(e) => setShowOverall(e.target.checked)}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${showOverall ? 'bg-brand-core' : 'bg-muted'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showOverall ? 'transform translate-x-4' : ''}`}></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                    Show Overall Data
                  </span>
                  <span className="text-xs text-muted-foreground">Display high-level fleet aggregates.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={showTable}
                    onChange={(e) => setShowTable(e.target.checked)}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${showTable ? 'bg-brand-core' : 'bg-muted'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showTable ? 'transform translate-x-4' : ''}`}></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                    Show Averages Table
                  </span>
                  <span className="text-xs text-muted-foreground">Display a tabular breakdown per vehicle.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={showTrends}
                    onChange={(e) => setShowTrends(e.target.checked)}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${showTrends ? 'bg-brand-core' : 'bg-muted'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showTrends ? 'transform translate-x-4' : ''}`}></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                    Show Trends Chart
                  </span>
                  <span className="text-xs text-muted-foreground">Display interactive historical trend charts.</span>
                </div>
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-brand-core" />
              Appearance
            </h3>
            
            <div className="space-y-2 max-w-sm">
              <label className="text-sm font-semibold text-foreground">Theme Mode</label>
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-background border border-border text-foreground text-sm rounded-lg p-2.5 focus:ring-brand-core focus:border-brand-core outline-none"
              >
                <option value="SYSTEM">System Default</option>
                <option value="LIGHT">Light</option>
                <option value="DARK">Dark</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Select your preferred visual style for the dashboard.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-void hover:bg-brand-void/90 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Security Section */}
      <div className="bg-card rounded-xl border border-border overflow-hidden font-body">
        <form onSubmit={handlePasswordChange} className="p-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-flame" />
              Security
            </h3>
            
            {pwdMessage && (
              <div className={`p-4 rounded-lg text-sm border flex items-center gap-2 ${
                pwdMessage.type === 'success' 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-brand-flame/10 text-brand-flame border-brand-flame/20'
              }`}>
                {pwdMessage.text}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full bg-background border border-border text-foreground text-sm rounded-lg p-2.5 focus:ring-brand-core focus:border-brand-core outline-none"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-background border border-border text-foreground text-sm rounded-lg p-2.5 focus:ring-brand-core focus:border-brand-core outline-none"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-background border border-border text-foreground text-sm rounded-lg p-2.5 focus:ring-brand-core focus:border-brand-core outline-none"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={pwdSaving || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="bg-brand-flame hover:bg-brand-flame/90 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {pwdSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
              {pwdSaving ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

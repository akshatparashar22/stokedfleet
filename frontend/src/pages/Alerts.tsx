import { useEffect, useState, useRef } from 'react';
import { AlertTriangle, CheckCircle, MapPin, Activity, Thermometer, Battery } from 'lucide-react';

interface Alert {
  id: string;
  vehicleId: string;
  timestamp: string;
  speed: number;
  engineTemp: number;
  fuelLevel: number;
  eventType: string;
  lat: number;
  lng: number;
}

export function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track acknowledged IDs so they don't reappear upon polling since the backend is a mock
  const acknowledgedIds = useRef<Set<string>>(new Set());

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/v1/alerts');
      if (!res.ok) {
        throw new Error('Failed to fetch alerts');
      }
      const data = await res.json();
      
      const activeAlerts = (data.data || []).filter(
        (a: Alert) => !acknowledgedIds.current.has(a.id)
      );
      
      setAlerts(activeAlerts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/alerts/${id}/acknowledge`, {
        method: 'PATCH',
      });
      
      if (!res.ok) {
        throw new Error('Failed to acknowledge alert');
      }
      
      acknowledgedIds.current.add(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-heading text-brand-void mb-2 uppercase">Alerts & Events</h1>
          <p className="text-muted-foreground font-body">Threshold breaches and system events over the last 5 minutes.</p>
        </div>
        <div className="bg-brand-flame/10 text-brand-flame px-4 py-2 rounded-lg font-bold border border-brand-flame/20 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {alerts.length} Active
        </div>
      </div>

      {error && (
        <div className="bg-brand-flame/10 text-brand-flame p-4 rounded-lg flex items-center gap-2 font-body border border-brand-flame/20">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {loading && alerts.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-void"></div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center flex flex-col items-center justify-center">
          <CheckCircle className="w-16 h-16 text-brand-core mb-4" />
          <h2 className="text-2xl font-heading text-foreground uppercase tracking-widest mb-2">All Clear</h2>
          <p className="text-muted-foreground font-body">No active alerts at this time.</p>
        </div>
      ) : (
        <div className="grid gap-4 font-body">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-card rounded-xl border border-border p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between transition-colors hover:border-brand-flame/50">
              <div className="flex items-start gap-4 flex-1">
                <div className="bg-brand-flame/10 p-3 rounded-full border border-brand-flame/20 shrink-0">
                  <AlertTriangle className="w-6 h-6 text-brand-flame" />
                </div>
                <div className="space-y-1 w-full">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-foreground uppercase tracking-wide">{alert.vehicleId}</h3>
                    <span className="bg-brand-flame text-white text-xs font-bold px-2 py-1 rounded">
                      {alert.eventType}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Activity className="w-4 h-4 text-brand-core" />
                      <span className="font-semibold text-foreground">{alert.speed.toFixed(1)} mph</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-4 h-4 text-brand-core" />
                      <span className="font-semibold text-foreground">{alert.engineTemp.toFixed(1)} °F</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Battery className="w-4 h-4 text-brand-core" />
                      <span className="font-semibold text-foreground">{alert.fuelLevel.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-brand-core" />
                      <span className="font-semibold text-foreground">{alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => acknowledgeAlert(alert.id)}
                className="shrink-0 bg-background border border-border-hover hover:bg-brand-core/10 hover:text-brand-core hover:border-brand-core/30 text-foreground font-bold py-2 px-6 rounded-lg transition-all"
              >
                Acknowledge
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

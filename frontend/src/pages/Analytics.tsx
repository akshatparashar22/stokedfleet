import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Thermometer, Battery } from 'lucide-react';
import PollerService from '../services/pollerService';
import { useAuthStore } from '../store/authStore';

interface TelemetrySummary {
  vehicleId: string;
  _avg: { speed: number | null; engineTemp: number | null };
  _min: { fuelLevel: number | null };
}

export function Analytics() {
  const { user } = useAuthStore();
  const [summaries, setSummaries] = useState<TelemetrySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const summaryRes = await fetch('/api/v1/telemetry/summary');

      if (!summaryRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const summaryData = await summaryRes.json();
      setSummaries(summaryData.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();
    
    // Subscribe to poller only if auto-refresh is enabled
    if (user?.settings?.autoRefreshAnalytics) {
      const unsubscribe = PollerService.getInstance().subscribe(fetchData);
      return () => unsubscribe();
    }
  }, [user?.settings?.autoRefreshAnalytics]);

  return (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-5xl font-heading text-brand-void mb-2 uppercase">Analytics & Trends</h1>
        <p className="text-muted-foreground font-body">Historical data and fleet performance over the last 5 minutes.</p>
      </div>

      {error && (
        <div className="bg-brand-flame/10 text-brand-flame p-4 rounded-lg flex items-center gap-2 font-body border border-brand-flame/20">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {loading && summaries.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-void"></div>
        </div>
      ) : (
        <div className="font-body">
          {/* Telemetry Summary Section */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-core" />
              <h2 className="text-xl font-heading text-foreground uppercase tracking-wide">Fleet Averages</h2>
            </div>
            <div className="p-6">
              {summaries.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No telemetry data available.</p>
              ) : (
                <div className="space-y-4">
                  {summaries.map((summary) => (
                    <div key={summary.vehicleId} className="bg-background border border-border-hover rounded-lg p-4 transition-colors hover:border-brand-core">
                      <div className="font-bold text-foreground mb-3 flex items-center justify-between">
                        <span>Vehicle: {summary.vehicleId}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Activity className="w-3 h-3"/> Avg Speed</span>
                          <span className="font-semibold text-foreground">{summary._avg.speed?.toFixed(1) || '0'} mph</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Thermometer className="w-3 h-3"/> Avg Temp</span>
                          <span className="font-semibold text-foreground">{summary._avg.engineTemp?.toFixed(1) || '0'} °F</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Battery className="w-3 h-3"/> Min Fuel</span>
                          <span className="font-semibold text-foreground">{summary._min.fuelLevel?.toFixed(1) || '0'}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import PollerService from '../services/pollerService';
import { useAuthStore } from '../store/authStore';

import { OverallDataWidget } from '../components/analytics/OverallDataWidget';
import type { TelemetrySummary } from '../components/analytics/OverallDataWidget';
import { TrendsChartWidget } from '../components/analytics/TrendsChartWidget';
import type { HistoryData } from '../components/analytics/TrendsChartWidget';
import { AveragesTableWidget } from '../components/analytics/AveragesTableWidget';

export function Analytics() {
  const { user } = useAuthStore();
  const [summaries, setSummaries] = useState<TelemetrySummary[]>([]);
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(5);

  // Widget settings
  const showOverall = user?.settings?.widgets?.analytics?.showOverall ?? true;
  const showTable = user?.settings?.widgets?.analytics?.showTable ?? true;
  const showTrends = user?.settings?.widgets?.analytics?.showTrends ?? true;

  const fetchData = async () => {
    try {
      const [summaryRes, historyRes] = await Promise.all([
        fetch('/api/v1/telemetry/summary'),
        fetch(`/api/v1/telemetry/fleet-history?range=${timeRange}`)
      ]);

      if (!summaryRes.ok || !historyRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const summaryData = await summaryRes.json();
      const historyData = await historyRes.json();
      
      setSummaries(summaryData.data || []);
      setHistory(historyData.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (user?.settings?.autoRefreshAnalytics) {
      const unsubscribe = PollerService.getInstance().subscribe(fetchData);
      return () => unsubscribe();
    }
  }, [user?.settings?.autoRefreshAnalytics, timeRange]);

  return (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-5xl font-heading text-brand-void mb-2 uppercase">Analytics & Trends</h1>
        <p className="text-muted-foreground font-body">Historical data and fleet performance analysis.</p>
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
        <div className="flex flex-col gap-8 font-body">
          
          {showOverall && <OverallDataWidget summaries={summaries} />}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {showTrends && <TrendsChartWidget history={history} summaries={summaries} timeRange={timeRange} setTimeRange={setTimeRange} />}
            {showTable && <AveragesTableWidget summaries={summaries} />}
          </div>
          
        </div>
      )}
    </div>
  );
}

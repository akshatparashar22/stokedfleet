import { useState, useMemo } from 'react';
import { TrendingUp, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import type { TelemetrySummary } from './OverallDataWidget';

export interface HistoryData {
  timestamp: string;
  speed: number;
  fuelLevel: number;
  engineTemp: number;
  vehicleId: string;
}

interface TrendsChartWidgetProps {
  history: HistoryData[];
  summaries: TelemetrySummary[];
  timeRange: number;
  setTimeRange: (range: number) => void;
}


export function TrendsChartWidget({ history, summaries, timeRange, setTimeRange }: TrendsChartWidgetProps) {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');

  // Derived Chart Data (Time series)
  const chartData = useMemo(() => {
    if (history.length === 0) return [];
    
    // Dynamic grouping based on selected time range
    let coeff = 1000 * 10; // 10s for 5m
    if (timeRange === 15) coeff = 1000 * 30; // 30s for 15m
    if (timeRange === 60) coeff = 1000 * 120; // 2m for 1h

    const timeMap = new Map<string, { time: string, speedSum: number, count: number, ts: number, activeSet: Set<string> }>();
    
    history.forEach(point => {
      const date = new Date(point.timestamp);
      const ts = Math.round(date.getTime() / coeff) * coeff;
      const roundedDate = new Date(ts);
      
      const timeKey = timeRange === 60 
        ? roundedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : roundedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      if (!timeMap.has(timeKey)) {
        timeMap.set(timeKey, { time: timeKey, speedSum: 0, count: 0, ts, activeSet: new Set() });
      }
      
      const entry = timeMap.get(timeKey)!;
      entry.speedSum += point.speed;
      entry.count += 1;
      if (point.speed > 0) entry.activeSet.add(point.vehicleId);
    });

    return Array.from(timeMap.values())
      .sort((a, b) => a.ts - b.ts)
      .map(entry => ({
        time: entry.time,
        AvgSpeed: parseFloat((entry.speedSum / entry.count).toFixed(1)),
        ActiveVehicles: entry.activeSet.size
      }))
      .slice(-40); // keep it clean
  }, [history, timeRange]);

  // Derived Bar Data (Status distribution)
  const barData = useMemo(() => {
    const counts: Record<string, number> = { INTRANSIT: 0, IDLE: 0, OUTOFSERVICE: 0, STANDBY: 0 };
    summaries.forEach(s => {
      const st = s.status || 'UNKNOWN';
      if (counts[st] !== undefined) counts[st]++;
      else counts[st] = 1;
    });
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [summaries]);

  // Derived Pie Data (Health classification)
  const pieData = useMemo(() => {
    const counts: Record<string, number> = { OK: 0, WARN: 0, CRITICAL: 0 };
    summaries.forEach(s => {
      const h = s.health || 'UNKNOWN';
      if (counts[h] !== undefined) counts[h]++;
      else counts[h] = 1;
    });
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [summaries]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'INTRANSIT': return 'var(--brand-core)';
      case 'IDLE': return 'var(--brand-ember)';
      case 'OUTOFSERVICE': return 'var(--brand-flame)';
      default: return 'var(--muted-foreground)';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'OK': return '#22c55e'; // success green
      case 'WARN': return 'var(--brand-ember)';
      case 'CRITICAL': return 'var(--brand-flame)';
      default: return 'var(--muted-foreground)';
    }
  };

  const getChartTitle = () => {
    if (chartType === 'pie') return 'Health Classification';
    if (chartType === 'bar') return 'Status Classification';
    return 'Fleet Utilization vs Speed';
  };

  const getChartDescription = () => {
    if (chartType === 'pie') return 'Displays the real-time health breakdown of your fleet based on engine telemetry. Use this to identify vehicles requiring immediate maintenance.';
    if (chartType === 'bar') return 'Shows the current distribution of your fleet across operational states. Use this to quickly gauge overall fleet availability and downtime.';
    return 'Tracks actively moving vehicles against the fleet\'s average speed. Use this to identify peak activity periods, traffic bottlenecks, and overall utilization.';
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col h-[400px]">
      <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-core" />
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            {getChartTitle()}
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Time Selector UI (only for Line chart) */}
          {chartType === 'line' && (
            <div className="flex items-center bg-background rounded-lg border border-border p-1 text-xs font-bold">
              {[5, 15, 60].map(val => (
                <button
                  key={val}
                  onClick={() => setTimeRange(val)}
                  className={`px-2 py-1 rounded-md transition-colors ${timeRange === val ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {val === 60 ? '1H' : `${val}M`}
                </button>
              ))}
            </div>
          )}

          {/* Chart Type Tabs */}
          <div className="flex items-center bg-background rounded-lg border border-border p-1">
            <button 
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded-md transition-colors ${chartType === 'line' ? 'bg-brand-core text-white' : 'text-muted-foreground hover:bg-muted'}`}
              title="Line Chart"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-md transition-colors ${chartType === 'bar' ? 'bg-brand-core text-white' : 'text-muted-foreground hover:bg-muted'}`}
              title="Bar Chart"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setChartType('pie')}
              className={`p-1.5 rounded-md transition-colors ${chartType === 'pie' ? 'bg-brand-core text-white' : 'text-muted-foreground hover:bg-muted'}`}
              title="Pie Chart"
            >
              <PieChartIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-1 min-h-0 flex flex-col">
        {(chartType === 'line' && chartData.length === 0) || 
         (chartType === 'bar' && barData.length === 0) || 
         (chartType === 'pie' && pieData.length === 0) ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
        ) : (
          <>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={12} tickMargin={10} minTickGap={30} />
                    <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                    <Line yAxisId="left" connectNulls type="monotone" dataKey="AvgSpeed" stroke="var(--brand-core)" strokeWidth={2} dot={false} activeDot={{ r: 5 }} name="Avg Speed (km/h)" />
                    <Line yAxisId="right" connectNulls type="monotone" dataKey="ActiveVehicles" stroke="var(--brand-ember)" strokeWidth={2} dot={false} activeDot={{ r: 5 }} name="Active Vehicles" />
                  </LineChart>
                ) : chartType === 'bar' ? (
                  <BarChart data={barData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} vertical={false} />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickMargin={10} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                      itemStyle={{ fontWeight: 'bold' }}
                      cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                      formatter={(val: any) => [val, 'Vehicles']}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getHealthColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                      itemStyle={{ fontWeight: 'bold' }}
                      formatter={(val: any) => [val, 'Vehicles']}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
            <p className="mt-4 text-xs text-muted-foreground text-center max-w-md mx-auto">
              {getChartDescription()}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

import { BarChart2 } from 'lucide-react';
import type { TelemetrySummary } from './OverallDataWidget';

interface AveragesTableWidgetProps {
  summaries: TelemetrySummary[];
}

export function AveragesTableWidget({ summaries }: AveragesTableWidgetProps) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col h-[400px]">
      <div className="px-6 py-4 border-b border-border flex items-center gap-2 bg-muted/30">
        <BarChart2 className="w-5 h-5 text-brand-core" />
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Vehicle Aggregates</h2>
      </div>
      <div className="flex-1 overflow-auto">
        {summaries.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">No telemetry data available.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border">Vehicle</th>
                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border">Avg Speed</th>
                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border">Avg Temp</th>
                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border">Min Fuel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {summaries.map((summary) => (
                <tr key={summary.vehicleId} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold">{summary.vehicleId}</td>
                  <td className="px-6 py-4 text-brand-core font-bold">{summary._avg.speed?.toFixed(1) || '0'}</td>
                  <td className="px-6 py-4">{summary._avg.engineTemp?.toFixed(1) || '0'} °C</td>
                  <td className="px-6 py-4 text-brand-ember">{summary._min.fuelLevel?.toFixed(1) || '0'}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

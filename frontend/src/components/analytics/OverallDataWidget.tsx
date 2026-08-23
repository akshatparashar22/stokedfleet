import { Activity, Thermometer, Battery, Truck } from 'lucide-react';
import { useMemo } from 'react';

export interface TelemetrySummary {
  vehicleId: string;
  status: string;
  health: string;
  _avg: { speed: number | null; engineTemp: number | null };
  _min: { fuelLevel: number | null };
}

interface OverallDataWidgetProps {
  summaries: TelemetrySummary[];
}

export function OverallDataWidget({ summaries }: OverallDataWidgetProps) {
  const overallStats = useMemo(() => {
    if (summaries.length === 0) return null;
    const avgSpeed = summaries.reduce((acc, curr) => acc + (curr._avg.speed || 0), 0) / summaries.length;
    const avgTemp = summaries.reduce((acc, curr) => acc + (curr._avg.engineTemp || 0), 0) / summaries.length;
    const minFuel = Math.min(...summaries.map(s => s._min.fuelLevel || 100));
    return { avgSpeed, avgTemp, minFuel, activeCount: summaries.length };
  }, [summaries]);

  if (!overallStats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-center shadow-sm">
        <span className="text-sm text-muted-foreground font-bold tracking-widest mb-1 flex items-center gap-2">
          <Truck className="w-4 h-4"/> ACTIVE VEHICLES
        </span>
        <span className="text-4xl font-heading text-foreground">{overallStats.activeCount}</span>
      </div>
      <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-center shadow-sm">
        <span className="text-sm text-muted-foreground font-bold tracking-widest mb-1 flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-core"/> FLEET AVG SPEED
        </span>
        <span className="text-4xl font-heading text-brand-core">
          {overallStats.avgSpeed.toFixed(1)} <span className="text-xl">km/h</span>
        </span>
      </div>
      <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-center shadow-sm">
        <span className="text-sm text-muted-foreground font-bold tracking-widest mb-1 flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-brand-flame"/> FLEET AVG TEMP
        </span>
        <span className="text-4xl font-heading text-foreground">
          {overallStats.avgTemp.toFixed(1)} <span className="text-xl">°C</span>
        </span>
      </div>
      <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-center shadow-sm">
        <span className="text-sm text-muted-foreground font-bold tracking-widest mb-1 flex items-center gap-2">
          <Battery className="w-4 h-4 text-brand-ember"/> LOWEST FUEL
        </span>
        <span className="text-4xl font-heading text-brand-ember">
          {overallStats.minFuel.toFixed(1)} <span className="text-xl">%</span>
        </span>
      </div>
    </div>
  );
}

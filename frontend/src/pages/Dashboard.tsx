import { useEffect, useState } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'
import { Activity, Thermometer, Zap, AlertTriangle, CheckCircle, Navigation, Power } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

interface TelemetryTick {
  vehicleId: string
  timestamp: string
  speed: number
  fuelLevel: number
  engineTemp: number
  status: string
  health: 'OK' | 'WARN' | 'CRITICAL'
  eventType: string
  lat: number
  lng: number
}

export function Dashboard() {
  const { user, updateSettings } = useAuthStore()
  const [telemetry, setTelemetry] = useState<TelemetryTick | null>(null)
  const isLiveDataOn = user?.settings?.liveData ?? true;
  
  const { lastMessage } = useWebSocket()

  useEffect(() => {
    if (lastMessage && isLiveDataOn) {
      try {
        const parsed = JSON.parse(lastMessage) as TelemetryTick
        setTelemetry(parsed)
      } catch (err) {}
    }
  }, [lastMessage, isLiveDataOn])

  return (
    <div className="p-8 w-full max-w-6xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-4xl md:text-5xl font-heading text-brand-void tracking-widest">LIVE TELEMETRY</h1>
        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-full border border-border shadow-sm">
          <div className={`w-3 h-3 rounded-full ${telemetry && isLiveDataOn ? 'bg-success animate-pulse' : 'bg-brand-ember'}`} />
          <span className="text-sm font-bold text-muted-foreground">{isLiveDataOn ? (telemetry ? 'STREAMING ACTIVE' : 'CONNECTING...') : 'STREAMING OFF'}</span>
        </div>
      </div>

      {!isLiveDataOn ? (
        <div className="w-full h-[50vh] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-card gap-4">
          <Power className="w-12 h-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground font-bold tracking-widest text-lg">LIVE STREAMING TURNED OFF</p>
          <button 
            onClick={() => updateSettings({ liveData: true })}
            className="mt-4 px-6 py-3 bg-brand-core text-white font-bold rounded-xl hover:bg-brand-core/90 transition-colors shadow-sm"
          >
            Enable Live Stream
          </button>
        </div>
      ) : !telemetry ? (
        <div className="w-full h-[50vh] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-card">
          <Activity className="w-10 h-10 text-brand-core animate-pulse mb-4" />
          <p className="text-muted-foreground font-bold tracking-widest">AWAITING SIGNAL...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Speed Widget */}
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col items-center justify-center shadow-sm relative overflow-hidden group">
              <div className="absolute top-4 left-4 text-brand-core opacity-50"><Navigation className="w-6 h-6" /></div>
              <h3 className="text-sm text-muted-foreground font-bold tracking-widest mb-2 z-10">SPEED (KM/H)</h3>
              <p className="text-7xl font-heading text-brand-core z-10 drop-shadow-sm">{telemetry.speed.toFixed(0)}</p>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-brand-core/5 rounded-full blur-2xl"></div>
            </div>

            {/* Fuel Widget */}
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col items-center justify-center shadow-sm relative overflow-hidden group">
              <div className="absolute top-4 left-4 text-brand-ember opacity-50"><Zap className="w-6 h-6" /></div>
              <h3 className="text-sm text-muted-foreground font-bold tracking-widest mb-2 z-10">FUEL LEVEL (%)</h3>
              <p className="text-7xl font-heading text-brand-ember z-10 drop-shadow-sm">{telemetry.fuelLevel.toFixed(1)}</p>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-brand-ember/5 rounded-full blur-2xl"></div>
            </div>

            {/* Temp Widget */}
            <div className={`bg-card p-6 rounded-2xl border flex flex-col items-center justify-center shadow-sm relative overflow-hidden transition-colors ${telemetry.engineTemp > 100 ? 'border-brand-flame bg-brand-flame/5' : 'border-border'}`}>
              <div className={`absolute top-4 left-4 opacity-50 ${telemetry.engineTemp > 100 ? 'text-brand-flame animate-pulse' : 'text-foreground'}`}><Thermometer className="w-6 h-6" /></div>
              <h3 className="text-sm text-muted-foreground font-bold tracking-widest mb-2 z-10">ENGINE TEMP (°C)</h3>
              <p className={`text-7xl font-heading z-10 drop-shadow-sm ${telemetry.engineTemp > 100 ? 'text-brand-flame' : 'text-foreground'}`}>{telemetry.engineTemp.toFixed(1)}</p>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-foreground/5 rounded-full blur-2xl"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Panel */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-4">
              <h3 className="text-sm text-muted-foreground font-bold tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4" /> SYSTEM STATUS
              </h3>
              
              <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border transition-colors hover:border-brand-void/30">
                <span className="text-sm font-bold text-muted-foreground">VEHICLE ID</span>
                <span className="font-mono text-brand-void font-bold">{telemetry.vehicleId}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border transition-colors hover:border-brand-core/30">
                <span className="text-sm font-bold text-muted-foreground">OPERATIONAL STATE</span>
                <span className="font-bold tracking-widest px-3 py-1 bg-brand-core/10 text-brand-core rounded-lg text-sm">{telemetry.status}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border transition-colors hover:border-green-500/30">
                <span className="text-sm font-bold text-muted-foreground">HEALTH DIAGNOSTIC</span>
                <div className="flex items-center gap-2">
                  {telemetry.health === 'OK' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertTriangle className={`w-5 h-5 ${telemetry.health === 'CRITICAL' ? 'text-brand-flame animate-bounce' : 'text-brand-ember'}`} />}
                  <span className={`font-bold tracking-widest ${telemetry.health === 'OK' ? 'text-green-500' : telemetry.health === 'CRITICAL' ? 'text-brand-flame' : 'text-brand-ember'}`}>{telemetry.health}</span>
                </div>
              </div>
            </div>

            {/* Event Log */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-4 h-full">
              <h3 className="text-sm text-muted-foreground font-bold tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> LATEST EVENT
              </h3>
              <div className={`flex-1 p-6 rounded-xl border flex flex-col items-center justify-center text-center gap-3 transition-colors duration-500 ${telemetry.eventType === 'ALERT' ? 'bg-brand-flame/10 border-brand-flame/50 shadow-[inset_0_0_20px_rgba(230,30,37,0.1)]' : telemetry.eventType === 'RECOVERY' ? 'bg-green-500/10 border-green-500/50' : 'bg-background border-border hover:border-brand-core/30'}`}>
                <span className={`text-3xl font-bold tracking-widest ${telemetry.eventType === 'ALERT' ? 'text-brand-flame' : telemetry.eventType === 'RECOVERY' ? 'text-green-500' : 'text-brand-core'}`}>{telemetry.eventType}</span>
                <span className="text-sm text-muted-foreground font-mono bg-card px-3 py-1 rounded-md border border-border">
                  {new Date(telemetry.timestamp).toLocaleString()}
                </span>
                <div className="flex gap-4 mt-2 font-mono text-xs text-muted-foreground bg-card/50 p-2 rounded-lg">
                  <span>LAT: {telemetry.lat.toFixed(4)}</span>
                  <span>LNG: {telemetry.lng.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

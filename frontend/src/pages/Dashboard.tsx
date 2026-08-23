import { useEffect, useState, useMemo } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'
import { Activity, Thermometer, Zap, AlertTriangle, CheckCircle, Navigation, Power, Truck, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

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

const createCustomIcon = (status: string, isPinned: boolean) => {
  const color = status === 'INTRANSIT' ? '#e61e25' // Brand Core
    : status === 'IDLE' ? '#f59e0b' // Brand Ember
    : status === 'OUTOFSERVICE' ? '#ef4444' // Brand Flame
    : '#6b7280'; // Standby / muted

  return L.divIcon({
    className: 'custom-vehicle-marker bg-transparent border-0',
    html: `
      <div style="
        background-color: ${color}; 
        width: ${isPinned ? '24px' : '16px'}; 
        height: ${isPinned ? '24px' : '16px'}; 
        border-radius: 50%; 
        border: ${isPinned ? '4px' : '2px'} solid white; 
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
        transition: all 0.3s ease;
        ${isPinned ? 'animation: pulse 2s infinite;' : ''}
      "></div>
    `,
    iconSize: isPinned ? [24, 24] : [16, 16],
    iconAnchor: isPinned ? [12, 12] : [8, 8]
  });
};

const MAP_CENTER: [number, number] = [28.6139, 77.2090]; // New Delhi

export function Dashboard() {
  const { user, updateSettings } = useAuthStore()
  const [fleetData, setFleetData] = useState<Record<string, TelemetryTick>>({})
  const [pinnedVehicleId, setPinnedVehicleId] = useState<string | null>(null)
  
  const isLiveDataOn = user?.settings?.liveData ?? true;
  const showMap = user?.settings?.widgets?.dashboard?.showMap ?? true;
  const { lastMessage } = useWebSocket()

  useEffect(() => {
    if (lastMessage && isLiveDataOn) {
      try {
        const parsed = JSON.parse(lastMessage) as TelemetryTick[]
        setFleetData(prev => {
          const next = { ...prev }
          parsed.forEach(tick => {
            next[tick.vehicleId] = tick
          })
          return next
        })
      } catch (err) {}
    }
  }, [lastMessage, isLiveDataOn])

  // Auto-pin first vehicle
  useEffect(() => {
    const ids = Object.keys(fleetData)
    if (ids.length > 0 && !pinnedVehicleId) {
      setPinnedVehicleId(ids[0]!)
    }
  }, [fleetData, pinnedVehicleId])

  const vehicles = useMemo(() => Object.values(fleetData).sort((a, b) => a.vehicleId.localeCompare(b.vehicleId)), [fleetData])
  const pinnedVehicle = pinnedVehicleId ? fleetData[pinnedVehicleId] : null;

  return (
    <div className="p-8 w-full max-w-7xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-4xl md:text-5xl font-heading text-brand-void tracking-widest">LIVE TELEMETRY</h1>
        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-full border border-border shadow-sm">
          <div className={`w-3 h-3 rounded-full ${Object.keys(fleetData).length > 0 && isLiveDataOn ? 'bg-success animate-pulse' : 'bg-brand-ember'}`} />
          <span className="text-sm font-bold text-muted-foreground">{isLiveDataOn ? (Object.keys(fleetData).length > 0 ? 'STREAMING ACTIVE' : 'CONNECTING...') : 'STREAMING OFF'}</span>
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
      ) : Object.keys(fleetData).length === 0 ? (
        <div className="w-full h-[50vh] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-card">
          <Activity className="w-10 h-10 text-brand-core animate-pulse mb-4" />
          <p className="text-muted-foreground font-bold tracking-widest">AWAITING SIGNAL...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          
          {/* Conditionally rendered Map Widget */}
          {showMap && (
            <div className="flex flex-col gap-2">
              <div className="w-full h-[40vh] bg-card rounded-2xl border border-border shadow-sm overflow-hidden relative z-0">
                <MapContainer center={MAP_CENTER} zoom={12} style={{ height: '100%', width: '100%' }}>
                  <TileLayer 
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                  {vehicles.map(v => (
                    <Marker 
                      key={v.vehicleId} 
                      position={[v.lat, v.lng]} 
                      icon={createCustomIcon(v.status, v.vehicleId === pinnedVehicleId)}
                      eventHandlers={{ click: () => setPinnedVehicleId(v.vehicleId) }}
                    >
                      <Popup className="font-body text-sm font-bold">
                        <div className="flex flex-col gap-1">
                          <span className="text-brand-void text-lg">{v.vehicleId}</span>
                          <span className="text-muted-foreground">Status: <span className="text-brand-core">{v.status}</span></span>
                          <span className="text-muted-foreground">Speed: {v.speed.toFixed(0)} km/h</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              <p className="text-xs text-muted-foreground px-2">
                <a href="https://leafletjs.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline transition-colors">Leaflet</a>, the open-source map library used above, asks for contributions for the welfare of the people of Ukraine hurt during the war. <a href="https://u24.gov.ua/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline transition-colors">Please consider supporting their cause here.</a>
                <span className="block mt-1.5 italic opacity-75 text-[11px]">
                  — Regards, dev with no affiliation to any organization or agenda.
                </span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Panel: Fleet List */}
          <div className="lg:col-span-1 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col max-h-[75vh]">
            <div className="p-4 border-b border-border bg-muted/30">
              <h2 className="text-sm font-bold tracking-widest text-muted-foreground flex items-center gap-2">
                <Truck className="w-4 h-4" /> ACTIVE FLEET ({vehicles.length})
              </h2>
            </div>
            <div className="overflow-y-auto p-2 space-y-2">
              {vehicles.map(v => (
                <button
                  key={v.vehicleId}
                  onClick={() => setPinnedVehicleId(v.vehicleId)}
                  className={`w-full text-left flex items-center justify-between p-4 rounded-xl border transition-all ${
                    pinnedVehicleId === v.vehicleId 
                      ? 'border-brand-core bg-brand-core/5 shadow-sm' 
                      : 'border-transparent hover:bg-muted'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-mono font-bold text-foreground">{v.vehicleId}</span>
                    <div className="flex items-center gap-2 text-xs font-bold tracking-widest">
                      <span className={`${
                        v.status === 'INTRANSIT' ? 'text-brand-core' : 
                        v.status === 'IDLE' ? 'text-brand-ember' : 
                        v.status === 'OUTOFSERVICE' ? 'text-brand-flame' : 'text-muted-foreground'
                      }`}>
                        {v.status}
                      </span>
                      <span className="text-muted-foreground/30">•</span>
                      <span className={`${
                        v.health === 'OK' ? 'text-green-500' : 
                        v.health === 'CRITICAL' ? 'text-brand-flame animate-pulse' : 'text-brand-ember'
                      }`}>
                        {v.health}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${pinnedVehicleId === v.vehicleId ? 'text-brand-core' : 'text-muted-foreground/30'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel: Pinned Vehicle Detail */}
          {pinnedVehicle && (
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex items-center justify-between bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex flex-col">
                  <h2 className="text-sm text-muted-foreground font-bold tracking-widest mb-1">PINNED VEHICLE</h2>
                  <span className="text-3xl font-mono text-brand-void font-bold">{pinnedVehicle.vehicleId}</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground font-bold tracking-widest mb-1">LATITUDE</span>
                    <span className="font-mono text-sm font-bold bg-muted px-2 py-1 rounded-md">{pinnedVehicle.lat.toFixed(4)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground font-bold tracking-widest mb-1">LONGITUDE</span>
                    <span className="font-mono text-sm font-bold bg-muted px-2 py-1 rounded-md">{pinnedVehicle.lng.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Speed Widget */}
                <div className="bg-card p-6 rounded-2xl border border-border flex flex-col items-center justify-center shadow-sm relative overflow-hidden group">
                  <div className="absolute top-4 left-4 text-brand-core opacity-50"><Navigation className="w-6 h-6" /></div>
                  <h3 className="text-sm text-muted-foreground font-bold tracking-widest mb-2 z-10">SPEED (KM/H)</h3>
                  <p className="text-6xl font-heading text-brand-core z-10 drop-shadow-sm">{pinnedVehicle.speed.toFixed(0)}</p>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-brand-core/5 rounded-full blur-2xl"></div>
                </div>

                {/* Fuel Widget */}
                <div className="bg-card p-6 rounded-2xl border border-border flex flex-col items-center justify-center shadow-sm relative overflow-hidden group">
                  <div className="absolute top-4 left-4 text-brand-ember opacity-50"><Zap className="w-6 h-6" /></div>
                  <h3 className="text-sm text-muted-foreground font-bold tracking-widest mb-2 z-10">FUEL LEVEL (%)</h3>
                  <p className="text-6xl font-heading text-brand-ember z-10 drop-shadow-sm">{pinnedVehicle.fuelLevel.toFixed(1)}</p>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-brand-ember/5 rounded-full blur-2xl"></div>
                </div>

                {/* Temp Widget */}
                <div className={`bg-card p-6 rounded-2xl border flex flex-col items-center justify-center shadow-sm relative overflow-hidden transition-colors ${pinnedVehicle.engineTemp > 100 ? 'border-brand-flame bg-brand-flame/5' : 'border-border'}`}>
                  <div className={`absolute top-4 left-4 opacity-50 ${pinnedVehicle.engineTemp > 100 ? 'text-brand-flame animate-pulse' : 'text-foreground'}`}><Thermometer className="w-6 h-6" /></div>
                  <h3 className="text-sm text-muted-foreground font-bold tracking-widest mb-2 z-10">ENGINE TEMP (°C)</h3>
                  <p className={`text-6xl font-heading z-10 drop-shadow-sm ${pinnedVehicle.engineTemp > 100 ? 'text-brand-flame' : 'text-foreground'}`}>{pinnedVehicle.engineTemp.toFixed(1)}</p>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-foreground/5 rounded-full blur-2xl"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Panel */}
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-4">
                  <h3 className="text-sm text-muted-foreground font-bold tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4" /> SYSTEM STATUS
                  </h3>
                  
                  <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border transition-colors hover:border-brand-core/30">
                    <span className="text-sm font-bold text-muted-foreground">OPERATIONAL STATE</span>
                    <span className={`font-bold tracking-widest px-3 py-1 rounded-lg text-sm ${
                      pinnedVehicle.status === 'INTRANSIT' ? 'bg-brand-core/10 text-brand-core' :
                      pinnedVehicle.status === 'IDLE' ? 'bg-brand-ember/10 text-brand-ember' :
                      pinnedVehicle.status === 'OUTOFSERVICE' ? 'bg-brand-flame/10 text-brand-flame' : 'bg-muted text-muted-foreground'
                    }`}>
                      {pinnedVehicle.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border transition-colors hover:border-green-500/30">
                    <span className="text-sm font-bold text-muted-foreground">HEALTH DIAGNOSTIC</span>
                    <div className="flex items-center gap-2">
                      {pinnedVehicle.health === 'OK' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertTriangle className={`w-5 h-5 ${pinnedVehicle.health === 'CRITICAL' ? 'text-brand-flame animate-bounce' : 'text-brand-ember'}`} />}
                      <span className={`font-bold tracking-widest ${pinnedVehicle.health === 'OK' ? 'text-green-500' : pinnedVehicle.health === 'CRITICAL' ? 'text-brand-flame' : 'text-brand-ember'}`}>{pinnedVehicle.health}</span>
                    </div>
                  </div>
                </div>

                {/* Event Log */}
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-4 h-full">
                  <h3 className="text-sm text-muted-foreground font-bold tracking-widest flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> LATEST EVENT
                  </h3>
                  <div className={`flex-1 p-6 rounded-xl border flex flex-col items-center justify-center text-center gap-3 transition-colors duration-500 ${pinnedVehicle.eventType === 'ALERT' ? 'bg-brand-flame/10 border-brand-flame/50 shadow-[inset_0_0_20px_rgba(230,30,37,0.1)]' : pinnedVehicle.eventType === 'RECOVERY' ? 'bg-green-500/10 border-green-500/50' : 'bg-background border-border hover:border-brand-core/30'}`}>
                    <span className={`text-3xl font-bold tracking-widest ${pinnedVehicle.eventType === 'ALERT' ? 'text-brand-flame' : pinnedVehicle.eventType === 'RECOVERY' ? 'text-green-500' : 'text-brand-core'}`}>{pinnedVehicle.eventType}</span>
                    <span className="text-sm text-muted-foreground font-mono bg-card px-3 py-1 rounded-md border border-border">
                      {new Date(pinnedVehicle.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  )
}

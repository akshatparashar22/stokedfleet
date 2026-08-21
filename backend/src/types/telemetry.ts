/** Movement / operational status of the vehicle */
export type VehicleStatus = 'INTRANSIT' | 'OUTOFSERVICE' | 'IDLE' | 'STANDBY';

/** Vehicle health derived from engine diagnostics */
export type VehicleHealth = 'OK' | 'WARN' | 'CRITICAL';

/** Type of telemetry event */
export type TelemetryEventType = 'UPDATE' | 'ALERT' | 'RECOVERY';

export interface TelemetryTick {
  vehicleId: string;
  timestamp: string; // ISO 8601

  // ≥3 numeric metrics
  speed: number; // km/h, 0–120
  fuelLevel: number; // %, 0–100
  engineTemp: number; // °C, 70–115

  // categorical / movement status
  status: VehicleStatus;

  // vehicle health (derived from engine diagnostics)
  health: VehicleHealth;

  // event type
  eventType: TelemetryEventType;

  // location
  lat: number;
  lng: number;
}

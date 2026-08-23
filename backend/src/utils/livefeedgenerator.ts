import type {
  TelemetryTick,
  VehicleStatus,
  VehicleHealth,
  TelemetryEventType,
} from '../types/telemetry.js';
import { env } from '../config/env.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface VehicleState {
  vehicleId: string;
  speed: number;
  fuelLevel: number;
  engineTemp: number;
  lat: number;
  lng: number;
  status: VehicleStatus;
  prevHealth: VehicleHealth;
}

const STATUSES: VehicleStatus[] = ['INTRANSIT', 'OUTOFSERVICE', 'IDLE', 'STANDBY'];

// a publisher to be subscribed by the websocket server to send live feed data to the clients
export class LiveFeedPublisher {
  private subscribers: Set<(data: TelemetryTick[]) => void> = new Set();
  private vehicles: VehicleState[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(fleetSize = 5) {
    this.vehicles = Array.from({ length: fleetSize }, (_, i) => ({
      vehicleId: `SF-${String(i + 1).padStart(3, '0')}`,
      speed: 40 + Math.random() * 80,
      fuelLevel: 60 + Math.random() * 30,
      engineTemp: 75 + Math.random() * 10,
      lat: 28.6139 + (Math.random() - 0.5) * 0.05,
      lng: 77.209 + (Math.random() - 0.5) * 0.05,
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)]!,
      prevHealth: 'OK' as VehicleHealth,
    }));
  }

  subscribe(callback: (data: TelemetryTick[]) => void) {
    this.subscribers.add(callback);
    // Immediately send current state of all vehicles to new subscriber
    const currentStates = this.vehicles.map(v => this.createTick(v));
    callback(currentStates);
  }

  unsubscribe(callback: (data: TelemetryTick[]) => void) {
    this.subscribers.delete(callback);
  }

  private publish(data: TelemetryTick[]) {
    this.subscribers.forEach((cb) => cb(data));
  }
  
  private createTick(v: VehicleState): TelemetryTick {
    return {
      vehicleId: v.vehicleId,
      timestamp: new Date().toISOString(),
      speed: round2(v.speed),
      fuelLevel: round2(v.fuelLevel),
      engineTemp: round2(v.engineTemp),
      status: v.status,
      health: v.prevHealth,
      eventType: 'UPDATE', // Default, real events are handled during interval
      lat: v.lat,
      lng: v.lng,
    };
  }

  // simulate live feed data generation
  async init() {
    if (this.intervalId) return; // prevent double-init

    // Upsert vehicles before starting the interval
    for (const v of this.vehicles) {
      await prisma.vehicle.upsert({
        where: { id: v.vehicleId },
        update: { status: v.status, health: v.prevHealth },
        create: { id: v.vehicleId, status: v.status, health: v.prevHealth },
      });
    }

    this.intervalId = setInterval(() => {
      if (this.subscribers.size === 0) return;
      // emit a tick for a random number of vehicles each interval
      const count = 1 + Math.floor(Math.random() * this.vehicles.length);
      const shuffled = [...this.vehicles].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, count);

      const batchUpdates: TelemetryTick[] = [];

      for (const v of selected) {
        // Realistic State Machine (Status transitions)
        const r = Math.random();
        if (v.status === 'STANDBY') {
          if (r < 0.1) v.status = 'INTRANSIT';
        } else if (v.status === 'INTRANSIT') {
          if (r < 0.05) v.status = 'IDLE';
          else if (r < 0.1) v.status = 'STANDBY';
        } else if (v.status === 'IDLE') {
          if (r < 0.1) v.status = 'INTRANSIT';
        }
        // NOTE: OUTOFSERVICE transitions are now strictly handled by health rules below.

        // drift metrics realistically
        if (v.status === 'INTRANSIT') {
          v.speed = clamp(v.speed + (Math.random() - 0.5) * 10, 20, 120);
          v.fuelLevel = clamp(v.fuelLevel - Math.random() * 0.5, 0, 100);
          
          // Slight upward bias to engine temperature to simulate eventual overheating
          // Max delta is +2.4, min is -1.6, ensuring it must pass through WARN (90-100) before CRITICAL (>100)
          v.engineTemp = clamp(v.engineTemp + (Math.random() - 0.4) * 4, 80, 115);
          
          v.lat += (Math.random() - 0.5) * 0.002;
          v.lng += (Math.random() - 0.5) * 0.002;
        } else {
          v.speed = 0;
          // Cool down when not moving
          v.engineTemp = clamp(v.engineTemp - 2, 75, 115);
        }

        const health = deriveHealth(v.engineTemp);
        const eventType = deriveEventType(v.prevHealth, health);
        v.prevHealth = health;

        // Apply strict health-based status rules
        if (health === 'CRITICAL' && v.status !== 'OUTOFSERVICE') {
          v.status = 'OUTOFSERVICE';
        } else if (health === 'OK' && v.status === 'OUTOFSERVICE') {
          v.status = 'STANDBY';
        }

        const payload: TelemetryTick = {
          vehicleId: v.vehicleId,
          timestamp: new Date().toISOString(),
          speed: round2(v.speed),
          fuelLevel: round2(v.fuelLevel),
          engineTemp: round2(v.engineTemp),
          status: v.status,
          health,
          eventType,
          lat: v.lat,
          lng: v.lng,
        };

        batchUpdates.push(payload);

        // Asynchronously insert into database
        prisma.telemetry.create({
          data: {
            vehicleId: payload.vehicleId,
            timestamp: new Date(payload.timestamp),
            speed: payload.speed,
            fuelLevel: payload.fuelLevel,
            engineTemp: payload.engineTemp,
            status: payload.status,
            health: payload.health,
            eventType: payload.eventType,
            lat: payload.lat,
            lng: payload.lng,
          }
        }).catch((err: any) => console.error('[DB Error] Failed to insert telemetry:', err));
      }
      
      this.publish(batchUpdates);
    }, env.LIVE_FEED_INTERVAL_MS);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// ---- helpers ----

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function round2(val: number) {
  return Math.round(val * 100) / 100;
}

function deriveHealth(engineTemp: number): VehicleHealth {
  if (engineTemp > 100) return 'CRITICAL';
  if (engineTemp > 90) return 'WARN';
  return 'OK';
}

function deriveEventType(prev: VehicleHealth, curr: VehicleHealth): TelemetryEventType {
  const severity: Record<VehicleHealth, number> = { OK: 0, WARN: 1, CRITICAL: 2 };
  if (severity[curr] > severity[prev]) return 'ALERT';
  if (severity[curr] < severity[prev]) return 'RECOVERY';
  return 'UPDATE';
}
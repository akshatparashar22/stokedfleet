import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/v1/telemetry/summary
router.get('/summary', async (req, res, next) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const aggregations = await prisma.telemetry.groupBy({
      by: ['vehicleId'],
      where: { timestamp: { gte: fiveMinutesAgo } },
      _avg: {
        speed: true,
        engineTemp: true,
      },
      _min: {
        fuelLevel: true,
      }
    });

    res.json({ status: 'ok', data: aggregations });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/telemetry/:vehicleId — get latest telemetry for a vehicle
router.get('/:vehicleId', (req, res) => {
  res.json({ status: 'ok', data: { vehicleId: req.params.vehicleId, telemetry: {} } });
});

// GET /api/v1/telemetry/:vehicleId/history — get telemetry history
router.get('/:vehicleId/history', (req, res) => {
  res.json({ status: 'ok', data: { vehicleId: req.params.vehicleId, history: [] } });
});

// POST /api/v1/telemetry — ingest telemetry data point(s)
router.post('/', (_req, res) => {
  res.status(201).json({ status: 'ok', message: 'Telemetry ingested' });
});

export default router;

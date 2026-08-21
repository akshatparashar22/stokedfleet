import { Router } from 'express';

const router = Router();

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

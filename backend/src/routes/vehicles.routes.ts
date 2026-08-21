import { Router } from 'express';

const router = Router();

// GET /api/v1/vehicles — list all vehicles
router.get('/', (_req, res) => {
  res.json({ status: 'ok', data: [] });
});

// GET /api/v1/vehicles/:id — get a single vehicle
router.get('/:id', (req, res) => {
  res.json({ status: 'ok', data: { id: req.params.id } });
});

// POST /api/v1/vehicles — register a new vehicle
router.post('/', (_req, res) => {
  res.status(201).json({ status: 'ok', message: 'Vehicle registered' });
});

// PATCH /api/v1/vehicles/:id — update vehicle metadata
router.patch('/:id', (req, res) => {
  res.json({ status: 'ok', message: `Vehicle ${req.params.id} updated` });
});

// DELETE /api/v1/vehicles/:id — decommission a vehicle
router.delete('/:id', (req, res) => {
  res.json({ status: 'ok', message: `Vehicle ${req.params.id} removed` });
});

export default router;

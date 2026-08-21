import { Router } from 'express';

const router = Router();

// GET /api/v1/alerts — list active alerts
router.get('/', (_req, res) => {
  res.json({ status: 'ok', data: [] });
});

// PATCH /api/v1/alerts/:id/acknowledge — acknowledge an alert
router.patch('/:id/acknowledge', (req, res) => {
  res.json({ status: 'ok', message: `Alert ${req.params.id} acknowledged` });
});

export default router;

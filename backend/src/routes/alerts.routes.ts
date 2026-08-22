import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/v1/alerts — list active alerts
router.get('/', async (req, res, next) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const alerts = await prisma.telemetry.findMany({
      where: { 
        eventType: 'ALERT',
        timestamp: { gte: fiveMinutesAgo }
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    res.json({ status: 'ok', data: alerts });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/alerts/:id/acknowledge — acknowledge an alert
router.patch('/:id/acknowledge', (req, res) => {
  res.json({ status: 'ok', message: `Alert ${req.params.id} acknowledged` });
});

export default router;

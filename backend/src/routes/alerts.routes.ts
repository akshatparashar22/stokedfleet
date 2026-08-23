import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/v1/alerts — list active alerts
router.get('/', async (req, res, next) => {
  try {
    const isHistory = req.query.tab === 'history';
    
    const alerts = await prisma.alert.findMany({
      where: { acknowledged: isHistory },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ status: 'ok', data: alerts });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/alerts/:id/acknowledge — acknowledge an alert
router.patch('/:id/acknowledge', async (req, res, next) => {
  try {
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: { acknowledged: true }
    });
    res.json({ status: 'ok', message: `Alert acknowledged`, data: alert });
  } catch (error) {
    next(error);
  }
});

export default router;

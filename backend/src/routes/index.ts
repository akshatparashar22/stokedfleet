import { Router } from 'express';
import healthRoutes from './health.routes.js';
import vehicleRoutes from './vehicles.routes.js';
import telemetryRoutes from './telemetry.routes.js';
import alertRoutes from './alerts.routes.js';
import authRoutes from './auth.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Protected routes
router.use('/vehicles', authenticate, vehicleRoutes);
router.use('/telemetry', authenticate, telemetryRoutes);
router.use('/alerts', authenticate, alertRoutes);

export default router;

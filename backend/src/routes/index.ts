import { Router } from 'express';
import healthRoutes from './health.routes.js';
import vehicleRoutes from './vehicles.routes.js';
import telemetryRoutes from './telemetry.routes.js';
import alertRoutes from './alerts.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/telemetry', telemetryRoutes);
router.use('/alerts', alertRoutes);

export default router;

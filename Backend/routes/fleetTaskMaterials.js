import express from 'express';
import { createFleetTaskMaterial, getMaterialsByFleetTask } from '../controllers/fleetTaskMaterialController.js';

const router = express.Router();

router.post('/', createFleetTaskMaterial);
router.get('/task/:fleetTaskId', getMaterialsByFleetTask);

export default router;
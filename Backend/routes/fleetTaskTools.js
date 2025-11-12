import express from 'express';
import { createFleetTaskTool, getToolsByFleetTask } from '../controllers/fleetTaskToolController.js';

const router = express.Router();

router.post('/', createFleetTaskTool);
router.get('/task/:fleetTaskId', getToolsByFleetTask);

export default router;
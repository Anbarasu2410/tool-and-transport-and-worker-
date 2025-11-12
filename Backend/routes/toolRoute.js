import express from 'express';
import { 
  getAllTools, 
  getToolById, 
  createTool, 
  updateTool, 
  deleteTool 
} from '../controllers/toolController.js';

const router = express.Router();

// GET /api/tools - Get all tools
router.get('/', getAllTools);

// GET /api/tools/:id - Get tool by ID
router.get('/:id', getToolById);

// POST /api/tools - Create new tool
router.post('/', createTool);

// PUT /api/tools/:id - Update tool
router.put('/:id', updateTool);

// DELETE /api/tools/:id - Delete tool
router.delete('/:id', deleteTool);

export default router;
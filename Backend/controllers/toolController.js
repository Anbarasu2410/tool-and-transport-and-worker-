import Tool from '../models/Tool.js';

// GET /api/tools - Get all tools from Tools collection
export const getAllTools = async (req, res) => {
  try {
    const tools = await Tool.find({});
    
    console.log('Tools from Tools collection:', tools);
    
    res.json({
      success: true,
      data: tools,
      message: 'Tools fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tools',
      error: error.message
    });
  }
};

// GET /api/tools/:id - Get tool by ID
export const getToolById = async (req, res) => {
  try {
    const { id } = req.params;
    
    let tool;
    if (id.match(/^[0-9]+$/)) {
      tool = await Tool.findOne({ id: parseInt(id) });
    } else {
      tool = await Tool.findById(id);
    }

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Tool not found'
      });
    }

    res.json({
      success: true,
      data: tool,
      message: 'Tool fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching tool:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tool',
      error: error.message
    });
  }
};

// POST /api/tools - Create new tool
export const createTool = async (req, res) => {
  try {
    const { name, description, category, status } = req.body;
    
    // Generate sequential ID
    const lastTool = await Tool.findOne().sort({ id: -1 });
    const newId = lastTool ? lastTool.id + 1 : 1;

    const tool = new Tool({
      id: newId,
      name,
      description,
      category,
      status: status || 'AVAILABLE'
    });

    const savedTool = await tool.save();

    res.status(201).json({
      success: true,
      data: savedTool,
      message: 'Tool created successfully'
    });
  } catch (error) {
    console.error('Error creating tool:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tool',
      error: error.message
    });
  }
};

// PUT /api/tools/:id - Update tool
export const updateTool = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    let updatedTool;
    if (id.match(/^[0-9]+$/)) {
      updatedTool = await Tool.findOneAndUpdate(
        { id: parseInt(id) },
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      updatedTool = await Tool.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!updatedTool) {
      return res.status(404).json({
        success: false,
        message: 'Tool not found'
      });
    }

    res.json({
      success: true,
      data: updatedTool,
      message: 'Tool updated successfully'
    });
  } catch (error) {
    console.error('Error updating tool:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tool',
      error: error.message
    });
  }
};

// DELETE /api/tools/:id - Delete tool
export const deleteTool = async (req, res) => {
  try {
    const { id } = req.params;
    
    let deletedTool;
    if (id.match(/^[0-9]+$/)) {
      deletedTool = await Tool.findOneAndDelete({ id: parseInt(id) });
    } else {
      deletedTool = await Tool.findByIdAndDelete(id);
    }

    if (!deletedTool) {
      return res.status(404).json({
        success: false,
        message: 'Tool not found'
      });
    }

    res.json({
      success: true,
      message: 'Tool deleted successfully',
      data: deletedTool
    });
  } catch (error) {
    console.error('Error deleting tool:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tool',
      error: error.message
    });
  }
};
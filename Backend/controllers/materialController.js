import Material from '../models/Material.js';

// GET /api/materials - Get all materials from Materials collection
export const getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find({});
    
    console.log('Materials from Materials collection:', materials);
    
    res.json({
      success: true,
      data: materials,
      message: 'Materials fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch materials',
      error: error.message
    });
  }
};
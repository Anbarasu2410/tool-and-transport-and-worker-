import mongoose from 'mongoose';

const fleetTaskMaterialSchema = new mongoose.Schema({
  id:{
     type: Number,
  },
  fleetTaskId: {
    type: Number,
    required: true
  },

  materialId: {
    type: Number,
    required: true
  },
  
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'fleetTaskMaterials',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});





const FleetTaskMaterial = mongoose.model('FleetTaskMaterial', fleetTaskMaterialSchema);
export default FleetTaskMaterial;
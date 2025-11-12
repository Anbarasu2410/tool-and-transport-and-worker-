import mongoose from 'mongoose';

const fleetTaskToolSchema = new mongoose.Schema({
    id:{  
    type: Number,
      },
  fleetTaskId: {
    type: Number,
    required: true
  },
  toolId: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
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
  collection: 'fleetTaskTools',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});



const FleetTaskTool = mongoose.model('FleetTaskTool', fleetTaskToolSchema);
export default FleetTaskTool;
import mongoose from 'mongoose';

const toolSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    default: 'GENERAL'
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DAMAGED'],
    default: 'AVAILABLE'
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
  collection: 'tools',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Auto-generate sequential ID before saving
toolSchema.pre('save', async function(next) {
  if (this.isNew && !this.id) {
    try {
      const lastTool = await this.constructor.findOne({}, {}, { sort: { id: -1 } });
      this.id = lastTool ? lastTool.id + 1 : 1;
    } catch (error) {
      console.error('Error generating sequential ID for tool:', error);
      this.id = 1;
    }
  }
  next();
});

const Tool = mongoose.model('Tool', toolSchema);
export default Tool;
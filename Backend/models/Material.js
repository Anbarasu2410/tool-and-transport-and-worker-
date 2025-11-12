// models/Material.js
import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
    id:{
    type: Number,
    required: true
    },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  unit: {
    type: String
  }
}, {
  timestamps: true
});

const Material = mongoose.model('Material', materialSchema);
export default Material;
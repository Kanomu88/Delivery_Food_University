import mongoose from 'mongoose';

const canteenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Canteen name is required'],
    trim: true,
  },
  nameEn: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  descriptionEn: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
  },
  location: {
    type: String,
    trim: true,
  },
  building: {
    type: String,
    trim: true,
  },
  floor: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes
canteenSchema.index({ isActive: 1 });
canteenSchema.index({ order: 1 });
canteenSchema.index({ name: 'text', description: 'text' });

const Canteen = mongoose.model('Canteen', canteenSchema);

export default Canteen;

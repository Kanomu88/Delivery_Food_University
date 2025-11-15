import mongoose from 'mongoose';

const reportRequestSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending',
  },
  reportData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  processedAt: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

reportRequestSchema.index({ vendorId: 1 });
reportRequestSchema.index({ status: 1 });
reportRequestSchema.index({ createdAt: -1 });

const ReportRequest = mongoose.model('ReportRequest', reportRequestSchema);

export default ReportRequest;

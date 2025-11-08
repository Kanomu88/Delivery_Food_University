import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  method: {
    type: String,
    enum: ['qr_code', 'debit_card'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
  },
  gateway: {
    type: String,
    default: 'primary',
  },
  attempts: {
    type: Number,
    default: 1,
  },
  errors: [{
    gateway: String,
    attempt: Number,
    error: String,
    timestamp: Date,
  }],
  errorMessage: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;

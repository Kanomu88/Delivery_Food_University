import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import Vendor from '../models/Vendor.js';
import { sendNotification } from '../services/notificationService.js';
import { 
  initiatePaymentWithRetry, 
  getPaymentErrorMessage,
  mockPaymentProcess 
} from '../services/paymentService.js';

// Initiate payment
export const initiatePayment = async (req, res) => {
  try {
    const { orderId, method } = req.body;

    // Validate order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    // Check if user owns this order
    if (order.customerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'You do not have permission to pay for this order',
        },
      });
    }

    // Check order status
    if (order.status !== 'pending_payment') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Order is not pending payment',
        },
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ orderId, status: { $in: ['pending', 'success'] } });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Payment already initiated for this order',
        },
      });
    }

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`.toUpperCase();

    // Prepare payment data
    const paymentData = {
      transactionId,
      amount: order.totalAmount,
      method,
    };

    // Process payment with retry logic and automatic failover
    // Using mock payment for development - replace with actual gateway in production
    const paymentResult = await mockPaymentProcess(paymentData);
    // For production, use: const paymentResult = await initiatePaymentWithRetry(paymentData);

    if (!paymentResult.success) {
      // Payment failed after all retries
      const userFriendlyMessage = getPaymentErrorMessage(paymentResult.errors);

      // Create failed payment record
      const failedPayment = await Payment.create({
        orderId,
        amount: order.totalAmount,
        method,
        status: 'failed',
        transactionId,
        errors: paymentResult.errors || [],
        errorMessage: userFriendlyMessage,
        attempts: paymentResult.errors ? paymentResult.errors.length : 1,
      });

      return res.status(503).json({
        success: false,
        error: {
          code: 'PAYMENT_ERROR',
          message: userFriendlyMessage,
          details: {
            paymentId: failedPayment._id,
            canRetry: true,
          },
        },
      });
    }

    // Payment initiated successfully
    const payment = await Payment.create({
      orderId,
      amount: order.totalAmount,
      method,
      status: 'pending',
      transactionId,
      gateway: paymentResult.gateway,
      attempts: paymentResult.attempts || 1,
      errors: paymentResult.errors || [],
      gatewayResponse: paymentResult.data,
    });

    // Prepare response data
    const responseData = {
      paymentId: payment._id,
      transactionId: payment.transactionId,
      amount: payment.amount,
      method: payment.method,
      gateway: payment.gateway,
      ...paymentResult.data,
    };

    res.status(201).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Error initiating payment',
      },
    });
  }
};

// Verify payment (webhook/callback from payment gateway)
export const verifyPayment = async (req, res) => {
  try {
    const { transactionId, status, gatewayResponse, errorDetails } = req.body;

    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Payment not found',
        },
      });
    }

    // Update payment status
    payment.status = status === 'success' ? 'success' : 'failed';
    payment.gatewayResponse = gatewayResponse;

    // Store error information if payment failed
    if (status === 'failed' && errorDetails) {
      if (!payment.errors) {
        payment.errors = [];
      }
      payment.errors.push({
        gateway: payment.gateway,
        attempt: payment.attempts + 1,
        error: errorDetails.message || 'Payment verification failed',
        timestamp: new Date(),
      });
      payment.attempts += 1;
      payment.errorMessage = getPaymentErrorMessage(payment.errors);
    }

    await payment.save();

    // Update order status if payment successful
    if (payment.status === 'success') {
      const order = await Order.findById(payment.orderId);
      if (order) {
        order.status = 'paid';
        await order.save();

        // Notify customer of successful payment
        const io = req.app.get('io');
        if (io) {
          await sendNotification(
            io,
            order.customerId,
            'payment',
            'Payment Successful',
            `Your payment for order ${order.orderNumber} was successful`,
            order._id
          );

          // Notify vendor of new paid order
          const vendor = await Vendor.findById(order.vendorId);
          if (vendor) {
            await sendNotification(
              io,
              vendor.userId,
              'order_status',
              'New Order Received',
              `New order ${order.orderNumber} received`,
              order._id
            );
            
            // Emit real-time event to vendor
            await order.populate('customerId', 'username phone');
            io.to(`user:${vendor.userId}`).emit('order:new', order);
          }
        }
      }
    }

    res.json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error verifying payment',
      },
    });
  }
};

// Get payment details
export const getPaymentByOrderId = async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId }).sort({ createdAt: -1 });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Payment not found',
        },
      });
    }

    // Check if user has permission to view this payment
    const order = await Order.findById(payment.orderId);
    if (order.customerId.toString() !== req.user.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'You do not have permission to view this payment',
        },
      });
    }

    res.json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching payment',
      },
    });
  }
};

// Retry failed payment
export const retryPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Find the failed payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Payment not found',
        },
      });
    }

    // Verify order ownership
    const order = await Order.findById(payment.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    if (order.customerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'You do not have permission to retry this payment',
        },
      });
    }

    // Check if payment can be retried
    if (payment.status === 'success') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payment already successful',
        },
      });
    }

    if (order.status !== 'pending_payment') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Order is not pending payment',
        },
      });
    }

    // Prepare payment data for retry
    const paymentData = {
      transactionId: payment.transactionId,
      amount: payment.amount,
      method: payment.method,
    };

    // Retry payment with retry logic
    const paymentResult = await mockPaymentProcess(paymentData);
    // For production, use: const paymentResult = await initiatePaymentWithRetry(paymentData);

    if (!paymentResult.success) {
      // Payment failed again
      const userFriendlyMessage = getPaymentErrorMessage(paymentResult.errors);

      // Update payment record with new errors
      payment.status = 'failed';
      payment.errors = [...(payment.errors || []), ...(paymentResult.errors || [])];
      payment.errorMessage = userFriendlyMessage;
      payment.attempts += paymentResult.errors ? paymentResult.errors.length : 1;
      await payment.save();

      return res.status(503).json({
        success: false,
        error: {
          code: 'PAYMENT_ERROR',
          message: userFriendlyMessage,
          details: {
            paymentId: payment._id,
            canRetry: true,
            totalAttempts: payment.attempts,
          },
        },
      });
    }

    // Payment retry successful
    payment.status = 'pending';
    payment.gateway = paymentResult.gateway;
    payment.attempts += paymentResult.attempts || 1;
    if (paymentResult.errors && paymentResult.errors.length > 0) {
      payment.errors = [...(payment.errors || []), ...paymentResult.errors];
    }
    payment.gatewayResponse = paymentResult.data;
    await payment.save();

    // Prepare response data
    const responseData = {
      paymentId: payment._id,
      transactionId: payment.transactionId,
      amount: payment.amount,
      method: payment.method,
      gateway: payment.gateway,
      ...paymentResult.data,
    };

    res.json({
      success: true,
      message: 'Payment retry initiated successfully',
      data: responseData,
    });
  } catch (error) {
    console.error('Retry payment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error retrying payment',
      },
    });
  }
};

// Mock payment success (for testing only - remove in production)
export const mockPaymentSuccess = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    // Check if user owns this order
    if (order.customerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'You do not have permission',
        },
      });
    }

    // Create or update payment
    let payment = await Payment.findOne({ orderId });
    if (!payment) {
      payment = await Payment.create({
        orderId,
        amount: order.totalAmount,
        method: 'qr_code',
        status: 'success',
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`.toUpperCase(),
      });
    } else {
      payment.status = 'success';
      await payment.save();
    }

    // Update order status
    order.status = 'paid';
    await order.save();

    // Send notifications
    const io = req.app.get('io');
    if (io) {
      // Notify customer
      await sendNotification(
        io,
        order.customerId,
        'payment',
        'Payment Successful',
        `Your payment for order ${order.orderNumber} was successful`,
        order._id
      );

      // Notify vendor
      const vendor = await Vendor.findById(order.vendorId);
      if (vendor) {
        await sendNotification(
          io,
          vendor.userId,
          'order_status',
          'New Order Received',
          `New order ${order.orderNumber} received`,
          order._id
        );
        
        // Emit real-time event to vendor
        await order.populate('customerId', 'username phone');
        io.to(`user:${vendor.userId}`).emit('order:new', order);
      }
    }

    res.json({
      success: true,
      message: 'Payment marked as successful',
      data: { payment, order },
    });
  } catch (error) {
    console.error('Mock payment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error processing mock payment',
      },
    });
  }
};

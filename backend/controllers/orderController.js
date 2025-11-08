import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Vendor from '../models/Vendor.js';
import { sendNotification } from '../services/notificationService.js';

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `ORD-${timestamp}-${random}`.toUpperCase();
};

// Create new order
export const createOrder = async (req, res) => {
  try {
    const { vendorId, items, pickupTime, specialRequests } = req.body;

    // Validate vendor
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Vendor not found',
        },
      });
    }

    if (!vendor.isAcceptingOrders) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Vendor is not accepting orders at this time',
        },
      });
    }

    // Validate and calculate items
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Menu item ${item.menuItemId} is not available`,
          },
        });
      }

      if (menuItem.vendorId.toString() !== vendorId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'All items must be from the same vendor',
          },
        });
      }

      const subtotal = menuItem.price * item.quantity;
      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        subtotal,
      });
      totalAmount += subtotal;
    }

    // Validate pickup time (at least 15 minutes from now)
    const minPickupTime = new Date(Date.now() + 15 * 60 * 1000);
    if (new Date(pickupTime) < minPickupTime) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Pickup time must be at least 15 minutes from now',
        },
      });
    }

    // Create order
    const order = await Order.create({
      customerId: req.user.userId,
      vendorId,
      orderNumber: generateOrderNumber(),
      status: 'pending_payment',
      items: orderItems,
      totalAmount,
      pickupTime,
      specialRequests,
    });

    // Populate order for response
    await order.populate('customerId', 'username phone');
    await order.populate('vendorId', 'shopName');

    res.status(201).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Error creating order',
      },
    });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = { customerId: req.user.userId };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await Order.find(query)
      .populate('vendorId', 'shopName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching orders',
      },
    });
  }
};

// Get vendor's orders
export const getVendorOrders = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Vendor profile not found',
        },
      });
    }

    const query = { vendorId: vendor._id };
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await Order.find(query)
      .populate('customerId', 'username phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ pickupTime: 1 });

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching orders',
      },
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'username email phone')
      .populate('vendorId', 'shopName');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    // Check if user has permission to view this order
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    const isCustomer = order.customerId._id.toString() === req.user.userId.toString();
    const isVendor = vendor && order.vendorId._id.toString() === vendor._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isVendor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'You do not have permission to view this order',
        },
      });
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching order',
      },
    });
  }
};

// Update order status (vendor only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    // Check if user owns this order's vendor
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor || order.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'You do not have permission to update this order',
        },
      });
    }

    // Validate status transition
    const validTransitions = {
      paid: ['preparing'],
      preparing: ['ready'],
      ready: ['completed'],
    };

    if (!validTransitions[order.status] || !validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Cannot transition from ${order.status} to ${status}`,
        },
      });
    }

    order.status = status;
    await order.save();

    // Send notification to customer
    const io = req.app.get('io');
    const statusMessages = {
      preparing: 'Your order is being prepared',
      ready: 'Your order is ready for pickup!',
      completed: 'Your order has been completed',
    };

    if (io && statusMessages[status]) {
      await sendNotification(
        io,
        order.customerId,
        'order_status',
        'Order Status Updated',
        statusMessages[status],
        order._id
      );
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error updating order status',
      },
    });
  }
};

// Cancel order (customer only, before payment)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

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
          message: 'You do not have permission to cancel this order',
        },
      });
    }

    // Can only cancel if status is pending_payment
    if (order.status !== 'pending_payment') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Order can only be cancelled before payment',
        },
      });
    }

    order.status = 'cancelled';
    await order.save();

    // Notify vendor
    const io = req.app.get('io');
    const vendor = await Vendor.findById(order.vendorId);
    if (io && vendor) {
      await sendNotification(
        io,
        vendor.userId,
        'order_status',
        'Order Cancelled',
        `Order ${order.orderNumber} has been cancelled by the customer`,
        order._id
      );
      
      // Emit real-time event to vendor
      io.to(`user:${vendor.userId}`).emit('order:cancelled', { orderId: order._id, orderNumber: order.orderNumber });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order },
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error cancelling order',
      },
    });
  }
};

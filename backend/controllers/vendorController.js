import Vendor from '../models/Vendor.js';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';

// Create vendor profile
export const createVendor = async (req, res) => {
  try {
    const { shopName, description, logo, operatingHours } = req.body;

    // Check if vendor already exists for this user
    const existingVendor = await Vendor.findOne({ userId: req.user.userId });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Vendor profile already exists',
        },
      });
    }

    const vendor = await Vendor.create({
      userId: req.user.userId,
      shopName,
      description,
      logo,
      operatingHours,
    });

    res.status(201).json({
      success: true,
      data: { vendor },
    });
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Error creating vendor profile',
      },
    });
  }
};

// Get vendor by ID
export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('userId', 'username email');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Vendor not found',
        },
      });
    }

    res.json({
      success: true,
      data: { vendor },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching vendor',
      },
    });
  }
};

// Update vendor profile
export const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Vendor not found',
        },
      });
    }

    // Check if user owns this vendor profile
    if (vendor.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'You do not have permission to update this vendor profile',
        },
      });
    }

    // Update fields
    const allowedFields = ['shopName', 'description', 'logo', 'operatingHours'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        vendor[field] = req.body[field];
      }
    });

    await vendor.save();

    res.json({
      success: true,
      data: { vendor },
    });
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error updating vendor profile',
      },
    });
  }
};

// Toggle order acceptance status
export const toggleOrderAcceptance = async (req, res) => {
  try {
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

    vendor.isAcceptingOrders = !vendor.isAcceptingOrders;
    await vendor.save();

    res.json({
      success: true,
      data: { 
        vendor,
        message: vendor.isAcceptingOrders ? 'Now accepting orders' : 'Stopped accepting orders',
      },
    });
  } catch (error) {
    console.error('Toggle order acceptance error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error toggling order acceptance',
      },
    });
  }
};

// Get vendor dashboard data
export const getVendorDashboard = async (req, res) => {
  try {
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

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's orders
    const todayOrders = await Order.find({
      vendorId: vendor._id,
      createdAt: { $gte: today, $lt: tomorrow },
      status: { $ne: 'cancelled' },
    });

    // Calculate today's revenue
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get pending orders count
    const pendingOrdersCount = await Order.countDocuments({
      vendorId: vendor._id,
      status: { $in: ['paid', 'preparing'] },
    });

    // Get popular menu items (top 5)
    const popularMenus = await Order.aggregate([
      { $match: { vendorId: vendor._id, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItemId',
          name: { $first: '$items.name' },
          totalOrders: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      data: {
        todayOrdersCount: todayOrders.length,
        todayRevenue,
        pendingOrdersCount,
        popularMenus,
      },
    });
  } catch (error) {
    console.error('Get vendor dashboard error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching vendor dashboard data',
      },
    });
  }
};

// Get sales report
export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

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

    const query = {
      vendorId: vendor._id,
      status: { $ne: 'cancelled' },
    };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const orders = await Order.find(query);

    // Calculate totals
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    // Group by date
    const salesByDate = orders.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, orders: 0 };
      }
      acc[date].revenue += order.totalAmount;
      acc[date].orders += 1;
      return acc;
    }, {});

    const dailySales = Object.values(salesByDate).sort((a, b) => new Date(a.date) - new Date(b.date));
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        dailySales: dailySales.map(day => ({
          date: day.date,
          revenue: day.revenue,
          orders: day.orders,
        })),
      },
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching sales report',
      },
    });
  }
};

// Get popular menus
export const getPopularMenus = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

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

    const matchQuery = {
      vendorId: vendor._id,
      status: { $ne: 'cancelled' },
    };

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchQuery.createdAt.$lte = end;
      }
    }

    const popularMenus = await Order.aggregate([
      { $match: matchQuery },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItemId',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) },
    ]);

    res.json({
      success: true,
      data: { popularMenus },
    });
  } catch (error) {
    console.error('Get popular menus error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching popular menus',
      },
    });
  }
};

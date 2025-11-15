import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Order from '../models/Order.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select('-password -refreshToken')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching users',
      },
    });
  }
};

// Ban/unban user
export const toggleUserBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    // Cannot ban admin users
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cannot ban admin users',
        },
      });
    }

    // Toggle ban status
    user.status = user.status === 'banned' ? 'active' : 'banned';
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    res.json({
      success: true,
      message: user.status === 'banned' ? 'User banned successfully' : 'User unbanned successfully',
      data: { user: userResponse },
    });
  } catch (error) {
    console.error('Toggle user ban error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error updating user status',
      },
    });
  }
};

// Get all vendors
export const getAllVendors = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.shopName = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const vendors = await Vendor.find(query)
      .populate('userId', 'username email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Vendor.countDocuments(query);

    res.json({
      success: true,
      data: {
        vendors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get all vendors error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching vendors',
      },
    });
  }
};

// Approve vendor
export const approveVendor = async (req, res) => {
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

    vendor.status = 'approved';
    await vendor.save();

    // TODO: Send notification to vendor

    res.json({
      success: true,
      message: 'Vendor approved successfully',
      data: { vendor },
    });
  } catch (error) {
    console.error('Approve vendor error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error approving vendor',
      },
    });
  }
};

// Suspend vendor
export const suspendVendor = async (req, res) => {
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

    vendor.status = 'suspended';
    await vendor.save();

    // TODO: Send notification to vendor

    res.json({
      success: true,
      message: 'Vendor suspended successfully',
      data: { vendor },
    });
  } catch (error) {
    console.error('Suspend vendor error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error suspending vendor',
      },
    });
  }
};

// Unsuspend vendor (reactivate)
export const unsuspendVendor = async (req, res) => {
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

    vendor.status = 'approved';
    await vendor.save();

    // TODO: Send notification to vendor

    res.json({
      success: true,
      message: 'Vendor unsuspended successfully',
      data: { vendor },
    });
  } catch (error) {
    console.error('Unsuspend vendor error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error unsuspending vendor',
      },
    });
  }
};

// Get all orders (admin view)
export const getAllOrders = async (req, res) => {
  try {
    const { status, vendorId, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (vendorId) query.vendorId = vendorId;
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
      .populate('customerId', 'username email')
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
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching orders',
      },
    });
  }
};

// Get system reports
export const getSystemReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateQuery.createdAt.$lte = end;
      }
    }

    // Get total users
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalVendorUsers = await User.countDocuments({ role: 'vendor' });

    // Get total vendors
    const totalVendors = await Vendor.countDocuments();
    const activeVendors = await Vendor.countDocuments({ status: 'approved' });
    const pendingVendors = await Vendor.countDocuments({ status: 'pending' });

    // Get orders data
    const orderQuery = { status: { $ne: 'cancelled' }, ...dateQuery };
    const totalOrders = await Order.countDocuments(orderQuery);
    const orders = await Order.find(orderQuery);
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
      status: { $ne: 'cancelled' },
    });

    const todayOrdersData = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow },
      status: { $ne: 'cancelled' },
    });
    const todayRevenue = todayOrdersData.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get orders by vendor
    const ordersByVendor = await Order.aggregate([
      { $match: orderQuery },
      {
        $group: {
          _id: '$vendorId',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    // Populate vendor names
    const vendorIds = ordersByVendor.map(item => item._id);
    const vendors = await Vendor.find({ _id: { $in: vendorIds } }).select('shopName');
    const vendorMap = vendors.reduce((acc, vendor) => {
      acc[vendor._id] = vendor.shopName;
      return acc;
    }, {});

    const topVendors = ordersByVendor.map(item => ({
      vendorId: item._id,
      vendorName: vendorMap[item._id] || 'Unknown',
      totalOrders: item.totalOrders,
      totalRevenue: item.totalRevenue,
    }));

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          vendors: totalVendorUsers,
        },
        vendors: {
          total: totalVendors,
          active: activeVendors,
          pending: pendingVendors,
        },
        orders: {
          total: totalOrders,
          today: todayOrders,
        },
        revenue: {
          total: totalRevenue,
          today: todayRevenue,
        },
        topVendors,
      },
    });
  } catch (error) {
    console.error('Get system reports error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching system reports',
      },
    });
  }
};

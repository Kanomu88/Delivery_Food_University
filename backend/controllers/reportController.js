import ReportRequest from '../models/ReportRequest.js';
import Vendor from '../models/Vendor.js';
import Order from '../models/Order.js';
import Menu from '../models/Menu.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// Vendor requests a report
export const requestReport = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find vendor by user ID
    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'VENDOR_NOT_FOUND',
          message: 'Vendor not found',
        },
      });
    }

    // Create report request
    const reportRequest = new ReportRequest({
      vendorId: vendor._id,
      requestedBy: userId,
      status: 'pending',
    });

    await reportRequest.save();

    // Find all admin users
    const adminUsers = await User.find({ role: 'admin' });
    
    // Send notification to all admins
    for (const admin of adminUsers) {
      await createNotification(
        admin._id,
        'report_request',
        'คำขอรายงานใหม่',
        `ร้าน ${vendor.name} ขอรายงานการขาย`,
        null
      );
    }

    res.json({
      success: true,
      data: { reportRequest },
    });
  } catch (error) {
    console.error('Request report error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to request report',
      },
    });
  }
};

// Get all report requests (Admin)
export const getReportRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const reportRequests = await ReportRequest.find(query)
      .populate('vendorId', 'name')
      .populate('requestedBy', 'name email')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ReportRequest.countDocuments(query);

    res.json({
      success: true,
      data: {
        reportRequests,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      },
    });
  } catch (error) {
    console.error('Get report requests error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch report requests',
      },
    });
  }
};

// Generate report data for a vendor (Admin)
export const generateReport = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { vendorId, startDate, endDate } = req.body;
    const adminId = req.user.id;

    // Find the report request
    const reportRequest = await ReportRequest.findById(requestId);
    if (!reportRequest) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REQUEST_NOT_FOUND',
          message: 'Report request not found',
        },
      });
    }

    // Get vendor data
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'VENDOR_NOT_FOUND',
          message: 'Vendor not found',
        },
      });
    }

    // Calculate date range (default to today)
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Get orders for the vendor in date range
    const orders = await Order.find({
      vendorId,
      status: 'completed',
      createdAt: { $gte: start, $lte: end },
    }).populate('items.menuId', 'name price');

    // Calculate sales data
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    // Get popular menus
    const menuStats = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const menuId = item.menuId?._id?.toString();
        if (menuId) {
          if (!menuStats[menuId]) {
            menuStats[menuId] = {
              menuId: item.menuId._id,
              name: item.menuId.name,
              price: item.menuId.price,
              quantity: 0,
              revenue: 0,
            };
          }
          menuStats[menuId].quantity += item.quantity;
          menuStats[menuId].revenue += item.quantity * item.price;
        }
      });
    });

    const popularMenus = Object.values(menuStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Prepare report data
    const reportData = {
      vendor: {
        id: vendor._id,
        name: vendor.name,
        location: vendor.location,
      },
      period: {
        startDate: start,
        endDate: end,
      },
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      },
      popularMenus,
      generatedAt: new Date(),
      generatedBy: adminId,
    };

    // Update report request
    reportRequest.status = 'completed';
    reportRequest.reportData = reportData;
    reportRequest.processedBy = adminId;
    reportRequest.processedAt = new Date();
    await reportRequest.save();

    // Notify vendor
    await createNotification(
      vendor.userId,
      'system',
      'รายงานของคุณพร้อมแล้ว',
      'แอดมินได้สร้างรายงานการขายสำหรับร้านของคุณแล้ว',
      null
    );

    res.json({
      success: true,
      data: { reportRequest, reportData },
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to generate report',
      },
    });
  }
};

// Update report data (Admin can edit)
export const updateReportData = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reportData } = req.body;

    const reportRequest = await ReportRequest.findById(requestId);
    if (!reportRequest) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REQUEST_NOT_FOUND',
          message: 'Report request not found',
        },
      });
    }

    reportRequest.reportData = {
      ...reportRequest.reportData,
      ...reportData,
      lastModifiedAt: new Date(),
      lastModifiedBy: req.user.id,
    };

    await reportRequest.save();

    res.json({
      success: true,
      data: { reportRequest },
    });
  } catch (error) {
    console.error('Update report data error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update report data',
      },
    });
  }
};

// Get report by ID
export const getReportById = async (req, res) => {
  try {
    const { requestId } = req.params;

    const reportRequest = await ReportRequest.findById(requestId)
      .populate('vendorId', 'name location')
      .populate('requestedBy', 'name email')
      .populate('processedBy', 'name');

    if (!reportRequest) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REQUEST_NOT_FOUND',
          message: 'Report request not found',
        },
      });
    }

    res.json({
      success: true,
      data: { reportRequest },
    });
  } catch (error) {
    console.error('Get report by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch report',
      },
    });
  }
};

// Get all vendors for report generation (Admin)
export const getVendorsForReport = async (req, res) => {
  try {
    const vendors = await Vendor.find({ isActive: true })
      .select('name location userId')
      .populate('userId', 'name email')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { vendors },
    });
  } catch (error) {
    console.error('Get vendors for report error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch vendors',
      },
    });
  }
};

import MenuItem from '../models/MenuItem.js';
import Vendor from '../models/Vendor.js';

// Create menu item (vendor only)
export const createMenuItem = async (req, res) => {
  try {
    const { name, nameEn, description, descriptionEn, price, category, allergenInfo, image } = req.body;

    // Get vendor for this user
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

    // Create menu item
    const menuItem = await MenuItem.create({
      vendorId: vendor._id,
      name,
      nameEn,
      description,
      descriptionEn,
      price,
      category,
      allergenInfo,
      image,
    });

    res.status(201).json({
      success: true,
      data: { menuItem },
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Error creating menu item',
      },
    });
  }
};

// Get vendor's own menu items
export const getVendorMenuItems = async (req, res) => {
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

    const menuItems = await MenuItem.find({ vendorId: vendor._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { menus: menuItems },
    });
  } catch (error) {
    console.error('Get vendor menu items error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching menu items',
      },
    });
  }
};

// Get all menu items with filters
export const getMenuItems = async (req, res) => {
  try {
    const { category, vendorId, minPrice, maxPrice, search, page = 1, limit = 20 } = req.query;

    const query = { isAvailable: true };

    // Apply filters
    if (category) query.category = category;
    if (vendorId) query.vendorId = vendorId;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameEn: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const menuItems = await MenuItem.find(query)
      .populate('vendorId', 'shopName isAcceptingOrders')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await MenuItem.countDocuments(query);

    res.json({
      success: true,
      data: {
        menuItems,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching menu items',
      },
    });
  }
};

// Get menu item by ID
export const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('vendorId', 'shopName description');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Menu item not found',
        },
      });
    }

    res.json({
      success: true,
      data: { menuItem },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching menu item',
      },
    });
  }
};

// Update menu item (vendor only)
export const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Menu item not found',
        },
      });
    }

    // Check if user owns this menu item
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor || menuItem.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'You do not have permission to update this menu item',
        },
      });
    }

    // Update fields
    const allowedFields = ['name', 'nameEn', 'description', 'descriptionEn', 'price', 'category', 'allergenInfo', 'image', 'isAvailable'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        menuItem[field] = req.body[field];
      }
    });

    await menuItem.save();

    res.json({
      success: true,
      data: { menuItem },
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error updating menu item',
      },
    });
  }
};

// Delete menu item (soft delete - vendor only)
export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Menu item not found',
        },
      });
    }

    // Check if user owns this menu item
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor || menuItem.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'You do not have permission to delete this menu item',
        },
      });
    }

    // Soft delete by setting isAvailable to false
    menuItem.isAvailable = false;
    await menuItem.save();

    res.json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error deleting menu item',
      },
    });
  }
};

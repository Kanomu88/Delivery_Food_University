import Canteen from '../models/Canteen.js';
import Vendor from '../models/Vendor.js';

// Get all canteens
export const getAllCanteens = async (req, res) => {
  try {
    const canteens = await Canteen.find({ isActive: true })
      .sort({ order: 1, name: 1 });
    
    res.json({
      success: true,
      data: canteens,
    });
  } catch (error) {
    console.error('Get canteens error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch canteens' },
    });
  }
};

// Get canteen by ID
export const getCanteenById = async (req, res) => {
  try {
    const { id } = req.params;
    const canteen = await Canteen.findById(id);
    
    if (!canteen) {
      return res.status(404).json({
        success: false,
        error: { message: 'Canteen not found' },
      });
    }
    
    res.json({
      success: true,
      data: canteen,
    });
  } catch (error) {
    console.error('Get canteen error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch canteen' },
    });
  }
};

// Get vendors by canteen ID
export const getVendorsByCanteen = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vendors = await Vendor.find({
      canteenId: id,
      status: 'approved',
    })
      .populate('userId', 'name email')
      .sort({ shopName: 1 });
    
    res.json({
      success: true,
      data: vendors,
    });
  } catch (error) {
    console.error('Get vendors by canteen error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch vendors' },
    });
  }
};

// Create canteen (Admin only)
export const createCanteen = async (req, res) => {
  try {
    const canteenData = req.body;
    const canteen = await Canteen.create(canteenData);
    
    res.status(201).json({
      success: true,
      data: canteen,
    });
  } catch (error) {
    console.error('Create canteen error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to create canteen' },
    });
  }
};

// Update canteen (Admin only)
export const updateCanteen = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const canteen = await Canteen.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!canteen) {
      return res.status(404).json({
        success: false,
        error: { message: 'Canteen not found' },
      });
    }
    
    res.json({
      success: true,
      data: canteen,
    });
  } catch (error) {
    console.error('Update canteen error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to update canteen' },
    });
  }
};

// Delete canteen (Admin only)
export const deleteCanteen = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if canteen has vendors
    const vendorCount = await Vendor.countDocuments({ canteenId: id });
    if (vendorCount > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete canteen with existing vendors' },
      });
    }
    
    const canteen = await Canteen.findByIdAndDelete(id);
    
    if (!canteen) {
      return res.status(404).json({
        success: false,
        error: { message: 'Canteen not found' },
      });
    }
    
    res.json({
      success: true,
      message: 'Canteen deleted successfully',
    });
  } catch (error) {
    console.error('Delete canteen error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete canteen' },
    });
  }
};

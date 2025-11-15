import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// MongoDB connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
  phone: String,
  address: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  image: String,
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  available: { type: Boolean, default: true },
  preparationTime: Number,
  tags: [String],
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    menu: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
    quantity: Number,
    price: Number,
    name: String,
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  pickupTime: { type: Date },
  specialRequests: String,
  deliveryAddress: String,
  notes: String,
}, { timestamps: true });

const canteenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameEn: String,
  description: String,
  descriptionEn: String,
  image: String,
  location: String,
  building: String,
  floor: String,
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const vendorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  canteenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Canteen' },
  shopName: { type: String, required: true },
  description: String,
  logo: String,
  status: { type: String, enum: ['pending', 'approved', 'suspended'], default: 'pending' },
  isAcceptingOrders: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Menu = mongoose.models.Menu || mongoose.model('Menu', menuSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
const Canteen = mongoose.models.Canteen || mongoose.model('Canteen', canteenSchema);
const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);

// Auth middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: { message: 'No token provided' } });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: { message: 'Invalid token' } });
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'University Canteen Backend API',
    status: 'running',
    version: '1.0.0'
  });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    await connectDB();
    const { email, password, name, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: { message: 'Email already exists' } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: role || 'customer'
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '15m'
    });

    res.status(201).json({
      success: true,
      data: {
        user: { id: user._id, email: user.email, name: user.name, role: user.role },
        accessToken: token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '15m'
    });

    res.json({
      success: true,
      data: {
        user: { id: user._id, email: user.email, name: user.name, role: user.role },
        accessToken: token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    }
  });
});

// Menu routes
app.get('/api/menus', async (req, res) => {
  try {
    await connectDB();
    const { category, search, available } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (available !== undefined) query.available = available === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const menus = await Menu.find(query)
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, data: menus, count: menus.length });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

app.get('/api/menus/vendor/my-menus', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ success: false, error: { message: 'Only vendors can access this' } });
    }

    // Find vendor profile
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, error: { message: 'Vendor profile not found' } });
    }

    // Get menus using vendorId
    const menus = await Menu.find({ vendorId: vendor._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: menus, count: menus.length });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Create menu
app.post('/api/menus', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ success: false, error: { message: 'Only vendors can create menus' } });
    }

    // Find vendor profile
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, error: { message: 'Vendor profile not found' } });
    }

    const menuData = {
      ...req.body,
      vendorId: vendor._id,
    };

    const menu = await Menu.create(menuData);
    res.status(201).json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Update menu
app.put('/api/menus/:id', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ success: false, error: { message: 'Only vendors can update menus' } });
    }

    // Find vendor profile
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, error: { message: 'Vendor profile not found' } });
    }

    // Check if menu belongs to vendor
    const menu = await Menu.findOne({ _id: req.params.id, vendorId: vendor._id });
    if (!menu) {
      return res.status(404).json({ success: false, error: { message: 'Menu not found or unauthorized' } });
    }

    const updatedMenu = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedMenu });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Delete menu
app.delete('/api/menus/:id', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ success: false, error: { message: 'Only vendors can delete menus' } });
    }

    // Find vendor profile
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, error: { message: 'Vendor profile not found' } });
    }

    // Check if menu belongs to vendor
    const menu = await Menu.findOne({ _id: req.params.id, vendorId: vendor._id });
    if (!menu) {
      return res.status(404).json({ success: false, error: { message: 'Menu not found or unauthorized' } });
    }

    await Menu.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Menu deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

app.get('/api/menus/:id', async (req, res) => {
  try {
    await connectDB();
    const menu = await Menu.findById(req.params.id).populate('vendorId', 'name location');
    
    if (!menu) {
      return res.status(404).json({ success: false, error: { message: 'Menu not found' } });
    }

    res.json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

app.post('/api/menus', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ success: false, error: { message: 'Only vendors can create menus' } });
    }

    const menu = await Menu.create({
      ...req.body,
      vendor: req.user._id
    });

    res.status(201).json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

app.put('/api/menus/:id', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ success: false, error: { message: 'Only vendors can update menus' } });
    }

    const menu = await Menu.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!menu) {
      return res.status(404).json({ success: false, error: { message: 'Menu not found' } });
    }

    Object.assign(menu, req.body);
    await menu.save();

    res.json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

app.delete('/api/menus/:id', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ success: false, error: { message: 'Only vendors can delete menus' } });
    }

    const menu = await Menu.findOneAndDelete({ _id: req.params.id, vendor: req.user._id });
    if (!menu) {
      return res.status(404).json({ success: false, error: { message: 'Menu not found' } });
    }

    res.json({ success: true, message: 'Menu deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Order routes
app.post('/api/orders', authenticate, async (req, res) => {
  try {
    await connectDB();
    const { vendorId, items, pickupTime, specialRequests } = req.body;

    // Get menu items and calculate total
    const menuIds = items.map(item => item.menuItemId);
    const menus = await Menu.find({ _id: { $in: menuIds } });
    
    let totalAmount = 0;
    const orderItems = items.map(item => {
      const menu = menus.find(m => m._id.toString() === item.menuItemId);
      if (!menu) throw new Error('Menu item not found');
      
      const itemTotal = menu.price * item.quantity;
      totalAmount += itemTotal;
      
      return {
        menu: menu._id,
        name: menu.name,
        quantity: item.quantity,
        price: menu.price,
      };
    });

    const order = await Order.create({
      user: req.user._id,
      vendor: vendorId,
      items: orderItems,
      totalAmount,
      pickupTime: pickupTime ? new Date(pickupTime) : null,
      specialRequests,
      status: 'pending',
      paymentStatus: 'pending',
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('items.menu')
      .populate('vendor', 'name email phone');

    res.status(201).json({ success: true, data: { order: populatedOrder } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

app.get('/api/orders', authenticate, async (req, res) => {
  try {
    await connectDB();
    const orders = await Order.find({ user: req.user._id })
      .populate('items.menu')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

app.get('/api/orders/:id', authenticate, async (req, res) => {
  try {
    await connectDB();
    const order = await Order.findById(req.params.id)
      .populate('items.menu')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, error: { message: 'Order not found' } });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

app.patch('/api/orders/:id/status', authenticate, async (req, res) => {
  try {
    await connectDB();
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id)
      .populate('items.menu')
      .populate('user', 'name email phone')
      .populate('vendor', 'name email phone');
      
    if (!order) {
      return res.status(404).json({ success: false, error: { message: 'Order not found' } });
    }

    order.status = status;
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Payment routes
app.post('/api/payments/process', authenticate, async (req, res) => {
  try {
    await connectDB();
    const { orderId, paymentMethod } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: { message: 'Order not found' } });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
    }

    // Simulate payment processing
    order.paymentStatus = 'paid';
    order.status = 'preparing'; // เปลี่ยนสถานะเป็น preparing หลังชำระเงิน
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('items.menu')
      .populate('vendor', 'name email phone');

    res.json({ 
      success: true, 
      data: { 
        payment: {
          orderId: order._id,
          amount: order.totalAmount,
          status: 'success',
          paymentMethod,
        },
        order: populatedOrder
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Vendor routes
app.get('/api/vendors/orders', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ success: false, error: { message: 'Only vendors can access this' } });
    }

    const vendorMenus = await Menu.find({ vendor: req.user._id }).select('_id');
    const menuIds = vendorMenus.map(m => m._id);

    const orders = await Order.find({ 'items.menu': { $in: menuIds } })
      .populate('items.menu')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

app.get('/api/vendors/dashboard', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ success: false, error: { message: 'Only vendors can access this' } });
    }

    // Find vendor profile
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, error: { message: 'Vendor profile not found' } });
    }

    // Get vendor's menus using vendorId
    const vendorMenus = await Menu.find({ vendorId: vendor._id });
    const menuIds = vendorMenus.map(m => m._id);
    
    const orders = await Order.find({ 'items.menu': { $in: menuIds } });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const todayOrders = orders.filter(o => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(o.createdAt) >= today;
    });

    res.json({
      success: true,
      data: {
        totalMenus: vendorMenus.length,
        totalOrders: orders.length,
        totalRevenue,
        todayOrders: todayOrders.length,
        recentOrders: orders.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Vendor reports - Sales report
app.get('/api/vendors/reports/sales', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ success: false, error: { message: 'Only vendors can access this' } });
    }

    const { startDate, endDate } = req.query;
    
    // Get vendor's menus
    const vendorMenus = await Menu.find({ vendor: req.user._id }).select('_id');
    const menuIds = vendorMenus.map(m => m._id);

    // Build query - find orders that contain vendor's menu items
    const matchQuery = { 
      'items.menu': { $in: menuIds },
      paymentStatus: 'paid'
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

    // Get orders
    const orders = await Order.find(matchQuery);

    // Calculate totals
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by date for daily sales
    const dailySales = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = { date, revenue: 0, orders: 0 };
      }
      dailySales[date].revenue += order.totalAmount;
      dailySales[date].orders += 1;
    });

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        dailySales: Object.values(dailySales).sort((a, b) => new Date(a.date) - new Date(b.date))
      }
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Vendor reports - Popular menus
app.get('/api/vendors/reports/popular-menus', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ success: false, error: { message: 'Only vendors can access this' } });
    }

    const { startDate, endDate, limit = 10 } = req.query;

    // Get vendor's menus
    const vendorMenus = await Menu.find({ vendor: req.user._id }).select('_id');
    const menuIds = vendorMenus.map(m => m._id);

    // Build match query - find orders that contain vendor's menu items
    const matchQuery = { 
      'items.menu': { $in: menuIds },
      paymentStatus: 'paid'
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

    // Get orders and aggregate menu data
    const orders = await Order.find(matchQuery);
    
    // Calculate menu statistics
    const menuStats = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const menuId = item.menu?.toString() || 'unknown';
        if (!menuStats[menuId]) {
          menuStats[menuId] = {
            _id: menuId,
            name: item.name,
            totalQuantity: 0,
            totalRevenue: 0
          };
        }
        menuStats[menuId].totalQuantity += item.quantity;
        menuStats[menuId].totalRevenue += item.price * item.quantity;
      });
    });

    // Sort by quantity and limit
    const popularMenus = Object.values(menuStats)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: { popularMenus }
    });
  } catch (error) {
    console.error('Get popular menus error:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Canteen routes
app.get('/api/canteens', async (req, res) => {
  try {
    await connectDB();
    const canteens = await Canteen.find({ isActive: true }).sort({ order: 1, name: 1 });
    res.json({ success: true, data: canteens });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

app.get('/api/canteens/:id', async (req, res) => {
  try {
    await connectDB();
    const canteen = await Canteen.findById(req.params.id);
    if (!canteen) {
      return res.status(404).json({ success: false, error: { message: 'Canteen not found' } });
    }
    res.json({ success: true, data: canteen });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

app.get('/api/canteens/:id/vendors', async (req, res) => {
  try {
    await connectDB();
    const vendors = await Vendor.find({ canteenId: req.params.id, status: 'approved' })
      .populate('userId', 'name email')
      .sort({ shopName: 1 });
    res.json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

app.get('/api/vendors/:id/menus', async (req, res) => {
  try {
    await connectDB();
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, error: { message: 'Vendor not found' } });
    }
    
    const menus = await Menu.find({ vendor: vendor.userId, available: true })
      .populate('vendor', 'name email')
      .sort({ name: 1 });
    
    res.json({ success: true, data: menus, vendor });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Admin routes
app.get('/api/admin/dashboard', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Only admins can access this' } });
    }

    const totalUsers = await User.countDocuments();
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const totalMenus = await Menu.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalVendors,
        totalMenus,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

app.get('/api/admin/users', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Only admins can access this' } });
    }

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

app.get('/api/admin/vendors', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Only admins can access this' } });
    }

    const vendors = await User.find({ role: 'vendor' }).select('-password');
    res.json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Report Request Schema
const reportRequestSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'rejected'], default: 'pending' },
  reportData: { type: mongoose.Schema.Types.Mixed, default: null },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedAt: Date,
  notes: String,
}, { timestamps: true });

const ReportRequest = mongoose.models.ReportRequest || mongoose.model('ReportRequest', reportRequestSchema);

// Report routes - Vendor request report
app.post('/api/reports/request', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ success: false, error: { message: 'Only vendors can request reports' } });
    }

    const reportRequest = await ReportRequest.create({
      vendorId: req.user._id,
      requestedBy: req.user._id,
      status: 'pending',
    });

    res.status(201).json({ success: true, data: { reportRequest } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Report routes - Admin get all requests
app.get('/api/reports/requests', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Only admins can access this' } });
    }

    const { status } = req.query;
    const query = status ? { status } : {};

    const reportRequests = await ReportRequest.find(query)
      .populate('vendorId', 'name email')
      .populate('requestedBy', 'name email')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { reportRequests, total: reportRequests.length } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Report routes - Admin approve request
app.put('/api/reports/requests/:requestId/approve', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Only admins can access this' } });
    }

    const reportRequest = await ReportRequest.findByIdAndUpdate(
      req.params.requestId,
      {
        status: 'completed',
        processedBy: req.user.id,
        processedAt: new Date(),
      },
      { new: true }
    );

    if (!reportRequest) {
      return res.status(404).json({ success: false, error: { message: 'Report request not found' } });
    }

    res.json({ success: true, data: { reportRequest } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Report routes - Admin reject request
app.put('/api/reports/requests/:requestId/reject', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Only admins can access this' } });
    }

    const reportRequest = await ReportRequest.findByIdAndUpdate(
      req.params.requestId,
      {
        status: 'rejected',
        processedBy: req.user.id,
        processedAt: new Date(),
      },
      { new: true }
    );

    if (!reportRequest) {
      return res.status(404).json({ success: false, error: { message: 'Report request not found' } });
    }

    res.json({ success: true, data: { reportRequest } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Report routes - Admin get vendors list
app.get('/api/reports/vendors', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Only admins can access this' } });
    }

    const vendors = await User.find({ role: 'vendor', isActive: true })
      .select('name email')
      .sort({ name: 1 });

    res.json({ success: true, data: { vendors } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Report routes - Admin generate report
app.post('/api/reports/generate/:requestId', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Only admins can generate reports' } });
    }

    const { vendorId, startDate, endDate } = req.body;
    const reportRequest = await ReportRequest.findById(req.params.requestId);
    
    if (!reportRequest) {
      return res.status(404).json({ success: false, error: { message: 'Report request not found' } });
    }

    // Get vendor info
    const vendor = await User.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, error: { message: 'Vendor not found' } });
    }

    // Get vendor's menus
    const vendorMenus = await Menu.find({ vendor: vendorId }).select('_id name price');
    const menuIds = vendorMenus.map(m => m._id);

    // Build date range
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Get orders
    const orders = await Order.find({
      'items.menu': { $in: menuIds },
      paymentStatus: 'paid',
      createdAt: { $gte: start, $lte: end }
    });

    // Calculate statistics
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    // Calculate popular menus
    const menuStats = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const menuId = item.menu?.toString();
        if (menuIds.some(id => id.toString() === menuId)) {
          if (!menuStats[menuId]) {
            menuStats[menuId] = {
              name: item.name,
              quantity: 0,
              revenue: 0
            };
          }
          menuStats[menuId].quantity += item.quantity;
          menuStats[menuId].revenue += item.price * item.quantity;
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
        location: vendor.address || 'N/A'
      },
      period: { startDate: start, endDate: end },
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      },
      popularMenus,
      generatedAt: new Date(),
      generatedBy: req.user._id
    };

    // Update report request
    reportRequest.status = 'completed';
    reportRequest.reportData = reportData;
    reportRequest.processedBy = req.user._id;
    reportRequest.processedAt = new Date();
    await reportRequest.save();

    res.json({ success: true, data: { reportRequest, reportData } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Report routes - Admin update report
app.put('/api/reports/update/:requestId', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Only admins can update reports' } });
    }

    const { reportData } = req.body;
    const reportRequest = await ReportRequest.findById(req.params.requestId);
    
    if (!reportRequest) {
      return res.status(404).json({ success: false, error: { message: 'Report request not found' } });
    }

    reportRequest.reportData = {
      ...reportRequest.reportData,
      ...reportData,
      lastModifiedAt: new Date(),
      lastModifiedBy: req.user._id
    };

    await reportRequest.save();

    res.json({ success: true, data: { reportRequest } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Export for Vercel
export default app;

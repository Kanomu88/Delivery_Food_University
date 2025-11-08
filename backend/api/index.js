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
  items: [{
    menu: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
    quantity: Number,
    price: Number,
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
  deliveryAddress: String,
  notes: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Menu = mongoose.models.Menu || mongoose.model('Menu', menuSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

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

app.get('/api/menus/:id', async (req, res) => {
  try {
    await connectDB();
    const menu = await Menu.findById(req.params.id).populate('vendor', 'name email phone');
    
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

// Order routes
app.post('/api/orders', authenticate, async (req, res) => {
  try {
    await connectDB();
    const order = await Order.create({
      ...req.body,
      user: req.user._id
    });

    res.status(201).json({ success: true, data: order });
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

// Export for Vercel
export default app;

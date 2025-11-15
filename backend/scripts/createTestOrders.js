import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const Order = mongoose.model('Order', new mongoose.Schema({
  orderNumber: String,
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  items: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: String,
    price: Number,
    quantity: Number,
    subtotal: Number
  }],
  totalAmount: Number,
  status: String,
  paymentMethod: String,
  paymentStatus: String,
  pickupTime: Date,
  specialRequests: String,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true }));

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
const Vendor = mongoose.model('Vendor', new mongoose.Schema({}, { strict: false }));
const MenuItem = mongoose.model('MenuItem', new mongoose.Schema({}, { strict: false }));

async function createTestOrders() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find vendor1
    const vendorUser = await User.findOne({ username: 'vendor1' });
    if (!vendorUser) {
      console.log('❌ Vendor user not found');
      return;
    }

    const vendor = await Vendor.findOne({ userId: vendorUser._id });
    if (!vendor) {
      console.log('❌ Vendor profile not found');
      return;
    }

    console.log('✅ Found vendor:', vendor.shopName);

    // Find customer
    const customer = await User.findOne({ role: 'customer' });
    if (!customer) {
      console.log('❌ No customer found');
      return;
    }

    console.log('✅ Found customer:', customer.username);

    // Find vendor's menu items
    const menuItems = await MenuItem.find({ vendorId: vendor._id, isAvailable: true }).limit(5);
    if (menuItems.length === 0) {
      console.log('❌ No menu items found for this vendor');
      return;
    }

    console.log(`✅ Found ${menuItems.length} menu items`);

    // Create orders for the past 30 days
    const ordersToCreate = [];
    const statuses = ['completed', 'completed', 'completed', 'ready', 'preparing'];
    
    for (let i = 0; i < 20; i++) {
      // Random date in the past 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      orderDate.setHours(Math.floor(Math.random() * 12) + 8); // 8 AM - 8 PM

      // Random 1-3 items
      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let totalAmount = 0;

      for (let j = 0; j < numItems; j++) {
        const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const subtotal = menuItem.price * quantity;

        orderItems.push({
          menuItemId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity,
          subtotal
        });

        totalAmount += subtotal;
      }

      const orderNumber = `ORD${Date.now()}${i}`.slice(0, 16);
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      ordersToCreate.push({
        orderNumber,
        customerId: customer._id,
        vendorId: vendor._id,
        items: orderItems,
        totalAmount,
        status,
        paymentMethod: 'qr_code',
        paymentStatus: 'paid',
        pickupTime: new Date(orderDate.getTime() + 30 * 60000), // 30 minutes later
        specialRequests: '',
        createdAt: orderDate,
        updatedAt: orderDate
      });
    }

    // Insert orders
    const result = await Order.insertMany(ordersToCreate);
    console.log(`✅ Created ${result.length} test orders`);

    // Calculate statistics
    const totalRevenue = ordersToCreate.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = totalRevenue / ordersToCreate.length;

    console.log('\n📊 Statistics:');
    console.log(`   Total orders: ${result.length}`);
    console.log(`   Total revenue: ฿${totalRevenue.toLocaleString()}`);
    console.log(`   Average order value: ฿${avgOrderValue.toFixed(2)}`);

    // Group by date
    const ordersByDate = ordersToCreate.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    console.log(`\n📅 Orders by date (${Object.keys(ordersByDate).length} days):`);
    Object.entries(ordersByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .forEach(([date, count]) => {
        console.log(`   ${date}: ${count} orders`);
      });

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestOrders();

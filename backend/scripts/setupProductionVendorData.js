import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.production') });

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
const Vendor = mongoose.model('Vendor', new mongoose.Schema({}, { strict: false }));
const MenuItem = mongoose.model('MenuItem', new mongoose.Schema({
  vendorId: mongoose.Schema.Types.ObjectId,
  name: String,
  nameEn: String,
  description: String,
  descriptionEn: String,
  price: Number,
  category: String,
  image: String,
  isAvailable: Boolean,
  allergenInfo: String,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true }));

const Order = mongoose.model('Order', new mongoose.Schema({
  orderNumber: String,
  customerId: mongoose.Schema.Types.ObjectId,
  vendorId: mongoose.Schema.Types.ObjectId,
  items: [{
    menuItemId: mongoose.Schema.Types.ObjectId,
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

const menuItems = [
  { name: 'ข้าวผัดกุ้ง', nameEn: 'Shrimp Fried Rice', price: 50, category: 'rice', allergenInfo: 'กุ้ง, ไข่' },
  { name: 'ผัดกะเพราหมูสับ', nameEn: 'Basil Pork', price: 45, category: 'rice', allergenInfo: 'ไข่' },
  { name: 'ก๋วยเตี๋ยวหมูตุ๋น', nameEn: 'Pork Noodle', price: 40, category: 'noodles', allergenInfo: 'ไข่' },
  { name: 'ข้าวมันไก่', nameEn: 'Chicken Rice', price: 45, category: 'rice', allergenInfo: 'ถั่วเหลือง' },
  { name: 'ส้มตำไทย', nameEn: 'Papaya Salad', price: 35, category: 'appetizer', allergenInfo: 'กุ้ง, ถั่ว' },
  { name: 'ไก่ทอดหาดใหญ่', nameEn: 'Fried Chicken', price: 55, category: 'appetizer', allergenInfo: 'ไข่' },
  { name: 'ต้มยำกุ้ง', nameEn: 'Tom Yum Goong', price: 60, category: 'soup', allergenInfo: 'กุ้ง' },
  { name: 'ข้าวเหนียวมะม่วง', nameEn: 'Mango Sticky Rice', price: 40, category: 'dessert', allergenInfo: 'นม' },
  { name: 'น้ำมะนาวโซดา', nameEn: 'Lime Soda', price: 25, category: 'beverage', allergenInfo: '' },
  { name: 'ชาเย็น', nameEn: 'Thai Iced Tea', price: 20, category: 'beverage', allergenInfo: 'นม' }
];

async function setupProductionVendorData() {
  try {
    console.log('🌐 Connecting to PRODUCTION MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Find vendor
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
      console.log('❌ Customer not found');
      return;
    }

    console.log('✅ Found customer:', customer.username);

    // Create menu items
    console.log('\n📝 Creating menu items...');
    const existingMenus = await MenuItem.find({ vendorId: vendor._id });
    
    if (existingMenus.length > 0) {
      console.log(`   Deleting ${existingMenus.length} existing menus...`);
      await MenuItem.deleteMany({ vendorId: vendor._id });
    }

    const menusToCreate = menuItems.map(item => ({
      ...item,
      vendorId: vendor._id,
      description: `${item.name} อร่อยถูกใจ`,
      descriptionEn: `Delicious ${item.nameEn}`,
      image: `/images/menus/${item.category}.jpg`,
      isAvailable: true
    }));

    const createdMenus = await MenuItem.insertMany(menusToCreate);
    console.log(`✅ Created ${createdMenus.length} menu items`);

    // Create orders
    console.log('\n📦 Creating test orders...');
    const existingOrders = await Order.find({ vendorId: vendor._id });
    
    if (existingOrders.length > 0) {
      console.log(`   Deleting ${existingOrders.length} existing orders...`);
      await Order.deleteMany({ vendorId: vendor._id });
    }

    const ordersToCreate = [];
    const statuses = ['completed', 'completed', 'completed', 'ready', 'preparing'];

    for (let i = 0; i < 30; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      orderDate.setHours(Math.floor(Math.random() * 12) + 8);

      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let totalAmount = 0;

      for (let j = 0; j < numItems; j++) {
        const menu = createdMenus[Math.floor(Math.random() * createdMenus.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const subtotal = menu.price * quantity;

        orderItems.push({
          menuItemId: menu._id,
          name: menu.name,
          price: menu.price,
          quantity,
          subtotal
        });

        totalAmount += subtotal;
      }

      ordersToCreate.push({
        orderNumber: `ORD${Date.now()}${i}`.slice(0, 16),
        customerId: customer._id,
        vendorId: vendor._id,
        items: orderItems,
        totalAmount,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        paymentMethod: 'qr_code',
        paymentStatus: 'paid',
        pickupTime: new Date(orderDate.getTime() + 30 * 60000),
        specialRequests: '',
        createdAt: orderDate,
        updatedAt: orderDate
      });
    }

    const createdOrders = await Order.insertMany(ordersToCreate);
    console.log(`✅ Created ${createdOrders.length} orders`);

    // Calculate statistics
    const totalRevenue = ordersToCreate.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrderValue = totalRevenue / ordersToCreate.length;

    console.log('\n📊 Statistics:');
    console.log(`   Total orders: ${createdOrders.length}`);
    console.log(`   Total revenue: ฿${totalRevenue.toLocaleString()}`);
    console.log(`   Average order: ฿${avgOrderValue.toFixed(2)}`);

    // Orders by date
    const ordersByDate = ordersToCreate.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    console.log(`\n📅 Orders spread across ${Object.keys(ordersByDate).length} days`);
    console.log('   Last 7 days:');
    Object.entries(ordersByDate)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 7)
      .forEach(([date, count]) => {
        console.log(`   ${date}: ${count} orders`);
      });

    await mongoose.disconnect();
    console.log('\n✅ Done! Vendor now has menu items and orders.');
    console.log('\n📝 Next steps:');
    console.log('   1. Login as vendor1@test.com');
    console.log('   2. Go to /vendor/reports');
    console.log('   3. You should see sales data and popular menus');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupProductionVendorData();

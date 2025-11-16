import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../backend/.env.production') });

const Vendor = mongoose.model('Vendor', new mongoose.Schema({}, { strict: false }));
const Menu = mongoose.model('Menu', new mongoose.Schema({}, { strict: false }));
const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

async function checkVendorOrders() {
  try {
    console.log('🌐 Connecting to PRODUCTION MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    // Get vendor
    const vendor = await Vendor.findOne({ shopName: /vendor1/i });
    if (!vendor) {
      console.log('❌ Vendor not found');
      return;
    }

    console.log('🏪 Vendor:', vendor.shopName);
    console.log('   ID:', vendor._id);
    console.log('');

    // Get vendor's menus
    const menus = await Menu.find({ vendorId: vendor._id });
    console.log('📋 Vendor Menus:', menus.length);
    const menuIds = menus.map(m => m._id);
    console.log('   Menu IDs:', menuIds.map(id => id.toString()));
    console.log('');

    // Get all orders
    const allOrders = await Order.find({});
    console.log('📦 Total Orders in DB:', allOrders.length);
    console.log('');

    // Check orders with vendor's menus
    const ordersWithVendorMenus = await Order.find({
      'items.menu': { $in: menuIds }
    });

    console.log('🎯 Orders containing vendor menus:', ordersWithVendorMenus.length);
    
    if (ordersWithVendorMenus.length > 0) {
      let totalRevenue = 0;
      ordersWithVendorMenus.forEach((order, index) => {
        console.log(`\n${index + 1}. Order ${order._id}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Payment: ${order.paymentStatus}`);
        console.log(`   Total: ฿${order.totalAmount}`);
        console.log(`   Items:`, order.items.length);
        
        if (order.paymentStatus === 'paid') {
          totalRevenue += order.totalAmount;
        }
      });
      
      console.log('\n💰 Total Revenue (paid orders):', totalRevenue);
    } else {
      console.log('⚠️ No orders found for this vendor');
    }

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkVendorOrders();

import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env.production' });

const API_URL = 'https://backend-one-alpha-39.vercel.app/api';

async function checkProductionVendorData() {
  console.log('='.repeat(60));
  console.log('🔍 CHECKING PRODUCTION VENDOR DATA');
  console.log('='.repeat(60));

  // Part 1: Check Database Directly
  console.log('\n📊 Part 1: Checking Database Directly');
  console.log('-'.repeat(60));

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to production database\n');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Vendor = mongoose.model('Vendor', new mongoose.Schema({}, { strict: false }));
    const MenuItem = mongoose.model('MenuItem', new mongoose.Schema({}, { strict: false }));
    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

    // Check vendor
    const vendorUser = await User.findOne({ username: 'vendor1' });
    if (!vendorUser) {
      console.log('❌ Vendor user not found');
      await mongoose.disconnect();
      return;
    }
    console.log('✅ Vendor user:', vendorUser.email);

    const vendor = await Vendor.findOne({ userId: vendorUser._id });
    if (!vendor) {
      console.log('❌ Vendor profile not found');
      await mongoose.disconnect();
      return;
    }
    console.log('✅ Vendor profile:', vendor.shopName);
    console.log('   Status:', vendor.status);
    console.log('   Accepting orders:', vendor.isAcceptingOrders);

    // Check menu items
    const menuItems = await MenuItem.find({ vendorId: vendor._id });
    console.log('\n📋 Menu Items:', menuItems.length);
    if (menuItems.length > 0) {
      console.log('   Sample menus:');
      menuItems.slice(0, 3).forEach(m => {
        console.log(`   - ${m.name} (฿${m.price}) - ${m.isAvailable ? 'Available' : 'Unavailable'}`);
      });
    } else {
      console.log('   ⚠️ No menu items found!');
    }

    // Check orders
    const orders = await Order.find({ vendorId: vendor._id });
    console.log('\n📦 Orders:', orders.length);
    if (orders.length > 0) {
      const completedOrders = orders.filter(o => o.status !== 'cancelled');
      const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      
      console.log('   Completed orders:', completedOrders.length);
      console.log('   Total revenue: ฿' + totalRevenue.toLocaleString());
      
      // Group by date
      const ordersByDate = {};
      orders.forEach(o => {
        const date = o.createdAt.toISOString().split('T')[0];
        ordersByDate[date] = (ordersByDate[date] || 0) + 1;
      });
      
      console.log('   Orders by date:');
      Object.entries(ordersByDate)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 5)
        .forEach(([date, count]) => {
          console.log(`     ${date}: ${count} orders`);
        });
    } else {
      console.log('   ⚠️ No orders found!');
    }

    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Database error:', error.message);
  }

  // Part 2: Check API
  console.log('\n📡 Part 2: Checking API Endpoints');
  console.log('-'.repeat(60));

  try {
    // Test login
    console.log('\n1. Testing vendor login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'vendor1@test.com',
      password: 'vendor123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed');
      return;
    }

    console.log('✅ Login successful');
    const token = loginResponse.data.data.token;

    // Test vendor dashboard
    console.log('\n2. Testing GET /vendors/dashboard...');
    const dashboardResponse = await axios.get(`${API_URL}/vendors/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Dashboard API works');
    console.log('   Today orders:', dashboardResponse.data.data?.todayOrdersCount || 0);
    console.log('   Today revenue:', dashboardResponse.data.data?.todayRevenue || 0);
    console.log('   Pending orders:', dashboardResponse.data.data?.pendingOrdersCount || 0);

    // Test sales report
    console.log('\n3. Testing GET /vendors/reports/sales...');
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];
    
    const salesResponse = await axios.get(
      `${API_URL}/vendors/reports/sales?startDate=${startDate}&endDate=${endDate}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✅ Sales report API works');
    const salesData = salesResponse.data.data || salesResponse.data;
    console.log('   Total revenue:', salesData.totalRevenue || 0);
    console.log('   Total orders:', salesData.totalOrders || 0);
    console.log('   Average order:', salesData.averageOrderValue || 0);
    console.log('   Daily sales:', salesData.dailySales?.length || 0, 'days');

    // Test popular menus
    console.log('\n4. Testing GET /vendors/reports/popular-menus...');
    const menusResponse = await axios.get(
      `${API_URL}/vendors/reports/popular-menus?startDate=${startDate}&endDate=${endDate}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✅ Popular menus API works');
    const menusData = menusResponse.data.data || menusResponse.data;
    const popularMenus = menusData.popularMenus || [];
    console.log('   Popular menus:', popularMenus.length);
    
    if (popularMenus.length > 0) {
      console.log('   Top 3:');
      popularMenus.slice(0, 3).forEach((m, i) => {
        console.log(`     ${i + 1}. ${m.name} - Qty: ${m.totalQuantity}, Revenue: ฿${m.totalRevenue}`);
      });
    }

  } catch (error) {
    console.error('❌ API error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Check Complete');
  console.log('='.repeat(60));
}

checkProductionVendorData();

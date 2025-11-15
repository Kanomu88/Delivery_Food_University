import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Test credentials
const VENDOR_CREDENTIALS = {
  username: 'vendor1',
  password: 'vendor123'
};

let vendorToken = '';

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null, token = vendorToken) => {
  try {
    const config = {
      method,
      url: `${API_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

// Test vendor login
const testVendorLogin = async () => {
  console.log('\n🔐 Testing Vendor Login...');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, VENDOR_CREDENTIALS);
    
    if (response.data.success && response.data.data.token) {
      vendorToken = response.data.data.token;
      console.log('✅ Vendor login successful');
      console.log('   Username:', response.data.data.user.username);
      console.log('   Role:', response.data.data.user.role);
      return true;
    } else {
      console.log('❌ Vendor login failed - Invalid response');
      return false;
    }
  } catch (error) {
    console.log('❌ Vendor login failed:', error.response?.data?.error?.message || error.message);
    return false;
  }
};

// Check vendor data in database
const checkVendorData = async () => {
  console.log('\n📊 Checking Vendor Data in Database...');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const Vendor = mongoose.model('Vendor', new mongoose.Schema({}, { strict: false }));
    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    // Find vendor user
    const vendorUser = await User.findOne({ username: VENDOR_CREDENTIALS.username });
    if (!vendorUser) {
      console.log('❌ Vendor user not found');
      return false;
    }
    console.log('✅ Vendor user found:', vendorUser.username);
    
    // Find vendor profile
    const vendor = await Vendor.findOne({ userId: vendorUser._id });
    if (!vendor) {
      console.log('❌ Vendor profile not found');
      return false;
    }
    console.log('✅ Vendor profile found:', vendor.shopName);
    console.log('   Status:', vendor.status);
    console.log('   Accepting orders:', vendor.isAcceptingOrders);
    
    // Check orders
    const orders = await Order.find({ vendorId: vendor._id });
    console.log('📦 Total orders:', orders.length);
    
    if (orders.length > 0) {
      const completedOrders = orders.filter(o => o.status !== 'cancelled');
      const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      
      console.log('   Completed orders:', completedOrders.length);
      console.log('   Total revenue:', totalRevenue);
      console.log('   Sample order:', {
        id: orders[0]._id,
        status: orders[0].status,
        total: orders[0].totalAmount,
        items: orders[0].items.length
      });
    } else {
      console.log('⚠️ No orders found for this vendor');
    }
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Database check error:', error.message);
    return false;
  }
};

// Test get sales report
const testGetSalesReport = async () => {
  console.log('\n📊 Testing Get Sales Report...');
  
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];
  
  const result = await makeRequest('GET', `/vendors/reports/sales?startDate=${startDate}&endDate=${endDate}`);
  
  if (result.success) {
    console.log('✅ Get sales report successful');
    console.log('   Response structure:', Object.keys(result.data));
    console.log('   Data structure:', result.data.data ? Object.keys(result.data.data) : 'No data key');
    
    const data = result.data.data || result.data;
    console.log('   Total revenue:', data.totalRevenue);
    console.log('   Total orders:', data.totalOrders);
    console.log('   Average order value:', data.averageOrderValue);
    console.log('   Daily sales count:', data.dailySales?.length || 0);
    
    if (data.dailySales && data.dailySales.length > 0) {
      console.log('   Sample daily sale:', data.dailySales[0]);
    }
  } else {
    console.log('❌ Get sales report failed:', result.error);
  }
  
  return result.success;
};

// Test get popular menus
const testGetPopularMenus = async () => {
  console.log('\n🍽️ Testing Get Popular Menus...');
  
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];
  
  const result = await makeRequest('GET', `/vendors/reports/popular-menus?startDate=${startDate}&endDate=${endDate}`);
  
  if (result.success) {
    console.log('✅ Get popular menus successful');
    console.log('   Response structure:', Object.keys(result.data));
    console.log('   Data structure:', result.data.data ? Object.keys(result.data.data) : 'No data key');
    
    const data = result.data.data || result.data;
    const menus = data.popularMenus || [];
    console.log('   Popular menus count:', menus.length);
    
    if (menus.length > 0) {
      console.log('   Top 3 menus:');
      menus.slice(0, 3).forEach((menu, index) => {
        console.log(`   ${index + 1}. ${menu.name} - Qty: ${menu.totalQuantity}, Revenue: ${menu.totalRevenue}`);
      });
    } else {
      console.log('   ⚠️ No popular menus found');
    }
  } else {
    console.log('❌ Get popular menus failed:', result.error);
  }
  
  return result.success;
};

// Test vendor dashboard
const testGetVendorDashboard = async () => {
  console.log('\n📈 Testing Get Vendor Dashboard...');
  
  const result = await makeRequest('GET', '/vendors/dashboard');
  
  if (result.success) {
    console.log('✅ Get vendor dashboard successful');
    const data = result.data.data || result.data;
    console.log('   Today orders:', data.todayOrdersCount);
    console.log('   Today revenue:', data.todayRevenue);
    console.log('   Pending orders:', data.pendingOrdersCount);
    console.log('   Popular menus:', data.popularMenus?.length || 0);
  } else {
    console.log('❌ Get vendor dashboard failed:', result.error);
  }
  
  return result.success;
};

// Main test runner
const runTests = async () => {
  console.log('='.repeat(60));
  console.log('🧪 Testing Vendor Reports');
  console.log('='.repeat(60));
  
  // Check database first
  await checkVendorData();
  
  const loginSuccess = await testVendorLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without vendor login');
    return;
  }
  
  await testGetVendorDashboard();
  await testGetSalesReport();
  await testGetPopularMenus();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!');
  console.log('='.repeat(60));
};

// Run tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});

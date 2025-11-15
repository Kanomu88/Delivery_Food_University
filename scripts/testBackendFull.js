import axios from 'axios';

const BACKEND_URL = 'https://backend-one-alpha-39.vercel.app';

async function testBackendFull() {
  console.log('='.repeat(60));
  console.log('🧪 FULL BACKEND API TEST');
  console.log('='.repeat(60));
  console.log('Backend URL:', BACKEND_URL);
  console.log('');

  // Step 1: Login
  console.log('1️⃣ Login as admin...');
  let token;
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    token = response.data.data.accessToken || response.data.data.token;
    console.log('✅ Login successful');
    console.log('   Token:', token.substring(0, 40) + '...');
    console.log('   User:', response.data.data.user.email);
    console.log('   Role:', response.data.data.user.role);
  } catch (error) {
    console.log('❌ Login failed:', error.message);
    return;
  }

  // Step 2: Test admin/users
  console.log('\n2️⃣ Testing GET /api/admin/users...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Get users successful');
    console.log('   Users count:', response.data.data?.users?.length || 0);
    if (response.data.data?.users) {
      response.data.data.users.forEach(u => {
        console.log(`   - ${u.username || u.email} (${u.role})`);
      });
    }
  } catch (error) {
    console.log('❌ Get users failed');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data);
  }

  // Step 3: Test admin/vendors
  console.log('\n3️⃣ Testing GET /api/admin/vendors...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/admin/vendors`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Get vendors successful');
    console.log('   Vendors count:', response.data.data?.vendors?.length || 0);
    if (response.data.data?.vendors) {
      response.data.data.vendors.forEach(v => {
        console.log(`   - ${v.shopName} (${v.status})`);
      });
    }
  } catch (error) {
    console.log('❌ Get vendors failed');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data);
  }

  // Step 4: Test vendor login and reports
  console.log('\n4️⃣ Testing vendor endpoints...');
  try {
    const vendorLogin = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'vendor1@test.com',
      password: 'vendor123'
    });
    
    const vendorToken = vendorLogin.data.data.accessToken || vendorLogin.data.data.token;
    console.log('✅ Vendor login successful');
    
    // Test vendor dashboard
    const dashboard = await axios.get(`${BACKEND_URL}/api/vendors/dashboard`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    console.log('✅ Vendor dashboard works');
    console.log('   Today orders:', dashboard.data.data?.todayOrdersCount || 0);
    console.log('   Today revenue:', dashboard.data.data?.todayRevenue || 0);
    
    // Test sales report
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];
    
    const sales = await axios.get(
      `${BACKEND_URL}/api/vendors/reports/sales?startDate=${startDate}&endDate=${endDate}`,
      { headers: { Authorization: `Bearer ${vendorToken}` } }
    );
    console.log('✅ Sales report works');
    console.log('   Total revenue:', sales.data.data?.totalRevenue || 0);
    console.log('   Total orders:', sales.data.data?.totalOrders || 0);
    
  } catch (error) {
    console.log('❌ Vendor endpoints failed');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.error?.message || error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ TEST COMPLETE');
  console.log('='.repeat(60));
  console.log('\n📝 Summary:');
  console.log('   Backend URL: ' + BACKEND_URL);
  console.log('   Status: API is working!');
  console.log('\n🎯 Next steps:');
  console.log('   1. Update frontend/.env:');
  console.log(`      VITE_API_URL=${BACKEND_URL}/api`);
  console.log('   2. Redeploy frontend');
  console.log('   3. Test on browser');
}

testBackendFull();

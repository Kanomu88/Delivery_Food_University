import axios from 'axios';

const API_URL = 'https://delivery-food-university.vercel.app/api';

async function testProductionAPI() {
  try {
    console.log('='.repeat(60));
    console.log('🧪 Testing Production API');
    console.log('='.repeat(60));
    console.log('API URL:', API_URL);

    // Test server
    console.log('\n1️⃣ Testing server connection...');
    try {
      const health = await axios.get('https://delivery-food-university.vercel.app');
      console.log('✅ Server is running');
    } catch (error) {
      console.log('⚠️ Server health check failed, but continuing...');
    }

    // Test login
    console.log('\n2️⃣ Testing admin login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }

    console.log('✅ Login successful');
    const token = loginResponse.data.data.token;
    console.log('   Token:', token.substring(0, 30) + '...');
    console.log('   User:', loginResponse.data.data.user.username);
    console.log('   Role:', loginResponse.data.data.user.role);

    // Test get users
    console.log('\n3️⃣ Testing GET /admin/users...');
    const usersResponse = await axios.get(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Get users successful');
    console.log('   Response structure:', Object.keys(usersResponse.data));
    console.log('   Success:', usersResponse.data.success);
    console.log('   Data keys:', Object.keys(usersResponse.data.data || {}));
    console.log('   Users count:', usersResponse.data.data?.users?.length || 0);
    
    if (usersResponse.data.data?.users) {
      console.log('   Users:');
      usersResponse.data.data.users.forEach(u => {
        console.log(`     - ${u.username} (${u.email}) - ${u.role} - ${u.status}`);
      });
    }

    // Test get vendors
    console.log('\n4️⃣ Testing GET /admin/vendors...');
    const vendorsResponse = await axios.get(`${API_URL}/admin/vendors`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Get vendors successful');
    console.log('   Response structure:', Object.keys(vendorsResponse.data));
    console.log('   Success:', vendorsResponse.data.success);
    console.log('   Data keys:', Object.keys(vendorsResponse.data.data || {}));
    console.log('   Vendors count:', vendorsResponse.data.data?.vendors?.length || 0);
    
    if (vendorsResponse.data.data?.vendors) {
      console.log('   Vendors:');
      vendorsResponse.data.data.vendors.forEach(v => {
        console.log(`     - ${v.shopName} - ${v.status}`);
        console.log(`       Owner: ${v.userId?.username || v.userId?.email || 'N/A'}`);
      });
    }

    // Test with filters
    console.log('\n5️⃣ Testing filters...');
    
    const customerFilter = await axios.get(`${API_URL}/admin/users?role=customer`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Filter by role (customer):', customerFilter.data.data?.users?.length || 0, 'users');

    const approvedFilter = await axios.get(`${API_URL}/admin/vendors?status=approved`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Filter by status (approved):', approvedFilter.data.data?.vendors?.length || 0, 'vendors');

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests passed!');
    console.log('='.repeat(60));
    console.log('\n📝 Summary:');
    console.log(`   - Users: ${usersResponse.data.data?.users?.length || 0}`);
    console.log(`   - Vendors: ${vendorsResponse.data.data?.vendors?.length || 0}`);
    console.log('\n✅ The admin pages should now display data correctly!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️ Cannot connect to production server');
    }
  }
}

testProductionAPI();

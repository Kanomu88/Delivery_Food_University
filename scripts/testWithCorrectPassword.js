import axios from 'axios';

const BACKEND_URL = 'https://backend-one-alpha-39.vercel.app';

async function testWithCorrectPassword() {
  console.log('='.repeat(60));
  console.log('🧪 Testing with Correct Passwords');
  console.log('='.repeat(60));
  console.log('Backend URL:', BACKEND_URL);
  console.log('');

  const accounts = [
    { email: 'admin@test.com', password: 'password123', role: 'Admin' },
    { email: 'vendor1@test.com', password: 'password123', role: 'Vendor' },
    { email: 'customer1@test.com', password: 'password123', role: 'Customer' }
  ];

  for (const account of accounts) {
    console.log(`\n🔐 Testing ${account.role} Login...`);
    console.log(`   Email: ${account.email}`);
    console.log(`   Password: ${account.password}`);
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: account.email,
        password: account.password
      });
      
      console.log(`   ✅ Login successful!`);
      console.log(`   User: ${response.data.data.user.email}`);
      console.log(`   Role: ${response.data.data.user.role}`);
      
      const token = response.data.data.accessToken || response.data.data.token;
      
      // Test role-specific endpoints
      if (account.role === 'Admin') {
        const users = await axios.get(`${BACKEND_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   ✅ Admin API works - Users: ${users.data.data?.users?.length || 0}`);
        
        const vendors = await axios.get(`${BACKEND_URL}/api/admin/vendors`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   ✅ Admin API works - Vendors: ${vendors.data.data?.vendors?.length || 0}`);
      }
      
      if (account.role === 'Vendor') {
        const dashboard = await axios.get(`${BACKEND_URL}/api/vendors/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   ✅ Vendor API works - Today orders: ${dashboard.data.data?.todayOrdersCount || 0}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Login failed`);
      console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ TEST COMPLETE');
  console.log('='.repeat(60));
  console.log('\n📝 Correct Passwords:');
  console.log('   Admin: admin@test.com / password123');
  console.log('   Vendor: vendor1@test.com / password123');
  console.log('   Customer: customer1@test.com / password123');
}

testWithCorrectPassword();

import axios from 'axios';

const BACKEND_URL = 'https://backend-one-alpha-39.vercel.app';

async function testAdminVendorsAPI() {
  console.log('='.repeat(60));
  console.log('🧪 Testing Admin Vendors API');
  console.log('='.repeat(60));
  console.log('');

  // Step 1: Login
  console.log('1️⃣ Login as admin...');
  let token;
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'admin@test.com',
      password: 'password123'
    });
    
    token = response.data.data.accessToken || response.data.data.token;
    console.log('✅ Login successful');
    console.log('   Token:', token.substring(0, 40) + '...');
  } catch (error) {
    console.log('❌ Login failed:', error.message);
    return;
  }

  // Step 2: Test GET /api/admin/vendors
  console.log('\n2️⃣ Testing GET /api/admin/vendors...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/admin/vendors`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ API call successful');
    console.log('   Status:', response.status);
    console.log('\n📦 Full Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check data structure
    console.log('\n📊 Data Analysis:');
    console.log('   response.data:', typeof response.data);
    console.log('   response.data.data:', typeof response.data.data);
    
    if (Array.isArray(response.data.data)) {
      console.log('   ✅ data is Array, length:', response.data.data.length);
      if (response.data.data.length > 0) {
        console.log('\n   First vendor:');
        console.log('   ', JSON.stringify(response.data.data[0], null, 2));
      }
    } else if (response.data.data?.vendors) {
      console.log('   ✅ data.vendors is Array, length:', response.data.data.vendors.length);
      if (response.data.data.vendors.length > 0) {
        console.log('\n   First vendor:');
        console.log('   ', JSON.stringify(response.data.data.vendors[0], null, 2));
      }
    } else {
      console.log('   ⚠️ Unexpected structure!');
    }
    
  } catch (error) {
    console.log('❌ API call failed');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Test Complete');
  console.log('='.repeat(60));
}

testAdminVendorsAPI();

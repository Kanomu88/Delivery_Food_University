import axios from 'axios';

const API_URL = 'https://backend-one-alpha-39.vercel.app/api';

async function testProductionVendors() {
  try {
    console.log('Testing Production Admin Vendors API...\n');
    console.log('API URL:', API_URL);

    // 1. Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'password123'
    });

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful\n');

    // 2. Get all vendors
    console.log('2. Fetching all vendors...');
    const vendorsResponse = await axios.get(`${API_URL}/admin/vendors`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Vendors API Response:');
    console.log('Success:', vendorsResponse.data.success);
    console.log('Response structure:', JSON.stringify(vendorsResponse.data, null, 2));
    
    if (vendorsResponse.data.data && vendorsResponse.data.data.vendors) {
      console.log('\nVendors count:', vendorsResponse.data.data.vendors.length);
      
      if (vendorsResponse.data.data.vendors.length > 0) {
        console.log('\nVendors:');
        vendorsResponse.data.data.vendors.forEach((vendor, index) => {
          console.log(`  ${index + 1}. ${vendor.shopName}`);
          console.log(`     Status: ${vendor.status}`);
          console.log(`     Owner: ${vendor.userId?.username || 'N/A'}`);
          console.log(`     Email: ${vendor.userId?.email || 'N/A'}`);
        });
      } else {
        console.log('⚠️ No vendors found in database');
      }
    } else {
      console.log('⚠️ Unexpected response format');
    }

    console.log('\n✅ Test completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testProductionVendors();

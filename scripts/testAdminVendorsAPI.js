import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

async function testAdminVendorsAPI() {
  try {
    console.log('Testing Admin Vendors API...\n');
    console.log('API URL:', API_URL);

    // 1. Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'Admin123!'
    });

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 20) + '...\n');

    // 2. Get all vendors
    console.log('2. Fetching all vendors...');
    const vendorsResponse = await axios.get(`${API_URL}/admin/vendors`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Vendors API Response:');
    console.log('Success:', vendorsResponse.data.success);
    console.log('Data structure:', Object.keys(vendorsResponse.data.data));
    console.log('Vendors count:', vendorsResponse.data.data.vendors?.length || 0);
    
    if (vendorsResponse.data.data.vendors && vendorsResponse.data.data.vendors.length > 0) {
      console.log('\nVendors:');
      vendorsResponse.data.data.vendors.forEach((vendor, index) => {
        console.log(`  ${index + 1}. ${vendor.shopName}`);
        console.log(`     Status: ${vendor.status}`);
        console.log(`     Owner: ${vendor.userId?.username || 'N/A'}`);
        console.log(`     Email: ${vendor.userId?.email || 'N/A'}`);
      });
    } else {
      console.log('⚠️ No vendors found in response');
    }

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAdminVendorsAPI();

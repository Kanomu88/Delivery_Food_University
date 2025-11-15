import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function quickTest() {
  try {
    // Test server connection
    console.log('Testing server connection...');
    const healthCheck = await axios.get('http://localhost:5000');
    console.log('✅ Server is running:', healthCheck.data);

    // Test login
    console.log('\nTesting admin login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful');
    const token = loginResponse.data.data.token;
    console.log('Token:', token.substring(0, 30) + '...');

    // Test get users
    console.log('\nTesting get users...');
    const usersResponse = await axios.get(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Get users successful');
    console.log('Users count:', usersResponse.data.data.users.length);
    console.log('Users:', usersResponse.data.data.users.map(u => `${u.username} (${u.role})`));

    // Test get vendors
    console.log('\nTesting get vendors...');
    const vendorsResponse = await axios.get(`${API_URL}/admin/vendors`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Get vendors successful');
    console.log('Vendors count:', vendorsResponse.data.data.vendors.length);
    console.log('Vendors:', vendorsResponse.data.data.vendors.map(v => `${v.shopName} (${v.status})`));

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️ Backend server is not running!');
      console.error('Please start the server with: npm run dev');
    }
  }
}

quickTest();

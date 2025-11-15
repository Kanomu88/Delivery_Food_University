import fetch from 'node-fetch';

const API_URL = 'https://backend-one-alpha-39.vercel.app/api';

async function testAdminReports() {
  try {
    console.log('🔐 Testing Admin Login and Reports API...\n');

    // Step 1: Login as admin
    console.log('Step 1: Login as admin');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', JSON.stringify(loginData, null, 2));

    if (!loginData.success) {
      console.error('❌ Login failed!');
      return;
    }

    const token = loginData.data.accessToken;
    console.log('\n✅ Login successful!');
    console.log('Token:', token.substring(0, 50) + '...\n');

    // Step 2: Test reports/requests endpoint
    console.log('Step 2: Test /api/reports/requests');
    const reportsResponse = await fetch(`${API_URL}/reports/requests`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', reportsResponse.status);
    const reportsData = await reportsResponse.json();
    console.log('Response data:', JSON.stringify(reportsData, null, 2));

    if (reportsResponse.status === 200) {
      console.log('\n✅ Reports API works!');
    } else {
      console.log('\n❌ Reports API failed!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdminReports();

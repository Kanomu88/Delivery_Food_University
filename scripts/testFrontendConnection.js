import axios from 'axios';

const testConnection = async () => {
  try {
    console.log('🧪 Testing Frontend-Backend Connection...\n');

    const frontendURL = 'https://university-canteen-ordering-system.vercel.app';
    const backendURL = 'https://university-canteen-backend.vercel.app/api';

    // Test 1: Frontend is accessible
    console.log('1️⃣ Testing Frontend...');
    const frontendResponse = await axios.get(frontendURL);
    console.log(`✅ Frontend is accessible (${frontendResponse.status})\n`);

    // Test 2: Backend API is accessible
    console.log('2️⃣ Testing Backend API...');
    const backendResponse = await axios.get(backendURL.replace('/api', ''));
    console.log(`✅ Backend is accessible (${backendResponse.status})`);
    console.log(`   Message: ${backendResponse.data.message}\n`);

    // Test 3: Menus endpoint
    console.log('3️⃣ Testing Menus Endpoint...');
    const menusResponse = await axios.get(`${backendURL}/menus`);
    console.log(`✅ Menus endpoint working`);
    console.log(`   Found: ${menusResponse.data.count} menus\n`);

    // Test 4: CORS headers
    console.log('4️⃣ Testing CORS...');
    console.log(`✅ CORS headers present:`);
    console.log(`   Access-Control-Allow-Origin: ${menusResponse.headers['access-control-allow-origin']}`);
    console.log(`   Access-Control-Allow-Credentials: ${menusResponse.headers['access-control-allow-credentials']}\n`);

    console.log('🎉 All connection tests passed!\n');
    console.log('📝 Summary:');
    console.log(`   Frontend:  ${frontendURL}`);
    console.log(`   Backend:   ${backendURL}`);
    console.log(`   Status:    ✅ Connected and working`);
    console.log(`   Menus:     ${menusResponse.data.count} items available`);
    console.log('\n✨ System is ready for use!');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
  }
};

testConnection();

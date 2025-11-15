import axios from 'axios';

const BACKEND_URL = 'https://backend-one-alpha-39.vercel.app';

async function diagnoseBackendAPI() {
  console.log('='.repeat(60));
  console.log('🔍 DIAGNOSING BACKEND API');
  console.log('='.repeat(60));
  console.log('Backend URL:', BACKEND_URL);
  console.log('');

  // Test 1: Root endpoint
  console.log('1️⃣ Testing root endpoint (/)...');
  try {
    const response = await axios.get(BACKEND_URL);
    console.log('✅ Root endpoint works');
    console.log('   Status:', response.status);
    console.log('   Data:', response.data);
  } catch (error) {
    console.log('❌ Root endpoint failed');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.message);
    if (error.response?.data) {
      console.log('   Response:', error.response.data);
    }
  }

  // Test 2: /api endpoint
  console.log('\n2️⃣ Testing /api endpoint...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api`);
    console.log('✅ /api endpoint works');
    console.log('   Status:', response.status);
    console.log('   Data:', response.data);
  } catch (error) {
    console.log('❌ /api endpoint failed');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.message);
  }

  // Test 3: /api/auth/login
  console.log('\n3️⃣ Testing /api/auth/login...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    console.log('✅ Login endpoint works');
    console.log('   Status:', response.status);
    console.log('   Full response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data?.token) {
      const token = response.data.data.token;
      console.log('   ✅ Got token:', token.substring(0, 30) + '...');
      
      // Test authenticated endpoint
      console.log('\n   Testing authenticated endpoint...');
      try {
        const usersResponse = await axios.get(`${BACKEND_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ Admin users endpoint works!');
        console.log('   Users count:', usersResponse.data.data?.users?.length || 0);
      } catch (authError) {
        console.log('   ❌ Admin users endpoint failed');
        console.log('   Status:', authError.response?.status);
        console.log('   Error:', authError.response?.data);
      }
    }
  } catch (error) {
    console.log('❌ Login endpoint failed');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.message);
    if (error.response?.data) {
      console.log('   Response:', JSON.stringify(error.response.data, null, 2));
    }
  }

  // Test 4: Check if it's a serverless function issue
  console.log('\n4️⃣ Checking serverless function structure...');
  console.log('   Expected structure:');
  console.log('   - backend/api/index.js (serverless function entry)');
  console.log('   - backend/server.js (Express app)');
  console.log('   - Routes should be mounted on /api/*');

  // Test 5: Try different paths
  console.log('\n5️⃣ Testing different API paths...');
  
  const paths = [
    '/',
    '/api',
    '/api/',
    '/api/auth',
    '/api/auth/login',
    '/auth/login',
  ];

  for (const path of paths) {
    try {
      const response = await axios.get(`${BACKEND_URL}${path}`);
      console.log(`   ✅ ${path} - Status: ${response.status}`);
    } catch (error) {
      console.log(`   ❌ ${path} - Status: ${error.response?.status || 'No response'}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 DIAGNOSIS SUMMARY');
  console.log('='.repeat(60));
  console.log('\nPossible issues:');
  console.log('1. Serverless function not configured correctly');
  console.log('2. Routes not mounted properly');
  console.log('3. CORS configuration issue');
  console.log('4. Environment variables missing');
  console.log('5. Build/deployment failed');
  
  console.log('\n📝 Next steps:');
  console.log('1. Check Vercel deployment logs');
  console.log('2. Verify backend/api/index.js exists and exports app');
  console.log('3. Check vercel.json configuration');
  console.log('4. Verify environment variables in Vercel dashboard');
}

diagnoseBackendAPI();

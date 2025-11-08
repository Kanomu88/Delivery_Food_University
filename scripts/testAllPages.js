import axios from 'axios';

const BASE_URL = 'https://university-canteen-ordering-system.vercel.app';
const API_URL = 'https://university-canteen-backend.vercel.app/api';

const testAllPages = async () => {
  console.log('🧪 Testing All Pages and Routes...\n');
  console.log('═══════════════════════════════════════\n');

  let passedTests = 0;
  let failedTests = 0;
  const errors = [];

  // Test pages
  const pages = [
    { name: 'Home Page', url: '/', expectedStatus: 200 },
    { name: 'Menu Page', url: '/menu', expectedStatus: 200 },
    { name: 'Login Page', url: '/login', expectedStatus: 200 },
    { name: 'Register Page', url: '/register', expectedStatus: 200 },
    { name: 'Cart Page', url: '/cart', expectedStatus: 200 },
  ];

  console.log('📄 Testing Frontend Pages:\n');

  for (const page of pages) {
    try {
      const response = await axios.get(`${BASE_URL}${page.url}`);
      if (response.status === page.expectedStatus) {
        console.log(`✅ ${page.name.padEnd(20)} - ${response.status} OK`);
        passedTests++;
      } else {
        console.log(`⚠️  ${page.name.padEnd(20)} - ${response.status} (Expected ${page.expectedStatus})`);
        failedTests++;
        errors.push({ page: page.name, error: `Unexpected status ${response.status}` });
      }
    } catch (error) {
      console.log(`❌ ${page.name.padEnd(20)} - ${error.message}`);
      failedTests++;
      errors.push({ page: page.name, error: error.message });
    }
  }

  console.log('\n🔧 Testing Backend API Endpoints:\n');

  // Test API endpoints
  const apiEndpoints = [
    { name: 'Root API', url: '', method: 'GET', expectedStatus: 200 },
    { name: 'Get Menus', url: '/menus', method: 'GET', expectedStatus: 200 },
    { name: 'Get Menus with Filter', url: '/menus?category=อาหารจานหลัก', method: 'GET', expectedStatus: 200 },
    { name: 'Get Menus with Search', url: '/menus?search=ข้าว', method: 'GET', expectedStatus: 200 },
  ];

  for (const endpoint of apiEndpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${API_URL}${endpoint.url}`,
      });
      
      if (response.status === endpoint.expectedStatus) {
        console.log(`✅ ${endpoint.name.padEnd(25)} - ${response.status} OK`);
        if (response.data.data) {
          const count = Array.isArray(response.data.data) ? response.data.data.length : 1;
          console.log(`   └─ Data: ${count} items`);
        }
        passedTests++;
      } else {
        console.log(`⚠️  ${endpoint.name.padEnd(25)} - ${response.status}`);
        failedTests++;
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name.padEnd(25)} - ${error.message}`);
      failedTests++;
      errors.push({ endpoint: endpoint.name, error: error.message });
    }
  }

  console.log('\n🔐 Testing Authentication Flow:\n');

  // Test login
  try {
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'customer@test.com',
      password: 'password123'
    });

    if (loginResponse.data.success) {
      console.log(`✅ Login                      - Success`);
      console.log(`   └─ User: ${loginResponse.data.data.user.name}`);
      passedTests++;

      const token = loginResponse.data.data.accessToken;

      // Test protected endpoint
      try {
        const meResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Get Profile (Protected)    - Success`);
        console.log(`   └─ User: ${meResponse.data.data.name}`);
        passedTests++;
      } catch (error) {
        console.log(`❌ Get Profile (Protected)    - ${error.message}`);
        failedTests++;
        errors.push({ test: 'Get Profile', error: error.message });
      }

      // Test get orders
      try {
        const ordersResponse = await axios.get(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Get Orders (Protected)     - Success`);
        console.log(`   └─ Orders: ${ordersResponse.data.data.length} items`);
        passedTests++;
      } catch (error) {
        console.log(`❌ Get Orders (Protected)     - ${error.message}`);
        failedTests++;
        errors.push({ test: 'Get Orders', error: error.message });
      }

    } else {
      console.log(`❌ Login                      - Failed`);
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ Login                      - ${error.message}`);
    failedTests++;
    errors.push({ test: 'Login', error: error.message });
  }

  // Test wrong credentials
  try {
    await axios.post(`${API_URL}/auth/login`, {
      email: 'wrong@test.com',
      password: 'wrongpassword'
    });
    console.log(`❌ Wrong Credentials Test     - Should have failed!`);
    failedTests++;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log(`✅ Wrong Credentials Test     - Correctly rejected`);
      passedTests++;
    } else {
      console.log(`⚠️  Wrong Credentials Test     - Unexpected error`);
      failedTests++;
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

  if (errors.length > 0) {
    console.log('\n⚠️  ERRORS FOUND:');
    errors.forEach((err, index) => {
      console.log(`\n${index + 1}. ${err.page || err.endpoint || err.test}`);
      console.log(`   Error: ${err.error}`);
    });
  }

  console.log('\n═══════════════════════════════════════');
  if (failedTests === 0) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✨ System is fully operational!');
  } else {
    console.log('⚠️  SOME TESTS FAILED');
    console.log('🔧 Please review errors above');
  }
  console.log('═══════════════════════════════════════\n');

  console.log('🌐 URLs:');
  console.log(`   Frontend: ${BASE_URL}`);
  console.log(`   Backend:  ${API_URL}`);
  console.log('\n📝 Test Accounts:');
  console.log('   Customer: customer@test.com / password123');
  console.log('   Vendor:   vendor1@canteen.com / password123');
  console.log('   Admin:    admin@canteen.com / password123');

  process.exit(failedTests > 0 ? 1 : 0);
};

testAllPages();

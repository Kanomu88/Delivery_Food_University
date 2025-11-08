import axios from 'axios';

const FRONTEND_URL = 'https://university-canteen-ordering-system.vercel.app';
const BACKEND_URL = 'https://university-canteen-backend.vercel.app/api';

const testFullSystem = async () => {
  try {
    console.log('🧪 Testing Full System Integration...\n');

    // Test 1: Frontend accessible
    console.log('1️⃣ Testing Frontend...');
    const frontendResponse = await axios.get(FRONTEND_URL);
    console.log(`✅ Frontend accessible (${frontendResponse.status})\n`);

    // Test 2: Backend API accessible
    console.log('2️⃣ Testing Backend API...');
    const backendResponse = await axios.get(BACKEND_URL.replace('/api', ''));
    console.log(`✅ Backend accessible (${backendResponse.status})`);
    console.log(`   ${backendResponse.data.message}\n`);

    // Test 3: Menus endpoint
    console.log('3️⃣ Testing GET /api/menus...');
    const menusResponse = await axios.get(`${BACKEND_URL}/menus`);
    console.log(`✅ Menus endpoint working`);
    console.log(`   Found ${menusResponse.data.count} menus`);
    if (menusResponse.data.data.length > 0) {
      console.log(`   Sample: ${menusResponse.data.data[0].name} - ${menusResponse.data.data[0].price}฿\n`);
    }

    // Test 4: Login
    console.log('4️⃣ Testing Login...');
    const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: 'customer@test.com',
      password: 'password123'
    });
    console.log(`✅ Login successful`);
    console.log(`   User: ${loginResponse.data.data.user.name}`);
    console.log(`   Role: ${loginResponse.data.data.user.role}\n`);

    // Test 5: Protected endpoint
    const token = loginResponse.data.data.accessToken;
    console.log('5️⃣ Testing Protected Endpoint...');
    const meResponse = await axios.get(`${BACKEND_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Protected endpoint working`);
    console.log(`   Authenticated as: ${meResponse.data.data.name}\n`);

    // Test 6: Create order
    const menuId = menusResponse.data.data[0]._id;
    const menuPrice = menusResponse.data.data[0].price;
    console.log('6️⃣ Testing Create Order...');
    const orderResponse = await axios.post(`${BACKEND_URL}/orders`, {
      items: [{
        menu: menuId,
        quantity: 1,
        price: menuPrice
      }],
      totalAmount: menuPrice,
      deliveryAddress: 'Test Address',
      notes: 'Test order'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Order created successfully`);
    console.log(`   Order ID: ${orderResponse.data.data._id}`);
    console.log(`   Status: ${orderResponse.data.data.status}\n`);

    console.log('🎉 All system tests passed!\n');
    console.log('═══════════════════════════════════════');
    console.log('📊 SYSTEM STATUS: ✅ FULLY OPERATIONAL');
    console.log('═══════════════════════════════════════');
    console.log(`\n🌐 Frontend:  ${FRONTEND_URL}`);
    console.log(`🔧 Backend:   ${BACKEND_URL}`);
    console.log(`💾 Database:  MongoDB Atlas (Connected)`);
    console.log(`📦 Menus:     ${menusResponse.data.count} items`);
    console.log(`\n✨ Ready for production use!`);

  } catch (error) {
    console.error('\n❌ System test failed!');
    console.error(`Error: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    }
    process.exit(1);
  }
};

testFullSystem();

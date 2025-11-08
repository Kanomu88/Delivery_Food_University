import axios from 'axios';

const API_URL = 'https://university-canteen-backend.vercel.app/api';

const testAPI = async () => {
  try {
    console.log('🧪 Testing API...\n');

    // Test 1: Get menus
    console.log('1️⃣ Testing GET /api/menus');
    const menusResponse = await axios.get(`${API_URL}/menus`);
    console.log(`✅ Found ${menusResponse.data.count} menus`);
    console.log(`   First menu: ${menusResponse.data.data[0]?.name}\n`);

    // Test 2: Login
    console.log('2️⃣ Testing POST /api/auth/login');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'customer@test.com',
      password: 'password123'
    });
    console.log(`✅ Login successful`);
    console.log(`   User: ${loginResponse.data.data.user.name}`);
    console.log(`   Role: ${loginResponse.data.data.user.role}`);
    const token = loginResponse.data.data.accessToken;
    console.log(`   Token: ${token.substring(0, 20)}...\n`);

    // Test 3: Get user profile
    console.log('3️⃣ Testing GET /api/auth/me');
    const meResponse = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Profile retrieved`);
    console.log(`   Name: ${meResponse.data.data.name}`);
    console.log(`   Email: ${meResponse.data.data.email}\n`);

    // Test 4: Get specific menu
    const menuId = menusResponse.data.data[0]._id;
    console.log('4️⃣ Testing GET /api/menus/:id');
    const menuResponse = await axios.get(`${API_URL}/menus/${menuId}`);
    console.log(`✅ Menu details retrieved`);
    console.log(`   Name: ${menuResponse.data.data.name}`);
    console.log(`   Price: ${menuResponse.data.data.price} บาท`);
    console.log(`   Vendor: ${menuResponse.data.data.vendor?.name || 'N/A'}\n`);

    // Test 5: Create order
    console.log('5️⃣ Testing POST /api/orders');
    const orderResponse = await axios.post(`${API_URL}/orders`, {
      items: [
        {
          menu: menuId,
          quantity: 2,
          price: menuResponse.data.data.price
        }
      ],
      totalAmount: menuResponse.data.data.price * 2,
      deliveryAddress: 'มหาวิทยาลัย อาคาร 1',
      notes: 'ไม่ใส่ผัก'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Order created`);
    console.log(`   Order ID: ${orderResponse.data.data._id}`);
    console.log(`   Total: ${orderResponse.data.data.totalAmount} บาท`);
    console.log(`   Status: ${orderResponse.data.data.status}\n`);

    // Test 6: Get orders
    console.log('6️⃣ Testing GET /api/orders');
    const ordersResponse = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Found ${ordersResponse.data.data.length} orders\n`);

    console.log('🎉 All tests passed!\n');
    console.log('📊 Summary:');
    console.log(`   ✅ Menus: ${menusResponse.data.count}`);
    console.log(`   ✅ Login: Working`);
    console.log(`   ✅ Profile: Working`);
    console.log(`   ✅ Orders: Working`);
    console.log('\n🌐 Frontend URL: https://university-canteen-ordering-system.vercel.app');
    console.log('🔧 Backend URL: https://university-canteen-backend.vercel.app');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testAPI();

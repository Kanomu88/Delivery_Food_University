import axios from 'axios';

const BACKEND_URL = 'https://backend-one-alpha-39.vercel.app';

async function debugAdminUsersPage() {
  console.log('='.repeat(60));
  console.log('🔍 DEBUG ADMIN USERS PAGE');
  console.log('='.repeat(60));
  console.log('');

  // Step 1: Login as admin
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
    console.log('   User:', response.data.data.user.email);
    console.log('   Role:', response.data.data.user.role);
  } catch (error) {
    console.log('❌ Login failed:', error.message);
    console.log('   Response:', error.response?.data);
    return;
  }

  // Step 2: Test GET /api/admin/users
  console.log('\n2️⃣ Testing GET /api/admin/users...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ API call successful');
    console.log('   Status:', response.status);
    console.log('   Response structure:', JSON.stringify(response.data, null, 2));
    
    const users = response.data.data?.users || [];
    console.log('\n📊 Users data:');
    console.log('   Count:', users.length);
    
    if (users.length > 0) {
      console.log('\n   Users list:');
      users.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.username || u.email} (${u.role}) - ${u.status}`);
      });
    } else {
      console.log('   ⚠️ No users returned from API!');
    }
    
  } catch (error) {
    console.log('❌ API call failed');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data);
    console.log('   Message:', error.message);
  }

  // Step 3: Check database directly
  console.log('\n3️⃣ Checking database directly...');
  try {
    const mongoose = await import('mongoose');
    const dotenv = await import('dotenv');
    
    dotenv.config({ path: './backend/.env.production' });
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const allUsers = await User.find({});
    
    console.log('   Total users in database:', allUsers.length);
    
    if (allUsers.length > 0) {
      console.log('\n   Users in database:');
      allUsers.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.username || u.email} (${u.role}) - ${u.status}`);
      });
    }
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.log('❌ Database check failed:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 DIAGNOSIS');
  console.log('='.repeat(60));
  console.log('\nPossible issues:');
  console.log('1. API returns empty array even though database has users');
  console.log('2. Frontend not handling response correctly');
  console.log('3. Token/authentication issue');
  console.log('4. CORS or network issue');
}

debugAdminUsersPage();

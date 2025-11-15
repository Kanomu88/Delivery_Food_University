import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Test credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@test.com',
  password: 'admin123'
};

let adminToken = '';

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null, token = adminToken) => {
  try {
    const config = {
      method,
      url: `${API_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

// Test admin login
const testAdminLogin = async () => {
  console.log('\n🔐 Testing Admin Login...');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    if (response.data.success && response.data.data.token) {
      adminToken = response.data.data.token;
      console.log('✅ Admin login successful');
      console.log('   Token:', adminToken.substring(0, 20) + '...');
      console.log('   Role:', response.data.data.user.role);
      return true;
    } else {
      console.log('❌ Admin login failed - Invalid response');
      return false;
    }
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data?.error?.message || error.message);
    return false;
  }
};

// Test get all users
const testGetAllUsers = async () => {
  console.log('\n👥 Testing Get All Users...');
  const result = await makeRequest('GET', '/admin/users');
  
  if (result.success) {
    console.log('✅ Get all users successful');
    console.log('   Total users:', result.data.data.users.length);
    console.log('   Sample user:', result.data.data.users[0]?.username);
  } else {
    console.log('❌ Get all users failed:', result.error);
  }
  
  return result.success;
};

// Test get users with filters
const testGetUsersWithFilters = async () => {
  console.log('\n🔍 Testing Get Users with Filters...');
  
  // Test role filter
  const customerResult = await makeRequest('GET', '/admin/users?role=customer');
  if (customerResult.success) {
    console.log('✅ Filter by role (customer):', customerResult.data.data.users.length, 'users');
  } else {
    console.log('❌ Filter by role failed:', customerResult.error);
  }
  
  // Test status filter
  const activeResult = await makeRequest('GET', '/admin/users?status=active');
  if (activeResult.success) {
    console.log('✅ Filter by status (active):', activeResult.data.data.users.length, 'users');
  } else {
    console.log('❌ Filter by status failed:', activeResult.error);
  }
  
  return customerResult.success && activeResult.success;
};

// Test get all vendors
const testGetAllVendors = async () => {
  console.log('\n🏪 Testing Get All Vendors...');
  const result = await makeRequest('GET', '/admin/vendors');
  
  if (result.success) {
    console.log('✅ Get all vendors successful');
    console.log('   Total vendors:', result.data.data.vendors.length);
    if (result.data.data.vendors.length > 0) {
      console.log('   Sample vendor:', result.data.data.vendors[0]?.shopName);
      console.log('   Status:', result.data.data.vendors[0]?.status);
    }
  } else {
    console.log('❌ Get all vendors failed:', result.error);
  }
  
  return result.success;
};

// Test get vendors with filters
const testGetVendorsWithFilters = async () => {
  console.log('\n🔍 Testing Get Vendors with Filters...');
  
  // Test status filter
  const approvedResult = await makeRequest('GET', '/admin/vendors?status=approved');
  if (approvedResult.success) {
    console.log('✅ Filter by status (approved):', approvedResult.data.data.vendors.length, 'vendors');
  } else {
    console.log('❌ Filter by status failed:', approvedResult.error);
  }
  
  const pendingResult = await makeRequest('GET', '/admin/vendors?status=pending');
  if (pendingResult.success) {
    console.log('✅ Filter by status (pending):', pendingResult.data.data.vendors.length, 'vendors');
  } else {
    console.log('❌ Filter by status failed:', pendingResult.error);
  }
  
  return approvedResult.success && pendingResult.success;
};

// Test vendor actions (approve/suspend/unsuspend)
const testVendorActions = async () => {
  console.log('\n⚙️ Testing Vendor Actions...');
  
  // Get a vendor to test with
  const vendorsResult = await makeRequest('GET', '/admin/vendors');
  if (!vendorsResult.success || vendorsResult.data.data.vendors.length === 0) {
    console.log('⚠️ No vendors available to test actions');
    return false;
  }
  
  const testVendor = vendorsResult.data.data.vendors[0];
  console.log('   Testing with vendor:', testVendor.shopName);
  console.log('   Current status:', testVendor.status);
  
  // Test based on current status
  if (testVendor.status === 'pending') {
    const approveResult = await makeRequest('PUT', `/admin/vendors/${testVendor._id}/approve`);
    if (approveResult.success) {
      console.log('✅ Approve vendor successful');
    } else {
      console.log('❌ Approve vendor failed:', approveResult.error);
    }
  } else if (testVendor.status === 'approved') {
    const suspendResult = await makeRequest('PUT', `/admin/vendors/${testVendor._id}/suspend`);
    if (suspendResult.success) {
      console.log('✅ Suspend vendor successful');
      
      // Test unsuspend
      const unsuspendResult = await makeRequest('PUT', `/admin/vendors/${testVendor._id}/unsuspend`);
      if (unsuspendResult.success) {
        console.log('✅ Unsuspend vendor successful');
      } else {
        console.log('❌ Unsuspend vendor failed:', unsuspendResult.error);
      }
    } else {
      console.log('❌ Suspend vendor failed:', suspendResult.error);
    }
  }
  
  return true;
};

// Test user ban/unban
const testUserBanActions = async () => {
  console.log('\n🚫 Testing User Ban Actions...');
  
  // Get a customer to test with
  const usersResult = await makeRequest('GET', '/admin/users?role=customer');
  if (!usersResult.success || usersResult.data.data.users.length === 0) {
    console.log('⚠️ No customers available to test ban actions');
    return false;
  }
  
  const testUser = usersResult.data.data.users[0];
  console.log('   Testing with user:', testUser.username);
  console.log('   Current status:', testUser.status);
  
  // Test ban
  const banResult = await makeRequest('PUT', `/admin/users/${testUser._id}/ban`);
  if (banResult.success) {
    console.log('✅ Toggle user ban successful');
    console.log('   New status:', banResult.data.data.user.status);
    
    // Toggle back
    const unbanResult = await makeRequest('PUT', `/admin/users/${testUser._id}/ban`);
    if (unbanResult.success) {
      console.log('✅ Toggle user ban back successful');
      console.log('   Final status:', unbanResult.data.data.user.status);
    } else {
      console.log('❌ Toggle user ban back failed:', unbanResult.error);
    }
  } else {
    console.log('❌ Toggle user ban failed:', banResult.error);
  }
  
  return true;
};

// Test get system reports
const testGetSystemReports = async () => {
  console.log('\n📊 Testing Get System Reports...');
  const result = await makeRequest('GET', '/admin/reports');
  
  if (result.success) {
    console.log('✅ Get system reports successful');
    console.log('   Total users:', result.data.data.users.total);
    console.log('   Total vendors:', result.data.data.vendors.total);
    console.log('   Total orders:', result.data.data.orders.total);
    console.log('   Total revenue:', result.data.data.revenue.total);
  } else {
    console.log('❌ Get system reports failed:', result.error);
  }
  
  return result.success;
};

// Main test runner
const runTests = async () => {
  console.log('='.repeat(60));
  console.log('🧪 Testing Admin Pages API Endpoints');
  console.log('='.repeat(60));
  
  const loginSuccess = await testAdminLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without admin login');
    return;
  }
  
  await testGetAllUsers();
  await testGetUsersWithFilters();
  await testUserBanActions();
  
  await testGetAllVendors();
  await testGetVendorsWithFilters();
  await testVendorActions();
  
  await testGetSystemReports();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!');
  console.log('='.repeat(60));
};

// Run tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});

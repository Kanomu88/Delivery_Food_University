import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'https://university-canteen-ordering-system.vercel.app';

// Test credentials
const VENDOR_EMAIL = 'vendor1@test.com';
const VENDOR_PASSWORD = 'password123';
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'admin123';

let vendorToken = '';
let adminToken = '';
let reportRequestId = '';

async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.success) {
      console.log(`✅ Login successful for ${email}`);
      return data.data.token;
    } else {
      console.log(`❌ Login failed for ${email}:`, data.error?.message);
      return null;
    }
  } catch (error) {
    console.log(`❌ Login error for ${email}:`, error.message);
    return null;
  }
}

async function testVendorRequestReport() {
  console.log('\n📝 Testing Vendor Request Report...');
  try {
    const response = await fetch(`${API_URL}/reports/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${vendorToken}`,
      },
    });

    const data = await response.json();
    if (data.success) {
      reportRequestId = data.data.reportRequest._id;
      console.log('✅ Vendor request report successful');
      console.log('   Request ID:', reportRequestId);
      return true;
    } else {
      console.log('❌ Vendor request report failed:', data.error?.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Vendor request report error:', error.message);
    return false;
  }
}

async function testAdminGetReportRequests() {
  console.log('\n📋 Testing Admin Get Report Requests...');
  try {
    const response = await fetch(`${API_URL}/reports/requests`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Admin get report requests successful');
      console.log('   Total requests:', data.data.total);
      console.log('   Pending requests:', data.data.reportRequests.filter(r => r.status === 'pending').length);
      
      // Use the first pending request if we don't have one from vendor test
      if (!reportRequestId && data.data.reportRequests.length > 0) {
        const pendingRequest = data.data.reportRequests.find(r => r.status === 'pending');
        if (pendingRequest) {
          reportRequestId = pendingRequest._id;
          console.log('   Using existing request ID:', reportRequestId);
        }
      }
      return true;
    } else {
      console.log('❌ Admin get report requests failed:', data.error?.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Admin get report requests error:', error.message);
    return false;
  }
}

async function testAdminGetVendors() {
  console.log('\n🏪 Testing Admin Get Vendors...');
  try {
    const response = await fetch(`${API_URL}/reports/vendors`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Admin get vendors successful');
      console.log('   Total vendors:', data.data.vendors.length);
      if (data.data.vendors.length > 0) {
        console.log('   First vendor:', data.data.vendors[0].name);
      }
      return data.data.vendors[0]?._id;
    } else {
      console.log('❌ Admin get vendors failed:', data.error?.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Admin get vendors error:', error.message);
    return null;
  }
}

async function testAdminGenerateReport(vendorId) {
  if (!reportRequestId) {
    console.log('\n⚠️  Skipping generate report test - no request ID available');
    return false;
  }

  console.log('\n📊 Testing Admin Generate Report...');
  try {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const response = await fetch(`${API_URL}/reports/generate/${reportRequestId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        vendorId: vendorId,
        startDate: lastWeek.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      }),
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Admin generate report successful');
      console.log('   Total Revenue:', data.data.reportData.summary.totalRevenue);
      console.log('   Total Orders:', data.data.reportData.summary.totalOrders);
      console.log('   Popular Menus:', data.data.reportData.popularMenus.length);
      return true;
    } else {
      console.log('❌ Admin generate report failed:', data.error?.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Admin generate report error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Report System Tests...');
  console.log('API URL:', API_URL);
  console.log('='.repeat(50));

  // Login as vendor
  vendorToken = await login(VENDOR_EMAIL, VENDOR_PASSWORD);
  if (!vendorToken) {
    console.log('\n❌ Cannot proceed without vendor token');
    return;
  }

  // Login as admin
  adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
  if (!adminToken) {
    console.log('\n❌ Cannot proceed without admin token');
    return;
  }

  // Run tests
  const results = {
    vendorRequest: await testVendorRequestReport(),
    adminGetRequests: await testAdminGetReportRequests(),
  };

  // Get vendors for report generation
  const vendorId = await testAdminGetVendors();
  if (vendorId) {
    results.adminGenerateReport = await testAdminGenerateReport(vendorId);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:');
  console.log('='.repeat(50));
  
  const passed = Object.values(results).filter(r => r === true).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${result ? '✅' : '❌'} ${test}`);
  });
  
  console.log('\n' + `${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Report system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

runTests().catch(console.error);

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
const Vendor = mongoose.model('Vendor', new mongoose.Schema({}, { strict: false }));

async function checkAdminData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check users
    console.log('='.repeat(60));
    console.log('👥 CHECKING USERS');
    console.log('='.repeat(60));
    
    const allUsers = await User.find({});
    console.log(`Total users in database: ${allUsers.length}\n`);

    if (allUsers.length > 0) {
      const usersByRole = allUsers.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      console.log('Users by role:');
      Object.entries(usersByRole).forEach(([role, count]) => {
        console.log(`  ${role}: ${count}`);
      });

      const usersByStatus = allUsers.reduce((acc, user) => {
        acc[user.status || 'unknown'] = (acc[user.status || 'unknown'] || 0) + 1;
        return acc;
      }, {});

      console.log('\nUsers by status:');
      Object.entries(usersByStatus).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });

      console.log('\nSample users:');
      allUsers.slice(0, 5).forEach(user => {
        console.log(`  - ${user.email} (${user.role}) - ${user.status || 'no status'}`);
        console.log(`    Fields: ${Object.keys(user.toObject()).join(', ')}`);
      });
    } else {
      console.log('⚠️ No users found in database!');
    }

    // Check vendors
    console.log('\n' + '='.repeat(60));
    console.log('🏪 CHECKING VENDORS');
    console.log('='.repeat(60));
    
    const allVendors = await Vendor.find({});
    console.log(`Total vendors in database: ${allVendors.length}\n`);

    if (allVendors.length > 0) {
      const vendorsByStatus = allVendors.reduce((acc, vendor) => {
        acc[vendor.status] = (acc[vendor.status] || 0) + 1;
        return acc;
      }, {});

      console.log('Vendors by status:');
      Object.entries(vendorsByStatus).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });

      console.log('\nAll vendors:');
      for (const vendor of allVendors) {
        const user = await User.findById(vendor.userId);
        console.log(`  - ${vendor.shopName}`);
        console.log(`    Status: ${vendor.status}`);
        console.log(`    Owner: ${user?.email || 'N/A'}`);
        console.log(`    User ID: ${vendor.userId}`);
        console.log(`    Accepting orders: ${vendor.isAcceptingOrders}`);
        console.log('');
      }
    } else {
      console.log('⚠️ No vendors found in database!');
    }

    // Check for orphaned vendors (vendors without valid user)
    console.log('='.repeat(60));
    console.log('🔍 CHECKING FOR ISSUES');
    console.log('='.repeat(60));

    let vendorsWithoutUser = 0;
    for (const vendor of allVendors) {
      const user = await User.findById(vendor.userId);
      if (!user) {
        vendorsWithoutUser++;
        console.log(`⚠️ Vendor without user: ${vendor.shopName} (ID: ${vendor._id})`);
      }
    }
    if (vendorsWithoutUser === 0) {
      console.log('✅ All vendors have valid users');
    }

    // Check for users without status field
    const usersWithoutStatus = allUsers.filter(u => !u.status);
    if (usersWithoutStatus.length > 0) {
      console.log(`\n⚠️ Found ${usersWithoutStatus.length} users without status field:`);
      usersWithoutStatus.forEach(u => {
        console.log(`  - ${u.email} (${u.role})`);
      });
      console.log('\n💡 Need to add status field to users!');
    } else {
      console.log('\n✅ All users have status field');
    }
    
    // Check for users without username field
    const usersWithoutUsername = allUsers.filter(u => !u.username);
    if (usersWithoutUsername.length > 0) {
      console.log(`\n⚠️ Found ${usersWithoutUsername.length} users without username field:`);
      usersWithoutUsername.forEach(u => {
        console.log(`  - ${u.email} (${u.role})`);
      });
      console.log('\n💡 Need to add username field to users!');
    } else {
      console.log('\n✅ All users have username field');
    }

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAdminData();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load production environment
dotenv.config({ path: join(__dirname, '../.env.production') });

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
const Vendor = mongoose.model('Vendor', new mongoose.Schema({}, { strict: false }));

async function fixProductionData() {
  try {
    console.log('🌐 Connecting to PRODUCTION MongoDB...');
    console.log('URI:', process.env.MONGODB_URI?.substring(0, 30) + '...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to PRODUCTION MongoDB\n');

    // Check current data
    console.log('='.repeat(60));
    console.log('📊 CHECKING CURRENT DATA');
    console.log('='.repeat(60));

    const allUsers = await User.find({});
    console.log(`Total users: ${allUsers.length}`);
    
    if (allUsers.length > 0) {
      console.log('\nCurrent users:');
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.role})`);
        console.log(`    username: ${u.username || 'MISSING'}`);
        console.log(`    status: ${u.status || 'MISSING'}`);
      });
    }

    const allVendors = await Vendor.find({});
    console.log(`\nTotal vendors: ${allVendors.length}`);
    
    if (allVendors.length > 0) {
      console.log('\nCurrent vendors:');
      for (const v of allVendors) {
        const user = await User.findById(v.userId);
        console.log(`  - ${v.shopName || 'UNNAMED'}`);
        console.log(`    status: ${v.status || 'MISSING'}`);
        console.log(`    owner: ${user?.email || 'NO USER'}`);
      }
    }

    // Fix users
    console.log('\n' + '='.repeat(60));
    console.log('👥 FIXING USERS');
    console.log('='.repeat(60));

    let usersFixed = 0;
    for (const user of allUsers) {
      let needsUpdate = false;
      const updates = {};

      // Add username if missing
      if (!user.username) {
        const emailUsername = user.email.split('@')[0];
        updates.username = emailUsername;
        needsUpdate = true;
        console.log(`  Adding username: ${emailUsername} for ${user.email}`);
      }

      // Add status if missing
      if (!user.status) {
        updates.status = 'active';
        needsUpdate = true;
        console.log(`  Adding status: active for ${user.email}`);
      }

      // Add firstName if missing
      if (!user.firstName && user.name) {
        updates.firstName = user.name;
        needsUpdate = true;
      }

      // Add lastName if missing
      if (!user.lastName) {
        updates.lastName = '';
        needsUpdate = true;
      }

      if (needsUpdate) {
        await User.updateOne({ _id: user._id }, { $set: updates });
        usersFixed++;
      }
    }

    console.log(`\n✅ Fixed ${usersFixed} users`);

    // Fix vendors
    console.log('\n' + '='.repeat(60));
    console.log('🏪 FIXING VENDORS');
    console.log('='.repeat(60));

    let vendorsFixed = 0;
    let vendorsDeleted = 0;

    for (const vendor of allVendors) {
      // Check if user exists
      const user = await User.findById(vendor.userId);
      
      if (!user) {
        console.log(`  ⚠️ Deleting vendor without user: ${vendor.shopName || 'unnamed'}`);
        await Vendor.deleteOne({ _id: vendor._id });
        vendorsDeleted++;
        continue;
      }

      let needsUpdate = false;
      const updates = {};

      // Add shopName if missing
      if (!vendor.shopName) {
        updates.shopName = `ร้าน${user.username || user.email.split('@')[0]}`;
        needsUpdate = true;
        console.log(`  Adding shopName: ${updates.shopName}`);
      }

      // Add status if missing
      if (!vendor.status) {
        updates.status = 'approved';
        needsUpdate = true;
        console.log(`  Adding status: approved for ${vendor.shopName || updates.shopName}`);
      }

      // Add isAcceptingOrders if missing
      if (vendor.isAcceptingOrders === undefined) {
        updates.isAcceptingOrders = true;
        needsUpdate = true;
        console.log(`  Adding isAcceptingOrders: true`);
      }

      // Add description if missing
      if (!vendor.description) {
        updates.description = 'ร้านอาหารคุณภาพ';
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Vendor.updateOne({ _id: vendor._id }, { $set: updates });
        vendorsFixed++;
      }
    }

    console.log(`\n✅ Fixed ${vendorsFixed} vendors`);
    console.log(`🗑️ Deleted ${vendorsDeleted} orphaned vendors`);

    // Verify results
    console.log('\n' + '='.repeat(60));
    console.log('✅ VERIFICATION');
    console.log('='.repeat(60));

    const updatedUsers = await User.find({});
    const updatedVendors = await Vendor.find({});

    console.log(`\nFinal counts:`);
    console.log(`  Total users: ${updatedUsers.length}`);
    console.log(`  Total vendors: ${updatedVendors.length}`);

    console.log('\n✅ Users:');
    updatedUsers.forEach(u => {
      console.log(`  - ${u.username} (${u.email}) - ${u.role} - ${u.status}`);
    });

    console.log('\n✅ Vendors:');
    for (const vendor of updatedVendors) {
      const user = await User.findById(vendor.userId);
      console.log(`  - ${vendor.shopName} - ${vendor.status} - Owner: ${user?.username || 'N/A'}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Done! Production data has been fixed.');
    console.log('\n⚠️ IMPORTANT: You may need to redeploy the backend on Vercel');
    console.log('   to ensure the changes take effect.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixProductionData();

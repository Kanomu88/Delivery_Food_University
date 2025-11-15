import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
const Vendor = mongoose.model('Vendor', new mongoose.Schema({}, { strict: false }));

async function fixUsersAndVendors() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Fix users
    console.log('='.repeat(60));
    console.log('👥 FIXING USERS');
    console.log('='.repeat(60));

    const allUsers = await User.find({});
    console.log(`Found ${allUsers.length} users\n`);

    let usersFixed = 0;
    for (const user of allUsers) {
      let needsUpdate = false;
      const updates = {};

      // Add username if missing
      if (!user.username) {
        // Extract username from email
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

      // Add firstName and lastName if missing
      if (!user.firstName && user.name) {
        updates.firstName = user.name;
        needsUpdate = true;
      }

      if (!user.lastName) {
        updates.lastName = '';
        needsUpdate = true;
      }

      if (needsUpdate) {
        await User.updateOne({ _id: user._id }, { $set: updates });
        usersFixed++;
      }
    }

    console.log(`\n✅ Fixed ${usersFixed} users\n`);

    // Fix vendors
    console.log('='.repeat(60));
    console.log('🏪 FIXING VENDORS');
    console.log('='.repeat(60));

    const allVendors = await Vendor.find({});
    console.log(`Found ${allVendors.length} vendors\n`);

    let vendorsFixed = 0;
    let vendorsDeleted = 0;

    for (const vendor of allVendors) {
      // Check if user exists
      const user = await User.findById(vendor.userId);
      
      if (!user) {
        console.log(`  ⚠️ Deleting vendor without user: ${vendor.shopName || 'unnamed'} (${vendor._id})`);
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
        updates.status = 'approved'; // Auto-approve for existing vendors
        needsUpdate = true;
        console.log(`  Adding status: approved for ${vendor.shopName || updates.shopName}`);
      }

      // Add isAcceptingOrders if missing
      if (vendor.isAcceptingOrders === undefined) {
        updates.isAcceptingOrders = true;
        needsUpdate = true;
        console.log(`  Adding isAcceptingOrders: true for ${vendor.shopName || updates.shopName}`);
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
    console.log(`🗑️ Deleted ${vendorsDeleted} orphaned vendors\n`);

    // Verify results
    console.log('='.repeat(60));
    console.log('✅ VERIFICATION');
    console.log('='.repeat(60));

    const updatedUsers = await User.find({});
    const usersWithoutUsername = updatedUsers.filter(u => !u.username);
    const usersWithoutStatus = updatedUsers.filter(u => !u.status);

    console.log(`Users without username: ${usersWithoutUsername.length}`);
    console.log(`Users without status: ${usersWithoutStatus.length}`);

    const updatedVendors = await Vendor.find({});
    const vendorsWithoutShopName = updatedVendors.filter(v => !v.shopName);
    const vendorsWithoutStatus = updatedVendors.filter(v => !v.status);

    console.log(`Vendors without shopName: ${vendorsWithoutShopName.length}`);
    console.log(`Vendors without status: ${vendorsWithoutStatus.length}`);

    console.log('\nFinal counts:');
    console.log(`  Total users: ${updatedUsers.length}`);
    console.log(`  Total vendors: ${updatedVendors.length}`);

    console.log('\nUsers:');
    updatedUsers.forEach(u => {
      console.log(`  - ${u.username} (${u.email}) - ${u.role} - ${u.status}`);
    });

    console.log('\nVendors:');
    for (const vendor of updatedVendors) {
      const user = await User.findById(vendor.userId);
      console.log(`  - ${vendor.shopName} - ${vendor.status} - Owner: ${user?.username || 'N/A'}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixUsersAndVendors();

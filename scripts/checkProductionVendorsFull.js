import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../backend/.env.production') });

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
const Vendor = mongoose.model('Vendor', new mongoose.Schema({}, { strict: false }));

async function checkProductionVendors() {
  try {
    console.log('🌐 Connecting to PRODUCTION MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    // Check Users with vendor role
    console.log('👥 Checking Users with vendor role:');
    const vendorUsers = await User.find({ role: 'vendor' });
    console.log(`Found ${vendorUsers.length} vendor users\n`);
    
    vendorUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Name: ${user.name || user.username}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Status: ${user.status || 'N/A'}`);
      console.log('');
    });

    // Check Vendor collection
    console.log('🏪 Checking Vendor collection:');
    const vendors = await Vendor.find({});
    console.log(`Found ${vendors.length} vendors\n`);
    
    if (vendors.length > 0) {
      vendors.forEach((vendor, index) => {
        console.log(`${index + 1}. ${vendor.shopName}`);
        console.log(`   ID: ${vendor._id}`);
        console.log(`   User ID: ${vendor.userId}`);
        console.log(`   Status: ${vendor.status}`);
        console.log(`   Location: ${vendor.location || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('⚠️ No vendors found in Vendor collection!');
      console.log('\n📝 Need to create Vendor profiles for vendor users');
    }

    await mongoose.disconnect();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkProductionVendors();

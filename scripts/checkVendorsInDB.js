import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env.production' });

const Vendor = mongoose.model('Vendor', new mongoose.Schema({}, { strict: false }));
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

async function checkVendorsInDB() {
  try {
    console.log('🌐 Connecting to PRODUCTION MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Get all vendors
    const vendors = await Vendor.find({});
    console.log(`📊 Total vendors in database: ${vendors.length}\n`);

    if (vendors.length === 0) {
      console.log('❌ No vendors found in database!');
    } else {
      console.log('Vendors list:');
      for (const vendor of vendors) {
        const user = await User.findById(vendor.userId);
        console.log(`\n${vendors.indexOf(vendor) + 1}. ${vendor.shopName || 'UNNAMED'}`);
        console.log(`   ID: ${vendor._id}`);
        console.log(`   Status: ${vendor.status || 'NO STATUS'}`);
        console.log(`   Owner: ${user?.email || 'NO USER'} (${user?.username || 'N/A'})`);
        console.log(`   User ID: ${vendor.userId}`);
        console.log(`   Accepting orders: ${vendor.isAcceptingOrders}`);
      }
    }

    // Check for "ร้านอาหารทดสอบ 1"
    console.log('\n' + '='.repeat(60));
    console.log('🔍 Searching for "ร้านอาหารทดสอบ 1"...');
    const testVendor = await Vendor.findOne({ shopName: /ทดสอบ.*1/i });
    
    if (testVendor) {
      console.log('✅ Found!');
      console.log('   Shop name:', testVendor.shopName);
      console.log('   Status:', testVendor.status);
    } else {
      console.log('❌ Not found!');
      console.log('\n💡 Available vendors:');
      vendors.forEach(v => {
        console.log(`   - ${v.shopName}`);
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkVendorsInDB();

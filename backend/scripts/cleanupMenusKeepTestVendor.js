import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.production') });

const Vendor = mongoose.model('Vendor', new mongoose.Schema({}, { strict: false }));
const MenuItem = mongoose.model('MenuItem', new mongoose.Schema({}, { strict: false }));
const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

async function cleanupMenusKeepTestVendor() {
  try {
    console.log('🌐 Connecting to PRODUCTION MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Find all vendors
    const allVendors = await Vendor.find({});
    console.log('ร้านค้าที่มีในระบบ:');
    allVendors.forEach((v, i) => {
      console.log(`  ${i + 1}. ${v.shopName} (ID: ${v._id})`);
    });
    console.log('');

    // Find "ร้านอาหารทดสอบ 1" or first vendor with "ทดสอบ" in name
    let testVendor = await Vendor.findOne({ shopName: /ทดสอบ.*1/i });
    
    if (!testVendor) {
      // If not found, look for any vendor with "ทดสอบ"
      testVendor = await Vendor.findOne({ shopName: /ทดสอบ/i });
    }
    
    if (!testVendor) {
      console.log('❌ ไม่พบร้านอาหารทดสอบ');
      console.log('💡 กรุณาระบุชื่อร้านที่ต้องการเก็บไว้');
      await mongoose.disconnect();
      return;
    }

    console.log('✅ พบร้านที่จะเก็บไว้:', testVendor.shopName);
    console.log(`   Vendor ID: ${testVendor._id}`);
    console.log(`   Status: ${testVendor.status}\n`);

    // Count current menus
    const allMenus = await MenuItem.find({});
    const testVendorMenus = await MenuItem.find({ vendorId: testVendor._id });
    const otherMenus = allMenus.filter(m => m.vendorId.toString() !== testVendor._id.toString());

    console.log('📊 สถานะปัจจุบัน:');
    console.log(`   เมนูทั้งหมด: ${allMenus.length}`);
    console.log(`   เมนูของ ${testVendor.shopName}: ${testVendorMenus.length}`);
    console.log(`   เมนูของร้านอื่น: ${otherMenus.length}\n`);

    if (testVendorMenus.length > 0) {
      console.log(`เมนูของ ${testVendor.shopName}:`);
      testVendorMenus.forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.name} - ฿${m.price} - ${m.category}`);
      });
      console.log('');
    }

    if (otherMenus.length === 0) {
      console.log('✅ ไม่มีเมนูของร้านอื่นที่ต้องลบ');
      await mongoose.disconnect();
      return;
    }

    // Show menus to be deleted
    console.log('🗑️ เมนูที่จะถูกลบ:');
    const menusByVendor = {};
    
    for (const menu of otherMenus) {
      const vendor = await Vendor.findById(menu.vendorId);
      const vendorName = vendor?.shopName || 'Unknown';
      
      if (!menusByVendor[vendorName]) {
        menusByVendor[vendorName] = [];
      }
      menusByVendor[vendorName].push(menu);
    }

    Object.entries(menusByVendor).forEach(([vendorName, menus]) => {
      console.log(`\n  ${vendorName} (${menus.length} เมนู):`);
      menus.slice(0, 5).forEach(m => {
        console.log(`    - ${m.name} - ฿${m.price}`);
      });
      if (menus.length > 5) {
        console.log(`    ... และอีก ${menus.length - 5} เมนู`);
      }
    });

    // Delete other menus
    console.log('\n🗑️ กำลังลบเมนูของร้านอื่น...');
    const otherVendorIds = [...new Set(otherMenus.map(m => m.vendorId.toString()))];
    
    const deleteResult = await MenuItem.deleteMany({
      vendorId: { $in: otherVendorIds }
    });

    console.log(`✅ ลบเมนูสำเร็จ: ${deleteResult.deletedCount} รายการ\n`);

    // Also delete orders from other vendors
    console.log('🗑️ กำลังลบออเดอร์ของร้านอื่น...');
    const orderDeleteResult = await Order.deleteMany({
      vendorId: { $in: otherVendorIds }
    });

    console.log(`✅ ลบออเดอร์สำเร็จ: ${orderDeleteResult.deletedCount} รายการ\n`);

    // Verify
    console.log('='.repeat(60));
    console.log('✅ ตรวจสอบผลลัพธ์');
    console.log('='.repeat(60));

    const remainingMenus = await MenuItem.find({});
    const remainingOrders = await Order.find({});

    console.log(`\nเมนูที่เหลือ: ${remainingMenus.length} รายการ`);
    console.log(`ออเดอร์ที่เหลือ: ${remainingOrders.length} รายการ\n`);

    if (remainingMenus.length > 0) {
      console.log('เมนูที่เหลือทั้งหมด:');
      for (const menu of remainingMenus) {
        const vendor = await Vendor.findById(menu.vendorId);
        console.log(`  - ${menu.name} (฿${menu.price}) - ร้าน: ${vendor?.shopName || 'Unknown'}`);
      }
    }

    await mongoose.disconnect();
    console.log(`\n✅ เสร็จสิ้น! ตอนนี้มีเฉพาะเมนูของ ${testVendor.shopName} เท่านั้น`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupMenusKeepTestVendor();

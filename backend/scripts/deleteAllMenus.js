import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.production') });

const MenuItem = mongoose.model('MenuItem', new mongoose.Schema({}, { strict: false }));
const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
const Vendor = mongoose.model('Vendor', new mongoose.Schema({}, { strict: false }));

async function deleteAllMenus() {
  try {
    console.log('🌐 Connecting to PRODUCTION MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Count current data
    const allMenus = await MenuItem.find({});
    const allOrders = await Order.find({});

    console.log('📊 สถานะปัจจุบัน:');
    console.log(`   เมนูทั้งหมด: ${allMenus.length}`);
    console.log(`   ออเดอร์ทั้งหมด: ${allOrders.length}\n`);

    if (allMenus.length > 0) {
      console.log('เมนูที่จะถูกลบ:');
      
      // Group by vendor
      const menusByVendor = {};
      for (const menu of allMenus) {
        const vendor = await Vendor.findById(menu.vendorId);
        const vendorName = vendor?.shopName || 'Unknown';
        
        if (!menusByVendor[vendorName]) {
          menusByVendor[vendorName] = [];
        }
        menusByVendor[vendorName].push(menu);
      }

      Object.entries(menusByVendor).forEach(([vendorName, menus]) => {
        console.log(`\n  ${vendorName} (${menus.length} เมนู):`);
        menus.forEach((m, i) => {
          console.log(`    ${i + 1}. ${m.name} - ฿${m.price}`);
        });
      });
    }

    if (allMenus.length === 0 && allOrders.length === 0) {
      console.log('✅ ไม่มีข้อมูลที่ต้องลบ');
      await mongoose.disconnect();
      return;
    }

    // Delete all menus
    console.log('\n🗑️ กำลังลบเมนูทั้งหมด...');
    const menuDeleteResult = await MenuItem.deleteMany({});
    console.log(`✅ ลบเมนูสำเร็จ: ${menuDeleteResult.deletedCount} รายการ`);

    // Delete all orders
    console.log('\n🗑️ กำลังลบออเดอร์ทั้งหมด...');
    const orderDeleteResult = await Order.deleteMany({});
    console.log(`✅ ลบออเดอร์สำเร็จ: ${orderDeleteResult.deletedCount} รายการ`);

    // Verify
    console.log('\n' + '='.repeat(60));
    console.log('✅ ตรวจสอบผลลัพธ์');
    console.log('='.repeat(60));

    const remainingMenus = await MenuItem.find({});
    const remainingOrders = await Order.find({});

    console.log(`\nเมนูที่เหลือ: ${remainingMenus.length} รายการ`);
    console.log(`ออเดอร์ที่เหลือ: ${remainingOrders.length} รายการ`);

    await mongoose.disconnect();
    console.log('\n✅ เสร็จสิ้น! ลบเมนูและออเดอร์ทั้งหมดแล้ว');
    console.log('\n📝 หมายเหตุ: ร้านค้ายังคงอยู่ในระบบ สามารถเพิ่มเมนูใหม่ได้');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteAllMenus();

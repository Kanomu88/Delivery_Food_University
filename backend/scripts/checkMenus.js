import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

// Schemas
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  role: String,
}, { timestamps: true });

const vendorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shopName: String,
}, { timestamps: true });

const menuItemSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  name: { type: String, required: true },
  nameEn: String,
  description: String,
  descriptionEn: String,
  price: { type: Number, required: true },
  image: String,
  category: String,
  allergenInfo: String,
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Vendor = mongoose.model('Vendor', vendorSchema);
const MenuItem = mongoose.model('MenuItem', menuItemSchema);

async function checkMenus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find vendor
    const vendorUser = await User.findOne({ email: 'vendor@test.com' });
    if (!vendorUser) {
      console.log('❌ Vendor user not found.');
      process.exit(1);
    }

    const vendor = await Vendor.findOne({ userId: vendorUser._id });
    if (!vendor) {
      console.log('❌ Vendor shop not found.');
      process.exit(1);
    }

    console.log(`🏪 Vendor Shop: ${vendor.shopName}\n`);

    // Get all menus
    const menus = await MenuItem.find({ vendorId: vendor._id }).sort({ category: 1, name: 1 });
    
    console.log('📋 Menu Items Summary:');
    console.log('═══════════════════════════════════════════════\n');

    const categories = {
      main_dish: 'อาหารจานหลัก (Main Dishes)',
      snack: 'ของว่าง (Snacks)',
      beverage: 'เครื่องดื่ม (Beverages)',
      dessert: 'ของหวาน (Desserts)'
    };

    let totalItems = 0;
    let totalValue = 0;

    for (const [key, label] of Object.entries(categories)) {
      const items = menus.filter(m => m.category === key);
      if (items.length > 0) {
        console.log(`\n${label} (${items.length} items):`);
        console.log('─'.repeat(50));
        items.forEach((item, index) => {
          console.log(`${index + 1}. ${item.name} (${item.nameEn})`);
          console.log(`   ราคา: ฿${item.price} | สถานะ: ${item.isAvailable ? '✅ พร้อมขาย' : '❌ ไม่พร้อมขาย'}`);
          if (item.allergenInfo) {
            console.log(`   ⚠️  สารก่อภูมิแพ้: ${item.allergenInfo}`);
          }
          totalValue += item.price;
        });
        totalItems += items.length;
      }
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log(`\n📊 Statistics:`);
    console.log(`   Total Menu Items: ${totalItems}`);
    console.log(`   Average Price: ฿${(totalValue / totalItems).toFixed(2)}`);
    console.log(`   Price Range: ฿${Math.min(...menus.map(m => m.price))} - ฿${Math.max(...menus.map(m => m.price))}`);
    
    const availableCount = menus.filter(m => m.isAvailable).length;
    console.log(`   Available Items: ${availableCount}/${totalItems}`);

    console.log('\n═══════════════════════════════════════════════\n');

    await mongoose.connection.close();
    console.log('✅ Done! Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkMenus();

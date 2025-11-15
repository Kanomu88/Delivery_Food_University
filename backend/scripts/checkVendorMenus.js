import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.production') });

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  image: String,
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  available: { type: Boolean, default: true },
  preparationTime: Number,
  tags: [String],
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
  phone: String,
  address: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Menu = mongoose.models.Menu || mongoose.model('Menu', menuSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function checkVendorMenus() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // หา vendors ทั้งหมด
    const vendors = await User.find({ role: 'vendor' });
    console.log(`\nFound ${vendors.length} vendors:`);

    for (const vendor of vendors) {
      const menus = await Menu.find({ vendor: vendor._id });
      console.log(`\n- ${vendor.name} (${vendor.email})`);
      console.log(`  ID: ${vendor._id}`);
      console.log(`  Menus: ${menus.length}`);
      
      if (menus.length > 0) {
        console.log('  Menu items:');
        menus.forEach(menu => {
          console.log(`    - ${menu.name} (฿${menu.price})`);
        });
      }
    }

    // แสดงเมนูทั้งหมด
    const allMenus = await Menu.find().populate('vendor', 'name email');
    console.log(`\n\nTotal menus in database: ${allMenus.length}`);
    
    if (allMenus.length > 0) {
      console.log('\nAll menus:');
      allMenus.forEach(menu => {
        console.log(`- ${menu.name} (฿${menu.price}) - Vendor: ${menu.vendor?.name || 'No vendor'}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkVendorMenus();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.production') });

const menuSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  imageUrl: String,
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const Menu = mongoose.model('Menu', menuSchema);

const categoryMapping = {
  'อาหารจานหลัก': 'main_dish',
  'ของว่าง': 'snack',
  'เครื่องดื่ม': 'beverage',
  'ของหวาน': 'dessert',
};

async function updateMenuCategories() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!\n');

    const menus = await Menu.find({});
    console.log(`Found ${menus.length} menus\n`);

    let updated = 0;
    for (const menu of menus) {
      const oldCategory = menu.category;
      const newCategory = categoryMapping[oldCategory] || oldCategory;
      
      if (oldCategory !== newCategory) {
        menu.category = newCategory;
        await menu.save();
        console.log(`✅ Updated: ${menu.name}`);
        console.log(`   ${oldCategory} → ${newCategory}\n`);
        updated++;
      }
    }

    console.log(`\n✅ Updated ${updated} menus`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateMenuCategories();

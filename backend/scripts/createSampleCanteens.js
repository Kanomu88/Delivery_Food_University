import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Canteen from '../models/Canteen.js';
import Vendor from '../models/Vendor.js';
import User from '../models/User.js';

dotenv.config();

const sampleCanteens = [
  {
    name: 'โรงอาหารกลาง',
    nameEn: 'Central Canteen',
    description: 'โรงอาหารกลางใจกลางมหาวิทยาลัย มีร้านอาหารหลากหลาย',
    descriptionEn: 'Central canteen in the heart of the university with various food shops',
    location: 'อาคารกลาง ชั้น 1',
    building: 'อาคารกลาง',
    floor: '1',
    image: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800',
    isActive: true,
    order: 1,
  },
  {
    name: 'โรงอาหารคณะวิศวกรรมศาสตร์',
    nameEn: 'Engineering Canteen',
    description: 'โรงอาหารคณะวิศวกรรมศาสตร์ เปิดบริการตลอดทั้งวัน',
    descriptionEn: 'Engineering faculty canteen, open all day',
    location: 'อาคารคณะวิศวกรรมศาสตร์ ชั้น 1',
    building: 'อาคารคณะวิศวกรรมศาสตร์',
    floor: '1',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    isActive: true,
    order: 2,
  },
  {
    name: 'โรงอาหารคณะแพทยศาสตร์',
    nameEn: 'Medical Canteen',
    description: 'โรงอาหารคณะแพทยศาสตร์ อาหารสะอาด ถูกสุขอนามัย',
    descriptionEn: 'Medical faculty canteen with clean and hygienic food',
    location: 'อาคารคณะแพทยศาสตร์ ชั้น 2',
    building: 'อาคารคณะแพทยศาสตร์',
    floor: '2',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    isActive: true,
    order: 3,
  },
  {
    name: 'โรงอาหารหอพัก',
    nameEn: 'Dormitory Canteen',
    description: 'โรงอาหารหอพักนักศึกษา เปิดบริการถึงดึก',
    descriptionEn: 'Student dormitory canteen, open until late',
    location: 'หอพักนักศึกษา ชั้น 1',
    building: 'หอพักนักศึกษา',
    floor: '1',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    isActive: true,
    order: 4,
  },
];

const createSampleCanteens = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing canteens
    await Canteen.deleteMany({});
    console.log('Cleared existing canteens');

    // Create canteens
    const createdCanteens = await Canteen.insertMany(sampleCanteens);
    console.log(`Created ${createdCanteens.length} canteens`);

    // Assign vendors to canteens (if vendors exist)
    const vendors = await Vendor.find();
    if (vendors.length > 0) {
      console.log(`\nAssigning ${vendors.length} vendors to canteens...`);
      
      for (let i = 0; i < vendors.length; i++) {
        const canteenIndex = i % createdCanteens.length;
        vendors[i].canteenId = createdCanteens[canteenIndex]._id;
        await vendors[i].save();
        console.log(`Assigned ${vendors[i].shopName} to ${createdCanteens[canteenIndex].name}`);
      }
    }

    console.log('\n✅ Sample canteens created successfully!');
    console.log('\nCanteens:');
    createdCanteens.forEach((canteen, index) => {
      console.log(`${index + 1}. ${canteen.name} (${canteen.nameEn})`);
      console.log(`   Location: ${canteen.location}`);
      console.log(`   ID: ${canteen._id}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating sample canteens:', error);
    process.exit(1);
  }
};

createSampleCanteens();

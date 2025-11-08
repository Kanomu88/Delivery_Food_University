import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const fixOrdersIndex = async () => {
  try {
    const db = mongoose.connection.db;
    
    console.log('🔧 Fixing orders collection indexes...');
    
    // Drop all indexes on orders collection
    try {
      await db.collection('orders').dropIndexes();
      console.log('✅ Dropped old indexes');
    } catch (error) {
      console.log('⚠️  No indexes to drop or collection does not exist');
    }

    console.log('\n🎉 Orders indexes fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
};

connectDB().then(fixOrdersIndex);

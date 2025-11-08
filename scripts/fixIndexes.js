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

const fixIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Drop all indexes on users collection
    console.log('🔧 Dropping old indexes...');
    await db.collection('users').dropIndexes();
    console.log('✅ Dropped old indexes');

    // Create new indexes
    console.log('🔧 Creating new indexes...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('✅ Created email index');

    console.log('\n🎉 Indexes fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
};

connectDB().then(fixIndexes);

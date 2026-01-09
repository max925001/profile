import mongoose from 'mongoose';

const connectDB = async () => {
  let retries = 5;

  while (retries) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected successfully');
      return;
    } catch (err) {
      console.error(`MongoDB connection failed: ${err.message}`);
      retries -= 1;

      if (retries === 0) {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }

      console.log(`Retrying in 5s... (${retries} left)`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
};

export default connectDB;
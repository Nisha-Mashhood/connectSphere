import mongoose from 'mongoose';
import config from './env-config';
import logger from '../core/utils/logger';

const connectDB = async () => {
  try {
    const mongoUri = config.mongoURI;
    if (!mongoUri) {
      throw new Error("MongoDB URI is not defined.");
    }

    const conn = await mongoose.connect(mongoUri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error}`)
    process.exit(1); // Exit with failure
  }
};

export default connectDB;

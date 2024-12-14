import mongoose from 'mongoose';
import config from './env.config.js';
const connectDB = async () => {
    try {
        const mongoUri = config.mongoURI;
        if (!mongoUri) {
            throw new Error("MongoDB URI is not defined.");
        }
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`Error connecting to MongoDB: ${error}`);
        process.exit(1); // Exit with failure
    }
};
export default connectDB;
//# sourceMappingURL=db.config.js.map
import mongoose from "mongoose";

export const connectDB = async () => {
    const user = encodeURIComponent(process.env.DB_USER || 'shikhaagrahari076');
    const pass = encodeURIComponent(process.env.DB_PASS || '9044090276');
    const dbName = encodeURIComponent(process.env.DB_NAME || 'college+Eatery');
    const hosts = 'ac-rvfhfqi-shard-00-00.667m5it.mongodb.net:27017,ac-rvfhfqi-shard-00-01.667m5it.mongodb.net:27017,ac-rvfhfqi-shard-00-02.667m5it.mongodb.net:27017';
    const options = 'ssl=true&replicaSet=atlas-141hzc-shard-0&authSource=admin&appName=Cluster0';

    const mongoURI = process.env.MONGODB_URI ||
        `mongodb://${user}:${pass}@${hosts}/${dbName}?${options}`;

    try {
        await mongoose.connect(mongoURI);
        console.log('DB Connected');
    } catch (err) {
        console.error('DB connection error:', err);
        process.exit(1);
    }
};
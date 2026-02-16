
import mongoose from "mongoose";

export const connectDB= async ()=>{
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://shikhaagrahari076:9044090276@cluster0.667m5it.mongodb.net/college+Eatery';
    await mongoose.connect(mongoURI).then(()=>console.log("DB Connected"));
}
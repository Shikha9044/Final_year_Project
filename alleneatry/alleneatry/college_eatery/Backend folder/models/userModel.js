import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    otp: { type: String },
    otpExpires: { type: Date },
    profilePic: { type: String },
    cartData: { type: Object, default: {} },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    // Student-specific fields
    studentId: { type: String, unique: true, sparse: true },
    college: { type: String },
    branch: { type: String },
    role: { type: String, enum: ['user','student','admin'], default: 'user' }
}, { minimize: false })

const userModel = mongoose.models.user || mongoose.model("user",userSchema);
export default userModel;
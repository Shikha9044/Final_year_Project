import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";


// login user

const loginUser = async (req,res)=>{

    const {email,password} = req.body;
    try {
        const user = await userModel.findOne({email});

        if (!user) {
            return res.json({success:false,message:"User does not exist"})
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if (!isMatch) {
            return res.json({success:false,message:"Invalid credentials"})
        }

        const token = createToken(user._id);
        
        // Return user info along with token (excluding password)
        const userInfo = {
            _id: user._id,
            name: user.name,
            email: user.email
        };
        
        res.json({
            success: true,
            token,
            user: userInfo
        });


    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"});
    }

}

const createToken = (id)=>{
    const secret = process.env.JWT_SECRET || 'fallback_jwt_secret_key_for_development_only';
    return jwt.sign({id}, secret)
}

const isStrongPassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
}

// Student registration (email + password)
const registerStudent = async (req, res) => {
    try {
        const { name, password, email, studentId, college, branch } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'name, email and password are required' });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email' });
        }

        const existsByEmail = await userModel.findOne({ email });
        if (existsByEmail) return res.status(400).json({ success: false, message: 'Email already registered' });

        if (studentId) {
            const existsByStudentId = await userModel.findOne({ studentId });
            if (existsByStudentId) return res.status(400).json({ success: false, message: 'Student ID already registered' });
        }

        if (!isStrongPassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special symbol'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            studentId: studentId || undefined,
            college: college || '',
            branch: branch || '',
            role: 'student'
        });

        const user = await newUser.save();
        const token = createToken(user._id);

        const userInfo = { _id: user._id, name: user.name, email: user.email, studentId: user.studentId, role: user.role };

        res.json({ success: true, token, user: userInfo });

    } catch (error) {
        console.error('Register student error:', error);
        res.status(500).json({ success: false, message: 'Error registering student' });
    }
}

// Student login (by studentId or email)
const loginStudent = async (req, res) => {
    try {
        const { studentId, email, password } = req.body;

        if ((!studentId && !email) || !password) {
            return res.status(400).json({ success: false, message: 'Provide studentId or email and password' });
        }

        const query = studentId ? { studentId } : { email };
        const user = await userModel.findOne(query);
        if (!user) return res.status(400).json({ success: false, message: 'Student not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

        const token = createToken(user._id);
        const userInfo = { _id: user._id, name: user.name, email: user.email, studentId: user.studentId, role: user.role };

        res.json({ success: true, token, user: userInfo });

    } catch (error) {
        console.error('Login student error:', error);
        res.status(500).json({ success: false, message: 'Error logging in student' });
    }
}


// register user

const registerUser = async (req,res)=>{
   const {name,password,email}= req.body;
   try {
    // checking is user already exist
    const exists = await userModel.findOne({email});
    if (exists) {
        return res.json({success:false,message:"User already exists"}); 
    }
    // Validating email format & Strong password

    if (!validator.isEmail(email)) {
        return res.json({success:false,message:"Please enter a Valid email"}); 
    }

    if (!isStrongPassword(password)) {
        return res.json({success:false,message:"Password must include uppercase, lowercase, numbers, and special symbols"}); 
    }

    // hashing user password

    const salt =await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt);

    const newUser = new userModel({
        name:name,
        email:email,
        password:hashedPassword
    })

   const user= await newUser.save();
   const token = createToken(user._id);

   // Return user info along with token (excluding password)
   const userInfo = {
       _id: user._id,
       name: user.name,
       email: user.email
   };

   res.json({
       success: true,
       token,
       user: userInfo
   });

   } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message})
   }
}

// Get user profile by token
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // This will be set by auth middleware
        
        const user = await userModel.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        res.json({ success: true, user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error fetching user profile" });
    }
};

// Forgot password - generate reset token
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }
        
        const user = await userModel.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User with this email does not exist" });
        }
        
        // Generate a simple reset token (in production, you'd want a more secure token)
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        // Store reset token and expiry in user document
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
        
        await user.save();
        
        // In a real application, you would send an email here
        // For now, we'll just return the token (in production, remove this)
        console.log(`Password reset token for ${email}: ${resetToken}`);
        
        res.json({ 
            success: true, 
            message: "Password reset link sent to your email!",
            // Remove this in production - only for testing
            resetToken: resetToken 
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error processing forgot password request" });
    }
};

// Reset password using token
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: "Token and new password are required" });
        }
        
        if (!isStrongPassword(newPassword)) {
            return res.status(400).json({ success: false, message: "Password must include uppercase, lowercase, numbers, and special symbols" });
        }
        
        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }
        
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update password and clear reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();
        
        res.json({ success: true, message: "Password has been reset successfully" });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error resetting password" });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, phone, profilePic } = req.body;
        // Only allow updating allowed fields
        const updateFields = {};
        if (name) updateFields.name = name;
        if (email) updateFields.email = email;
        if (phone) updateFields.phone = phone;
        if (profilePic) updateFields.profilePic = profilePic;

        const user = await userModel.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true, select: '-password' }
        );
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ success: false, message: "Error updating user profile" });
    }
};

export {loginUser, registerUser, registerStudent, loginStudent, getUserProfile, updateUserProfile, forgotPassword, resetPassword}

export { loginUser, registerUser, registerStudent, loginStudent, getUserProfile, updateUserProfile, forgotPassword, resetPassword };
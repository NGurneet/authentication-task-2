
import mongoose from "mongoose";
import { type IUser } from "./user.dto";
import UserSchema from "./user.schema";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express";
import userSchema from "./user.schema";
import nodemailer from 'nodemailer';

export const createUser = async (data: IUser) => {
    const result = await UserSchema.create({ ...data, active: true });
    return result;
};
export const createUserByAdmin = async (data: IUser) => {
    const result = await UserSchema.create({ ...data, active: true });
    return result;
};


export const updateUser = async (id: string, data: IUser) => {
    const result = await UserSchema.findOneAndUpdate({ _id: id }, data, {
        new: true,
    });
    return result;
};

export const generateAuthToken = (userId: string, role: string) => {
    const token = jwt.sign({ _id: userId, role: role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    return token;
};


export const generateRefreshToken = (userId: string) => {
    const refreshToken = jwt.sign({ _id: userId }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' });
    return refreshToken;
};


export const comparePasswords = async (plainPassword: string, hashedPassword: string) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

export const editUser = async (id: string, data: Partial<IUser>) => {
    const result = await UserSchema.findOneAndUpdate({ _id: id }, data);
    return result;
};

export const findUserByEmail = async(email: string) => {
    const result = await UserSchema.findOne({email})
    return result
}

export const deleteUser = async (id: string) => {
    const result = await UserSchema.deleteOne({ _id: id });
    return result;
};

export const getUserById = async (id: string) => {
    const result = await UserSchema.findById(id).lean();
    return result;
};

export const getAllUser = async () => {
    const result = await UserSchema.find({}).lean();
    return result;
};
export const getUserByEmail = async (email: string) => {
    const result = await UserSchema.findOne({ email }).lean();
    return result;
}
// Define the RefreshToken schema
const RefreshTokenSchema = new mongoose.Schema({
    token: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now, expires: "7d" }, // Automatically deletes after 7 days
});

const RefreshTokenModel = mongoose.model("RefreshToken", RefreshTokenSchema);

/**
 * Save a refresh token to the database
 * @param {string} userId - The user ID
 * @param {string} token - The refresh token
 * @returns {Promise<any>} - The saved refresh token document
 */
export const saveRefreshToken = async (userId: string, token: string): Promise<any> => {
    const refreshToken = new RefreshTokenModel({ userId, token });
    const result = await refreshToken.save();
    return result;
};

/**
 * Verify a refresh token
 * @param {string} token - The refresh token to verify
 * @returns {Promise<any>} - Decoded token if valid, otherwise throws an error
 */
// export const verifyRefreshToken = async (token: string): Promise<any> => {
//     try {
//         const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
//         const savedToken = await RefreshTokenModel.findOne({ token });
//         if (!savedToken) {
//             throw new Error("Invalid refresh token");
//         }
//         return decoded;
//     } catch (error) {
//         throw new Error("Invalid or expired refresh token");
//     }
// };
export const verifyRefreshToken = async (token: string): Promise<any> => {
    try {
        // Ensure the secret exists
        const secret = process.env.REFRESH_TOKEN_SECRET;
        if (!secret) {
            throw new Error("Refresh token secret is not defined in the environment variables");
        }

        // Verify the token
        const decoded = jwt.verify(token, secret);

        // Check if the token exists in the database
        const savedToken = await RefreshTokenModel.findOne({ token });
        if (!savedToken) {
            throw new Error("Invalid refresh token");
        }

        return decoded;
    } catch (error) {
        throw new Error("Invalid or expired refresh token");
    }
};

/**
 * Delete a specific refresh token from the database
 * @param {string} token - The refresh token to delete
 * @returns {Promise<any>} - The result of the delete operation
 */
export const deleteRefreshToken = async (token: string): Promise<any> => {
    const result = await RefreshTokenModel.deleteOne({ token });
    return result;
};

/**
 * Delete all refresh tokens associated with a user
 * @param {string} userId - The user ID
 * @returns {Promise<any>} - The result of the delete operation
 */
export const deleteAllRefreshTokensForUser = async (userId: string): Promise<any> => {
    const result = await RefreshTokenModel.deleteMany({ userId });
    return result;
};

// Function to update user status (block/unblock)
export const updateUserStatus = async (userId: string, status: "ACTIVE" | "BLOCKED"): Promise<IUser> => {
    const user = await UserSchema.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.status = status;  // Set status to either ACTIVE or BLOCKED
    await user.save();
    return user;
  };

  // Create a reusable email transporter
const transporter = nodemailer.createTransport({
    service: "gmail",  // Use the email service of your choice
    auth: {
      user: process.env.EMAIL_USER,  // Your email
      pass: process.env.EMAIL_PASS,  // Your email password
    },
  });
  
  // Function to resend email if KYC is not done
  export const resendEmailForKYC = async (userId: string): Promise<void> => {
    const user = await userSchema.findById(userId);
  
    if (!user) {
      throw new Error("User not found");
    }
  
    if (user.kycStatus) {
      throw new Error("KYC already completed");
    }
  
    // Construct the email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Complete Your KYC",
      text: `Hello ${user.name},\n\nWe noticed that your KYC is still pending. Please complete the KYC process to fully activate your account.\n\nBest Regards,\nYour Company`,
    };
  
    // Send the email
    try {
      await transporter.sendMail(mailOptions);
      console.log("Resend email sent successfully");
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Could not send email");
    }
  };






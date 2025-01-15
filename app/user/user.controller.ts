
import * as userService from "./user.service";
import { createResponse } from "../common/helper/response.hepler";
import asyncHandler from "express-async-handler";
import { type Request, type Response } from 'express';
import nodemailer from 'nodemailer';

// export const createUser = asyncHandler(async (req: Request, res: Response) => {
//     const result = await userService.createUser(req.body);
//     res.send(createResponse(result, "User created sucssefully"))
// });

export const createUser = asyncHandler(async(req: Request, res: Response) =>{
    const {email} = req.body
    const existingUser = await userService.findUserByEmail(email)
    if(existingUser){
        throw new Error("User already exists")
    }
    const result = await userService.createUser(req.body);
    res.send(createResponse(result, "User created sucssefully"));
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const {email, password} = req.body

    const user = await userService.findUserByEmail(email);
    if (!user) {
        throw new Error("User not found");
    }

    const isPasswordValid = await userService.comparePasswords(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }
    const refreshToken = userService.generateRefreshToken(user._id);

    // Save the refresh token in the database
    await userService.saveRefreshToken(user._id, refreshToken);


    const token = userService.generateAuthToken(user._id, user.role); 
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'local',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie('token', token, {
        httpOnly: true,           // Ensures the cookie can't be accessed by client-side JavaScript
        secure: process.env.NODE_ENV === 'local', // Set to true in production (HTTPS only)
        maxAge: 3600000,          // Set the cookie expiry time (1 hour in milliseconds)
              
    });
    res.json(createResponse({ token }, "Login successful")); 
})


export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.updateUser(req.params.id, req.body);
    res.send(createResponse(result, "User updated sucssefully"))
});

export const editUser = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.editUser(req.params.id, req.body);
    res.send(createResponse(result, "User updated sucssefully"))
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.deleteUser(req.params.id);
    res.send(createResponse(result, "User deleted sucssefully"))
});

// export const createUserByAdmin = asyncHandler(async (req: Request, res: Response) => {
//     const {email} = req.body
//     const existingUser = await userService.findUserByEmail(email)
//     if(existingUser){
//         throw new Error("User already exists")
//     }
//     const result = await userService.createUserByAdmin(req.body);
//     res.send(createResponse(result, "User created sucssefully"))
// });

export const createUserByAdmin = asyncHandler(async (req: Request, res: Response) => {
    const { email, name } = req.body;
  
    // Check if the user already exists
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }
  
    // Create the user
    const result = await userService.createUserByAdmin(req.body);
  
    // Send welcome email
    try {
      const subject = 'Welcome to Our Platform!';
      const text = `Hello ${name},\n\nWelcome to our platform. We're thrilled to have you onboard.\n\nBest regards,\nTeam`;
      const html = `<p>Hello <strong>${name}</strong>,</p>
                    <p>Welcome to our platform. We're thrilled to have you onboard.</p>
                    <p>Best regards,<br>Team</p>`;
  
      await sendEmail(email, subject, text, html);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Optional: Notify admin about the failure to send email
    }
  
    // Respond to the client
    res.send(createResponse(result, 'User created successfully'));
  });

  

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.getUserById(req.params.id);
    res.send(createResponse(result))
});


export const getAllUser = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.getAllUser();
    res.send(createResponse(result))
});
// Refresh Token Endpoint
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(400).json({ message: "Refresh token is required" });
        return;
    }

    try {
        const decoded = await userService.verifyRefreshToken(refreshToken);
        const newAccessToken = userService.generateAuthToken(decoded._id, decoded.role);

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, // 1 hour
        });

        res.json({
            message: "Access token refreshed successfully",
            accessToken: newAccessToken,
        });
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired refresh token" });
    }
});

// Logout Endpoint
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
        await userService.deleteRefreshToken(refreshToken);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({ message: "Logged out successfully" });
});



export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
) => {
  try {
    // Configure the transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or use host/port for custom SMTP
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html, // Optional HTML content
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new Error('Could not send email');
  }
};

// Block user
export const blockUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;  // Expecting userId in the request body
  const result = await userService.updateUserStatus(userId, "BLOCKED");
  res.send(createResponse(result, "User blocked successfully"));
});

// Unblock user
export const unblockUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;  // Expecting userId in the request body
  const result = await userService.updateUserStatus(userId, "ACTIVE");
  res.send(createResponse(result, "User unblocked successfully"));
});

// Controller to handle resending email for KYC
export const resendKYCEmail = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;  // Expecting userId in the request body

  try {
    await userService.resendEmailForKYC(userId);
    res.send(createResponse(null, "KYC email resent successfully"));
  } catch (error) {
    res.status(500).send({ message:{ message: "Email didn't resend" } });
    
  }
});




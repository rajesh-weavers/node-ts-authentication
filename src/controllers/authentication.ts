import express from "express";
import { createUser, getUserByEmail, updateUserById } from "../models/User";
import { authentication, generateOTP, random } from "../helpers";
import transporter from "../config/email";
import {
  createUserOtp,
  deleteOtpById,
  getUserOtpByEmail,
} from "../models/UserOtp";
import jwt from "jsonwebtoken";

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password"
    );
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist.",
      });
    }

    const passwordHash = authentication(
      user.authentication?.salt ?? "",
      password
    );

    if (user.authentication?.password !== passwordHash) {
      return res.status(400).json({
        success: false,
        message: "Invalid password.",
      });
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET || "nodeAuthentication", // fallback
      {
        expiresIn: "24h",
      }
    );

    return res
      .status(200)
      .json({
        success: true,
        message: "You logged in successfully.",
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      })
      .end();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong.",
    });
  }
};

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password.",
      });
    }

    const isMatch = await getUserByEmail(email);
    if (isMatch) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    const OTP = generateOTP(6);

    const salt = random();
    const user = await createUser({
      name,
      email,
      password: authentication(salt, password),
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });

    await createUserOtp({
      email,
      otp: OTP,
      expiresAt: new Date(
        Date.now() + Number(process.env.OTP_EXPIRY_MINUTES) * 60 * 1000
      ),
    });

    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_USER_EMAIL}>`, // sender address
      to: user.email, // list of receivers
      subject: "Email verification", // Subject line
      text: "Please verify your email", // plain text body
      html: `<p>Do not share this email with anyone.</p>
            <p>Email verification code: <b>${OTP}</b></p>`, // html body
    });

    return res
      .status(200)
      .json({
        success: true,
        message: "User created successfully.",
        user,
      })
      .end();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong.",
    });
  }
};

export const logout = async (req: express.Request, res: express.Response) => {
  try {
    return res.status(200).json({
      success: true,
      message: "User logged out successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong.",
    });
  }
};

export const sendOtp = async (req: express.Request, res: express.Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email.",
      });
    }

    const isMatch = await getUserByEmail(email);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "User does not exist.",
      });
    }

    const OTP = generateOTP(6);

    await createUserOtp({
      email,
      otp: OTP,
      expiresAt: new Date(
        Date.now() + Number(process.env.OTP_EXPIRY_MINUTES) * 60 * 1000
      ),
    });

    await transporter.sendMail({
      from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_USER_EMAIL}>`, // sender address
      to: email, // list of receivers
      subject: "Email verification", // Subject line
      text: "Please verify your email", // plain text body
      html: `<p>Do not share this email with anyone.</p>
            <p>Email verification code: <b>${OTP}</b></p>`, // html body
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong.",
    });
  }
};

export const verifyOtp = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and otp.",
      });
    }

    const isMatch = await getUserByEmail(email);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "User does not exist.",
      });
    }

    const userOtp = await getUserOtpByEmail(email);
    if (!userOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP has been expired.",
      });
    }

    if (userOtp.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    await deleteOtpById(userOtp._id.toString());
    await updateUserById(isMatch._id.toString(), {
      is_verified: true,
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong.",
    });
  }
};

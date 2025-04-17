import express from "express";
import { createUser, getUserByEmail } from "../models/User";
import { authentication, generateOTP, random } from "../helpers";
import transporter from "../config/email";
import { createUserOtp } from "../models/UserOtp";

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

    const salt = random();
    user.authentication.sessionToken = authentication(
      salt,
      user._id.toString()
    );

    await user.save();

    res.cookie("node_auth_token", user.authentication.sessionToken, {
      domain: process.env.COOKIE_DOMAIN,
      path: "/",
    });

    return res
      .status(200)
      .json({
        success: true,
        message: "User logged in successfully.",
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

    const userOtp = await createUserOtp({
      email,
      otp: OTP,
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
    // Clear the authentication cookie
    res.cookie("node_auth_token", "", {
      domain: process.env.COOKIE_DOMAIN,
      path: "/",
      expires: new Date(0), // Expire the cookie immediately
      httpOnly: true, // Prevent client-side access
      secure: process.env.NODE_ENV === "production", // Secure in production
    });

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

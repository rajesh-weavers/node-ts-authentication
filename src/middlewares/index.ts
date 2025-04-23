import express from "express";
import { get, merge } from "lodash";
import { getUserByEmail } from "../models/User";
import jwt from "jsonwebtoken";

export const isOwner = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { id } = req.params;

    const userId = get(req, "identity._id") as string | undefined;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Logged in user not foundddd.",
      });
    }

    if (userId.toString() === id) {
      return res.status(400).json({
        success: false,
        message: "You can not delete your own data.",
      });
    }

    return next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong.",
    });
  }
};

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "nodeAuthentication"
    ) as {
      id: string;
      email: string;
    };

    const user = await getUserByEmail(decoded.email);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Logged in user not found.",
      });
    }

    merge(req, { identity: user });
    return next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong.",
    });
  }
};

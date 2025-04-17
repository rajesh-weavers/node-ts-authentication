import express from "express";
import { get, merge } from "lodash";
import { getUserBySessionToken } from "../models/User";

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
    const sessionToken = req.cookies["node_auth_token"];
    if (!sessionToken) {
      return res.status(400).json({
        success: false,
        message: "You are not logged in.",
      });
    }
    const user = await getUserBySessionToken(sessionToken);
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

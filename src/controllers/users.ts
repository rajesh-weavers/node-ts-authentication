import express from "express";
import { deleteUserById, getUserById, getUsers } from "../models/User";
import { ObjectId } from "mongoose";

interface User {
  id: ObjectId;
  name: string;
  email: string;
  is_verified: boolean;
  role: string;
  createdAt: Date;
}
interface CustomRequest extends express.Request {
  identity: User;
}

export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const users = await getUsers();
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong.",
    });
  }
};

export const deleteUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const deletedUser = await deleteUserById(id);
    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      data: deletedUser,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong.",
    });
  }
};

export const updateUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Please provide name.",
      });
    }
    const user = await getUserById(id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found.",
      });
    }

    user.name = name;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong.",
    });
  }
};

export const profile = async (req: express.Request, res: express.Response) => {
  try {
    const customReq = req as CustomRequest;

    return res.status(200).json({
      success: true,
      message: "User profile data.",
      data: customReq.identity,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong.",
    });
  }
};

import mongoose, { Document, ObjectId, Schema } from "mongoose";

// Define the TypeScript interface for the User
export interface IUser extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  is_verified?: boolean;
  role?: "user" | "admin";
  createdAt?: Date;
  authentication?: {
    password: string;
    sessionToken: string;
    salt: string;
  };
}

// Define the Mongoose schema
const userSchema: Schema<IUser> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    select: false,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  authentication: {
    password: {
      type: String,
      required: true,
      select: false,
    },
    sessionToken: {
      type: String,
      select: false,
    },
    salt: {
      type: String,
      select: false,
    },
  },
});

// Export the model
export const UserModel = mongoose.model<IUser>("User", userSchema);

export const getUsers = () => UserModel.find();
export const getUserByEmail = (email: string) => UserModel.findOne({ email });
export const getUserBySessionToken = (sessionToken: string) =>
  UserModel.findOne({ "authentication.sessionToken": sessionToken });
export const getUserById = (id: string) => UserModel.findById(id);
export const createUser = (values: Record<string, any>) =>
  new UserModel(values).save().then((user) => user.toObject());
export const deleteUserById = (id: string) =>
  UserModel.findOneAndDelete({ _id: id });
export const updateUserById = (id: string, values: Record<string, any>) =>
  UserModel.findByIdAndUpdate(id, values);

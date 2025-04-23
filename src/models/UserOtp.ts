import mongoose, { Schema, Document, ObjectId } from "mongoose";

interface IOtp extends Document {
  _id: ObjectId;
  email: string;
  otp: string;
  createdAt: Date;
}

const UserOtpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 }, // Expire after 5 mins (300 sec)
  },
  { timestamps: true }
);

export const UserOtpModel = mongoose.model<IOtp>("UserOtp", UserOtpSchema);

export const createUserOtp = (values: Record<string, any>) =>
  new UserOtpModel(values).save().then((otp) => otp.toObject());

export const getUserOtpByEmail = (email: string) =>
  UserOtpModel.findOne({ email });
export const deleteOtpById = (id: string) =>
  UserOtpModel.findOneAndDelete({ _id: id });

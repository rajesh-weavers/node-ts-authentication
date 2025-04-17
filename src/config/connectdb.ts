import mongoose, { ConnectOptions } from "mongoose";

const connectDB = async (DATABASE_URL: string): Promise<void> => {
  try {
    const DB_OPTIONS: ConnectOptions = {
      dbName: process.env.DB_NAME,
    };

    await mongoose.connect(DATABASE_URL, DB_OPTIONS);
    console.log("DB connected");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

export default connectDB;

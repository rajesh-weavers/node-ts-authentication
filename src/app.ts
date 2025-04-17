import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import http from "http";
import connectDB from "./config/connectdb";
import router from "./router";

const app = express();
const PORT = process.env.PORT || 4000;
const DATABASE_URL = process.env.MONGO_URL || "";

const crosOptions = {
  origin: process.env.FRONTEND_HOST,
  credentials: true,
  optiomsSuccessStatus: 200,
};
app.use(cors(crosOptions));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

// const server = http.createServer(app);

//connect db
if (DATABASE_URL) {
  connectDB(DATABASE_URL);
} else {
  console.error("Database URL not found in environment variables");
}

app.use("/api", router());

app.listen(PORT, () => {
  console.log(`The server is running on http://localhost:${PORT}`);
});

export default app;

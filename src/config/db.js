import mongoose from "mongoose";

export const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;
  const DB_NAME = process.env.MONGO_DB_NAME || "le_dauphin";
  if (!MONGO_URI) {
    console.error("MongoDB: MONGO_URI manquant dans .env");
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: DB_NAME,
    });
    console.log("MongoDB connected — base:", DB_NAME);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};


import mongoose from "mongoose";

export const connectDB = async (): Promise<typeof mongoose | null> => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/doctor_tracker";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error: any) {
    console.error("\n❌ MongoDB Connection Error:", error?.message || error);

    return null;
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};

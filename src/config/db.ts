import mongoose from "mongoose";

// In-memory connection cache for serverless environments (Vercel)
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDB = async (): Promise<typeof mongoose | null> => {
  // If active cached connection exists
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If already connected
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/doctor_tracker";

  // If connection is in-flight, await the same promise
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => {
        console.log(
          `✅ MongoDB Connected Successfully: ${m.connection.host}/${m.connection.name}`
        );
        return m;
      })
      .catch((error: any) => {
        console.error("❌ MongoDB Connection Error:", error?.message || error);
        cached.promise = null;
        return null;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  cached.conn = null;
  cached.promise = null;
};

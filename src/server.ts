import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  // Attempt initial connection to MongoDB
  const conn = await connectDB();

  // If initial connection fails, periodically attempt reconnect in background
  if (!conn) {
    const retryInterval = setInterval(async () => {
      console.log("🔄 Retrying MongoDB connection...");
      const retryConn = await connectDB();
      if (retryConn) {
        clearInterval(retryInterval);
      }
    }, 15000);
  }

  // Start HTTP Server
  app.listen(PORT, () => {
    console.log(`🚀 Doctor Tracker API running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("❌ Fatal server error:", err);
});

import cors from "cors";
import express, { Request, Response } from "express";
import { authRouter } from "./module/auth/auth.route.js";
import { userRouter } from "./module/user/user.route.js";
import { doctorRouter } from "./module/doctor/doctor.route.js";
import { patientRouter } from "./module/patient/patient.route.js";
import { dashboardRouter } from "./module/dashboard/dashboard.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health check route
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Doctor Tracker API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/patients", patientRouter);
app.use("/api/dashboard", dashboardRouter);

// Centralized error handling
app.use(errorHandler);

export default app;

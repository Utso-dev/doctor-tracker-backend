import mongoose, { Schema, Document, Model } from "mongoose";
import { IDoctor } from "../../type/index.js";

export interface IDoctorDocument extends IDoctor, Document {}

const DoctorSchema = new Schema<IDoctorDocument>(
  {
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
      index: true,
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
      index: true,
    },
    hospital: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for getting patients assigned to this doctor
DoctorSchema.virtual("patients", {
  ref: "Patient",
  localField: "_id",
  foreignField: "doctor",
});

// Indexes for query performance
DoctorSchema.index({ name: "text", specialization: "text", hospital: "text", email: "text" });
DoctorSchema.index({ createdAt: -1 });
DoctorSchema.index({ specialization: 1, createdAt: -1 });

export const Doctor: Model<IDoctorDocument> =
  (mongoose.models.Doctor as Model<IDoctorDocument>) ||
  mongoose.model<IDoctorDocument>("Doctor", DoctorSchema);

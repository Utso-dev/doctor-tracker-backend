import mongoose, { Schema, Document, Model } from "mongoose";
import { IPatient } from "../../type/index.js";

export interface IPatientDocument extends IPatient, Document {}

const PatientSchema = new Schema<IPatientDocument>(
  {
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      index: true,
    },
    age: {
      type: Number,
      required: [true, "Patient age is required"],
      min: [0, "Age cannot be negative"],
      max: [150, "Age cannot exceed 150"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [true, "Gender is required"],
      default: "Male",
    },
    condition: {
      type: String,
      enum: ["Stable", "Critical", "Recovered", "Under Treatment"],
      required: [true, "Patient condition is required"],
      default: "Under Treatment",
      index: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Assigning a doctor is required"],
      index: true,
    },
    phone: {
      type: String,
      required: [true, "Contact phone is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query performance
PatientSchema.index({ doctor: 1, createdAt: -1 });
PatientSchema.index({ condition: 1, createdAt: -1 });
PatientSchema.index({ admissionDate: -1 });
PatientSchema.index({ createdAt: -1 });
PatientSchema.index({ name: "text", phone: "text", condition: "text" });

export const Patient: Model<IPatientDocument> =
  (mongoose.models.Patient as Model<IPatientDocument>) ||
  mongoose.model<IPatientDocument>("Patient", PatientSchema);

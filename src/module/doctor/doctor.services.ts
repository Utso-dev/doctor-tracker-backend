import { Types } from "mongoose";
import { Doctor } from "./doctor.model.js";
import { Patient } from "../patient/patient.model.js";
import { IDoctor, IPatient } from "../../type/index.js";

export interface DoctorQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  specialization?: string;
  hospital?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const createDoctorService = async (doctorData: Partial<IDoctor>) => {
  const existingDoctor = await Doctor.findOne({ email: doctorData.email?.toLowerCase() });
  if (existingDoctor) {
    throw new Error("A doctor with this email already exists");
  }

  const doctor = await Doctor.create({
    ...doctorData,
    email: doctorData.email?.toLowerCase(),
  });

  return doctor;
};

export const getAllDoctorsService = async (query: DoctorQueryParams) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  // Build filter query
  const filter: any = {};

  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), "i");
    filter.$or = [
      { name: searchRegex },
      { specialization: searchRegex },
      { hospital: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  if (query.specialization && query.specialization !== "all") {
    filter.specialization = new RegExp(`^${query.specialization.trim()}$`, "i");
  }

  if (query.hospital && query.hospital !== "all") {
    filter.hospital = new RegExp(query.hospital.trim(), "i");
  }

  // Date-wise filtering
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) {
      filter.createdAt.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const sortField = query.sortBy || "createdAt";
  const sortDirection = query.sortOrder === "asc" ? 1 : -1;
  const sortOption: any = { [sortField]: sortDirection };

  // Optimized parallel query: fetch paginated docs + patient counts + total count
  const [total, rawDoctors] = await Promise.all([
    Doctor.countDocuments(filter),
    Doctor.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  // Aggregate patient counts per doctor for fast rendering
  const doctorIds = rawDoctors.map((doc: any) => doc._id);
  const patientCounts = await Patient.aggregate([
    { $match: { doctor: { $in: doctorIds } } },
    { $group: { _id: "$doctor", count: { $sum: 1 } } },
  ]);

  const countMap = new Map<string, number>();
  patientCounts.forEach((pc: any) => {
    countMap.set(pc._id.toString(), pc.count);
  });

  const doctorsWithPatientCount = rawDoctors.map((doc: any) => ({
    ...doc,
    patientCount: countMap.get(doc._id.toString()) || 0,
  }));

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    doctors: doctorsWithPatientCount,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

export const getDoctorByIdService = async (id: string): Promise<any> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid doctor ID");
  }

  const doctor = await Doctor.findById(id).lean();
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const patients = await Patient.find({ doctor: id }).sort({ createdAt: -1 }).lean();

  return {
    ...doctor,
    patients,
    patientCount: patients.length,
  };
};

export const updateDoctorService = async (id: string, updateData: Partial<IDoctor>) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid doctor ID");
  }

  if (updateData.email) {
    const existing = await Doctor.findOne({
      email: updateData.email.toLowerCase(),
      _id: { $ne: id },
    });
    if (existing) {
      throw new Error("Another doctor with this email already exists");
    }
  }

  const updatedDoctor = await Doctor.findByIdAndUpdate(
    id,
    { ...updateData, ...(updateData.email ? { email: updateData.email.toLowerCase() } : {}) },
    { new: true, runValidators: true }
  ).lean();

  if (!updatedDoctor) {
    throw new Error("Doctor not found");
  }

  return updatedDoctor;
};

export const deleteDoctorService = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid doctor ID");
  }

  const doctor = await Doctor.findByIdAndDelete(id);
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  // Delete all patients assigned to this doctor
  await Patient.deleteMany({ doctor: id });

  return { message: "Doctor and associated patients deleted successfully" };
};

export const getDoctorPatientsService = async (
  doctorId: string,
  query: { page?: number | string; limit?: number | string; search?: string }
) => {
  if (!Types.ObjectId.isValid(doctorId)) {
    throw new Error("Invalid doctor ID");
  }

  const doctor = await Doctor.findById(doctorId).select("name specialization hospital");
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter: any = { doctor: doctorId };

  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), "i");
    filter.$or = [{ name: searchRegex }, { condition: searchRegex }, { phone: searchRegex }];
  }

  const [total, patients] = await Promise.all([
    Patient.countDocuments(filter),
    Patient.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
  ]);

  return {
    doctor,
    patients,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const addPatientToDoctorService = async (doctorId: string, patientData: Partial<IPatient>) => {
  if (!Types.ObjectId.isValid(doctorId)) {
    throw new Error("Invalid doctor ID");
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const patient = await Patient.create({
    ...patientData,
    doctor: doctorId,
  });

  return patient;
};

export const deletePatientFromDoctorService = async (doctorId: string, patientId: string) => {
  if (!Types.ObjectId.isValid(doctorId) || !Types.ObjectId.isValid(patientId)) {
    throw new Error("Invalid ID format");
  }

  const patient = await Patient.findOneAndDelete({ _id: patientId, doctor: doctorId });
  if (!patient) {
    throw new Error("Patient not found under this doctor");
  }

  return { message: "Patient removed from doctor successfully" };
};

export const getDoctorSpecializationsService = async (): Promise<string[]> => {
  const rawSpecializations = await Doctor.distinct("specialization", {
    specialization: { $exists: true, $ne: "" },
  });
  return rawSpecializations
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .map((s) => s.trim())
    .filter((val, idx, arr) => arr.indexOf(val) === idx)
    .sort();
};

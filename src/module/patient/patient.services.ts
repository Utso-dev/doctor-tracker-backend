import { Types } from "mongoose";
import { Patient } from "./patient.model.js";
import { Doctor } from "../doctor/doctor.model.js";
import { IPatient } from "../../type/index.js";

export interface PatientQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  condition?: string;
  doctorId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const createPatientService = async (patientData: Partial<IPatient>) => {
  if (!patientData.doctor || !Types.ObjectId.isValid(patientData.doctor as any)) {
    throw new Error("A valid doctor must be assigned");
  }

  const doctorExists = await Doctor.findById(patientData.doctor);
  if (!doctorExists) {
    throw new Error("Assigned doctor does not exist");
  }

  const patient = await Patient.create(patientData);
  const populated = await Patient.findById(patient._id).populate("doctor", "name specialization hospital email");
  return populated;
};

export const getAllPatientsService = async (query: PatientQueryParams) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), "i");
    filter.$or = [
      { name: searchRegex },
      { condition: searchRegex },
      { phone: searchRegex },
      { email: searchRegex },
    ];
  }

  if (query.condition && query.condition !== "all") {
    filter.condition = query.condition;
  }

  if (query.doctorId && query.doctorId !== "all" && Types.ObjectId.isValid(query.doctorId)) {
    filter.doctor = query.doctorId;
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

  // Optimized parallel count and find with lean execution
  const [total, patients] = await Promise.all([
    Patient.countDocuments(filter),
    Patient.find(filter)
      .populate("doctor", "name specialization hospital email phone")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    patients,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

export const getPatientByIdService = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid patient ID");
  }

  const patient = await Patient.findById(id)
    .populate("doctor", "name specialization hospital email phone")
    .lean();

  if (!patient) {
    throw new Error("Patient not found");
  }

  return patient;
};

export const updatePatientService = async (id: string, updateData: Partial<IPatient>) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid patient ID");
  }

  if (updateData.doctor) {
    if (!Types.ObjectId.isValid(updateData.doctor as any)) {
      throw new Error("Invalid doctor ID");
    }
    const doctorExists = await Doctor.findById(updateData.doctor);
    if (!doctorExists) {
      throw new Error("Assigned doctor does not exist");
    }
  }

  const updatedPatient = await Patient.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("doctor", "name specialization hospital email phone")
    .lean();

  if (!updatedPatient) {
    throw new Error("Patient not found");
  }

  return updatedPatient;
};

export const deletePatientService = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid patient ID");
  }

  const patient = await Patient.findByIdAndDelete(id);
  if (!patient) {
    throw new Error("Patient not found");
  }

  return { message: "Patient deleted successfully" };
};

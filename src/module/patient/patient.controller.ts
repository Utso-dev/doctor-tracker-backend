import { Request, Response } from "express";
import {
  createPatientService,
  getAllPatientsService,
  getPatientByIdService,
  updatePatientService,
  deletePatientService,
} from "./patient.services.js";

export const createPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, age, gender, condition, doctor, phone, email, address, admissionDate } = req.body;

    if (!name || !age || !doctor || !phone) {
      res.status(400).json({
        success: false,
        message: "Name, age, doctor, and phone are required",
      });
      return;
    }

    const patient = await createPatientService({
      name,
      age: Number(age),
      gender: gender || "Male",
      condition: condition || "Under Treatment",
      doctor,
      phone,
      email,
      address,
      admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: patient,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create patient",
    });
  }
};

export const getAllPatients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, search, condition, doctorId, startDate, endDate, sortBy, sortOrder } =
      req.query;

    const result = await getAllPatientsService({
      page: page as string,
      limit: limit as string,
      search: search as string,
      condition: condition as string,
      doctorId: doctorId as string,
      startDate: startDate as string,
      endDate: endDate as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as "asc" | "desc",
    });

    res.status(200).json({
      success: true,
      data: result.patients,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch patients",
    });
  }
};

export const getPatientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const patient = await getPatientByIdService(id);

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || "Patient not found",
    });
  }
};

export const updatePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const patient = await updatePatientService(id, req.body);

    res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      data: patient,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update patient",
    });
  }
};

export const deletePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await deletePatientService(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete patient",
    });
  }
};

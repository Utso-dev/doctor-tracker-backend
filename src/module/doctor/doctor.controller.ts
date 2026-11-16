import { Request, Response } from "express";
import {
  createDoctorService,
  getAllDoctorsService,
  getDoctorByIdService,
  updateDoctorService,
  deleteDoctorService,
  getDoctorPatientsService,
  addPatientToDoctorService,
  deletePatientFromDoctorService,
  getDoctorSpecializationsService,
} from "./doctor.services.js";

export const createDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, specialization, hospital, phone, email } = req.body;

    if (!name || !specialization || !hospital || !phone || !email) {
      res.status(400).json({
        success: false,
        message: "All fields (name, specialization, hospital, phone, email) are required",
      });
      return;
    }

    const doctor = await createDoctorService({
      name,
      specialization,
      hospital,
      phone,
      email,
    });

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: doctor,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create doctor",
    });
  }
};

export const getAllDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, search, specialization, hospital, startDate, endDate, sortBy, sortOrder } =
      req.query;

    const result = await getAllDoctorsService({
      page: page as string,
      limit: limit as string,
      search: search as string,
      specialization: specialization as string,
      hospital: hospital as string,
      startDate: startDate as string,
      endDate: endDate as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as "asc" | "desc",
    });

    res.status(200).json({
      success: true,
      data: result.doctors,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch doctors",
    });
  }
};

export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doctor = await getDoctorByIdService(id);

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || "Doctor not found",
    });
  }
};

export const updateDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doctor = await updateDoctorService(id, req.body);

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: doctor,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update doctor",
    });
  }
};

export const deleteDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await deleteDoctorService(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete doctor",
    });
  }
};

export const getDoctorPatients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page, limit, search } = req.query;

    const result = await getDoctorPatientsService(id, {
      page: page as string,
      limit: limit as string,
      search: search as string,
    });

    res.status(200).json({
      success: true,
      data: result.patients,
      doctor: result.doctor,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || "Failed to fetch doctor patients",
    });
  }
};

export const addPatientToDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, age, gender, condition, phone, email, address, admissionDate } = req.body;

    if (!name || !age || !phone) {
      res.status(400).json({
        success: false,
        message: "Patient name, age, and phone are required",
      });
      return;
    }

    const patient = await addPatientToDoctorService(id, {
      name,
      age: Number(age),
      gender: gender || "Male",
      condition: condition || "Under Treatment",
      phone,
      email,
      address,
      admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Patient added to doctor successfully",
      data: patient,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to add patient to doctor",
    });
  }
};

export const deletePatientFromDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, patientId } = req.params;
    const result = await deletePatientFromDoctorService(id, patientId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to remove patient from doctor",
    });
  }
};

export const getDoctorSpecializations = async (req: Request, res: Response): Promise<void> => {
  try {
    const specializations = await getDoctorSpecializationsService();
    res.status(200).json({
      success: true,
      data: specializations,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch doctor specializations",
    });
  }
};

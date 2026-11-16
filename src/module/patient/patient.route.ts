import { Router } from "express";
import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "./patient.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const patientRouter = Router();

// Protect all patient routes
patientRouter.use(authenticateToken);

patientRouter.route("/")
  .post(createPatient)
  .get(getAllPatients);

patientRouter.route("/:id")
  .get(getPatientById)
  .put(updatePatient)
  .delete(deletePatient);

export { patientRouter };

import { Router } from "express";
import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
  addPatientToDoctor,
  deletePatientFromDoctor,
  getDoctorSpecializations,
} from "./doctor.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const doctorRouter = Router();

// Protect all doctor routes
doctorRouter.use(authenticateToken);

doctorRouter.route("/")
  .post(createDoctor)
  .get(getAllDoctors);

doctorRouter.route("/specializations")
  .get(getDoctorSpecializations);

doctorRouter.route("/:id")
  .get(getDoctorById)
  .put(updateDoctor)
  .delete(deleteDoctor);

doctorRouter.route("/:id/patients")
  .get(getDoctorPatients)
  .post(addPatientToDoctor);

doctorRouter.route("/:id/patients/:patientId")
  .delete(deletePatientFromDoctor);

export { doctorRouter };

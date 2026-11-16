import { Doctor } from "../doctor/doctor.model.js";
import { Patient } from "../patient/patient.model.js";

export const getDashboardStatsService = async () => {
  // Parallel execution for best query performance
  const [totalDoctors, totalPatients, patientsPerDoctor, dateBasedStats, conditionStats] =
    await Promise.all([
      // 1. Total Doctors
      Doctor.countDocuments(),

      // 2. Total Patients
      Patient.countDocuments(),

      // 3. Patients per Doctor (Aggregation pipeline with $lookup to get doctor name & specialization)
      Patient.aggregate([
        {
          $group: {
            _id: "$doctor",
            patientCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "_id",
            foreignField: "_id",
            as: "doctorDetails",
          },
        },
        {
          $unwind: {
            path: "$doctorDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            patientCount: 1,
            doctorName: { $ifNull: ["$doctorDetails.name", "Unassigned"] },
            specialization: { $ifNull: ["$doctorDetails.specialization", "General"] },
            hospital: { $ifNull: ["$doctorDetails.hospital", "N/A"] },
          },
        },
        { $sort: { patientCount: -1 } },
        { $limit: 10 }, // Top 10 doctors by patients
      ]),

      // 4. Date-based statistics (Daily/Weekly/Monthly registration trends over the last 30 days)
      Patient.aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 30 },
        {
          $project: {
            _id: 0,
            date: "$_id",
            count: 1,
          },
        },
      ]),

      // 5. Patient Condition Distribution
      Patient.aggregate([
        {
          $group: {
            _id: "$condition",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            condition: "$_id",
            count: 1,
          },
        },
      ]),
    ]);

  return {
    totalDoctors,
    totalPatients,
    averagePatientsPerDoctor: totalDoctors > 0 ? Number((totalPatients / totalDoctors).toFixed(1)) : 0,
    patientsPerDoctor,
    dateBasedStats,
    conditionStats,
  };
};

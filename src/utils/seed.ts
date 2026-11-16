import "dotenv/config";
import { connectDB, disconnectDB } from "../config/db.js";
import { User } from "../module/auth/auth.model.js";
import { Doctor } from "../module/doctor/doctor.model.js";
import { Patient } from "../module/patient/patient.model.js";
import { hashPassword } from "./auth.js";

const sampleDoctors = [
  {
    name: "Dr. Sarah Jenkins",
    specialization: "Cardiology",
    hospital: "Central City Hospital",
    phone: "+1-555-0101",
    email: "sarah.jenkins@hospital.org",
  },
  {
    name: "Dr. Michael Chen",
    specialization: "Neurology",
    hospital: "Metropolitan Medical Center",
    phone: "+1-555-0102",
    email: "m.chen@metrohealth.org",
  },
  {
    name: "Dr. Emily Rodriguez",
    specialization: "Pediatrics",
    hospital: "St. Jude Children's Clinic",
    phone: "+1-555-0103",
    email: "e.rodriguez@stjude.org",
  },
  {
    name: "Dr. James Wilson",
    specialization: "Orthopedics",
    hospital: "Apex Orthopedic Institute",
    phone: "+1-555-0104",
    email: "jwilson@apexortho.com",
  },
  {
    name: "Dr. Priya Patel",
    specialization: "Dermatology",
    hospital: "Skin & Wellness Center",
    phone: "+1-555-0105",
    email: "dr.patel@skinwellness.com",
  },
  {
    name: "Dr. Robert Taylor",
    specialization: "Oncology",
    hospital: "Memorial Cancer Institute",
    phone: "+1-555-0106",
    email: "robert.taylor@memorialcancer.org",
  },
];

const samplePatients = [
  {
    name: "John Doe",
    age: 45,
    gender: "Male" as const,
    condition: "Stable" as const,
    phone: "+1-555-1111",
    email: "john.doe@example.com",
    address: "742 Evergreen Terrace, Springfield",
    daysAgo: 20,
  },
  {
    name: "Alice Smith",
    age: 32,
    gender: "Female" as const,
    condition: "Under Treatment" as const,
    phone: "+1-555-1112",
    email: "alice.smith@example.com",
    address: "123 Main St, New York",
    daysAgo: 18,
  },
  {
    name: "David Miller",
    age: 58,
    gender: "Male" as const,
    condition: "Critical" as const,
    phone: "+1-555-1113",
    email: "david.m@example.com",
    address: "456 Elm St, Chicago",
    daysAgo: 15,
  },
  {
    name: "Emma Watson",
    age: 28,
    gender: "Female" as const,
    condition: "Recovered" as const,
    phone: "+1-555-1114",
    email: "emma.w@example.com",
    address: "789 Oak Ave, Los Angeles",
    daysAgo: 14,
  },
  {
    name: "Carlos Gomez",
    age: 62,
    gender: "Male" as const,
    condition: "Stable" as const,
    phone: "+1-555-1115",
    email: "carlos.g@example.com",
    address: "321 Pine Rd, Miami",
    daysAgo: 10,
  },
  {
    name: "Sophia Brown",
    age: 8,
    gender: "Female" as const,
    condition: "Recovered" as const,
    phone: "+1-555-1116",
    email: "parents.brown@example.com",
    address: "654 Maple Dr, Austin",
    daysAgo: 8,
  },
  {
    name: "Liam Johnson",
    age: 51,
    gender: "Male" as const,
    condition: "Critical" as const,
    phone: "+1-555-1117",
    email: "liam.j@example.com",
    address: "987 Cedar Blvd, Seattle",
    daysAgo: 5,
  },
  {
    name: "Olivia Davis",
    age: 39,
    gender: "Female" as const,
    condition: "Under Treatment" as const,
    phone: "+1-555-1118",
    email: "olivia.davis@example.com",
    address: "159 Birch Ln, Denver",
    daysAgo: 3,
  },
  {
    name: "Noah Martinez",
    age: 22,
    gender: "Male" as const,
    condition: "Stable" as const,
    phone: "+1-555-1119",
    email: "noah.m@example.com",
    address: "753 Walnut St, Boston",
    daysAgo: 1,
  },
  {
    name: "Ava Wilson",
    age: 4,
    gender: "Female" as const,
    condition: "Stable" as const,
    phone: "+1-555-1120",
    email: "parents.wilson@example.com",
    address: "852 Spruce Ct, Portland",
    daysAgo: 0,
  },
];

export const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");
    await connectDB();

    // 1. Seed Admin User
    const adminEmail = "admin@doctortracker.com";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashedPassword = await hashPassword("admin123");
      admin = await User.create({
        name: "Admin User",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log(` Created Admin: ${adminEmail} (password: admin123)`);
    } else {
      console.log(`ℹ️ Admin already exists: ${adminEmail}`);
    }

    // 2. Seed Doctors
    const createdDoctors: any[] = [];
    for (const docData of sampleDoctors) {
      let doctor = await Doctor.findOne({ email: docData.email });
      if (!doctor) {
        doctor = await Doctor.create(docData);
        console.log(` Created Doctor: ${doctor.name} (${doctor.specialization})`);
      }
      createdDoctors.push(doctor);
    }

    // 3. Seed Patients
    const currentPatientCount = await Patient.countDocuments();
    if (currentPatientCount === 0 && createdDoctors.length > 0) {
      for (let i = 0; i < samplePatients.length; i++) {
        const p = samplePatients[i];
        if (!p) continue;
        const assignedDoctor = createdDoctors[i % createdDoctors.length];
        const admissionDate = new Date();
        admissionDate.setDate(admissionDate.getDate() - p.daysAgo);

        await Patient.create({
          name: p.name,
          age: p.age,
          gender: p.gender,
          condition: p.condition,
          doctor: assignedDoctor._id,
          phone: p.phone,
          email: p.email,
          address: p.address,
          admissionDate: admissionDate,
          createdAt: admissionDate,
        });
      }
      console.log(` Created ${samplePatients.length} initial sample patients`);
    } else {
      console.log(`ℹ️ Patients already exist in database (${currentPatientCount} records).`);
    }

    console.log(" Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await disconnectDB();
  }
};

// Run if script called directly
if (process.argv[1]?.includes("seed.ts")) {
  seedDatabase().then(() => process.exit(0));
}

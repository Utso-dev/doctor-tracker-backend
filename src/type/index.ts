import { Types } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: "admin" | "doctor" | "staff";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDoctor {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPatient {
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  condition: "Stable" | "Critical" | "Recovered" | "Under Treatment";
  doctor: Types.ObjectId | IDoctor;
  phone: string;
  email?: string;
  address?: string;
  admissionDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: IPaginationMeta;
}
